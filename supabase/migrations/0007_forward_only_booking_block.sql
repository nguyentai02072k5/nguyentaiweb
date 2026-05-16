-- Migration 0007: switch booking block rule to strict forward-only.
--
-- Rule: candidate slot S is blocked only when an active booking T already
-- exists with 0 <= S - T < block_hours_forward. A later booking does not
-- retroactively disable earlier slots.

alter table public.bookings
  drop constraint if exists bookings_active_2h_no_overlap;

create or replace function public.enforce_booking_forward_block()
returns trigger
language plpgsql
as $$
declare
  v_block_hours integer := 2;
begin
  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  select coalesce(block_hours_forward, 2)
  into v_block_hours
  from public.booking_config
  where id = 1;
  v_block_hours := coalesce(v_block_hours, 2);

  -- Serialize booking writes so the forward-only check remains race-safe.
  perform pg_advisory_xact_lock(hashtext('public.bookings.forward_block'));

  if exists (
    select 1
    from public.bookings b
    where b.status in ('pending', 'confirmed')
      and b.id is distinct from new.id
      and b.meeting_start <= new.meeting_start
      and b.meeting_start > new.meeting_start - (v_block_hours * interval '1 hour')
    limit 1
  ) then
    raise exception 'slot is blocked by a prior booking'
      using errcode = '23P01';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_forward_block_before_write on public.bookings;
create trigger bookings_forward_block_before_write
  before insert or update of meeting_start, status
  on public.bookings
  for each row
  execute function public.enforce_booking_forward_block();

create or replace function public.create_booking(
  p_phone_zalo         text,
  p_meeting_start      timestamptz,
  p_email              text default null,
  p_full_name          text default null,
  p_expectations       text[] default '{}'::text[],
  p_expectation_other  text default null,
  p_user_agent         text default null,
  p_ip_hash            text default null,
  p_source             text default 'landing-page'
)
returns table (
  id            uuid,
  meeting_start timestamptz,
  meeting_end   timestamptz
)
language plpgsql
security invoker
as $$
declare
  v_duration_min  integer := 20;
  v_meeting_end   timestamptz;
  v_booking_id    uuid;
begin
  select coalesce(default_duration_minutes, 20)
  into v_duration_min
  from public.booking_config
  where booking_config.id = 1;
  v_duration_min := coalesce(v_duration_min, 20);

  v_meeting_end := p_meeting_start + (v_duration_min * interval '1 minute');

  insert into public.bookings (
    phone_zalo, email, full_name,
    expectations, expectation_other,
    consent_zalo,
    meeting_start, meeting_end, duration_minutes,
    source, user_agent, ip_hash
  )
  values (
    p_phone_zalo, p_email, p_full_name,
    p_expectations, p_expectation_other,
    true,
    p_meeting_start, v_meeting_end, v_duration_min,
    p_source, p_user_agent, p_ip_hash
  )
  returning bookings.id into v_booking_id;

  return query select v_booking_id, p_meeting_start, v_meeting_end;
end;
$$;

revoke all on function public.create_booking(
  text, timestamptz, text, text, text[], text, text, text, text
) from public, anon;
grant execute on function public.create_booking(
  text, timestamptz, text, text, text[], text, text, text, text
) to service_role;
