---
title: "Mooly landing → subdomain landing.nguyenvantai.com (gom lead về infor)"
description: "Port mooly-landing.html thành route cô lập trên subdomain mới, pixel-match, GA4, lead về pipeline infor + thêm ngành hàng & lượng tin nhắn."
status: done
priority: P2
effort: ~6h
branch: feat/template-library-blog
tags: [landing, subdomain, leads, infor, ga4, proxy]
created: 2026-06-23
---

# Mooly Landing → landing.nguyenvantai.com

Port `mooly-landing.html` (standalone) thành landing trên **subdomain mới `landing.nguyenvantai.com`** (URL gốc), **cùng repo, route cô lập**, KHÔNG sửa logic project cũ. Lead **gom về hệ thống infor** (cùng bảng `leads`, nhóm `infor`), tái dùng webhook + automation. Record landing có thêm `industry` + `message_volume`. Pixel-match 100% + GA4.

## Nguyên tắc
- **Additive-only**: code cũ chỉ THÊM nhánh/file, không đổi hành vi route/domain hiện có.
- **Routing = proxy.ts** (middleware đang chạy), không dùng next.config rewrites.
- **Host-scoped**: mọi phân nhánh dựa trên `host.startsWith('landing.')` → domain cũ bất biến.
- Pixel-match: giữ nguyên markup/CSS/animation file HTML; CSS scope dưới wrapper để tránh đụng globals.

## Field mapping (form landing → leads)
| Form HTML | Đích | Ghi chú |
|---|---|---|
| `name` (Họ và tên)* | `leads.full_name` | trim, min 2 |
| `phone` (SĐT/Zalo)* | `leads.phone` | `normalizeVnPhone`, regex VN |
| `industry` (Ngành hàng) | `payload.industry` | reuse field key infor có sẵn → admin tự hiện |
| `scale` (Lượng tin nhắn/ngày) | `payload.message_volume` | THÊM 1 LeadField config |
| — | `source = 'infor-landing-mooly'` | KHÔNG prefix `mooly` → source_group = `infor` |

## Phases
| # | Phase | Status | File |
|---|---|---|---|
| 01 | Subdomain routing (proxy.ts + domain Vercel/DNS) | ✅ code done (DNS = user) | [phase-01](phase-01-subdomain-routing-proxy-and-domain.md) |
| 02 | Layout cô lập (bỏ chrome theo host, fonts, GTM) | ✅ done | [phase-02](phase-02-isolated-landing-layout-and-chrome.md) |
| 03 | Port HTML → React, pixel-match (CSS scope, canvas/JS) | ✅ done | [phase-03](phase-03-port-html-to-react-pixel-match.md) |
| 04 | Form → pipeline infor (endpoint mới, field config) | ✅ done | [phase-04](phase-04-lead-form-to-infor-pipeline.md) |
| 05 | GA4 events + verification (pixel diff, lead, webhook) | ⏳ code done; QA runtime = user | [phase-05](phase-05-analytics-events-and-verification.md) |

## Implementation result (2026-06-23)
**Files tạo:** `src/app/landing/{page,layout,landing-interactions,landing-styles,landing-markup}.tsx/.ts`, `src/app/api/landing/lead/route.ts`, `src/lib/leads/landing-lead-schema.ts`. **Files sửa (additive):** `src/proxy.ts` (+landing.* rewrite +404 guard), `src/app/layout.tsx` (host-conditional chrome), `src/lib/leads/lead-field-config.ts` (+message_volume). **Generator:** `scout/scope-landing-css-transform.mjs` + `extract-landing-markup-transform.mjs` (CSS scope #mooly-lp + markup verbatim).
- Build PASS (0 TS, 0 eslint error). Code-review: DONE_WITH_CONCERNS → H1 (dynamic render) + M1 (guard) đã xử. Tester: no suite, build/lint/type pass.
- **Quyết định H1:** giữ host-conditional (KHÔNG route-group mass-move) — user ưu tiên không-conflict + SEO không quan trọng. Tối ưu: bỏ ThemeProvider cho landing (shell tối giản). Trade-off: trang main render động (chấp nhận).
- **Còn lại (user):** DNS+domain Vercel `landing.nguyenvantai.com`; GTM tag `generate_lead`→GA4; QA runtime (submit thật + pixel diff).

## Dependencies
- 01 trước (route resolve được) → 02 → 03 (UI) ‖ 04 (form/API) → 05 (verify).
- 03 và 04 chạy song song sau 02 (UI vs backend).

## Out of scope
- KHÔNG đổi `/infor` wizard, `/form` mooly, main site.
- KHÔNG đổi schema DB (chỉ payload jsonb — không migration).

## Unresolved
- DNS `landing.nguyenvantai.com` + add domain trên Vercel: cần user thao tác dashboard (phase 01 ghi rõ).
- Xác nhận key `industry` trong `lead-field-config.ts` đúng tên (verify khi code).
- GTM dashboard: tạo tag `generate_lead` → GA4 (user, phase 05).

## Validation Summary
**Validated:** 2026-06-23 · **Questions:** 4

### Confirmed decisions
- **Source tag:** `infor-mooly-lp` (override `infor-landing-mooly`). Vẫn không prefix `mooly` → `source_group='infor'`.
- **CSS isolation:** scope `#mooly-lp` + CSS Module (phase 03).
- **Lộ /landing:** CHẶN trên domain chính — chỉ phục vụ host `landing.*`.
- **SEO:** landing CHO index (metadata + OG tags bình thường).

### Action items (áp khi code)
- [ ] Phase 04: dùng `p_source: 'infor-mooly-lp'` (sửa mọi chỗ ghi `infor-landing-mooly`).
- [ ] Phase 01: thêm guard — nếu host KHÔNG phải `landing.*` mà path `/landing*` → `notFound()`/redirect (chặn duplicate).
- [ ] Phase 02: landing layout export `metadata` — title, description, favicon, **openGraph + twitter dùng logo Mooly R2**; KHÔNG noindex.

## Red-team Review (HTML fidelity)
**Date:** 2026-06-23 · Report: [red-team fidelity gaps](reports/red-team-260623-1233-html-fidelity-gaps-report.md) · Verdict: DONE_WITH_CONCERNS.
- Đã fold 10 mục hardening vào phase-03 (§Red-team hardening), phase-02 (fonts/favicon/OG), phase-04 (options).
- BLOCKER đã vá: đếm script SAI (thực **8 khối JS**), `*{}`/reduced-motion `*` phải scope `#mooly-lp *`.
- Phát hiện thêm (verify): **font literal** `'Be Vietnam Pro'`/`'Space Grotesk'` ≠ tên hash next/font, và next/font thiếu weight **300** → GIỮ `<link>` Google Fonts gốc trong landing.
- **Nguyên tắc fidelity:** COPY-PASTE nguyên (text/@media/@keyframes/SVG/URL), KHÔNG gõ tay; GIỮ cả CSS "thừa" (`--violet-2`, pricing block) — không dọn kẻo vỡ `.faq.open`/`.ticket`.

### Decisions (red-team) — ĐÃ CHỐT
- **CSS = inline scoped `<style>`** (không CSS Module — né rename keyframes). Giữ 100% CSS gốc, chỉ prefix `#mooly-lp`.
- **OG = SET bằng logo Mooly** (R2 `LOGO MOOLY blank.png`) — `openGraph`+`twitter(summary)`+favicon, title/description từ HTML. Banner OG 1200×630 riêng = backlog (logo 512² sẽ letterbox).
