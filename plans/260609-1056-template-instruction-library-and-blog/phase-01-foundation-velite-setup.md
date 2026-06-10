---
phase: 1
title: Foundation & Velite Setup
status: completed
priority: P1
effort: 1d
dependencies: []
---

# Phase 1: Foundation & Velite Setup

## Overview
Dựng content layer Velite + taxonomy SSOT + content queries + MDX components + cập nhật nav. **Risk-buster**: verify Velite chạy được với Next 16 Turbopack TRƯỚC khi build UI. Nếu vướng → fallback `next-mdx-remote/rsc` (giữ nguyên kiến trúc còn lại).

## Requirements
- Functional: `velite build` sinh `.velite/` data + types từ `content/templates/*.mdx`; import được vào RSC; frontmatter sai → build fail. `pnpm dev` + `pnpm build` chạy được kèm Velite.
- Non-functional: zero runtime cost (build-time), type-safe, KISS. Module <200 dòng, kebab-case.

## Architecture
- **Build pipeline (de-risked)**: KHÔNG webpack plugin (hỏng Turbopack). Hai lớp: (a) `package.json` script tường minh `"build": "velite && next build"`, `"dev": "velite --watch & next dev -p 3001"` (hoặc `concurrently`/`npm-run-all` cho cross-platform Windows); (b) optional programmatic init trong `next.config.ts` (guard `VELITE_STARTED`) chỉ làm dự phòng DX, KHÔNG dựa vào nó cho build production (fire-and-forget `import().then()` race với type-check trên Vercel cold build). Verify trên Vercel preview.
- **velite.config.ts**: 2 collection `templates` + `posts`; schema viết **bằng `s` của Velite** (velite@0.3.1 KHÔNG phụ thuộc zod - KHÔNG import `z` của project, API `.refine()` khác). Enum lấy mảng từ `taxonomy.ts` truyền `s.enum([...])`. MDX qua `s.mdx()`. **KHÔNG dùng `s.image()`** (kéo sharp, coupling build) → `cover` là `s.string()` path `/templates/<slug>/cover.*` trong `public/`. Đính kèm cũng `public/templates/<slug>/`.
- **Taxonomy SSOT** `src/lib/content/taxonomy.ts`: hằng `BUSINESS_MODELS`, `GOALS`, `INDUSTRIES` (industry map theo model) + label tiếng Việt + helper. Dùng cho cả velite schema (`s.enum`) lẫn UI filter. `industry` validate `s.string().refine(thuộc model)`.
- **Render RSC**: helper **`getMDXContent(code)`** (KHÔNG đặt tên `useXxx` - không phải React hook, gây nhầm + lint) exec function body Velite pre-compiled → component `<MDXContent code={...} components={...} />` chạy trong Server Component.
- **Path alias**: `tsconfig.json` `"#site/content": ["./.velite"]`. Output `.velite` git-ignored. KHÔNG dùng `@/.velite` (resolve sai sang `src/.velite`).
- **Owner doc**: `content/templates/README.md` mô tả format frontmatter + ví dụ để owner tự thêm template.

## Related Code Files
- Create:
  - `velite.config.ts` - collections + schema bằng `s`
  - `src/lib/content/taxonomy.ts` - SSOT 3 chiều + labels + helpers
  - `src/lib/content/queries.ts` - `getTemplates()`, `getTemplateBySlug()`, `filterTemplates()`
  - `src/lib/content/mdx-runtime.tsx` - `getMDXContent` + `<MDXContent>` (KHÔNG đặt tên hook)
  - `src/components/content/mdx-components.tsx` - map heading/code/callout theo design tokens
  - `src/components/content/copy-button.tsx` - client component nút copy
  - `content/templates/README.md` - hướng dẫn frontmatter cho owner (F3)
  - `content/templates/mau-spa-chot-don.mdx` - 1 file thật verify schema + render
- Modify:
  - `next.config.ts` - (optional) programmatic init guard, KHÔNG là đường build chính
  - `package.json` - scripts `build: velite && next build`, `dev: concurrently "velite --watch" "next dev -p 3001"`; deps `velite` + `@tailwindcss/typography` + devDep `concurrently`
  - `tsconfig.json` - path alias `#site/content` → `./.velite` + include `.velite`
  - `.gitignore` - thêm `.velite`
  - `src/content/landing.ts` - thêm nav link Templates; mở rộng kiểu link sang `PageLink` (href tuyệt đối, không cần `sectionId`)
  - `src/lib/nav/*` hoặc nơi định nghĩa `NavLink`/`CtaLocation` - thêm biến thể `PageLink` + entry analytics `nav_templates` (H1: hiện `NavLink` bắt buộc `sectionId`, union `CtaLocation` thiếu entry → build fail nếu không sửa)
  - `src/components/layout/nav-bar.tsx` + `nav-mobile-drawer.tsx` - render PageLink bằng `next/link`, active theo `pathname`
  - `src/app/globals.css` (nơi import Tailwind v4) - `@plugin "@tailwindcss/typography";` + `.prose` token override + `.dark .prose` (map sang Aurora tokens)

## Implementation Steps
1. `pnpm add velite @tailwindcss/typography`. Verify version Velite (≥0.3.1).
2. **SPIKE (làm trước, chốt B1)**: đọc `node_modules/velite/dist/index.d.ts` xác nhận API `s` (schema helper) + cách Velite compile MDX + shape data export. Ghi nhận: schema viết bằng `s`, KHÔNG dùng `z` của project. Nếu API lệch dự kiến → điều chỉnh trước khi viết tiếp.
3. `src/lib/content/taxonomy.ts`: define 3 chiều slug + label VN. Mỗi `industry` có thêm `description` (1–2 câu VN context thật, KHÔNG chỉ label - dùng cho intro pSEO page chống thin content, vd: "Template chatbot cho spa, thẩm mỹ viện - từ chào dịch vụ đến chốt lịch hẹn."). `INDUSTRIES` gom theo `businessModel`. Export type union + array + `getIndustriesByModel()`, `getLabel()`, mảng slug cho `s.enum`.
4. `velite.config.ts` (dùng `s`): collection `templates` { title `s.string()`, description `s.string()`, businessModel `s.enum([...])`, industry `s.string().refine(thuộc model)`, goal `s.enum([...])`, tags `s.array(s.string()).default([])`, cover `s.string().optional()` (path public/, KHÔNG `s.image()`), attachments `s.array(s.object({label,href})).optional()`, featured `s.boolean().default(false)`, schemaType `s.enum(['article','howto']).default('article')` (F5), publishedAt `s.isodate()`, updatedAt `s.isodate().optional()`, slug từ `s.path()`, body `s.mdx()` }. Collection `posts` khung sẵn (Phase 5).
5. `package.json` scripts: `"build": "velite && next build"`; `"dev": "concurrently \"velite --watch\" \"next dev -p 3001\""` (KHÔNG dùng `&` - hỏng trên Windows cmd/PowerShell). Thêm devDep `concurrently`. (Optional) programmatic init guard trong `next.config.ts` chỉ để DX, KHÔNG thay script build.
6. `.gitignore` += `.velite`. `tsconfig.json`: alias `"#site/content": ["./.velite"]` + include `.velite`.
7. `content/templates/README.md`: doc format frontmatter + ví dụ đầy đủ cho owner (F3).
8. `content/templates/mau-spa-chot-don.mdx`: 1 file thật verify schema + render.
9. `src/lib/content/mdx-runtime.tsx`: `getMDXContent(code)` + `<MDXContent>` (KHÔNG tên hook) + `src/components/content/mdx-components.tsx` (h1-h4, p, ul/ol, a, pre/code + CopyButton, blockquote/callout - tokens Aurora) + `copy-button.tsx` ('use client', navigator.clipboard, toast sonner sẵn có).
10. `src/lib/content/queries.ts`: đọc từ `#site/content`, sort featured→publishedAt desc, helpers filter 3 chiều + search.
11. **Nav (H1)**: thêm biến thể `PageLink` vào type system nav (không bắt buộc `sectionId`) + entry analytics `nav_templates` vào `CtaLocation`; thêm link Templates vào `LANDING.nav.links`; `nav-bar.tsx`/`nav-mobile-drawer.tsx` render PageLink bằng `next/link`, active theo `pathname` (không IntersectionObserver cho page-link).
12. Tailwind v4 prose: `@plugin "@tailwindcss/typography";` + **block `.prose` map `--tw-prose-*` (body/headings/links/code/quotes/borders/hr...) sang token Aurora** + `.dark .prose { --tw-prose-*: ... }` override (globals.css dùng `.dark` class-based - typography default KHÔNG tự theo). Chốt 1 nguồn style cho code block: hoặc `prose` hoặc mapping `pre/code` ở mdx-components (tránh 2 nguồn xung đột). KHÔNG để 1 dòng.
13. **Verify**: `pnpm dev` (velite watch sinh `.velite`) + `pnpm build` (`velite && next build`) pass. Import typed data vào 1 trang test/log confirm OK. Test frontmatter sai (industry sai model) → build FAIL. **Deploy Vercel preview** confirm build pipeline (không chỉ local).

## Success Criteria
- [ ] Spike xong: xác nhận API `s` từ `velite/dist`, schema viết bằng `s` (không `z`)
- [ ] `pnpm add velite @tailwindcss/typography` xong, version Velite ghi nhận
- [ ] `pnpm dev` chạy (velite watch + next dev song song) + sinh `.velite/`; sửa `.mdx` reload (restart nếu HMR lag - chấp nhận)
- [ ] `pnpm build` = `velite && next build` pass (Turbopack); **verify trên Vercel preview**, không chỉ local
- [ ] Frontmatter sai (industry không thuộc model) → build FAIL lỗi rõ
- [ ] Import typed data qua alias `#site/content` vào RSC OK
- [ ] `taxonomy.ts` là SSOT duy nhất 3 chiều (schema `s.enum` + UI dùng chung)
- [ ] `content/templates/README.md` có doc frontmatter cho owner
- [ ] Nav: type `PageLink` + `nav_templates` thêm xong (TS pass); link "Templates" hoạt động desktop + mobile drawer, active theo pathname
- [ ] `pnpm dev` dùng `concurrently` (KHÔNG `&`), chạy được trên Windows
- [ ] `.prose` + `.dark .prose` map Aurora tokens (light + dark khớp), không lệch màu mặc định typography
- [ ] `.velite` git-ignore; `pnpm lint` pass

## Risk Assessment
- **Velite + Turbopack**: webpack plugin hỏng → **đường build chính = script tường minh `velite && next build`** (deterministic, không race). Programmatic init trong next.config.ts chỉ optional cho DX (nếu dùng, guard `VELITE_STARTED` + check `process.argv`, KHÔNG dựa NODE_ENV). Nếu vẫn vướng (build order/HMR) → **fallback** `gray-matter` + `next-mdx-remote/rsc`: `queries.ts` đọc fs + parse frontmatter + validate thủ công; `mdx-components.tsx` tái dùng nguyên. Kiến trúc taxonomy/UI không đổi.
- **zod trap (B1)**: KHÔNG import `z` của project vào velite.config - dùng `s`. Spike (step 2) xác nhận trước.
- **Vercel deploy**: verify build trên preview (script `velite && next build` đảm bảo `.velite` sinh trước `next build`).
- **Nav refactor (H1)**: `NavLink` hiện bắt buộc `sectionId`, `CtaLocation` thiếu entry → phải thêm `PageLink` type + `nav_templates` nếu không build FAIL. Giữ thay đổi nhỏ, không phá home anchor behavior.
