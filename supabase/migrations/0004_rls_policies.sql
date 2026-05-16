-- Migration 0004: Row Level Security policies
-- Lock-down: ZERO public access to ANY booking table.
-- All reads/writes go through server-side Route Handlers using
-- SUPABASE_SERVICE_ROLE_KEY (which bypasses RLS).
--
-- Rationale (review fix 2026-05-14):
--   - booking_config has owner_zalo_phone — must not leak via REST
--   - blocked_periods.reason may contain private notes — must not leak
--   - bookings contains PII (phone, email, name) — never client-accessible
--
-- If later anh muốn admin client-side đọc bookings, thêm policy auth-based
-- with role check (e.g. `auth.jwt() ->> 'role' = 'admin'`).

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------------------------

alter table public.bookings         enable row level security;
alter table public.booking_config   enable row level security;
alter table public.blocked_periods  enable row level security;

-- ---------------------------------------------------------------------------
-- Drop any prior policies (idempotent on re-run)
-- ---------------------------------------------------------------------------

drop policy if exists "Public can read bookings"          on public.bookings;
drop policy if exists "Public can insert bookings"        on public.bookings;
drop policy if exists "Public can update bookings"        on public.bookings;
drop policy if exists "Public can delete bookings"        on public.bookings;
drop policy if exists "Public can read booking_config"    on public.booking_config;
drop policy if exists "Public can read blocked_periods"   on public.blocked_periods;

-- ---------------------------------------------------------------------------
-- NO policies created → service_role only (bypasses RLS)
-- Anon / authenticated roles have ZERO access via REST/PostgREST.
-- ---------------------------------------------------------------------------
