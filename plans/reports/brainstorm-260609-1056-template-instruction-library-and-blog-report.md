# Brainstorm — Kho Template Instruction + Blog

- Date: 2026-06-09
- Project: tai-ai-automation (`nguyenvantai.com`) — Next.js 16 App Router
- Status: Design approved by owner → ready for `/ck:plan`
- Type: brainstorm design report

## 1. Problem statement

Cần 2 tính năng nội dung mới cho landing page:
1. **Kho Template Instruction** — owner quản lý + thêm "hàng tá" template theo ngành; khách duyệt/lọc/chọn xem dễ dàng.
2. **Blog** — owner chia sẻ kiến thức (SEO/traffic play).

Mục tiêu kép: cung cấp giá trị cho khách + kéo organic traffic + đẩy vào funnel đặt lịch hiện có.

## 2. Codebase context (scout)

- Stack: Next.js 16 App Router, React 19, TS strict, Tailwind v4, shadcn/ui, Framer Motion. Font Space Grotesk + Be Vietnam Pro.
- Backend: Supabase (service-role `server-only`). 3 bảng booking-domain. RLS bật.
- Admin `/admin`: cookie HMAC session, 1 owner. Pattern Server Component + `force-dynamic`.
- Content landing: `src/content/landing.ts` (1 file TS). Nav links từ `LANDING.nav`.
- Routes hiện có: `/`, `/booking`, `/thank-you`, `/admin`, `/terms`, `/privacy` + trang dev. CHƯA có template/blog.
- Design system: tokens `src/lib/tokens/*` (Aurora gradient, semantic colors). File kebab-case, module <200 dòng.
- SEO sẵn: `/api/og` (OG động), Meta Pixel + CAPI.

## 3. Requirements đã chốt (qua AskUserQuestion)

| Mục | Quyết định |
|---|---|
| Lưu trữ | File `.mdx` trong repo (content-as-code, deploy lại để publish) |
| Render/content layer | **Velite** (frontmatter typed bằng zod, validate build-time, xử lý ảnh) |
| Template = gì | Bộ hỗn hợp: mô tả + instruction + đính kèm file/ảnh |
| Khách làm gì | Xem full miễn phí + **CTA mềm** (đặt lịch/Zalo) cuối trang |
| Route | `/templates`, `/templates/[slug]`, `/blog`, `/blog/[slug]` |
| SEO | **Đầy đủ**: meta per-page + OG động + JSON-LD + sitemap + robots |
| Thứ tự | Foundation → Templates → SEO → (sau) Blog |
| Taxonomy | Đa chiều, starter đã duyệt (mục 5) |

## 4. Approaches evaluated

### Storage/management
- **A. MDX trong repo + Velite** ✅ CHỌN — SEO/tốc độ tốt nhất, version-controlled, miễn phí, typed frontmatter. Nhược: đăng bài cần git + deploy lại (owner chấp nhận).
- B. Supabase DB + Admin CRUD — không cần deploy, khớp hạ tầng admin. Nhược: tốn công (form soạn thảo, upload ảnh, editor); loại vì owner ưu tiên SEO + chấp nhận redeploy.
- C. Hybrid (template DB + blog MDX) — phức tạp duy trì 2 cơ chế. Loại.

### MDX tooling
- **Velite** ✅ CHỌN — typed (zod), auto index, validate build-time, image pipeline.
- gray-matter + next-mdx-remote — ít dep hơn, full control → giữ làm **fallback** nếu Velite vướng Turbopack.
- @next/mdx native — mỗi template = 1 page file, khó listing/filter động. Loại.

## 5. Taxonomy (starter — đã duyệt)

3 chiều, SSOT ở `src/lib/content/taxonomy.ts` (drive cả zod schema lẫn UI filter):

- **businessModel**: `ban-le` (Bán lẻ) · `dich-vu` (Dịch vụ)
- **goal**: `nuoi-duong` (Nuôi dưỡng) · `thu-lead` (Thu leads) · `chot-don` (Chốt đơn)
- **industry** (gắn theo model):
  - Bán lẻ: Thời trang · Mỹ phẩm · Mẹ & bé · Thực phẩm/đặc sản · Đồ gia dụng · Điện tử
  - Dịch vụ: Spa/Thẩm mỹ · Nhà hàng/Quán ăn · Bất động sản · Giáo dục/Trung tâm · Gym/Fitness · Nha khoa/Phòng khám · Du lịch/Khách sạn

UX `/templates`: chọn Mô hình → lọc Ngành (chips động) → lọc chéo Mục tiêu + ô search tên → grid cards.

## 6. Final solution — kiến trúc

Shared content layer (Templates + Blog tái dùng):

```
velite.config.ts                          # 2 collection: templates + posts, zod schema từ taxonomy
content/templates/*.mdx                    # template content
content/blog/*.mdx                         # blog (phase sau)
public/templates/<slug>/...                # ảnh + file đính kèm
src/lib/content/taxonomy.ts                # SSOT model/goal/industry
src/lib/content/queries.ts                 # getTemplates, getTemplateBySlug, filter helpers
src/components/content/mdx-components.tsx   # MDX → style design tokens (heading, code + nút Copy, callout)
src/components/templates/*                  # card, filter-bar, grid
src/app/templates/page.tsx                 # listing + filter đa chiều
src/app/templates/[slug]/page.tsx          # detail + đính kèm + soft CTA + related
src/app/sitemap.ts, src/app/robots.ts      # SEO
```

### Frontmatter template
```yaml
title, description
businessModel: ban-le|dich-vu
industry: <slug thuộc nhóm model>
goal: nuoi-duong|thu-lead|chot-don
tags: [..]            # optional, lọc phụ
cover: /templates/x/cover.png  # card + OG
attachments: [{label, href}]   # optional
featured: true        # optional, ghim
publishedAt, updatedAt
```

### Touchpoints (sửa file sẵn có)
- `src/content/landing.ts` — thêm nav link Templates (+ Blog sau)
- `src/components/layout/nav-bar.tsx` + `nav-mobile-drawer.tsx` — hỗ trợ "page link" (không chỉ hash); `resolve-hash-href` đã xử lý off-home
- `src/app/api/og/route.tsx` — nhận title/category render OG card template/blog
- `next.config.*` + `package.json` scripts — tích hợp Velite build step
- Tái dùng: `trackCtaClick`, design tokens, shadcn primitives

## 7. Phases

- **Phase 0 — Foundation & risk-buster**: cài Velite, config, `taxonomy.ts` SSOT, content queries, mdx-components, cập nhật nav, **verify Velite chạy với Next 16/Turbopack**.
- **Phase 1 — Templates listing**: `/templates` + filter đa chiều + cards + seed 3–5 template mẫu.
- **Phase 2 — Template detail**: render MDX + đính kèm + nút copy + CTA mềm + related.
- **Phase 3 — SEO**: metadata + OG động + JSON-LD (HowTo/Article) + sitemap + robots.
- **Phase 4 (sau) — Blog**: `/blog` + `/blog/[slug]` tái dùng content layer.

## 8. Risks & mitigations

1. **Velite + Next 16 Turbopack** — Velite là build step riêng; Turbopack không cắm webpack plugin. Mitigation: chạy `velite` qua `predev`/`prebuild` hoặc `concurrently --watch`; verify ở Phase 0; fallback `gray-matter + next-mdx-remote` nếu vướng (giữ nguyên kiến trúc còn lại).
2. **Nav hash-based** — cần thêm page-link type; nhẹ, `resolve-hash-href` đã hỗ trợ off-home.
3. **Redeploy để publish** — owner đã chấp nhận (đổi lấy SEO + version control).

## 9. Success metrics / validation

- Thêm 1 `.mdx` đúng frontmatter → xuất hiện trên `/templates`, lọc đúng 3 chiều; frontmatter sai → build fail (Velite validate).
- Detail page: render MDX đầy đủ + đính kèm hoạt động + CTA mềm track được click.
- SEO: meta + OG render đúng; JSON-LD validate (Rich Results Test); sitemap.xml liệt kê đủ template; robots hợp lệ.
- Khớp design system Aurora, responsive, a11y (skip link, focus states).
- `pnpm build` + `pnpm lint` pass.

## 10. Next steps & dependencies

- `/ck:plan` (default) — sinh plan phase-by-phase từ report này.
- Dep mới: `velite` (+ có thể `concurrently`). Verify tương thích Next 16 ở Phase 0.
- Cần owner cung cấp: nội dung template mẫu thật (Phase 1 seed có thể dùng placeholder trước).

## Unresolved questions

- ❓ Có cần nút "Copy" cho từng block instruction trong detail không, hay chỉ copy toàn bài? (mặc định: copy theo code/instruction block).
- ❓ Related templates ở detail: theo `industry` hay `goal` ưu tiên? (mặc định: cùng industry trước, fallback goal).
- ❓ Phần đính kèm file: host trong `public/` (commit kèm) hay link ngoài (Drive/CDN)? (mặc định: `public/templates/<slug>/`).
