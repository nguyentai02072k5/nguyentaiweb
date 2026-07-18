# Brainstorm — Course LMS cho course.nguyenvantai.com

- **Ngày**: 2026-07-16
- **Skill**: /brainstorm (không flag)
- **Trạng thái**: Thiết kế đã DUYỆT, sẵn sàng /ck:plan
- **Nguồn bối cảnh**: `phan-tich-DRMcourse.txt` (bàn kiến trúc hosting Vercel+Supabase+R2)

## 1. Bài toán

Xây khu học tập (LMS) trên subdomain `course.nguyenvantai.com`: giao diện đẹp, dễ thao tác, responsive Mobile + PC. Học viên đăng ký miễn phí để xem video bài học có bảo vệ.

## 2. Scout — codebase hiện có

- Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui + Framer Motion. Deploy Vercel.
- Nội dung chạy bằng **Velite** (MDX trong git): collection `blog`, `templates`. Không CMS.
- **Supabase chỉ server-side** (service-role). Chưa có auth người dùng cuối — chỉ admin HMAC cookie.
- **Subdomain pattern** trong `src/proxy.ts`: admin/infor/form/webhook/landing.* rewrite → route nội bộ. `course.*` sẽ theo đúng khuôn.
- Chưa có gì về video/khoá học/R2.

## 3. Quyết định đã chốt (qua AskUserQuestion)

| Hạng mục | Chọn |
|---|---|
| Phạm vi | LMS đầy đủ (không chỉ trang bán) |
| Số khoá | 2–6 |
| Nội dung | Velite MDX (git) |
| Bảo vệ video | Cơ bản (signed URL + CORS, gate sau login) |
| Enrollment | Đăng ký miễn phí (login = xem hết, KHÔNG cần bảng enrollment) |
| Auth | Supabase Auth (magic-link + Google) |
| Video host | Cloudflare R2 + signed URL |
| Render khu học | RSC gated + island nhỏ |
| Trang tiến độ | Có, `/course/tai-khoan` riêng |

## 4. Giải pháp chốt

### Kiến trúc hybrid tĩnh/động
- **MDX (git)** `content/courses/<khoa>.mdx`: `title, description, level, cover, instructor, modules[]`; mỗi lesson `{ slug, title, duration, videoKey, free? }`. Nội dung text trong body.
- **Supabase**: 1 bảng `lesson_progress (user_id, course_slug, lesson_slug, completed_at)` + RLS "user chỉ đọc/ghi row của mình". Auth users do Supabase Auth quản lý.

### Sitemap (`course.*` → `/course/*`)
```
/course                    Catalog (PUBLIC, SEO)
/course/[khoa]             Chi tiết/bán khoá (PUBLIC, SEO)
/course/[khoa]/hoc/[bai]   Khu học tập player (GATED)
/course/dang-nhap          Đăng nhập (magic-link + Google)
/course/tai-khoan          Tiến độ của tôi (GATED)
```

### Vai trò "bảo vệ cơ bản"
Không phải chống share account (khoá free). Mục đích: gate video sau đăng nhập → bắt để email (lead magnet), chặn hotlink file R2. Signed URL TTL ngắn (~5 phút), bucket private, CORS chỉ allow `course.nguyenvantai.com`.

### Luồng auth + video
```
Bấm bài → RSC layout check Supabase session
  ├─ chưa login → redirect /course/dang-nhap?next=…
  └─ đã login  → API /api/course/video-url mint signed URL R2 → <video> phát
```

### UI/UX — layout "lớp học"
- **PC**: 2 cột — sidebar 320px (progress + chương/bài accordion, bài đang học highlight, checkmark bài xong) | main (video 16:9 → tabs Nội dung/Tài liệu/Ghi chú → nút "Đánh dấu hoàn thành" + "Bài tiếp").
- **Mobile**: video sticky đầu; danh sách bài thu vào drawer/bottom-sheet (nút ☰); nút Hoàn thành/Tiếp to, đặt dưới trong tầm ngón cái; progress bar dưới player.
- **Trang chi tiết khoá (public)**: dùng lại pattern `templates` — hero + CTA "Học miễn phí" → "Bạn học được gì" → curriculum accordion (bài `free` xem thử) → giảng viên → FAQ → CTA cuối.

## 5. Touchpoints triển khai

- `src/proxy.ts` — thêm nhánh rewrite `course.*` → `/course/*` (public, không auth ở proxy).
- `velite.config.ts` — thêm collection `courses` + validate (theo pattern `prepare()` đếm mdx hiện có).
- `content/courses/*.mdx` — nội dung khoá.
- `src/app/course/*` — routes mới (catalog, detail, player layout gated, dang-nhap, tai-khoan).
- `src/lib/supabase/*` — thêm SSR auth client (`@supabase/ssr`), giữ `server-client` service-role riêng.
- `src/lib/r2/*` — client + hàm mint signed URL (mới).
- Supabase — migration `lesson_progress` + RLS.
- `src/components/course/*` — sidebar, lesson-list, video-player, progress-bar, course-card.

## 6. Rủi ro & lưu ý

- **MDX build-time**: thêm/sửa bài = commit + deploy (~1–2 phút). Chấp nhận được với 2–6 khoá cập nhật thưa.
- **`@supabase/ssr` + Next 16**: cookie-based auth cần cấu hình đúng; gate đặt ở layout Server Component, KHÔNG nhồi vào proxy (giữ proxy edge gọn, tránh đụng auth admin HMAC).
- **R2 CORS**: lỗi kinh điển — phải allow đúng origin `course.nguyenvantai.com`.
- **Signed URL trong RSC**: mint per-request, TTL ngắn; cân nhắc cache-control để không lộ trong static.
- **RLS**: bắt buộc bật cho `lesson_progress` — service-role bypass RLS nên phần progress phải dùng client auth (anon+session), không dùng `supabaseAdmin`.

## 7. Nghiệm thu (acceptance)

1. Khách xem catalog + curriculum công khai (SEO ok).
2. Đăng ký free bằng magic-link/Google.
3. Chỉ khi login mới phát được video (R2 signed URL, hotlink hết hạn).
4. "Đánh dấu hoàn thành" lưu bền vào Supabase, hiện lại đúng ở sidebar + `/course/tai-khoan`.
5. Chạy mượt Mobile & PC (video sticky mobile, 2 cột PC).

## 8. Bước tiếp

`/ck:plan` — chia phase triển khai. Đề xuất thứ tự: (P1) subdomain + catalog + detail public MDX → (P2) Supabase Auth + login → (P3) R2 signed URL + player gated → (P4) progress + trang tài khoản → (P5) polish responsive/animation.

## 9. Câu hỏi còn treo

- Domain `course.nguyenvantai.com` đã trỏ DNS về Vercel chưa? (cần cấu hình trước P1).
- R2 bucket + credentials đã có sẵn chưa, hay tạo mới?
- 2–6 khoá: đã có sẵn video/nội dung chưa, hay cần khoá mẫu (placeholder) để dựng UI trước?
