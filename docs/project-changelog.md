# Project Changelog

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
