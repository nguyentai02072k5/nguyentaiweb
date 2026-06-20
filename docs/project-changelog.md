# Project Changelog

## 2026-06-20

### Added
- Trang cảm ơn `infor.nguyenvantai.com/thanks` (`src/app/infor/thanks/page.tsx`) — port từ `thanks.html` sang React: card glass full-screen takeover, confetti + particle canvas, countdown 15' (sessionStorage), nút Zalo ripple, quà tặng chatbot AI. Style ở `infor-thanks.module.css`, hiệu ứng tách `use-thanks-effects.ts`. noindex.
- Nền aurora động dùng chung `infor-aurora-background.tsx` (blob trôi `animate-blob-*` + mesh) cho `/infor` và `/infor/[phone]`, thay lớp radial-gradient tĩnh.
- Website mới `form.nguyenvantai.com` (subdomain) — form khai thác thông tin Bot Mooly: 1 trang, contact (Tên + SĐT/Zalo) + 6 trường nội dung (Tên shop·ngành, Link web/fanpage, Sản phẩm·giá/catalog, Quy trình bán hàng, Chính sách, FAQs). Mỗi trường có tooltip (?) giải thích + placeholder mẫu, hoạt động trên mobile & desktop.
- UX: thanh tiến độ hoàn thành (Zeigarnik), tick "đã điền" từng ô, nền Aurora mesh + glass card, CTA gradient shine, trust signals (3–5 phút · bảo mật · có hướng dẫn), trạng thái success.
- Route `/form` (`src/app/form/page.tsx`) + components `src/components/form/mooly-form.tsx`, `mooly-field.tsx`; config `src/lib/leads/mooly-field-config.ts`; schema `mooly-schema.ts`.
- API `POST /api/form/submit` tái dùng RPC `submit_lead` (bảng `leads`, `source='mooly-form'`) + webhook Discord/n8n; admin CMS `/admin/leads` render thêm trường Mooly.

### Changed
- Landing `/infor`: capture form cơ bản thành công → điều hướng thẳng sang `/thanks` (bỏ wizard cấu hình + toast inline tại landing; wizard vẫn giữ ở route `/infor/[phone]`). Form cơ bản bọc trong BOX frame gradient aurora động cho nổi bật. Gỡ `infor-transition-toast.tsx` (dead code).
- `proxy.ts`: thêm rewrite host `form.*` → `/form` (public, không auth), cùng pattern với `infor.*`/`admin.*`.
- Form Mooly: FAQ chuyển từ textarea → **repeater cột Câu hỏi – Câu trả lời** (mỗi dòng 1 cặp, nút +/− thêm-xoá, placeholder xoay theo dòng, dễ điền & tracking). Lưu payload dạng mảng `{q,a}`.
- Trường "Quy trình bán hàng" thêm **note nhắc thu Leads**: với sản phẩm/dịch vụ, ghi rõ điều kiện để bot xin SĐT/Zalo của khách.
- Thanh progress tách thành component `mooly-progress.tsx`, hiển thị `x/total mục · %`, đổi sang trạng thái emerald + tick khi đạt 100% (chỉ đếm mục bắt buộc).
- Admin CMS + webhook dùng chung `formatLeadValue` cho field Mooly (FAQ repeater render thành các dòng `• Q — A`).

## 2026-06-19

### Added
- Bản HTML/CSS/JS thuần của landing `/infor` tại `public/infor-static/`, gồm hero, video demo, features, flow đăng ký cơ bản → modal → form cấu hình chi tiết.
- JS thuần render form config-driven, repeater, validation client-side, tracking `dataLayer`/Meta fallback, và giữ API payload tương thích `/api/infor/capture` + `/api/infor/submit`.
- File single-page export `infor.html` ở root project, self-contained với CSS/JS inline và form native tương thích GHL external tracking.

### Changed
- Chuyển form liên hệ trong `public/infor-static/` sang native HTML form theo chuẩn GHL external tracking: không bind submit bằng JS, có `input type="email"`, dùng `input type="submit"`, bỏ icon nằm trong input, và thêm script `external-tracking.js` với tracking id.
- Khôi phục `infor.html` về nền light Aurora cũ, thay background dark/Cloudinary bằng canvas hạt tím-hồng nhẹ phía sau nội dung; giữ form GHL native không bị JS can thiệp submit/click.
- Giảm độ đậm lớp nền tím-hồng và làm chậm tốc độ hạt background trong `infor.html` để hiệu ứng nền nhẹ hơn, ít cạnh tranh với nội dung.
- Gỡ lớp grid `linear-gradient` 1px trong background `infor.html` vì tạo vạch ngang full-frame; thay bằng radial tint mềm không có đường thẳng.

## 2026-06-10

### Added
- 2 bài blog dạng "landing" (từ HTML mockup → MDX): `tuong-lai-doanh-nghiep-ky-nguyen-ai` (McKinsey/Goldman, 4.400 tỷ USD · 300 triệu việc làm) + `kich-ban-2027-2029-dieu-phoi-hay-bi-bo-lai` (GEO/AEO · cú phân tách 3–10× · Spiral Dynamics).
- Bộ block MDX rich on-brand (Aurora token, an toàn dark): `StatGrid · KeyTakeaways · Callout · AdminNote · DataStat · Fork · CardGrid · Tiers · Steps · Checklist · PullQuote · CTACard` (`src/components/content/blog-mdx-*.tsx`, đăng ký trong `mdx-components.tsx`, dùng theo tên trong `.mdx` không cần import).
- Frontmatter `faqs` (tuỳ chọn) cho blog → section FAQ accordion (`PostFaq`) + `FAQPage` JSON-LD (`buildFaqPageJsonLd`) phục vụ AEO/rich result.

### Changed
- Thay 2 template demo ngành Thời trang & Mỹ phẩm bằng bộ chỉ dẫn chatbot đầy đủ (quy trình tư vấn, NLU, quy tắc khuyến mãi, bảng size dáng người Việt / bảng tư vấn theo loại da, mẫu câu, an toàn tư vấn da). Mỗi trang gói toàn bộ instruction trong 1 khối `text` để copy & dán một chạm vào system prompt chatbot.
- `MdxCodeBlock`: khung cố định `max-h-[36rem]`, chỉ cuộn DỌC (`overflow-y-auto overflow-x-hidden`), dòng dài tự xuống dòng (`whitespace-pre-wrap break-words`) thay vì tràn ngang; nút Copy luôn hiển thị, nội dung copy vẫn đúng (soft-wrap không thêm newline). Áp dụng mọi template + blog.
- Prose heading nổi bật hơn: `.prose h2` thêm thanh accent gradient aurora bên trái + hairline phân tách section; `.prose h3` thêm marker brand-violet. Áp dụng chung template + blog.
- CTA template (`SoftCta`): rút còn 1 nút gradient aurora động "Liên hệ qua Zalo" (heading "Cần hỗ trợ gì cho shop của anh/chị?"), bỏ nút "Đặt lịch tư vấn".

### Removed
- Bỏ hẳn CTA cuối bài blog (`SoftCta` + import khỏi `/blog/[slug]`); gỡ location `blog_cta` khỏi `CtaLocation`.
- Demo `mau-thoi-trang-thu-lead.mdx` (thay bằng `mau-thoi-trang-chot-don.mdx`). Template Mỹ phẩm giữ slug `mau-my-pham-chot-don` nhưng thay toàn bộ nội dung.

## 2026-06-09

### Added
- Kho Template Instruction (`/templates`): lọc client-side theo mô hình kinh doanh + ngành + search không dấu; trang chi tiết `/templates/[slug]` render MDX (prose + nút copy) + đính kèm + CTA mềm + template liên quan.
- pSEO routes `/templates/nganh/[industry]` (SSG, index được) cho từng ngành có template.
- Blog (`/blog` + `/blog/[slug]`): lọc theo 3 chủ đề cố định (Phát triển kinh doanh · Phát triển bản thân · Phân tích trên thế gian), reading-time, related theo chủ đề, CTA mềm.
- Content layer Velite (MDX trong `content/`, frontmatter validate build-time; build fail nếu phân loại sai). Taxonomy SSOT `src/lib/content/taxonomy.ts` + `blog-taxonomy.ts`.
- SEO đầy đủ: `generateMetadata` (canonical + openGraph + twitter), OG động (`next/og`, font Be Vietnam Pro local) cho templates/pSEO/blog, JSON-LD (TechArticle · CollectionPage+ItemList · BlogPosting · BreadcrumbList), `sitemap.ts`, `robots.ts`.
- Site URL SSOT `src/lib/seo/site.ts` (env `NEXT_PUBLIC_SITE_URL`). Nav thêm link Templates + Blog.

### Changed
- `metadataBase` + og:url + canonical homepage lấy từ `site.ts` (thay hardcode).
- `robots.txt` chặn `/admin`, `/api` và các trang dev-verify (`/brand`, `/logo`, `/components`, `/animations`).

### Dependencies
- Thêm `velite`, `@tailwindcss/typography`, `concurrently` (devDep). Build script: `velite && next build`.

### Notes
- Khi deploy: set env `NEXT_PUBLIC_SITE_URL=https://nguyenvantai.com` để canonical/OG/sitemap dùng đúng domain.

## 2026-05-16

### Added
- Added Meta Conversions API server-side booking conversion dispatch.
- Added `Lead` and `Schedule` server events after successful booking creation.
- Added browser/server deduplication with booking-derived `eventID`.
- Added hashed Meta user data matching fields for email, phone, first name, last name, external ID, `_fbp`, `_fbc`, IP, and user agent.
- Documented Meta CAPI environment variables in `.env.local.example`.
- Added optional `META_CAPI_TEST_EVENT_CODE` support for Meta Events Manager testing.
- Installed Meta Pixel `1658487875083016` via Next.js `Script`.
- Added client-side `PageView` tracking for initial load and route changes.
- Added CTA click custom event tracking.
- Added booking funnel events: booking section view, day select, slot select, mobile form view, submit attempt, submit errors.
- Added successful booking conversion tracking with Meta standard `Lead` and `Schedule` events.

### Privacy
- Meta CAPI token is read from `META_CAPI_ACCESS_TOKEN`; real token is not stored in source code.
- Pixel events do not send phone, email, name, or booking ID.
