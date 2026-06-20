-- Migration 0008: leads table - thu thập thông tin khách qua link riêng theo SĐT.
--
-- Khác với `bookings` (ràng buộc theo slot lịch hẹn), `leads` chỉ là kho thông
-- tin khách điền ở trang infor.nguyenvantai.com/<sđt>. Mỗi SĐT = 1 lead (unique).
--
-- Vòng đời:
--   1. Khách MỞ link  → RPC record_lead_open()  → status 'opened'  (auto-fired)
--   2. Khách SUBMIT   → RPC submit_lead()        → status 'submitted'
--   3. Owner xử lý     → cập nhật status thủ công ở CMS (contacted/converted/spam)
--
-- `payload` là jsonb linh hoạt: các trường câu hỏi sẽ chốt sau, không cần đổi schema.

-- ---------------------------------------------------------------------------
-- Table: public.leads
-- ---------------------------------------------------------------------------

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),

  -- Định danh: 1 SĐT = 1 lead. Khớp constraint phone của bookings.
  phone        text not null unique
    constraint leads_phone_format
      check (phone ~ '^(\+84|0)\d{9,10}$'),

  -- Trạng thái vòng đời lead
  status       text not null default 'opened'
    constraint leads_status_valid
      check (status in ('opened','submitted','contacted','converted','spam','archived')),

  -- Thông tin khách. `full_name` tách riêng để CMS lọc/tìm nhanh;
  -- mọi câu trả lời còn lại (trường chốt sau) gom vào `payload` jsonb.
  full_name    text,
  payload      jsonb not null default '{}'::jsonb,
  note         text,   -- ghi chú nội bộ của owner

  -- Theo dõi tương tác
  open_count   integer not null default 1
    constraint leads_open_count_positive check (open_count >= 0),
  opened_at    timestamptz not null default now(),
  submitted_at timestamptz,

  -- Nguồn + chống spam (one-way hash, không lưu IP gốc)
  source       text default 'infor-link',
  user_agent   text,
  ip_hash      text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_leads_status     on public.leads (status);
create index if not exists idx_leads_created_at  on public.leads (created_at desc);
create index if not exists idx_leads_opened_at   on public.leads (opened_at desc);

-- updated_at trigger (set_updated_at đã định nghĩa ở migration 0001)
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RPC: record_lead_open - auto-fired khi khách MỞ link.
-- Insert lead mới với status 'opened', hoặc nếu đã tồn tại thì chỉ tăng
-- open_count + cập nhật opened_at. KHÔNG đụng tới status/payload đã có
-- (tránh việc mở lại link làm mất dữ liệu khách đã submit).
-- ---------------------------------------------------------------------------

create or replace function public.record_lead_open(
  p_phone      text,
  p_user_agent text default null,
  p_ip_hash    text default null,
  p_source     text default 'infor-link'
)
returns table (id uuid, status text, full_name text, payload jsonb)
language plpgsql
as $$
begin
  return query
  insert into public.leads (phone, status, user_agent, ip_hash, source)
  values (p_phone, 'opened', p_user_agent, p_ip_hash, coalesce(p_source, 'infor-link'))
  on conflict (phone) do update
    set open_count = public.leads.open_count + 1,
        opened_at  = now(),
        user_agent = coalesce(excluded.user_agent, public.leads.user_agent)
  returning public.leads.id, public.leads.status, public.leads.full_name, public.leads.payload;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: submit_lead - khi khách GỬI form.
-- Ghi đè full_name + payload, chuyển status sang 'submitted', đóng dấu thời gian.
-- Dùng upsert phòng trường hợp record open chưa kịp tạo.
-- ---------------------------------------------------------------------------

create or replace function public.submit_lead(
  p_phone      text,
  p_full_name  text default null,
  p_payload    jsonb default '{}'::jsonb,
  p_user_agent text default null,
  p_ip_hash    text default null,
  p_source     text default 'infor-link'
)
returns table (id uuid, status text, submitted_at timestamptz)
language plpgsql
as $$
begin
  return query
  insert into public.leads (phone, status, full_name, payload, submitted_at, user_agent, ip_hash, source)
  values (p_phone, 'submitted', p_full_name, coalesce(p_payload, '{}'::jsonb), now(),
          p_user_agent, p_ip_hash, coalesce(p_source, 'infor-link'))
  on conflict (phone) do update
    set status       = 'submitted',
        full_name    = coalesce(excluded.full_name, public.leads.full_name),
        payload      = coalesce(excluded.payload, public.leads.payload),
        submitted_at = now(),
        user_agent   = coalesce(excluded.user_agent, public.leads.user_agent),
        ip_hash      = coalesce(excluded.ip_hash, public.leads.ip_hash)
  returning public.leads.id, public.leads.status, public.leads.submitted_at;
end;
$$;
