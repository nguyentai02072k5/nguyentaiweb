---
phase: 2
title: Templates Listing & Filter
status: completed
priority: P1
effort: 1d
dependencies:
  - 1
---

# Phase 2: Templates Listing & Filter

## Overview
Trang `/templates`: hero + filter client-side đa chiều (mô hình → ngành động → mục tiêu + search) + grid card. **Cộng pSEO routes tĩnh `/templates/nganh/[industry]`** (index được, SSG từ taxonomy) — đây là bề mặt SEO chính theo từng ngành; filter ở `/templates` chỉ phục vụ duyệt nhanh. Seed 5 template mẫu thật.

## Requirements
- Functional: `/templates` hiển thị tất cả template (SSG). Khách lọc theo `businessModel` → `industry` (chips lọc theo model đang chọn) → `goal` + ô search. Empty state. Click card → `/templates/[slug]`.
- Functional (pSEO): `/templates/nganh/[industry]` SSG cho mọi industry trong taxonomy (kể cả industry chưa có template → trang vẫn render, empty state, hoặc bỏ khỏi staticParams nếu rỗng — chốt: chỉ generate industry CÓ ≥1 template để tránh thin content). Mỗi trang: H1 theo ngành + intro copy + grid template của ngành đó. Metadata + canonical riêng (Phase 4 nâng cấp đủ).
- Non-functional: filter instant (client-side), responsive, a11y (focus, aria), khớp Aurora. Module <200 dòng.

## Architecture
- `app/templates/page.tsx` (RSC, SSG): `getTemplates()` → truyền data xuống client filter component. Metadata cơ bản (Phase 4 nâng cấp).
- `templates-explorer.tsx` ('use client'): giữ state filter (model/industry/goal/query) bằng `useState` + `useMemo` filter; render `FilterBar` + grid. KISS — không nuqs ở v1.
- `template-filter-bar.tsx`: nhóm chips 3 chiều (industry derive từ model đang chọn qua `getIndustriesByModel`) + input search. "Tất cả" reset từng chiều. Hiển thị số kết quả.
- `template-card.tsx`: cover (next/image, fallback gradient Aurora), title, description (line-clamp), badges (industry + goal). Link toàn card. `featured` chỉ dùng cho sort/related — KHÔNG ribbon UI (tránh design ambiguity, lệch Aurora).
- Tái dùng tokens, `badge`, `card`, `input` shadcn sẵn có.

## Related Code Files
- Create:
  - `src/app/templates/page.tsx` — listing RSC (SSG)
  - `src/app/templates/nganh/[industry]/page.tsx` — pSEO route theo ngành (SSG + generateStaticParams)
  - `src/components/templates/templates-explorer.tsx` — client state + grid (tách reusable cho cả listing + pSEO page)
  - `src/components/templates/template-grid.tsx` — grid thuần (dùng lại ở pSEO page, không filter bar)
  - `src/components/templates/template-filter-bar.tsx` — filter 3 chiều + search
  - `src/components/templates/template-card.tsx` — card
  - `src/components/templates/template-empty-state.tsx` — empty
  - `content/templates/*.mdx` — seed 5 template (phủ 2 model + 3 goal + vài ngành)
  - `public/templates/<slug>/cover.*` — ảnh cover seed
- Modify:
  - `src/lib/content/queries.ts` — `filterTemplates(data,{model,industry,goal,query})`, `getTemplatesByIndustry(slug)`, `getIndustriesWithTemplates()`
  - `src/lib/content/taxonomy.ts` — helper count/label theo chiều nếu cần

## Implementation Steps
1. `app/templates/page.tsx`: `export const dynamic = 'force-static'` (hoặc default SSG); load `getTemplates()`; render hero + `<TemplatesExplorer templates={...} />`.
2. `templates-explorer.tsx`: state `{ model, industry, goal, query }`; khi đổi model → reset industry; `useMemo` lọc; render FilterBar + grid (`grid-cols-1 sm:2 lg:3`) hoặc empty state.
3. `template-filter-bar.tsx`: 3 hàng chip (Mô hình / Ngành theo model / Mục tiêu) + search input; chip active style brand-violet; nút "Xoá lọc"; đếm kết quả.
4. `template-card.tsx`: layout card với cover 16:9, badges, hover lift (motion nhẹ, motion-reduce safe). Link `/templates/${slug}`.
5. `template-empty-state.tsx`: thông điệp + nút reset (theo pattern admin EmptyState).
6. **pSEO page** `templates/nganh/[industry]/page.tsx`: `export const dynamicParams = false` (chặn render on-demand ngành rỗng/sai → 404 thật, củng cố chống thin content); `generateStaticParams` từ `getIndustriesWithTemplates()` (chỉ ngành có ≥1 template); H1 "Template [Tên ngành]" + **intro copy lấy `industry.description` từ taxonomy** (≥1 câu context thật, KHÔNG chỉ label — chống doorway page) + `<TemplateGrid items={getTemplatesByIndustry(industry)} />`; `notFound()` nếu industry không hợp lệ HOẶC rỗng. Metadata cơ bản (Phase 4 hoàn thiện canonical/OG/JSON-LD ItemList).
7. Seed template: `mau-spa-chot-don` (dich-vu/spa/chot-don), `mau-thoi-trang-thu-lead` (ban-le/thoi-trang/thu-lead), `mau-nha-hang-nuoi-duong` (dich-vu/nha-hang/nuoi-duong), `mau-my-pham-chot-don` (ban-le/my-pham/chot-don), `mau-bds-thu-lead` (dich-vu/bat-dong-san/thu-lead). Mỗi file frontmatter đủ + body mẫu (heading, list, code block, callout) test render Phase 3.
8. Verify lint + build + lọc đúng từng chiều + search + pSEO route render đúng template theo ngành.

## Success Criteria
- [ ] `/templates` render tất cả template, SSG
- [ ] Lọc Mô hình → Ngành chips cập nhật đúng theo model
- [ ] Lọc chéo Mục tiêu + search hoạt động, instant, không reload
- [ ] Đếm kết quả + empty state + nút xoá lọc OK
- [ ] Card responsive, badges đúng, click sang detail
- [ ] **pSEO**: `/templates/nganh/[industry]` SSG (`dynamicParams=false`) cho mọi ngành có template, render đúng template ngành đó, H1 + intro ≥1 câu context (từ `industry.description`, không chỉ label); industry sai/rỗng → 404
- [ ] ≥5 template seed phủ 2 model + 3 goal
- [ ] `pnpm build` + `pnpm lint` pass; a11y focus/aria OK

## Risk Assessment
- **Filter `/templates` không deep-link**: chấp nhận (SEO đã có bề mặt riêng = pSEO routes). Filter chỉ là tiện ích duyệt.
- **Thin content pSEO**: chỉ generate `/templates/nganh/[industry]` cho ngành có ≥1 template; intro copy đủ để không bị Google coi doorway page. Khi >1 template/ngành mới thực sự giá trị.
- **Số lượng lớn dần**: hàng tá item client filter vẫn nhanh. Hàng trăm → cân nhắc pagination/server filter (ngoài v1).
- **Cover ảnh thiếu**: fallback gradient Aurora để card không vỡ layout.
- **DRY listing↔pSEO**: tách `template-grid.tsx` dùng chung; tránh lặp markup card/grid.
