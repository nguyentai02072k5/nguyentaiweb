-- Migration 0005: RPC create_booking
-- Single atomic insert. DB constraints (exclusion 2h block + 9 check)
-- enforce business rules. Caller maps errors:
--   23P01 (exclusion) → 409 slot-taken
--   23514 (check)     → 400 validation
--
-- Why RPC instead of direct insert from /api/book?
--   - Encapsulates server-side computation (meeting_end from duration)
--   - Single API surface — schema change later doesn't touch route code
--   - Type-safe via supabase gen types (RPC signature reflected in TS)
--
-- v1 LOCKED 2026-05-14: NO outbox, NO event table, NO worker.
-- Webhook (Discord/Slack) gửi inline fire-and-forget từ /api/book sau insert.
-- Nếu webhook fail → owner check Supabase Studio (booking đã lưu).

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
  v_duration_min  integer := 20;  -- v1 hardcoded; read from booking_config later
  v_meeting_end   timestamptz;
  v_booking_id    uuid;
begin
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
    true,                            -- consent already enforced at API layer
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
