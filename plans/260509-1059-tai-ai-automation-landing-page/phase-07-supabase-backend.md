# Phase 07 - Supabase Backend Integration

**Status:** Pending
**Priority:** P0
**Depends on:** Phase 01 (project ready), can run parallel với Phase 06 (booking UI)

## Skills Active
- `databases` - PostgreSQL schema, indexes, constraints, queries
- `backend-development` - API routes, validation, error handling
- `web-frameworks` - Next.js Route Handlers (App Router) + Server Actions
- `docs-seeker` - Latest Supabase JS client + RLS docs
- `security-scan` - Audit RLS, exposed keys
- `frontend-development` - Type-safe Supabase client, env handling
- ⏸️ ~~`use-mcp` Zalo OA~~ - **Deferred to v1.5**

## Scope (UPDATED 2026-05-14)
- **v1 (current):** Schema + API routes (`/api/availability/*`, `/api/book`). Booking saves to DB only. Owner checks via Supabase Studio.
- **Flow lock 2026-05-14:** Booking UI inline trên `/` (anchor `#dat-lich`). Submit thành công → redirect `/thank-you?booking_id=...`. **KHÔNG** có route `/booking`.
- **SQL workflow lock 2026-05-14:** Migration files được tạo TRƯỚC trong `supabase/migrations/` → user review → user tự apply qua SQL Editor / Supabase CLI / psql. Code KHÔNG tự migrate.
- **v1.5 (deferred):** Zalo OA + ZNS auto-notify. Cron token refresh. Full automation chăm sóc.

## Objective
Build database schema + API endpoints để booking UI consume. Implement **2h forward block rule**. RLS để chỉ admin xem được bookings, public chỉ insert qua server route. **v1: lưu DB only** - Zalo Notify defer v1.5.

## Key Insights
- **Service role key NEVER ship client** - server-only
- Booking insert qua **Next.js Route Handler** (server-side), không từ client direct
- Slot availability tính **on-the-fly** từ existing bookings (không pre-populate slot table - hiệu quả hơn)
- **Block rule (locked):** slot `S` blocked nếu tồn tại booking `T` mà `0 ≤ S - T < 2h` (forward only, không block backward)
- **Working hours: 24/7** - không filter theo working_hours_config nữa, slot grid full day
- **Slot interval: 30 phút** (HH:00 và HH:30)
- Timezone: Server tính bằng `timestamptz`, lưu UTC, expose Asia/Ho_Chi_Minh ở API response
- **v1 notify:** không trigger external - chỉ insert DB. Owner xem bookings qua Supabase Studio.
- **Schema includes** `expectations text[]` array (multi-select) + `expectation_other text` (Khác content)

## Architecture (LOCKED 2026-05-14 — KISS rewrite)

### Scope (v1)
Supabase chỉ làm 4 việc:
1. **DB lưu booking** — 1 bảng `bookings` + `booking_config` singleton + `blocked_periods`
2. **RLS bảo vệ dữ liệu** — zero public policy, server-only qua service_role
3. **Constraint chống double booking** — exclusion `bookings_active_2h_no_overlap` enforce ở DB level
4. **Studio để owner xem booking** — không cần custom dashboard v1

### Flow
```
User submit form
  → POST /api/book
    → Zod validate
    → Phone normalize + IP hash
    → RPC create_booking(...)
       ├─ INSERT bookings (exclusion + check constraints)
       └─ Return booking_id + meeting_start/end
    → Catch DB errors:
       23P01 → 409 slot-taken
       23514 → 400 validation
    → Optional: fire-and-forget POST WEBHOOK_URL
       (Discord/Slack notify; nếu fail, owner check Studio)
    → Return 200 với booking_id
  → Frontend redirect /thank-you
```

### KHÔNG có trong v1 (defer v1.5+)
- ❌ Outbox queue / event log
- ❌ Background worker / cron / pg_cron
- ❌ Retry với backoff
- ❌ HMAC signing webhook (chỉ cần khi receiver verify — Discord/Slack không yêu cầu)
- ❌ Rule engine / automation rules
- ❌ Zalo OA / ZNS
- ❌ `.ics` calendar invite

Lý do defer: 90% case owner sẽ thấy booking trong Studio + Discord ping. Webhook fail thì miss 1 ping nhưng booking vẫn lưu (DB là nguồn sự thật). Khi nào có nhu cầu rõ ràng (vd: tích hợp Zalo, có ≥3 automation rule) mới build outbox.

### Migration files (v1 final — 5 file)
- `0001_init_bookings.sql` ✅ applied
- `0002_init_config.sql` ✅ applied
- `0003_seed_config.sql` ✅ applied
- `0004_rls_policies.sql` ✅ applied
- `0005_rpc_create_booking.sql` ⏳ draft — atomic insert RPC

---

## Database Schema

### Table: `bookings` (UPDATED 2026-05-09 PM - multi-select expectations)
```sql
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  -- Customer info (minimal)
  phone_zalo text not null,           -- REQUIRED: primary identifier (Zalo phone)
  email text,                         -- optional
  full_name text,                     -- optional
  expectations text[] not null default '{}',  -- multi-select slugs (consult-24-7, image-recognition, close-order, lead-capture, other)
  expectation_other text,             -- chỉ populate khi expectations chứa 'other'
  consent_zalo boolean not null default false, -- consent checkbox required true on insert
  -- Meeting info
  meeting_start timestamptz not null,
  meeting_end timestamptz not null,
  duration_minutes integer not null default 20,
  meet_platform text not null default 'google-meet',
  meet_link text,                     -- Tài fills in manually v1, auto-generate v1.5
  -- Status
  status text not null default 'pending'
    check (status in ('pending','confirmed','rescheduled','cancelled','completed','no-show')),
  notes text,                         -- internal notes by Tài
  -- v1.5 placeholders (deferred): Zalo notify tracking
  zalo_notified_at timestamptz,
  zalo_notify_error text,
  -- Source tracking
  source text default 'landing-page',
  user_agent text,
  ip_hash text,                       -- hashed IP for spam detection
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_bookings_meeting_start on public.bookings(meeting_start);
create index idx_bookings_status on public.bookings(status);
create index idx_bookings_phone on public.bookings(phone_zalo);
create index idx_bookings_created_at on public.bookings(created_at desc);

-- Phone format check (basic VN format)
alter table public.bookings add constraint phone_zalo_format
  check (phone_zalo ~ '^(\+84|0)\d{9,10}$');

-- Expectations slug validation (each element must be valid slug)
alter table public.bookings add constraint expectations_valid_slugs
  check (
    expectations <@ ARRAY['consult-24-7','image-recognition','close-order','lead-capture','other']::text[]
  );

-- Other-text only allowed when 'other' is in expectations
alter table public.bookings add constraint expectation_other_consistency
  check (
    (expectation_other is null) or ('other' = ANY(expectations))
  );

-- Consent required true
alter table public.bookings add constraint consent_required
  check (consent_zalo = true);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger bookings_updated_at
before update on public.bookings
for each row execute function update_updated_at();
```

### Table: `booking_config` (single-row config - simplified for 24/7)
```sql
create table public.booking_config (
  id integer primary key default 1 check (id = 1), -- singleton
  -- Slot interval in minutes (locked: 30)
  slot_interval_minutes integer not null default 30,
  -- Block rule (locked: 2 hours forward)
  block_hours_forward integer not null default 2,
  -- Buffer before today's slot is bookable (don't allow booking < 30min from now)
  min_advance_minutes integer not null default 30,
  -- Default meet duration (locked: 20)
  default_duration_minutes integer not null default 20,
  -- Owner Zalo phone (cho ZNS notify)
  owner_zalo_phone text,
  -- Working hours: 24/7 → null means no restriction
  -- Optional: have field for "show only these slots in curation" (e.g. skip 02:00-05:00 by default)
  curation_skip_hours integer[] default '{}', -- vd: '{2,3,4}' để skip 2-4h sáng dù 24/7
  updated_at timestamptz not null default now()
);

-- Seed default
insert into public.booking_config (id) values (1) on conflict do nothing;
```

### Optional Table: `blocked_periods` (manual blocks by Tài)
```sql
create table public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now()
);

create index idx_blocked_periods_range on public.blocked_periods(start_at, end_at);
```

## Row Level Security (RLS)

```sql
alter table public.bookings enable row level security;
alter table public.booking_config enable row level security;
alter table public.blocked_periods enable row level security;

-- Public: NO direct read/write on bookings
-- All access through server-side Route Handlers using service_role key

-- booking_config: public read OK (frontend can prefetch interval)
create policy "Public can read booking config"
  on public.booking_config for select
  using (true);

-- blocked_periods: public read for slot computation (optional)
create policy "Public can read blocked periods"
  on public.blocked_periods for select
  using (true);

-- All writes via service_role only (bypasses RLS)
-- bookings: NO public policies → only service_role can read/write
```

## API Endpoints (Next.js Route Handlers)

### `GET /api/availability/days`
Returns next 7 days with slot count. **24/7** nên all days included.

**Query:** none (or optional `?start=YYYY-MM-DD&count=7`)

**Response:**
```json
{
  "days": [
    { "date": "2026-05-09", "day_of_week": 6, "label": "T7 09/05", "available_count": 12, "is_today": true },
    { "date": "2026-05-10", "day_of_week": 0, "label": "CN 10/05", "available_count": 14, "is_today": false },
    { "date": "2026-05-11", "day_of_week": 1, "label": "T2 11/05", "available_count": 14, "is_today": false }
  ]
}
```
`available_count` = số 30-min slots còn trống sau khi apply 2h block.

### `GET /api/availability/slots?date=YYYY-MM-DD&full=false`
Returns suggested 3-5 slots cho ngày đó. `full=true` để show all 48 slots (30-min × 24h).

**Logic (24/7 + 30-min interval + 2h forward block):**
1. Load `booking_config` (slot_interval=30, block_hours_forward=2)
2. Generate raw slot grid: 48 slots (00:00, 00:30, 01:00, ..., 23:30) cho ngày
3. Apply `curation_skip_hours` filter (default skip 02:00-05:00 sáng nếu config - but 24/7 default keep all)
4. Load `bookings` cho ngày đó + ngày trước (vì block forward 2h từ booking ngày trước có thể overlap đầu ngày này) - status in ('pending','confirmed')
5. Load `blocked_periods` overlap window
6. For each candidate slot S, check:
   - `S >= now() + min_advance_minutes` (default 30 min advance)
   - **Không tồn tại** booking T mà `0 ≤ S - T < 2h` (forward-only block)
   - Không overlap blocked_period
7. Nếu `full=false` → pick 3-5 best slots spread theo time-of-day (sáng/trưa/chiều/tối/khuya)
8. Nếu `full=true` → return all available 30-min slots

**Response:**
```json
{
  "date": "2026-05-11",
  "slots": [
    { "time": "09:00", "iso": "2026-05-11T02:00:00Z", "available": true, "period": "morning" },
    { "time": "10:00", "iso": "2026-05-11T03:00:00Z", "available": false, "period": "morning", "reason": "blocked-by-prior-booking" },
    { "time": "10:30", "iso": "2026-05-11T03:30:00Z", "available": false, "period": "morning", "reason": "blocked-by-prior-booking" },
    { "time": "11:00", "iso": "2026-05-11T04:00:00Z", "available": false, "period": "morning", "reason": "blocked-by-prior-booking" },
    { "time": "11:30", "iso": "2026-05-11T04:30:00Z", "available": false, "period": "morning", "reason": "blocked-by-prior-booking" },
    { "time": "12:00", "iso": "2026-05-11T05:00:00Z", "available": true, "period": "midday" },
    { "time": "14:00", "iso": "2026-05-11T07:00:00Z", "available": true, "period": "afternoon" },
    { "time": "20:00", "iso": "2026-05-11T13:00:00Z", "available": true, "period": "evening" }
  ],
  "curated_picks": ["09:00", "12:00", "14:00", "16:30", "20:00"]
}
```
Frontend default render `curated_picks`, có button "Xem thêm giờ khác" expand show all `slots`.

### `POST /api/book`
Create booking + outbox event atomically. **v1 (LOCKED 2026-05-14):** Transactional Outbox — booking và event lưu chung 1 transaction, worker dispatch webhook async sau.

**Body:**
```json
{
  "phone_zalo": "0901234567",
  "email": "a@example.com",
  "full_name": "Nguyễn Văn A",
  "expectations": ["consult-24-7", "image-recognition", "other"],
  "expectation_other": "Tôi muốn bot trả lời câu hỏi đặc thù ngành nghề",
  "consent_zalo": true,
  "meeting_start_iso": "2026-05-11T07:00:00Z"
}
```

**Server logic:**
1. Validate body với Zod schema (mirror frontend):
   - `phone_zalo` required, format VN regex
   - `consent_zalo` must be `true`
   - `expectations` array, each element ∈ enum
   - `expectation_other` only if `expectations` includes 'other', max 200 chars
   - Other fields optional
2. Phone normalize (strip spaces, +84 → 0)
3. Hash IP for `ip_hash` field (sha256 + salt)
4. Call RPC `create_booking_with_event(phone, start, email, name, expectations[], other, ua, ip)`:
   - DB exclusion constraint enforces 2h block (atomic — no TOCTOU)
   - Booking + outbox event inserted in SAME transaction
   - If 23P01 (slot taken) → catch, return 409 with alternative slots
   - If 23514 (check) → catch, return 400 validation error
5. Return booking ID + summary. **Webhook dispatched async by worker (see /api/cron/dispatch-events).**

**Response success:**
```json
{
  "success": true,
  "booking_id": "uuid",
  "meeting_start": "2026-05-11T07:00:00Z",
  "meeting_end": "2026-05-11T07:20:00Z",
  "ics_url": "/api/booking/{id}/ics"
}
```

### Zalo Notify Integration - DEFERRED to v1.5

⏸️ Pause per user brief 2026-05-09 PM. Schema đã có sẵn `zalo_notified_at` + `zalo_notify_error` columns để v1.5 plug-in dễ dàng.

**v1.5 plan (preserved for reference):**
- ZNS template booking-confirm cho customer
- Zalo OA chat cho owner (notify booking mới)
- Cron job refresh OA token mỗi 12h
- Helper file: `src/lib/notifications/zalo-notify.ts`
- Endpoint: `/api/cron/refresh-zalo-token`
- Env vars: `ZALO_OA_*`, `ZNS_TEMPLATE_*`, `OWNER_ZALO_PHONE`, `CRON_SECRET`

**Response success:**
```json
{
  "success": true,
  "booking_id": "uuid-here",
  "meeting_start": "2026-05-11T07:00:00Z",
  "meeting_end": "2026-05-11T07:20:00Z",
  "ics_url": "/api/booking/{id}/ics"
}
```

**Response conflict:**
```json
{
  "success": false,
  "error": "slot-taken",
  "message": "Slot này vừa được đặt. Anh/chị chọn giờ khác giúp tôi nhé.",
  "alternative_slots": ["09:00", "14:00"]
}
```

### `GET /api/booking/[id]/ics`
Returns `.ics` file để user save vào calendar.

### Optional inline webhook (sau insert thành công)
Trong `/api/book` sau khi RPC trả booking_id:
```ts
const webhookUrl = process.env.WEBHOOK_URL;
if (webhookUrl) {
  // Fire-and-forget. Use Next.js after() để giữ request alive trên serverless.
  after(async () => {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          content: `📅 Booking mới: ${full_name ?? '(no name)'} - ${phone_zalo} - ${meeting_start}`,
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.error('[webhook] dispatch failed', err);
    }
  });
}
return Response.json({ booking_id, meeting_start, meeting_end });
```
**Risk accepted v1:** webhook fail → owner miss Discord ping nhưng booking đã lưu, check Studio. KHÔNG retry, KHÔNG log.

## Server-Side Supabase Clients

### `src/lib/supabase/server-client.ts` (service_role, server-only)
```ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // SERVER ONLY
  { auth: { persistSession: false } }
);
```

### `src/lib/supabase/anon-client.ts` (anon key, browser-safe)
```ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

**Verify với `security-scan` skill:** ensure `SUPABASE_SERVICE_ROLE_KEY` không bao giờ leak vào client bundle.

## 2-Hour Forward Block Rule (Detailed) - UPDATED

Given existing booking at `T = meeting_start`:
- **Block window forward:** slots in `[T, T + 2h)` đều blocked
- Hệ quả khi check candidate slot `S`:
  - Block nếu tồn tại `T ∈ bookings` mà `0 ≤ S - T < 2h`
  - Hoặc tương đương: tồn tại `T` mà `S - 2h < T ≤ S`

Implementation: SQL query
```sql
-- Check candidate slot S (timestamp)
select 1 from bookings
where status in ('pending','confirmed')
  and meeting_start <= :candidate_slot
  and meeting_start > :candidate_slot - interval '2 hours'
limit 1;
-- nếu trả row → S blocked
```

**Bidirectional check khi insert booking mới (S):**
- New booking S blocks future slots → existing constraint via candidate-slot check ở lúc query
- New booking S không bị blocked bởi prior booking → check `not exists T mà 0 ≤ S - T < 2h`
- Critical: khi insert S, cũng phải đảm bảo **không có booking T trong `(S, S + 2h)`** - vì nếu tồn tại T trong window đó thì S đã block T (T's slot bị disable retroactively, gây inconsistency)

**Final insert check (atomic):**
```sql
-- Re-check trong transaction trước khi insert
select 1 from bookings
where status in ('pending','confirmed')
  and (
    -- prior booking blocks this slot
    (meeting_start <= :new_start and meeting_start > :new_start - interval '2 hours')
    or
    -- this slot would block future booking
    (meeting_start > :new_start and meeting_start < :new_start + interval '2 hours')
  )
limit 1;
```
Nếu trả row → 409 Conflict, đề xuất alternative slot.

**Note:** đây là interpretation chặt - block bidirectional 2h để đảm bảo consistency. Nếu user muốn STRICTLY forward only (cho phép 2 bookings 30min apart nếu mới sau), điều chỉnh logic.

## Environment Variables

### v1 (current) - minimal
`.env.local.example`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # SERVER ONLY, never client

# Domain
NEXT_PUBLIC_SITE_URL=https://nguyenvantai.com

# IP hash salt (random per env, used for ip_hash)
IP_HASH_SALT=random-32-char-string

# Server hint
TZ=Asia/Ho_Chi_Minh
```

### v1.5 (deferred) - Zalo additions
```
# Zalo OA / ZNS (deferred to v1.5)
ZALO_OA_ACCESS_TOKEN=...
ZALO_OA_REFRESH_TOKEN=...
ZALO_OA_APP_ID=...
ZALO_OA_APP_SECRET=...
ZNS_TEMPLATE_ID_BOOKING_CONFIRM=...
OWNER_ZALO_PHONE=84xxx
CRON_SECRET=random-secret-for-cron-endpoint
```

### Zalo OA Token Refresh - DEFERRED v1.5
⏸️ Skip cron refresh trong v1. v1.5 sẽ implement qua Vercel Cron.

## Files to Create

### v1 (current scope — UPDATED 2026-05-14 KISS rewrite)

**SQL (`supabase/migrations/`) — 5 file:**
- `0001_init_bookings.sql` ✅ applied
- `0002_init_config.sql` ✅ applied
- `0003_seed_config.sql` ✅ applied
- `0004_rls_policies.sql` ✅ applied
- `0005_rpc_create_booking.sql` ⏳ draft — atomic insert RPC

**TypeScript:**
- `src/lib/supabase/server-client.ts` ✅ created
- `src/lib/supabase/anon-client.ts` ✅ created
- `src/lib/supabase/database-types.ts` ✅ generated (regen sau apply 0005)
- `src/app/api/availability/days/route.ts` ⏳
- `src/app/api/availability/slots/route.ts` ⏳
- `src/app/api/book/route.ts` ⏳ — RPC `create_booking` + optional inline webhook
- `src/lib/booking/availability-engine.ts` ⏳
- `src/lib/booking/slot-curator.ts` ⏳
- `src/lib/booking/types.ts` ⏳ — domain types
- `src/lib/validators/booking-schema.ts` ⏳
- `src/lib/format/date-vn.ts` ⏳
- `src/lib/format/phone-vn.ts` ⏳
- `src/lib/security/ip-hash.ts` ⏳

**Defer v1.5+ (KISS):** `.ics` generator, outbox + workers, HMAC webhook signing, retry queue, automation rules, Zalo OA/ZNS.

### v1.5 (deferred - placeholders only)
- ⏸️ `src/app/api/cron/refresh-zalo-token/route.ts`
- ⏸️ `src/lib/notifications/zalo-notify.ts`
- ⏸️ `src/lib/notifications/zalo-token-refresh.ts`
- ⏸️ `src/lib/notifications/send-booking-notify.ts`
- ⏸️ `vercel.json` cron config (sẽ thêm v1.5)

## Implementation Steps
1. Create Supabase project (manual UI step - user)
2. Run migrations via Supabase CLI hoặc dashboard SQL editor
3. Generate TS types: `supabase gen types typescript --project-id xxx > src/lib/supabase/types.ts`
4. Build server + anon clients
5. Implement `availability-engine.ts`:
   - `getNext7WorkingDays(now)` → array of dates
   - `getSlotsForDay(date, config, bookings, blocks)` → array of slots
   - `pickSuggestedSlots(slots, count=5)` → curated selection (spread time-of-day)
6. Build `/api/availability/days` route handler
7. Build `/api/availability/slots` route handler
8. Build `/api/book` route handler:
   - Zod validate
   - Re-check availability (TOCTOU)
   - Insert booking
   - Trigger notifications (background)
   - Return success/conflict
9. Build `.ics` generator + endpoint
10. Optional: rate limiting via Upstash hoặc next-rate-limit
11. Optional: Turnstile verification trên `/api/book`
12. Run `security-scan` skill audit
13. Test endpoints via curl / Postman với edge cases

## Todo

### Done ✅
- [x] Supabase project created (ref `hiocvsfjssqozovdmfas`, Singapore)
- [x] 0001-0004 applied — bookings + config + RLS + seed
- [x] DB exclusion constraint `bookings_active_2h_no_overlap` smoke-tested
- [x] TS types generated (`src/lib/supabase/database-types.ts`)
- [x] `server-client.ts` + `anon-client.ts`
- [x] `.env.local` with random salt

### SQL (pending review/apply)
- [ ] Review `0005_rpc_create_booking.sql`
- [ ] Apply 0005
- [ ] Regenerate TS types

### API + UI
- [ ] `src/lib/validators/booking-schema.ts` — Zod
- [ ] `src/lib/format/phone-vn.ts`
- [ ] `src/lib/security/ip-hash.ts`
- [ ] `src/lib/booking/types.ts` — domain types
- [ ] `src/lib/booking/availability-engine.ts`
- [ ] `src/lib/booking/slot-curator.ts`
- [ ] `/api/availability/days`
- [ ] `/api/availability/slots`
- [ ] `/api/book` — RPC + optional inline webhook (fire-and-forget)
- [ ] Edge tests: double-book → 409, validation → 400, webhook fail → still success

### Deferred to v1.5+
- [ ] Outbox queue + workers + retry (`automation_events`, `automation_event_attempts`, pg_cron, dispatcher)
- [ ] HMAC webhook signing
- [ ] Rule engine / `automation_rules` table
- [ ] Zalo OA / ZNS notify
- [ ] `.ics` calendar invite generator
- [ ] Rate limit (Upstash) + Turnstile captcha

## Success Criteria
- Schema applied clean, không lỗi
- RLS verified: anon client không insert được vào bookings
- `/api/availability/days` trả 7 ngày kế tiếp (24/7, không filter working hours)
- `/api/availability/slots` apply 2h forward block đúng
- `/api/book` insert thành công, conflict → trả 409 với alternative
- Server không leak `SUPABASE_SERVICE_ROLE_KEY` (verify build bundle)
- Timezone test: book 14:00 Asia/Ho_Chi_Minh → DB lưu UTC đúng → slot khác xem block đúng
- TOCTOU test: 2 concurrent requests cùng slot → 1 success, 1 conflict

## Risks
- **Service role key leak** - phải double check Next.js không bundle vào client. Use server-only directive `import 'server-only'`
- **Race condition** - 2 user click submit cùng slot. Mitigate: re-check availability trong same transaction, optionally `select ... for update` lock pattern
- **Email deliverability** - Resend may go spam initially. Mitigate: SPF/DKIM domain setup
- **Spam bookings** - abuse vector. Mitigate: rate limit + captcha (recommend bật cho production)
- **Calendar timezone** - `.ics` `TZID=Asia/Ho_Chi_Minh`, test import vào Google Cal + Apple Cal

## Resolved (2026-05-09 PM - UPDATED)
- ✅ Block rule: **2h forward** (đã update SQL + logic)
- ✅ Slot interval: **30 phút**
- ✅ Working hours: **24/7**
- ✅ Captcha: **không cần v1**
- ✅ Form schema: simplified với multi-select expectations[] + expectation_other
- ✅ Form fields: phone_zalo (required) + email/full_name/expectations/expectation_other (optional) + consent_zalo (required)
- ⏸️ **Zalo Notify deferred to v1.5** - focus web first
- ⏸️ **Email confirmation:** không gửi (cả v1 và v1.5 trừ khi user đổi ý)

## Open Questions Still (v1)
- ❓ Supabase region: chọn Singapore `ap-southeast-1` cho latency VN tốt nhất

## v1.5 Open Questions (sau khi web stable)
- ❓ Zalo OA account đã verified chưa?
- ❓ ZNS template booking confirm đã đăng ký chưa? (duyệt 1-3 ngày)
- ❓ Owner Zalo phone để nhận notify booking mới?

## Next
→ Phase 08 (Animations + Polish) - final UX micro-interactions
→ Phase 09 (Deploy) - domain `nguyenvantai.com` setup (v1 minimal env vars)
