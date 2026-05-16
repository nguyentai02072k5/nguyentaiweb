-- Migration 0003: seed default booking_config singleton row
-- Idempotent — safe to re-run

insert into public.booking_config (
  id,
  slot_interval_minutes,
  block_hours_forward,
  min_advance_minutes,
  default_duration_minutes,
  curation_skip_hours
)
values (
  1,
  30,   -- 30-min grid
  2,    -- 2h forward block
  30,   -- can't book < 30 min from now
  20,   -- 20-min meet
  -- Working hours: 9:00-11:30 + 14:00-19:30 (HCM owner preference)
  -- Skip = hours OUTSIDE working window (engine + curator both respect this)
  '{0,1,2,3,4,5,6,7,8,12,13,20,21,22,23}'::integer[]
)
on conflict (id) do nothing;
