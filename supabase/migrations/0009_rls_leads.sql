-- Migration 0009: Row Level Security cho bảng leads.
-- Khoá sạch như các bảng booking (migration 0004): bật RLS, KHÔNG tạo policy nào.
--   → chỉ service_role (API route server) truy cập được (bypass RLS).
--   → anon / authenticated có ZERO quyền qua Data API / PostgREST.
--
-- Lý do: leads chứa PII (phone, full_name) + thông tin shop khách trong payload,
-- tuyệt đối không được lộ qua Data API công khai (anon key nằm trong bundle browser).

alter table public.leads enable row level security;

-- Dọn policy cũ nếu có (idempotent khi chạy lại)
drop policy if exists "Public can read leads"   on public.leads;
drop policy if exists "Public can insert leads"  on public.leads;
drop policy if exists "Public can update leads"  on public.leads;
drop policy if exists "Public can delete leads"  on public.leads;

-- KHÔNG tạo policy → service_role only.
