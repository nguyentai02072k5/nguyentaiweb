-- ---------------------------------------------------------------------------
-- 0010_init_lead_docs_storage.sql
--
-- Bucket lưu file khách upload ở chế độ "đã có sẵn tài liệu" của phiếu set-up
-- chatbot (mô tả doanh nghiệp + quy trình bán hàng). Thay cho việc điền tay
-- toàn bộ wizard, khách chỉ cần đính kèm 1 file.
--
-- - Bucket PRIVATE: file tài liệu nội bộ, chỉ truy cập qua signed URL do server
--   (service role) phát hành. Không để public để tránh lộ tài liệu kinh doanh.
-- - file_size_limit 2MB: chặn ở tầng storage, server cũng validate lại.
-- - Service role bỏ qua RLS → upload/sign từ Route Handler không cần policy.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('lead-docs', 'lead-docs', false, 2097152)
on conflict (id) do update
  set public          = excluded.public,
      file_size_limit = excluded.file_size_limit;
