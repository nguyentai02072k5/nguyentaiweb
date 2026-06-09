---
phase: 5
title: Blog
status: completed
priority: P3
effort: 1d
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Blog

## Overview
Trang Blog (`/blog` + `/blog/[slug]`) chia sẻ kiến thức, tái dùng toàn bộ content layer + MDX components + SEO của Phase 1–4. Làm SAU khi Templates ổn định.

## Requirements
- Functional: listing bài viết (sort mới nhất, lọc theo tag/category nhẹ + search), detail render MDX + tác giả + ngày + reading time + related + CTA mềm. SSG.
- Non-functional: SEO BlogPosting + sitemap + OG động; khớp Aurora; module <200 dòng.

## Architecture
- Velite collection `posts` (đã khai báo khung ở Phase 1) hoàn thiện schema: { title, description, category|tags[], cover, author (`s.string().optional()` — tên hiển thị, default owner), publishedAt, updatedAt, draft?, body s.mdx() }. JSON-LD `BlogPosting.author` map sang **Person object `{name, url}`** (url = site author từ `site.ts`), KHÔNG để author là string trần trong schema.org.
- `app/blog/page.tsx` (RSC SSG): list + filter tag + search (client component nhỏ tái dùng pattern explorer). Loại `draft`.
- `app/blog/[slug]/page.tsx`: `generateStaticParams`, render `prose` + MDX (tái dùng `mdx-components.tsx`), meta header, related (cùng tag/category), CTA mềm.
- SEO: `generateMetadata` + `opengraph-image.tsx` (tái dùng builder) + JSON-LD `BlogPosting` + BreadcrumbList; thêm bài vào `sitemap.ts`.
- Nav: thêm link "Blog" vào `LANDING.nav.links`.

## Related Code Files
- Create:
  - `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`
  - `src/app/blog/[slug]/opengraph-image.tsx`
  - `src/components/blog/post-card.tsx`, `post-list-explorer.tsx`, `post-detail-header.tsx`
  - `content/blog/*.mdx` — 2–3 bài seed
  - `public/blog/<slug>/cover.*`
- Modify:
  - `velite.config.ts` — hoàn thiện schema `posts`
  - `src/lib/content/queries.ts` — `getPosts()`, `getPostBySlug()`, `getRelatedPosts()`
  - `src/lib/seo/json-ld.ts` — `buildBlogPosting()`
  - `src/app/sitemap.ts` — thêm posts
  - `src/content/landing.ts` + nav — link Blog (PageLink, như Templates)
  - reading-time: tính từ **raw content qua Velite transform** (body sau compile là function string, KHÔNG phải plain text — F11). Velite `s.mdx()` cho phép thêm computed field; hoặc package `reading-time` (tiny). Không tự đếm trên body compiled.

## Implementation Steps
0. **Refactor DRY trước** (nếu Phase 2 chưa tách): rút `content-explorer.tsx` generic (filter + grid) + `content-card` base từ templates để blog tái dùng, tránh fork ~90% code.
1. Hoàn thiện schema `posts` trong `velite.config.ts` (bằng `s`) + computed reading-time + `getPosts/getPostBySlug/getRelatedPosts`.
2. `blog/page.tsx`: listing + filter tag + search (tái dùng `content-explorer` generic, 1 chiều tag).
3. `post-card.tsx`: cover, title, description, tag, ngày, reading time.
4. `blog/[slug]/page.tsx`: generateStaticParams, header (title/author/ngày/reading time), `prose` MDX, related, CTA mềm.
5. SEO: generateMetadata + opengraph-image + JSON-LD BlogPosting + BreadcrumbList; thêm vào sitemap.
6. Nav thêm "Blog"; seed 2–3 bài.
7. Verify build + lint + SEO validate.

## Success Criteria
- [ ] `/blog` listing SSG, lọc tag + search, loại draft
- [ ] `/blog/[slug]` render MDX + meta + reading time + related + CTA
- [ ] SEO: meta + OG động + JSON-LD BlogPosting validate; posts trong sitemap
- [ ] Nav có link Blog (desktop + mobile)
- [ ] ≥2 bài seed; `pnpm build` + `pnpm lint` pass

## Risk Assessment
- **Trùng lặp code với Templates**: chủ động tái dùng `mdx-components`, `json-ld`, opengraph builder, explorer pattern (DRY). Tránh fork logic.
- **Draft leak**: đảm bảo filter `draft` ở cả listing, generateStaticParams, sitemap.
- **Scope creep** (comment, RSS, pagination): ngoài v1, note lại nếu cần.
