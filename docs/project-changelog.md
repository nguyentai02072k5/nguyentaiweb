# Project Changelog

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
