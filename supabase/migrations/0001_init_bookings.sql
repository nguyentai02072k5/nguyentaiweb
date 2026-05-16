-- Migration 0001: bookings table
-- Phase 07 spec — schema for 1-1 Meet booking
-- (default 20-min duration, 24/7, 30-min grid, 2h forward block, DB-enforced)
-- See: plans/260509-1059-tai-ai-automation-landing-page/phase-07-supabase-backend.md

-- ---------------------------------------------------------------------------
-- IMMUTABLE helper — needed because `timestamptz + interval` is STABLE
-- (PG cannot statically prove interval arithmetic is timezone-independent),
-- and exclusion-constraint expressions must be IMMUTABLE.
-- We use pure epoch arithmetic (no interval) which is genuinely deterministic.
-- 7200 = 2 * 3600 seconds = 2 hours.
-- ---------------------------------------------------------------------------

create or replace function public.booking_block_range(start_ts timestamptz)
returns tstzrange
language sql
immutable
as $$
  select tstzrange(start_ts, to_timestamp(extract(epoch from start_ts) + 7200), '[)');
$$;

-- ---------------------------------------------------------------------------
-- Table: public.bookings — all constraints inline (idempotent on re-run)
-- ---------------------------------------------------------------------------

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),

  -- Customer info (minimal — phase 06 form-cro lock)
  phone_zalo          text    not null
    constraint phone_zalo_format
      check (phone_zalo ~ '^(\+84|0)\d{9,10}$'),
  email               text,
  full_name           text,
  expectations        text[]  not null default '{}'::text[]
    constraint expectations_valid_slugs
      check (expectations <@ array[
        'consult-24-7',
        'image-recognition',
        'close-order',
        'lead-capture',
        'other'
      ]::text[]),
  expectation_other   text
    constraint expectation_other_length
      check (expectation_other is null or char_length(expectation_other) <= 200),
  consent_zalo        boolean not null default false
    constraint consent_required check (consent_zalo = true),

  -- Meeting timing — duration + start fully determine end (DB enforces)
  meeting_start       timestamptz not null,
  duration_minutes    integer  not null default 20
    constraint duration_positive check (duration_minutes > 0)
    constraint duration_reasonable check (duration_minutes <= 240),  -- 4h hard ceiling
  meeting_end         timestamptz not null,

  meet_platform       text     not null default 'google-meet',
  meet_link           text,                                          -- owner fills manually v1

  -- Status
  status              text not null default 'pending'
    constraint status_valid
      check (status in ('pending','confirmed','rescheduled','cancelled','completed','no-show')),
  notes               text,

  -- v1.5 placeholders (Zalo notify tracking — deferred)
  zalo_notified_at    timestamptz,
  zalo_notify_error   text,

  -- Source tracking
  source              text default 'landing-page',
  user_agent          text,
  ip_hash             text,

  -- Timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- ---------------------------------------------------------------------------
  -- Table-level constraints
  -- ---------------------------------------------------------------------------

  -- expectation_other only valid when 'other' is in expectations
  constraint expectation_other_consistency
    check (expectation_other is null or 'other' = any(expectations)),

  -- meeting_end must equal start + duration (no API drift)
  constraint meeting_end_matches_duration
    check (meeting_end = meeting_start + duration_minutes * interval '1 minute'),

  -- 2h forward block — DB-enforced exclusion. Two active bookings cannot
  -- have meeting_start within 2h of each other (bidirectional).
  -- '[)' = right-exclusive so a booking at 14:00 blocks [14:00, 16:00),
  -- 16:00 sharp is bookable again.
  constraint bookings_active_2h_no_overlap
    exclude using gist (
      public.booking_block_range(meeting_start) with &&
    ) where (status in ('pending','confirmed'))
);

-- ---------------------------------------------------------------------------
-- Indexes (idempotent)
-- ---------------------------------------------------------------------------

create index if not exists idx_bookings_meeting_start on public.bookings (meeting_start);
create index if not exists idx_bookings_status       on public.bookings (status);
create index if not exists idx_bookings_phone        on public.bookings (phone_zalo);
create index if not exists idx_bookings_created_at   on public.bookings (created_at desc);

-- Partial index for availability queries
create index if not exists idx_bookings_active_meeting
  on public.bookings (meeting_start)
  where status in ('pending','confirmed');

-- ---------------------------------------------------------------------------
-- updated_at trigger (idempotent via create-or-replace + drop-if-exists)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();
