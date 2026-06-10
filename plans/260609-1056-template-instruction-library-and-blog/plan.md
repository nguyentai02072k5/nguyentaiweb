---
title: Kho Template Instruction + Blog
description: >-
  Kho template instruction theo mô hình/ngành/mục tiêu + blog kiến thức, content
  MDX qua Velite, SEO đầy đủ
status: completed
priority: P2
branch: main
tags:
  - content
  - mdx
  - velite
  - seo
  - templates
  - blog
blockedBy: []
blocks: []
created: '2026-06-09T04:31:08.991Z'
createdBy: 'ck:plan'
source: skill
---

# Kho Template Instruction + Blog

## Overview

Thêm 2 tính năng nội dung cho landing `nguyenvantai.com`:
1. **Kho Template Instruction** (`/templates`) - owner thêm "hàng tá" template `.mdx`; khách lọc theo mô hình KD + ngành + search, xem full + CTA mềm đặt lịch.
2. **Blog** (`/blog`) - owner chia sẻ kiến thức, kéo organic traffic vào funnel.

Content-as-code: `.mdx` trong repo, content layer **Velite** (frontmatter typed zod, validate build-time). SEO đầy đủ (meta + OG động + JSON-LD + sitemap + robots). Tái dùng design tokens Aurora, nav, `trackCtaClick`.

Nguồn: brainstorm `plans/reports/brainstorm-260609-1056-template-instruction-library-and-blog-report.md`; research `plans/reports/researcher-260609-1126-velite-nextjs16-turbopack-integration-report.md` + `researcher-260609-1127-nextjs16-content-seo-mdx-patterns-report.md`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Foundation & Velite Setup](./phase-01-foundation-velite-setup.md) | Completed |
| 2 | [Templates Listing & Filter](./phase-02-templates-listing-filter.md) | Completed |
| 3 | [Template Detail & CTA](./phase-03-template-detail-cta.md) | Completed |
| 4 | [SEO Complete](./phase-04-seo-complete.md) | Completed |
| 5 | [Blog](./phase-05-blog.md) | Completed |

Build order: 1 → 2 → 3 → 4 (giao giá trị Templates trước), 5 (Blog) làm sau, tái dùng content layer.

## Key Decisions (locked + red-team adjusted)

- **Storage**: `.mdx` trong `content/` (publish = deploy lại, **SSG thuần - KHÔNG ISR**). **Tooling**: Velite v0.3.x programmatic init trong `next.config.ts` (Turbopack KHÔNG dùng webpack plugin) + script tường minh `velite build && next build` (tránh race trên Vercel). Fallback: `next-mdx-remote/rsc` nếu Velite vướng.
- **Schema bằng Velite `s`** (KHÔNG dùng `z` của project): velite@0.3.1 không phụ thuộc zod, bundle validator `s` riêng - trộn zod 4 sẽ lỗi API. Enum lấy từ taxonomy SSOT truyền vào `s.enum()`.
- **Taxonomy 2 chiều** (SSOT `src/lib/content/taxonomy.ts`): `businessModel` (ban-le | dich-vu) = nhóm · `industry` (gắn theo model) = ngành cụ thể. **ĐÃ BỎ chiều `goal`** (nuôi dưỡng/thu leads/chốt đơn) theo yêu cầu owner 2026-06-09 - gỡ khỏi filter + badge + schema/frontmatter + related logic. `schemaType` (article/howto cho JSON-LD) là field RIÊNG, vẫn giữ.
- **SEO surface = pSEO routes**: `/templates/nganh/[industry]` tĩnh, index được (SSG từ taxonomy). Trang `/templates` giữ **filter client-side** cho UX duyệt nhanh (KISS) - không phải bề mặt index chính.
- **Template** = bộ hỗn hợp: mô tả + instruction MDX + đính kèm (cover = path `public/`, KHÔNG `s.image()` để tránh sharp). **Khách**: xem full + CTA mềm (đặt lịch/Zalo), không gate.
- **SEO**: `generateMetadata` + `generateStaticParams` (SSG); OG động qua `opengraph-image.tsx` (`next/og` built-in, runtime nodejs, font local); JSON-LD mặc định `TechArticle` (opt-in `HowTo` qua frontmatter `schemaType`) + `BreadcrumbList` + `BlogPosting` (blog); `sitemap.ts` (gồm pSEO routes) + `robots.ts` (chỉ disallow `/admin` + `/api`, KHÔNG chặn `/booking`).
- **Path alias**: `#site/content → ./.velite` (không dùng `@/.velite`).

## New Dependencies

- `velite` (required) · `@tailwindcss/typography` v0.5 (Tailwind v4, style prose MDX) · `concurrently` (devDep - chạy `velite --watch` + `next dev` song song; `&` KHÔNG hoạt động trên Windows cmd/PowerShell). Không thêm `nuqs`. Reading-time (blog) tính từ raw content, tránh thêm dep.
- **Site URL SSOT**: `src/lib/seo/site.ts` đọc `NEXT_PUBLIC_SITE_URL` (fallback `https://nguyenvantai.com`) - dùng chung cho `metadataBase` (layout đang hardcode), sitemap, robots, JSON-LD (tránh 3 nguồn).

## Red-team applied

Vòng 1 (`plans/reports/red-team-260609-1056-*-findings.md`) hợp nhất: B1 (zod/`s`), H1 (nav PageLink type), H2/H3 (build pipeline + alias), H4 (SSG no ISR), F3 (README), F5 (TechArticle default), F6 (robots), F11/DRY (reading-time raw + content-explorer generic). F1 → pSEO routes (user chốt). F2 → giữ 1:1 (user chốt).

Vòng 2 verify (`plans/reports/red-team-v2-260609-1056-*-verdict.md`) - verdict **COOK WITH CAVEATS**, đã fold: N1 (prose `.dark` token override), N2 (dev script `concurrently`, bỏ `&` hỏng Windows), N3 (pSEO `dynamicParams=false`), N5 (site.ts URL SSOT), M5 (Phase 5 deps→[1,2,3,4]), G1 (intro pSEO từ `industry.description` chống thin content), G3 (font cụ thể), F8 (bỏ ribbon UI). Còn mở: N4 (`s.refine` xác nhận ở spike Phase 1 step 2 - đã gate đúng thứ tự).

## Scope changes (post-cook)

- **2026-06-09 - Bỏ chiều `goal`**: owner yêu cầu đơn giản hoá filter chỉ còn mô hình (nhóm) + ngành. Gỡ `goal` khỏi: `taxonomy.ts` (GOALS), `velite.config.ts` schema, frontmatter 5 seed template, `template-filters.ts`, `template-filter-bar.tsx`, `templates-explorer.tsx`, badge ở `template-card.tsx` + `template-detail-header.tsx`. `getRelatedTemplates` đổi fallback: industry → cùng businessModel → featured. (Đảo F2 cũ - quyết định sản phẩm của owner.)

## Dependencies

<!-- No cross-plan dependencies. Existing plans (landing, meta-pixel, meta-CAPI) không overlap. -->
