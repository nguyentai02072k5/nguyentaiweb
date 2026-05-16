# Supabase Setup — Phase 07 v1

Hướng dẫn anh chạy toàn bộ migration trong `supabase/migrations/` sau khi review xong.

## Pre-flight: chuẩn bị project

1. Vào https://supabase.com/dashboard → **New project**
2. Chọn region **Singapore (`ap-southeast-1`)** — latency VN tốt nhất
3. Đặt password DB mạnh, lưu vào password manager
4. Đợi project provision xong (~2 phút)

## Bước 1 — Lấy 3 key cho app

Settings → **API**:

| Key | Dùng cho | Env var |
|---|---|---|
| Project URL | client + server | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` (public) | client browser | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` (secret) | **server only** | `SUPABASE_SERVICE_ROLE_KEY` |

Copy 3 giá trị này vào `.env.local` (tạo từ `.env.local.example`).

⚠️ `service_role` bypass RLS — **không bao giờ** ship vào client bundle. Code đã isolate qua `src/lib/supabase/server-client.ts` với `import 'server-only'`.

⚠️ Key `sbp_...` (Personal Access Token) là cho Supabase CLI / Management API, không phải 3 key trên. App **không** dùng PAT.

## Bước 2 — Review SQL trước khi migrate

Các file để review theo thứ tự:

| File | Nội dung | Phải đọc kỹ |
|---|---|---|
| `0001_init_bookings.sql` | Table `bookings` + 5 constraints (phone format, expectations enum, consent gate, time order, length cap) + 5 index + trigger updated_at | Constraint `consent_required` chặn insert nếu `consent_zalo = false`. Phone regex chỉ accept `+84...` hoặc `0...` |
| `0002_init_config.sql` | Singleton `booking_config` (slot=30 min, block=2h, advance=30 min, duration=20 min) + `blocked_periods` manual block | `curation_skip_hours` array để skip giờ khỏi danh sách "gợi ý" nhưng vẫn book được nếu expand all |
| `0003_seed_config.sql` | Insert 1 row mặc định vào `booking_config`. Idempotent (`on conflict do nothing`) | Chạy bao nhiêu lần cũng OK |
| `0004_rls_policies.sql` | Enable RLS toàn bộ. `bookings`: **không có policy** = chỉ service_role chạm được. `booking_config` + `blocked_periods`: public-read | Nếu sau này muốn admin UI đọc `bookings` từ client, phải thêm policy auth-based |
| `0005_rpc_create_booking.sql` | RPC `create_booking` để server route insert booking qua service role | App không insert trực tiếp từ client |
| `0006_update_working_hours.sql` | Cập nhật `curation_skip_hours` theo khung giờ owner đang muốn nhận lịch | Idempotent |
| `0007_forward_only_booking_block.sql` | Đổi block rule sang strict forward-only, drop exclusion constraint bidirectional cũ | Fix case book 19:30 không được khóa ngược 18:00/18:30/19:00 |

## Bước 3 — Chạy migrations (3 cách, chọn 1)

### Cách A — SQL Editor (đơn giản nhất, recommend cho v1)

1. Supabase Dashboard → **SQL Editor** → **New query**
2. Mở `0001_init_bookings.sql`, copy toàn bộ → paste → **Run**
3. Lặp lại với các file còn lại theo thứ tự `0002` → `0007`
4. Kiểm tra ở **Table Editor**: phải thấy 3 table (`bookings`, `booking_config`, `blocked_periods`) và `booking_config` có 1 row id=1

### Cách B — Supabase CLI (recommend khi muốn versioning)

```bash
# Install once
pnpm dlx supabase --version

# Login bằng Personal Access Token (sbp_...) — KHÔNG dùng password
pnpm dlx supabase login

# Link với project (lấy ref ở Settings → General → Reference ID)
pnpm dlx supabase link --project-ref YOUR_PROJECT_REF

# Push các migration trong supabase/migrations/
pnpm dlx supabase db push
```

### Cách C — psql trực tiếp

```bash
# Connection string ở Settings → Database → Connection string → URI
psql "postgresql://postgres:PASSWORD@db.YOUR_REF.supabase.co:5432/postgres" \
  -f supabase/migrations/0001_init_bookings.sql \
  -f supabase/migrations/0002_init_config.sql \
  -f supabase/migrations/0003_seed_config.sql \
  -f supabase/migrations/0004_rls_policies.sql \
  -f supabase/migrations/0005_rpc_create_booking.sql \
  -f supabase/migrations/0006_update_working_hours.sql \
  -f supabase/migrations/0007_forward_only_booking_block.sql
```

## Bước 4 — Verify

Chạy nhanh trong SQL Editor:

```sql
-- 1. 3 table tồn tại
select tablename from pg_tables where schemaname = 'public' order by tablename;
-- expected: blocked_periods, booking_config, bookings

-- 2. config seed
select * from public.booking_config;
-- expected: 1 row, slot_interval_minutes=30, block_hours_forward=2

-- 3. RLS đã bật
select tablename, rowsecurity from pg_tables where schemaname='public';
-- expected: rowsecurity = true cho cả 3 table

-- 4. Test constraint consent gate (phải fail)
insert into public.bookings (phone_zalo, meeting_start, meeting_end, consent_zalo)
values ('0901234567', now() + interval '1 day', now() + interval '1 day' + interval '20 min', false);
-- expected: ERROR — constraint "consent_required" violated
```

## Bước 5 — Generate TypeScript types (sau khi migrate xong)

```bash
pnpm dlx supabase gen types typescript \
  --project-id YOUR_PROJECT_REF \
  > src/lib/supabase/database-types.ts
```

File này sẽ được import bởi `server-client.ts` và `anon-client.ts` ở phase tiếp theo.

## Rollback (nếu cần làm lại)

```sql
-- Nuke trong SQL Editor (CẨN THẬN — mất hết data)
drop table if exists public.bookings cascade;
drop table if exists public.booking_config cascade;
drop table if exists public.blocked_periods cascade;
drop function if exists public.set_updated_at() cascade;
```

Sau đó chạy lại 4 migration theo thứ tự.

## Sau khi xong

Báo em đã migrate xong → em sẽ build tiếp:

1. `src/lib/supabase/server-client.ts` + `anon-client.ts`
2. Availability engine (24/7 + 30-min grid + 2h forward block)
3. 3 API routes: `/api/availability/days`, `/api/availability/slots`, `/api/book`
4. Phase 06 UI: booking section inline trên main site → submit success → redirect `/thank-you`

## Câu hỏi mở

- ❓ Region đã chọn Singapore chưa?
- ❓ Sau khi migrate xong, anh muốn em type-gen luôn (cần `sbp_` PAT) hay anh tự gen rồi commit file?
