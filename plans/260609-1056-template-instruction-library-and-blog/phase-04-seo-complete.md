---
phase: 4
title: SEO Complete
status: completed
priority: P2
effort: 1d
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: SEO Complete

## Overview
SEO đầy đủ cho templates (và khung dùng lại cho blog): per-page metadata, OG image động, JSON-LD, sitemap.xml, robots.txt. Mục tiêu organic traffic + rich results.

## Requirements
- Functional: mỗi template có title/description/canonical/openGraph/twitter; OG card động (title + badge ngành + brand); JSON-LD HowTo + BreadcrumbList; `sitemap.xml` liệt kê route tĩnh + tất cả template; `robots.txt` hợp lệ (chặn `/admin`).
- Non-functional: validate Rich Results Test; OG render đúng font VN; cache OG 1 năm.

## Architecture
- `metadataBase` set 1 lần ở `app/layout.tsx` (kiểm tra chưa có) → URL tương đối tự compose. `siteUrl` từ env `NEXT_PUBLIC_SITE_URL` (fallback prod domain).
- `generateMetadata` cho 3 nhóm trang: `templates/page.tsx`, `templates/nganh/[industry]/page.tsx` (pSEO), `templates/[slug]/page.tsx`: title, description, `alternates.canonical` (mỗi trang canonical về chính nó), openGraph/twitter.
- **OG động**: file convention `opengraph-image.tsx` cho `[slug]` (per-template) + `nganh/[industry]` (per-ngành) + `/templates` (listing). `next/og` `ImageResponse`, **runtime nodejs**, font Be Vietnam Pro + Space Grotesk load từ `public/fonts/` qua `readFile`. Card: title + badge + brand + nền Aurora. Cache `max-age=31536000`.
- **JSON-LD**: helper `src/lib/seo/json-ld.ts`; inject qua `src/components/seo/json-ld-script.tsx` (`dangerouslySetInnerHTML={{__html: JSON.stringify(x)}} suppressHydrationWarning`) trong RSC. Template detail → mặc định **`TechArticle`**, chỉ emit **`HowTo`** khi frontmatter `schemaType === 'howto'` (F5: KHÔNG auto-parse heading; HowTo cần `step[]` đúng cấu trúc, sai → Google phạt) + `BreadcrumbList`. pSEO industry page → `CollectionPage` + `ItemList` (list template) + BreadcrumbList.
- `app/sitemap.ts` (`MetadataRoute.Sitemap`): route tĩnh (`/`, `/templates`, `/booking`, legal) + **pSEO `/templates/nganh/[industry]`** (ngành có template) + map template detail (`lastModified` từ updatedAt||publishedAt). `app/robots.ts`: allow all, **chỉ disallow `/admin` + `/api`** (F6: KHÔNG chặn `/booking`), trỏ sitemap.
- Filtered views (client) không có URL nên không vào sitemap. pSEO routes thì index được.

## Related Code Files
- Create:
  - `src/app/templates/[slug]/opengraph-image.tsx` - OG per-template
  - `src/app/templates/nganh/[industry]/opengraph-image.tsx` - OG per-ngành
  - `src/app/templates/opengraph-image.tsx` - OG trang kho (số template + highlight)
  - `src/lib/seo/json-ld.ts` - builders `TechArticle`/`HowTo`/`CollectionPage`/`ItemList`/`BreadcrumbList`/`BlogPosting`
  - `src/lib/seo/site.ts` - site URL SSOT (env + fallback) cho metadataBase/sitemap/robots/JSON-LD
  - `src/lib/seo/og-fonts.ts` - load font local cho ImageResponse (DRY 3 OG routes)
  - `src/components/seo/json-ld-script.tsx` - inject an toàn
  - `src/app/sitemap.ts`, `src/app/robots.ts`
  - `public/fonts/*` - font file (.ttf/.otf) Be Vietnam Pro + Space Grotesk (nếu repo chưa có local - verify TRƯỚC)
- Modify:
  - `src/app/layout.tsx` - refactor `metadataBase` (đang hardcode `https://nguyenvantai.com`) dùng `site.ts` SSOT
  - `src/app/templates/page.tsx` + `nganh/[industry]/page.tsx` + `[slug]/page.tsx` - `generateMetadata` + JSON-LD
  - (giữ nguyên) `src/app/api/og/route.tsx` - proxy tĩnh cho home; OG động dùng file convention

## Implementation Steps
1. **Verify font local TRƯỚC** (chặn rủi ro fail muộn): kiểm tra `public/fonts/`. App hiện dùng `next/font` (không có file thô) → tải `BeVietnamPro-Regular.ttf` + `SpaceGrotesk-Medium.ttf` (Google Fonts → Download family, range Latin + Vietnamese), đặt `public/fonts/`. Làm đầu tiên.
2. **Site URL SSOT** `src/lib/seo/site.ts`: đọc `NEXT_PUBLIC_SITE_URL` (fallback `https://nguyenvantai.com`). Refactor `metadataBase` ở `layout.tsx` (đang hardcode) + sitemap + robots + JSON-LD đều import từ đây (tránh 3 nguồn - N5).
3. `generateMetadata`: `[slug]` (title `${title} · Template`, canonical `/templates/${slug}`), `nganh/[industry]` (title `Template [Ngành]`, canonical `/templates/nganh/${industry}`), `/templates` (canonical `/templates`). openGraph + twitter card.
4. `og-fonts.ts` + 3 `opengraph-image.tsx` (`[slug]`, `nganh/[industry]`, `/templates`): ImageResponse 1200×630, nền Aurora, title (Space Grotesk), badge (Be Vietnam Pro), brand; font qua `readFile(public/fonts/..)`; `runtime='nodejs'`; export size + contentType. Test dấu tiếng Việt.
5. `json-ld.ts`: `buildTechArticle` (default detail), `buildHowTo` (chỉ khi `schemaType==='howto'`, step từ frontmatter có cấu trúc - KHÔNG parse heading), `buildCollectionPage/ItemList(industry,templates)`, `buildBreadcrumb`. `json-ld-script.tsx` render an toàn.
6. Gắn JSON-LD: detail (TechArticle|HowTo + Breadcrumb); pSEO industry (CollectionPage + ItemList + Breadcrumb).
7. `app/sitemap.ts`: static routes + pSEO industry routes (ngành có template) + template detail; lastModified `updatedAt||publishedAt`. `app/robots.ts`: disallow `/admin` + `/api` (KHÔNG `/booking`), host + sitemap URL.
8. Verify: build OK; xem OG `/templates/<slug>/opengraph-image` + `/templates/nganh/<industry>/opengraph-image`; validate JSON-LD (Rich Results) cho TechArticle + HowTo (nếu có) + ItemList; mở `/sitemap.xml` (đủ pSEO + detail) + `/robots.txt`.

## Success Criteria
- [ ] Font local có trong `public/fonts/` (verify đầu phase)
- [ ] `metadataBase` set; canonical đúng cho `/templates`, `nganh/[industry]`, `[slug]`
- [ ] `generateMetadata` đủ title/description/og/twitter cho 3 nhóm trang
- [ ] OG động render đúng (title + badge + brand) cho detail + pSEO ngành, font VN không lỗi dấu, cache 1 năm
- [ ] JSON-LD: TechArticle (default) / HowTo (khi schemaType=howto) + BreadcrumbList + ItemList (pSEO) validate pass Rich Results
- [ ] `/sitemap.xml` đủ template detail + pSEO industry + route tĩnh, lastModified đúng
- [ ] `/robots.txt` hợp lệ, chặn `/admin` + `/api` (KHÔNG `/booking`), trỏ sitemap
- [ ] `pnpm build` + `pnpm lint` pass

## Risk Assessment
- **Font trong ImageResponse**: phải có font file local (`public/fonts/`), không fetch Google runtime (chậm/fail). Kiểm tra dấu tiếng Việt. Nếu repo chưa có font local → bổ sung subset.
- **HowTo schema không hợp** mọi template (không phải bài dạng step): fallback `TechArticle`/`Article` để tránh markup sai → Google phạt.
- **metadataBase trùng** nếu đã set ở nơi khác: kiểm tra trước, tránh override nhầm.
- **OG runtime**: nodejs (không edge) để `readFile` font hoạt động trên Vercel.
