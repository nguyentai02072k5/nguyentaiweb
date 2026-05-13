# Phase 03b - Mobile Sticky CTA

**Status:** Pending (depends on 03a ship gate)
**Priority:** P0
**Effort:** 0.5 day
**Ship gate:** Mobile UX test (3-4 device sizes · scroll trigger · không che FAQ/form/focus)
**Depends on:** Phase 03a (Hero rendered + `LANDING.stickyMobile` schema available)
**Cross-decisions:** xem [phase-03 overview](./phase-03-hero-about-sections.md) - D2, D3, D7, D9

## Source-of-Truth
- Spec: `./content-copy.md` S10 Microcopy → Sticky CTA bar block
- Schema: `LANDING.stickyMobile` từ Phase 03a `src/content/landing.ts`
- Text **Phase 02 LOCKED:** `Demo miễn phí - 20 phút →`

## Skills Active
- `frontend-design` · `ui-ux-pro-max` · `web-design-guidelines`

---

## Locked Spec (synthesis D2 + D9)

### Text & a11y
| Field | Value |
|---|---|
| **Display text** | `Demo miễn phí - 20 phút →` (Phase 02 LOCKED, không đổi) |
| **aria-label** | `Đặt lịch demo miễn phí 20 phút` (verb-led cho screen reader) |
| **data-cta-location** | `sticky_mobile` |
| **href** | `#booking` (smooth scroll) |
| **analytics event** | `cta_click` payload `{ cta_location: 'sticky_mobile' }` |

### Behavior
- **Display:** mobile only (`<768px`), `hidden md:hidden` desktop
- **Show trigger:** intersection observer - show khi `#hero` out viewport (threshold: 0 - fully out)
- **Hide trigger:** intersection observer - hide khi `#booking` enters viewport (threshold: 0.1 - first 10% visible)
- **Position:** `fixed bottom-0 left-0 right-0`
- **Z-index:** `z-40` (trên FAQ accordion z-30, dưới modal z-50)
- **Padding:** safe-area-inset-bottom respect cho iPhone notch
- **No dismiss button** - synthesis D9 lock (v1 ưu tiên conversion; review v1.1 nếu user test thấy che nội dung)

### Visual Style
- **Bg:** full-width `linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)`
- **Glow shadow:** `0 -8px 32px -8px rgba(168,85,247,0.4)` (lift from bottom)
- **Text:** white, Space Grotesk font-semibold 15px
- **Height:** ~56px (touch target ≥ 48px guaranteed)
- **Padding:** 16px horizontal · 14px vertical
- **Sketch arrow F1:** `→` sau text, animate translateX 4px on tap
- **Border-radius:** 0 (full-bleed bottom)

### Animations
- **E3 magnetic** (synthesis: disabled if reduced-motion D7)
  - Tap → scale 0.97 + ripple effect (subtle)
- **E1 shine sweep** (synthesis D7: disabled if reduced-motion)
  - Auto-sweep mỗi 8s (1 lần) draw attention
  - Owner-pending: confirm 8s OK hay cần custom interval
- **Show/hide transition:**
  - Show: `translateY(100%) → 0` 300ms ease-out
  - Hide: `translateY(0) → 100%` 200ms ease-in
  - Reduced-motion: instant show/hide (no transition)

### Reduced-motion Matrix (synthesis D7)
| Animation | Default | Reduced-motion |
|---|---|---|
| E3 magnetic tap | scale + ripple | **Tap feedback đơn giản** (opacity 0.85 briefly) |
| E1 shine sweep | Auto 8s loop | **Disabled** |
| Show/hide transition | translateY 300ms | **Instant** |
| Arrow translateX hover | 4px slide | **Disabled** |

---

## Conflict Prevention

### Hero secondary CTA `Xem cách hoạt động ↓` vs Sticky CTA
- Hero secondary chỉ visible WITHIN Hero viewport
- Sticky chỉ visible SAU KHI Hero out viewport
- → **Không overlap** thời điểm xuất hiện ✓
- Test case: scroll slow 50% Hero ra → Sticky chưa show; scroll 100% → Sticky show

### FAQ accordion z-index
- FAQ accordion z-30
- Sticky CTA z-40
- → Sticky luôn trên FAQ ✓
- Test: open FAQ accordion item → Sticky vẫn visible đáy

### Booking form focus state
- Khi user click vào field form S8 → keyboard mobile lên
- Sticky CTA cần ẩn HOẶC không che field
- iOS Safari: `100vh` không tính keyboard → Sticky có thể che input
- **Solution:** hide Sticky khi `#booking` enters viewport (đã có ✓) + verify keyboard không trigger re-show

---

## Files to Create

### Components
- `src/components/ui/sticky-cta-bar.tsx`

### Hooks
- `src/hooks/use-section-in-view.ts` - intersection observer hook (return boolean)

### Wire
- Modify `src/app/page.tsx` - add `<StickyCtaBar />` after `<About />`

---

## Implementation Pattern

```tsx
// src/components/ui/sticky-cta-bar.tsx
'use client';
import { LANDING } from '@/content/landing';
import { useSectionInView } from '@/hooks/use-section-in-view';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';

export function StickyCtaBar() {
  const heroVisible  = useSectionInView('#hero', { threshold: 0 });
  const bookingVisible = useSectionInView('#booking', { threshold: 0.1 });

  // Show: hero out AND booking not yet in
  const shouldShow = !heroVisible && !bookingVisible;

  return (
    <div
      data-show={shouldShow}
      className="sticky-cta-bar md:hidden"
      aria-hidden={!shouldShow}
    >
      <a
        href={LANDING.stickyMobile.cta.href}
        aria-label={LANDING.stickyMobile.cta.ariaLabel}
        data-cta-location="sticky_mobile"
        onClick={() => trackCtaClick('sticky_mobile')}
      >
        {LANDING.stickyMobile.cta.label}
      </a>
    </div>
  );
}
```

```ts
// src/hooks/use-section-in-view.ts
'use client';
import { useEffect, useState } from 'react';

export function useSectionInView(selector: string, options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = document.querySelector(selector);
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [selector, options]);
  return inView;
}
```

---

## Todo
- [ ] `useSectionInView` hook
- [ ] `StickyCtaBar` component
- [ ] CSS styles (gradient · glow · safe-area-inset-bottom)
- [ ] E3 magnetic on tap
- [ ] E1 shine sweep 8s loop
- [ ] Show/hide translateY transition
- [ ] Reduced-motion respect
- [ ] data-cta-location + analytics wire
- [ ] aria-hidden khi không show
- [ ] Wire vào `page.tsx`
- [ ] Mobile UX test 360/375/414
- [ ] Conflict test: Hero secondary CTA visible timing
- [ ] Conflict test: FAQ accordion open
- [ ] Conflict test: Booking form keyboard focus

---

## Success Criteria
- Sticky hiện đúng khi Hero out viewport
- Sticky ẩn đúng khi Booking enters viewport
- Không che FAQ / form / focus state
- Touch target ≥ 48px (height 56px ✓)
- Tap → smooth scroll `#booking` clean
- aria-label correct (verb-led)
- Reduced-motion respect (no shine sweep, instant show/hide)
- Bundle delta < 10KB gzipped
- Lighthouse a11y không drop

---

## Risks
- **iOS Safari `100vh`** - bottom có thể bị che bởi address bar; mitigation: `100dvh` + `safe-area-inset-bottom`
- **Keyboard up trigger re-show race condition** - verify intersection observer không re-fire khi keyboard close
- **Multiple intersection observers cùng `#hero`** - Phase 03c og:image PoC nếu cũng dùng có thể conflict; isolate observer instances
- **Shine sweep 8s loop trên battery-saver mode** - verify không drain pin; consider single-shot khi user scroll
- **`next/link` vs `<a>`** - `#booking` anchor không phải route, dùng `<a>` regular tốt hơn

---

## Resolved (synthesis 2026-05-12)
- ✅ D2 Text giữ Phase 02 lock `Demo miễn phí - 20 phút →` + aria-label verb-led
- ✅ D3 Analytics event `sticky_mobile`, không UTM
- ✅ D7 Reduced-motion matrix
- ✅ D9 V1 không có nút × dismiss

---

## Owner Decisions Pending
- [ ] E1 shine sweep 8s interval - OK hay đổi (5s / 10s / disable)?
- [ ] v1.1 dismiss button nếu user test thấy che nội dung - defer decision

---

## Next
→ [Phase 03c - og:image Banner](./phase-03c-og-image-banner.md) (parallel hoặc sau 03b)
