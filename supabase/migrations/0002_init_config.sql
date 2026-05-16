-- Migration 0002: booking_config + blocked_periods
-- Singleton config row + manual blocks by owner
-- See: plans/260509-1059-tai-ai-automation-landing-page/phase-07-supabase-backend.md

-- ---------------------------------------------------------------------------
-- Table: public.booking_config (singleton — row id always = 1)
-- ---------------------------------------------------------------------------

create table if not exists public.booking_config (
  id                          integer primary key default 1 check (id = 1),

  -- Slot grid (locked: 30-min interval)
  slot_interval_minutes       integer not null default 30
    check (slot_interval_minutes > 0 and 60 % slot_interval_minutes = 0),

  -- 2h forward block (locked)
  block_hours_forward         integer not null default 2
    check (block_hours_forward >= 0),

  -- Min advance booking (don't allow slot < N min from now)
  min_advance_minutes         integer not null default 30
    check (min_advance_minutes >= 0),

  -- Meet duration (locked: 20 min)
  default_duration_minutes    integer not null default 20
    check (default_duration_minutes > 0),

  -- Owner Zalo phone (for v1.5 ZNS notify)
  owner_zalo_phone            text,

  -- Working hours: 24/7. Use this array to skip specific hours from curation only
  -- (e.g. '{2,3,4}' = không gợi ý slot 2-4 AM mặc dù vẫn book được nếu user expand all).
  curation_skip_hours         integer[] not null default '{}'::integer[]
    check (curation_skip_hours <@ array[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]::integer[]),

  updated_at                  timestamptz not null default now()
);

-- updated_at trigger (reuses public.set_updated_at from migration 0001)
drop trigger if exists booking_config_set_updated_at on public.booking_config;
create trigger booking_config_set_updated_at
  before update on public.booking_config
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: public.blocked_periods (manual blocks — owner sets via Supabase Studio)
-- ---------------------------------------------------------------------------

create table if not exists public.blocked_periods (
  id          uuid primary key default gen_random_uuid(),
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  reason      text,
  created_at  timestamptz not null default now(),

  constraint blocked_periods_time_order check (end_at > start_at)
);

create index if not exists idx_blocked_periods_range
  on public.blocked_periods (start_at, end_at);
