-- Migration 0006: Update existing booking_config singleton with working hours
-- Original seed (0003) used '{}' (24/7); this migration narrows to owner's window.
-- Idempotent — re-running is a no-op if values already match.
--
-- Working hours: 9:00-11:30 + 14:00-19:30 HCM time
-- Skip = hours OUTSIDE working window
--   Skip: 0-8 (before 9am), 12-13 (lunch), 20-23 (after 19:30)
--   Keep: 9, 10, 11 (9-11:30), 14, 15, 16, 17, 18, 19 (14-19:30)
--   Total = 9 hours × 2 slots/hour = 18 slots/day

update public.booking_config
set curation_skip_hours = '{0,1,2,3,4,5,6,7,8,12,13,20,21,22,23}'::integer[]
where id = 1;
