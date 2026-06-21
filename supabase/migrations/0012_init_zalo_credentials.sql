-- Bảng lưu credential Zalo (cookie/imei/userAgent) đã mã hóa AES-256-GCM.
-- Worker Node dùng service_role key để đọc/ghi; RLS bật, không có policy public
-- nên chỉ service_role (bypass RLS) mới truy cập được.

create table if not exists public.zalo_credentials (
  id           text primary key,              -- định danh phiên (mặc định 'default'), cho phép nhiều tài khoản sau này
  enc_payload  text not null,                 -- base64(iv|tag|ciphertext) của JSON {cookie, imei, userAgent}
  display_name text,                          -- tên hiển thị tài khoản Zalo (tiện theo dõi)
  updated_at   timestamptz not null default now()
);

alter table public.zalo_credentials enable row level security;

comment on table public.zalo_credentials is 'Credential Zalo đã mã hóa cho zalo-worker (zca-js). Chỉ truy cập qua service_role.';
