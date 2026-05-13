# Tài AI Automation - Landing Page Master Plan

**Plan ID:** `260509-1059-tai-ai-automation-landing-page`
**Date:** 2026-05-09
**Owner:** PC (minhquoclove91999@gmail.com)
**Status:** Phase 02 complete · Phase 03 ready

## Goal
Premium, conversion-focused Next.js landing page cho thương hiệu **Tài AI Automation**.
KPI chính: book Meet 1-1 demo (20 phút) qua Supabase-backed smart calendar (block 2 tiếng sau mỗi booking).

## Brand Lock
- Tone màu: **Xanh dương đậm + Tím + Trắng**
- Cảm giác: premium, modern, công nghệ, sạch, dễ đọc trên mobile
- CTA chính: "Đặt lịch Meet 1-1 xem demo"
- **Logo:** sẽ thiết kế qua `logo-design` skill (Phase 01)
- **Owner photo:** https://pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev/LDP-schedule/tai-ai-automation.png
- **Tab favicon:** https://pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev/LDP-schedule/tai-auto-blank.png
- **Domain:** `nguyenvantai.com`

## Stack Lock
**v1 (current scope):** Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · shadcn/ui · Framer Motion · Supabase · Vercel
**v1.5 (deferred):** Zalo OA + ZNS booking notify · automation chăm sóc khách

> ⏸️ **Zalo/automation paused** per user brief 2026-05-09 PM. v1 chỉ lưu DB → owner check Supabase Studio. Notify automation sẽ build sau khi web stable.

## Phases
| # | Phase | Status | Skills chính | Deliverable |
|---|-------|--------|--------------|-------------|
| 01 | Setup + Design System | ✅ Complete | `web-frameworks`, `design-system`, `ui-styling`, `ui-ux-pro-max`, `bootstrap` | Next.js scaffold + tokens locked |
| 02 | Content + Copywriting (VN) | ✅ Complete | `copywriting`, `marketing-psychology`, `brand`, `ckm:write:cro`, `ckm:write:formula`, `ckm:write:audit` | Page copy + legal content locked |
| 03a | Hero + About + Content Schema | ⏭ Next (P0) | `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines`, `ai-multimodal`, `react-best-practices` | `src/content/landing.ts` schema · Hero section · About section · Mobile pills replace floating badges |
| 03b | Mobile Sticky CTA | Depends 03a (P0) | `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines` | Sticky CTA bar component + intersection observer, text Phase-02-locked `Demo miễn phí - 20 phút →` |
| 03c | og:image Banner | ✅ Complete | `banner-design`, `ai-artist`, `frontend-design` | `@vercel/og` Option C adopted — VN font passes via WOFF + IE11 UA |
| 03d | Nav Bar (global) | ⏭ Next (P0) | `frontend-design`, `ui-ux-pro-max`, `ui-styling` | Sticky nav `<layout.tsx>` global: NavLogo + anchor links (Dịch vụ · Quy trình · FAQ · Đặt lịch) + desktop CTA + mobile drawer |
| 04 | Services + Tech Graph | Pending | `frontend-design`, `mermaidjs-v11`, `ai-artist`, `shader` | Service cards + animated graph |
| 05 | Process + Trust + FAQ | Pending | `frontend-design`, `marketing-psychology`, `ui-ux-pro-max` | Timeline + FAQ accordion |
| 06 | Booking UI / Smart Calendar | Pending | `form-cro`, `signup-flow-cro`, `ui-ux-pro-max`, `frontend-design` | Multi-step booking UX |
| 07 | Supabase Backend | Pending | `databases`, `backend-development`, `web-frameworks` | Schema + API routes |
| 08 | Animations + Patterns + Polish | Pending | `frontend-design`, `shader`, `react-best-practices` | Motion + sketch patterns |
| 09 | Responsive · A11y · Test · Deploy | Pending | `web-testing`, `web-design-guidelines`, `react-best-practices`, `deploy`, `seo` | Vercel live + Lighthouse 90+ |

## User Flow (Locked)
LDP → đọc nội dung → scroll → đặt lịch (chọn ngày → chọn slot) → confirm → fill form → submit → thank-you screen

## Booking Rule (Locked - UPDATED 2026-05-09 PM)
- Slot duration: **20 phút** (meeting), interval display **30 phút** (slot grid: 9:00, 9:30, 10:00...)
- **Block rule: 2 tiếng forward** sau mỗi booking
  - Vd: book 10:00 → disable 10:30, 11:00, 11:30 → 12:00 enable lại
- **Working hours: 24/7** (không giới hạn - slot có thể chọn bất kỳ giờ nào)
- UX: chỉ show **3-5 slot gợi ý/ngày** spread theo time-of-day (sáng/trưa/chiều/tối/khuya), + 4-7 ngày kế tiếp
- **v1 Notify:** lưu DB only - owner check Supabase Studio
- **v1.5 Notify:** Zalo OA + ZNS automation (deferred)

## Phase Files
- [Phase 01 - Setup + Design System](./phase-01-setup-and-design-system.md)
- [Phase 02 - Content + Copywriting](./phase-02-content-and-copywriting.md)
- [Phase 03 - Overview & Split](./phase-03-hero-about-sections.md)
  - [Phase 03a - Hero + About + Content Schema](./phase-03a-hero-about-content-schema.md)
  - [Phase 03b - Mobile Sticky CTA](./phase-03b-mobile-sticky-cta.md)
  - [Phase 03c - og:image Banner](./phase-03c-og-image-banner.md)
  - [Phase 03d - Nav Bar (global)](./phase-03d-nav-bar.md)
- [Phase 04 - Services + Tech Graph](./phase-04-services-tech-graph.md)
- [Phase 05 - Process + Trust + FAQ](./phase-05-process-trust-faq.md)
- [Phase 06 - Booking UI / Smart Calendar](./phase-06-booking-ui-calendar.md)
- [Phase 07 - Supabase Backend](./phase-07-supabase-backend.md)
- [Phase 08 - Animations + Polish](./phase-08-animations-polish.md)
- [Phase 09 - Responsive · Test · Deploy](./phase-09-responsive-testing-deploy.md)

## Decisions Locked (2026-05-09 PM)
| Question | Answer |
|---|---|
| Owner photo | ✅ R2 URL above |
| Tab favicon | ✅ R2 URL above (blank version) |
| Logo brand | 🎨 Thiết kế qua `logo-design` skill trong Phase 01 |
| Meet platform | ✅ **Google Meet** |
| Notify mechanism | ✅ v1 lưu DB only; **Zalo OA/ZNS** deferred v1.5 |
| Working hours | ✅ **24/7** - không giới hạn |
| Slot interval | ✅ **30 phút** (grid: 9:00, 9:30, 10:00...) |
| Block rule | ✅ **2 tiếng forward** sau mỗi booking |
| Domain | ✅ **nguyenvantai.com** (DNS qua Cloudflare: apex/root domain) |
| Vercel account | ✅ Đã có sẵn |
| Owner story | ✅ Đã lock 2026-05-12 - Builder Background variant |
| Testimonials | ⏳ Chưa có khách cũ - skip v1, dùng "demo-first" trust signal |
| Captcha | ❌ Không cần v1 |
| Form fields | ✅ Required: **Phone (Zalo)** + Consent. Optional: Email, Name, **Expectations (multi-select 4 options + Khác)** |
| Expectation options | ✅ 4 checkbox: Tư vấn 24/7 · Nhận diện hình · Chốt đơn · Xin SĐT/Zalo · + Khác (textarea) |
| Zalo Notify | ⏸️ **Deferred to v1.5** - focus web first |
| Automation chăm sóc | ⏸️ **Deferred to v1.5** |
| Brand palette | ✅ **Aurora Glow** - indigo `#6366F1` + violet `#A855F7` + pink `#EC4899` + cyan `#06B6D4` accents trên cream-violet base `#FAF7FF` |
| Display font | ✅ **Space Grotesk** (geometric soft modern) |
| Body font | ✅ **Be Vietnam Pro** (VN diacritics) |
| Animation backdrop | ✅ **A5 silk shimmer + A6 aurora streaks** combo |
| Animation image | ✅ **B4 sparkles + B5 liquid blob** combo |
| Animation headline | ✅ **C1 split stagger + F1 sketch underline** combo |
| Animation cards | ✅ **D7 viewport stagger + D4 spotlight follow** combo |
| Animation CTA | ✅ **E3 magnetic + E1 shine sweep** combo |
| Sketch decoration | ✅ **F1 tinh tế xuyên suốt:** underline · arrow → CTA · section divider · photo frame |
