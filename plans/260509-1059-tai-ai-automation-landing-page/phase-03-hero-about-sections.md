# Phase 03 - Overview & Split

**Status:** ⏭ Next (rework applied 2026-05-12 post-red-team + synthesis review)
**Origin file:** Đã split để isolate risk + có owner ship-gate giữa các sub-phase
**Owner sign-off:** 2026-05-12 - synthesis adopted với 6 chỉnh

## Why split?
Red team review 260512-1058 phát hiện 6 P0 holes + scope inflation. Synthesis review confirm "REWORK_RECOMMENDED + split". Lý do tách 3 sub-phases:
- **03a** = Hero + About + content schema → owner visual review gate
- **03b** = Sticky CTA → mobile UX test gate, depends 03a
- **03c** = og:image → independent risk (`@vercel/og` VN font), không block ship 03a/03b

## Sub-phase Files
| Sub | File | Scope | Effort | Ship gate |
|---|---|---|---|---|
| **03a** | [phase-03a-hero-about-content-schema.md](./phase-03a-hero-about-content-schema.md) | Content schema `src/content/landing.ts` · Hero · About · Mobile pills | 2-3 days | Owner visual review |
| **03b** | [phase-03b-mobile-sticky-cta.md](./phase-03b-mobile-sticky-cta.md) | Sticky CTA bar + intersection observer | 0.5 day | Mobile UX test |
| **03c** | [phase-03c-og-image-banner.md](./phase-03c-og-image-banner.md) | og:image PoC + fallback | 0.5-1 day | Phase 04+ assets ready |

## Locked Cross-Sub Decisions (synthesis 2026-05-12)
| # | Decision | Sub-phase áp dụng |
|---|---|---|
| D1 | **Highlight render = segment array** (KISS, không markdown parser) | 03a |
| D2 | **Sticky CTA text = `Demo miễn phí - 20 phút →`** giữ Phase 02 lock + thêm aria-label `"Đặt lịch demo miễn phí 20 phút"` + analytics `cta_location: sticky_mobile` | 03b |
| D3 | **No UTM internal** - dùng analytics event + data attribute `cta_location` cho 6 CTAs → `#booking` (hero_primary · sticky_mobile · about_inline · module_1 · module_2 · module_3) | 03a + 03b |
| D4 | **Pink `#EC4899` chỉ accent/underline/heading lớn**, KHÔNG body text | 03a |
| D5 | **Floating badges desktop giữ, mobile chuyển inline pills** dưới CTA/photo: `Nhận diện hình ảnh · 20 phút demo · Bàn giao 100%` | 03a |
| D6 | **About photo = avatar crop 96-120px** từ Hero photo (không tạo "góc ảnh khác"). Nếu lặp visual quá mạnh → ưu tiên story panel + avatar nhỏ, không dùng ảnh lớn lần 2 | 03a |
| D7 | **Reduced-motion = static elegant** (not disable nội dung) - tắt shimmer/sparkles/aurora drift/shine sweep/magnetic; headline fade ngắn; sketch underline hiện sẵn | 03a + 03b |
| D8 | **Mobile animation tier** - 1-2 blobs · 3 sparkles · không SVG path morph loop · sketch lines one-shot | 03a |
| D9 | **Sticky CTA v1 KHÔNG có nút × dismiss** - ưu tiên conversion; hide tự động khi user vào S8 Booking | 03b |
| D10 | **Light-only v1** - force `enableSystem={false}` cho `next-themes`; Aurora Glow chưa có dark variant | 03a |
| D11 | **`@vercel/og` Option C không lock ngay** - chạy PoC trước; fallback static PNG từ HTML/Playwright nếu VN font fail | 03c |
| D12 | **Headline mobile wrap** - dùng manual `<br className="sm:hidden" />` thay `<wbr>` cho VN clean break | 03a |

## Perf Budget (measurable - synthesis P1)
| Metric | Target | Đo bằng |
|---|---|---|
| Hero LCP (desktop) | < 1.5s | Lighthouse local |
| Hero LCP (mobile 4× CPU) | < 2.5s | Lighthouse throttle |
| CLS | 0 | Lighthouse + Chrome DevTools |
| Bundle delta Phase 03a | < 80KB gzipped (client JS) | Next build output / build analyzer |
| Long task during hero idle | None > 50ms | Performance trace mobile |
| Active animations per frame | ≤ 8 mobile · ≤ 16 desktop | Manual count + RAF inspector |
| FPS | 60 desktop · ≥ 30 mobile mid-tier | Chrome perf monitor |

## Accessibility Contrast Rule (synthesis P0 #5)
| Use case | Color | Background | Ratio | WCAG status |
|---|---|---|---|---|
| Body text | `#1B1430` (ink) | `#FAF7FF` cream | ~16:1 | AAA ✅ |
| Muted text | `#5B5275` | `#FAF7FF` cream | ~7.5:1 | AAA ✅ |
| Heading large + accent | Aurora gradient `#6366F1 → #A855F7 → #EC4899` | `#FAF7FF` cream | Mixed (display only ≥18pt) | AA Large ✅ |
| **Pink `#EC4899` solid body** | - | - | 3.4:1 ❌ | **FORBIDDEN** |
| CTA primary | white | Aurora gradient | ≥4.5:1 | AA ✅ |
| Sticky CTA white | - | Aurora gradient | ≥4.5:1 | AA ✅ |

**Rule:** Pink chỉ được dùng cho accent · underline · heading ≥24pt · icon. Không bao giờ body text trên cream.

## Reduced-Motion Matrix (synthesis D7)
| Element | Default animation | Reduced-motion behavior |
|---|---|---|
| Aurora mesh blobs (A6) | Slow drift loop | **Static positions** (no drift) |
| Silk shimmer (A5) | Cross-screen pass | **Disabled** |
| Sparkles (B4) | Twinkle loop | **Disabled** |
| Liquid blob (B5) | Path morph | **Static blob** (no morph) |
| Sketch lines (F1) | `pathLength` reveal loop | **Hiện sẵn** (one-shot, no loop) |
| Sketch underline (F1) | Reveal on viewport | **Hiện sẵn** static |
| Headline split stagger (C1) | Per-word fade-up 80ms | **Single fade 250ms** (no stagger) |
| Card spotlight (D4) | Cursor follow | **Disabled** |
| Card viewport stagger (D7) | Staggered reveal | **Disabled stagger** - fade-in instant batch |
| CTA magnetic (E3) | Cursor offset | **Disabled** |
| CTA shine sweep (E1) | Auto sweep 8s | **Disabled** |
| Sticky CTA shine sweep | Auto sweep 8s | **Disabled** |

## Acceptance Gate trước dev start
- [x] D1-D12 locked
- [x] Perf budget measurable
- [x] Contrast rule explicit
- [x] Reduced-motion matrix per-element
- [x] Mobile pills replace floating badges spec'd
- [x] `src/app/page.tsx` mock replace gate noted (Phase 03a sẽ replace)
- [x] `lucide-react@1.14.0` verified real (off risk list)
- [ ] Owner final sign-off → start 03a

## Status & Order
1. **03a** start ngay (P0, highest)
2. **03b** sau 03a ship gate pass (P0)
3. **03c** parallel với 03b hoặc sau (P1, không block)

## Next
→ Start [Phase 03a](./phase-03a-hero-about-content-schema.md)
