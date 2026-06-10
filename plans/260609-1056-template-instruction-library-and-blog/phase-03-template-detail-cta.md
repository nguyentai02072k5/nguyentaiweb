---
phase: 3
title: Template Detail & CTA
status: completed
priority: P1
effort: 1d
dependencies:
  - 1
  - 2
---

# Phase 3: Template Detail & CTA

## Overview
Trang `/templates/[slug]`: render full nội dung MDX (mô tả + instruction) + phần đính kèm + nút copy + CTA mềm (đặt lịch/Zalo) cuối trang + related templates. SSG qua `generateStaticParams`.

## Requirements
- Functional: render MDX đẹp theo design tokens; copy được instruction/code block; liệt kê + download/preview đính kèm; CTA mềm track click; related (cùng industry trước, fallback goal). 404 nếu slug không tồn tại.
- Non-functional: SSG tất cả slug, a11y, responsive, prose readable. Module <200 dòng.

## Architecture
- `app/templates/[slug]/page.tsx` (RSC): `generateStaticParams` từ `getTemplates()`; `getTemplateBySlug(slug)` → `notFound()` nếu null. Render header (title, description, badges model/industry/goal, updated date) + `<article class="prose">` chứa `<MDXContent>` + attachments + CTA + related.
- MDX render dùng `mdx-components.tsx` (Phase 1): heading/p/list/link/blockquote + `pre`→code block kèm `CopyButton`. Bao `@tailwindcss/typography` `prose` + override tokens.
- `template-attachments.tsx`: list đính kèm (label + link, icon theo loại, target _blank rel noopener).
- `template-cta.tsx`: block CTA mềm tái dùng style aurora + `trackCtaClick('templates-detail-cta')`, href `/booking` (hoặc `#booking`) + link Zalo. KHÔNG gate.
- `related-templates.tsx`: 3 card liên quan (lọc cùng industry, loại bản thân; thiếu thì bù theo goal).

## Related Code Files
- Create:
  - `src/app/templates/[slug]/page.tsx` - detail RSC + generateStaticParams
  - `src/app/templates/[slug]/not-found.tsx` - 404 riêng (optional, dùng global nếu có)
  - `src/components/templates/template-attachments.tsx`
  - `src/components/templates/template-cta.tsx`
  - `src/components/templates/related-templates.tsx`
  - `src/components/templates/template-detail-header.tsx` - title/badges/meta
- Modify:
  - `src/lib/content/queries.ts` - `getRelatedTemplates(current, limit)`
  - `src/components/content/mdx-components.tsx` - hoàn thiện nếu Phase 1 để khung
- Reuse:
  - `src/lib/analytics/track-cta-click.ts`, design tokens, `badge`/`separator` shadcn

## Implementation Steps
1. `[slug]/page.tsx`: `generateStaticParams` map slug; load template, `notFound()` nếu thiếu.
2. `template-detail-header.tsx`: breadcrumb (Trang chủ › Templates › title), title display font, description, badges 3 chiều, "Cập nhật {date}" (date-fns vi đã có `date-vn.ts`).
3. Render body: `<MDXContent code={template.body} components={mdxComponents} />` trong `prose` wrapper (max-w-prose, tokens). Verify code block + copy button.
4. `template-attachments.tsx`: nếu `attachments?.length` → section "Tài liệu đính kèm" với link tải.
5. `template-cta.tsx`: block aurora "Cần áp dụng cho shop của bạn? Đặt lịch tư vấn" + nút `/booking` + Zalo link; `trackCtaClick`.
6. `related-templates.tsx` + `getRelatedTemplates`: cùng industry trước → bù goal → bù featured, tối đa 3, loại bản thân. Ẩn section CHỈ khi 0 kết quả (không phải khi <3).
7. Verify: build SSG ra trang cho mọi slug; copy hoạt động; CTA track; 404 đúng; lint pass. (JSON-LD/`schemaType` → Phase 4, frontmatter đã có field từ Phase 1.)

## Success Criteria
- [ ] `/templates/[slug]` SSG cho mọi template (generateStaticParams)
- [ ] MDX render đầy đủ, style prose theo tokens, readable mobile+desktop
- [ ] Nút copy hoạt động (toast xác nhận), code block đẹp
- [ ] Đính kèm hiển thị + tải được khi có
- [ ] CTA mềm hiển thị cuối trang, click track `trackCtaClick`
- [ ] Related 3 template đúng logic industry→goal
- [ ] Slug sai → 404; `pnpm build` + `pnpm lint` pass

## Risk Assessment
- **MDX components thiếu mapping** → element vỡ style. Mitigation: map đủ bộ phổ biến + prose fallback.
- **Copy button SSR**: phải 'use client', tránh hydration mismatch (Phase 1 đã tách).
- **Related rỗng** (ít template): fallback theo goal rồi tới featured; ẩn section nếu vẫn 0.
- **CTA trùng lặp** với booking section home: giữ 1 CTA mềm, không nhồi nhiều.
