# Phase 03d — Nav Bar (Global)

**Status:** ⏭ Next (P0)
**Priority:** P0 (foundational — anchor links referenced by Hero + Sticky + Phase 04+ CTAs)
**Effort:** 30-45 phút
**Ship gate:** Build clean + visual verify desktop + mobile
**Depends on:** Phase 01 (`NavLogo` component) + Phase 03a (`LANDING` schema)
**Cross-decisions:** D3 analytics · D7 reduced-motion · D10 light-only

## Source-of-Truth
- Logo: `@/components/brand/prod-logo` → `<NavLogo>` (Phase 01 locked)
- Anchor map matches section IDs:
  - `#hero` (Phase 03a) → Trang chủ (scroll-to-top behavior)
  - `#services` (Phase 04, not yet) → Dịch vụ
  - `#process` (Phase 05, not yet) → Quy trình
  - `#faq` (Phase 05, not yet) → FAQ
  - `#booking` (Phase 06, not yet) → Đặt lịch
- Palette: Aurora Glow tokens — glass surface for nav bg

## Scope (4 deliverables)
1. **NavBar component** sticky top, glass blur, NavLogo left + links right (desktop)
2. **Mobile drawer** hamburger trigger + side drawer (Radix Dialog wraps shadcn)
3. **Active section tracking** via IntersectionObserver — highlight current link
4. **Wire global** trong `src/app/layout.tsx` (above `{children}`)

---

## Spec — Desktop

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [NavLogo]      Dịch vụ · Quy trình · FAQ      [Đặt lịch →] │
└─────────────────────────────────────────────────────────────┘
                                                       sticky top-0 z-50
```

### Sticky behavior
- `fixed top-0 inset-x-0 z-50` — always on screen
- Initial state (over Hero): `bg-transparent backdrop-blur-md` — letting Aurora show through
- Scrolled state (past Hero): `bg-surface-elevated/85 backdrop-blur-md border-b border-border-default` — solid glass
- Toggle based on scroll distance > 80px

### Anchor links (desktop)
- Display: `hidden md:flex gap-1`
- Each link: `<a href="#section" data-cta-location="nav_X">` with hover indigo → violet
- Active section: indigo bg pill + underline F1 hint
- Tracking via IntersectionObserver — observe section IDs, set `data-active` on matching link

### CTA Button (desktop)
- Right edge: `Đặt lịch Meet →` Aurora gradient pill
- `data-cta-location="nav_cta"`
- Hidden on mobile (sticky bottom CTA already handles)

---

## Spec — Mobile

### Layout
```
┌────────────────────────┐
│ [NavLogo]      [≡]    │  ← hamburger right
└────────────────────────┘
```

### Drawer behavior (Radix Dialog)
- Hamburger tap → slide-in panel from right
- Backdrop: dark overlay tap-to-close
- Panel content:
  - Close button top-right
  - 4 anchor links stacked, large tap targets (≥48px)
  - CTA `Đặt lịch Meet →` at bottom
  - Footer: contact icons (Zalo · Email · FB · TikTok)

### Hamburger button
- 24x24px icon, lucide `Menu` icon
- Touch target ≥44px (padding 10px around 24px icon)
- Toggle states: ☰ → ✕

---

## Active Section Tracking

```ts
// useActiveSection hook (in nav-bar.tsx or extracted)
const sections = ['hero', 'services', 'process', 'faq', 'booking'];
const [active, setActive] = useState<string | null>(null);

useEffect(() => {
  const observers = sections.map(id => {
    const el = document.getElementById(id);
    if (!el) return null;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setActive(id),
      { rootMargin: '-30% 0% -60% 0%', threshold: 0 }
    );
    obs.observe(el);
    return obs;
  });
  return () => observers.forEach(o => o?.disconnect());
}, []);
```

Logic: when section center crosses upper 30% viewport line → mark active.

---

## A11y

| Requirement | Implementation |
|---|---|
| Skip-to-content link | `<a href="#main" className="sr-only focus:not-sr-only">Bỏ qua đến nội dung</a>` at top |
| Nav landmark | `<nav aria-label="Điều hướng chính">` |
| Active link | `aria-current="page"` (or `"location"` for in-page) |
| Mobile drawer | Radix Dialog handles focus trap + ESC + ARIA |
| Touch targets ≥48px | mobile drawer links + hamburger |

---

## Reduced-motion (D7)

| Element | Default | Reduced-motion |
|---|---|---|
| Sticky transition (transparent → glass) | 200ms ease-out | Instant |
| Drawer slide-in | 250ms ease-out | Instant fade |
| Link hover scale | `hover:scale-[1.02]` | `motion-reduce:hover:scale-100` |
| Active section pill morph | 150ms transition | Disabled |

---

## Files to Create

| File | Purpose |
|---|---|
| `src/components/layout/nav-bar.tsx` | Main nav (sticky, desktop + mobile trigger) |
| `src/components/layout/nav-mobile-drawer.tsx` | Mobile slide-in drawer (Radix Dialog) |
| `src/hooks/use-scroll-past.ts` | Boolean hook: scrolled past N px? |
| `src/hooks/use-active-section.ts` | Returns active section ID via IntersectionObserver |

## Files to Modify

| File | Change |
|---|---|
| `src/app/layout.tsx` | Add `<NavBar />` above `<ThemeProvider>{children}</ThemeProvider>` |
| `src/content/landing.ts` | Add `NavContent` type + `LANDING.nav` data |

---

## Content Schema Addition

```ts
// Append to landing.ts
export type NavLink = {
  label: string;
  href: string;
  /** Section ID for IntersectionObserver tracking */
  sectionId: string;
  analyticsId: string;
};

export type NavContent = {
  links: NavLink[];
  /** Desktop-only CTA (mobile uses bottom sticky) */
  desktopCta: Cta;
};

// Add to LANDING root:
nav: {
  links: [
    { label: 'Dịch vụ',  href: '#services', sectionId: 'services', analyticsId: 'nav_services' },
    { label: 'Quy trình', href: '#process',  sectionId: 'process',  analyticsId: 'nav_process'  },
    { label: 'FAQ',       href: '#faq',      sectionId: 'faq',      analyticsId: 'nav_faq'      },
  ],
  desktopCta: {
    label: 'Đặt lịch Meet →',
    href: '#booking',
    ariaLabel: 'Đặt lịch Meet 1-1 xem demo',
    analyticsId: 'nav_cta',
  },
}
```

Also extend `CtaLocation` union to include `nav_services | nav_process | nav_faq | nav_cta`.

---

## Implementation Steps

1. Append `NavContent` schema + `LANDING.nav` data
2. Extend `CtaLocation` enum
3. Create `useScrollPast(threshold)` hook
4. Create `useActiveSection(ids)` hook
5. Build `<NavMobileDrawer>` with Radix Dialog
6. Build `<NavBar>` main component (responsive)
7. Wire `<NavBar />` vào `layout.tsx`
8. `pnpm.cmd build` + `pnpm.cmd lint`
9. Visual verify mobile 375 + desktop 1440

---

## Success Criteria

- Nav visible all pages (layout-level)
- Desktop: 3 anchor links + CTA + logo, sticky glass on scroll
- Mobile: logo + hamburger; tap opens drawer slide-in
- Active section highlight working (test scroll between sections)
- Build clean, lint clean
- A11y: skip-to-content, focus trap drawer, aria-label nav

---

## Risks

- **`#services` `#process` `#faq` chưa exist** (Phase 04-05 chưa build) — anchor links scroll to top of page when target missing. Mitigation: graceful — sections exist as Phase ship. Pre-Phase 04, sticky nav shows "Trang chủ"-style behavior. Acceptable intermediate.
- **Radix Dialog bundle delta** — `radix-ui` deps already included in package.json. No new install.
- **IntersectionObserver SSR safety** — hook uses `useEffect`, client-only ✓
- **Glass blur perf on low-end mobile** — `backdrop-blur-md` GPU-cheap on iOS. Fallback: `motion-reduce` disables blur

---

## Resolved

- ✅ Anchor map locked (Trang chủ implicit · Dịch vụ · Quy trình · FAQ · Đặt lịch CTA)
- ✅ Mobile pattern: hamburger drawer (not bottom-sheet) — standard pattern
- ✅ No theme toggle in nav v1 (light-only D10)

---

## Next

→ Phase 04 (Services + Tech Graph) — Nav `#services` anchor will target Phase 04 section
