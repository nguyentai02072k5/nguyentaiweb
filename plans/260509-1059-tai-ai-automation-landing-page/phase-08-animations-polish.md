# Phase 08 - Animations, Patterns & Polish

**Status:** Pending - design locked 2026-05-10
**Priority:** P1
**Depends on:** Phase 03-06 (sections built)
**Reference showcase:** `/animations` route (24 variants benchmarked)

## 🔒 Animation Combo Locked (2026-05-10)

User picked sau khi review showcase. Mỗi combo = 2 effects layer.

### A · Backdrop (hero) - **A5 silk shimmer + A6 aurora streaks**
- **Base layer:** A6 - 3 vertical aurora streaks (violet/indigo/cyan) drift kiểu cực quang Bắc cực (subtle, blur-3xl)
- **Overlay layer:** A5 - silk shimmer sweep diagonally, only every 8s (rare premium accent)
- Implementation: stack 2 absolute layers behind hero content
- Why combo: aurora streaks tạo organic feel + shimmer thỉnh thoảng add "spark of premium" mà không phân tâm

### B · Image (owner photo) - **B4 sparkles + B5 liquid blob**
- **Frame:** B5 - photo container có `border-radius` morph organic (8s loop) thay vì tròn cứng
- **Decoration:** B4 - 6 dấu ✦ tím nhấp nháy quanh ảnh (sparkle-twinkle, drop-shadow glow violet)
- Implementation: photo wrapped in morph-blob div + sparkles positioned absolute
- Why combo: organic blob frame (B5) tránh "stock portrait" + sparkles (B4) add personality

### C · Text (headline) - **C1 split stagger + F1 sketch underline**
- **Words:** C1 - mỗi từ fade-up + blur-out → blur-in stagger 80ms apart on viewport
- **Keyword accent:** F1 ① sketch underline draws under "chốt khách" (1.2s path animation)
- Implementation: `<motion.span>` per word + `<SketchUnderline>` SVG bên dưới keyword
- Why combo: split stagger guide eye qua headline + underline khẳng định keyword là mấu chốt

### D · Service cards - **D7 stagger reveal + D4 spotlight follow**
- **Viewport entrance:** D7 - 3 cards reveal stagger fade-up + blur-out 150ms apart khi scroll vào view
- **Hover state:** D4 - radial spotlight (400px violet) theo cursor inside card
- Implementation: parent motion container với `whileInView` + per-card `useState` cho mouse position
- Why combo: dramatic entrance (D7) + interactive hover (D4) = cards "alive"

### E · CTA buttons - **E3 magnetic + E1 shine sweep**
- **Idle/movement:** E3 - button "hút" theo cursor 0.4 strength khi gần, spring back khi rời
- **Hover state:** E1 - ánh sáng quét trái → phải 700ms khi hover
- Implementation: motion button với `useSpring(useMotionValue)` + group-hover shine overlay
- Why combo: magnetic attract attention (E3) + shine confirm interactivity (E1)

### F · Decoration - **F1 sketch line tinh tế xuyên suốt**
4 cách áp dụng đã demo `/animations` section "F1 in Context":
1. **Underline accent** dưới keyword trong headlines (vd "chốt khách", "Vision AI")
2. **Hand-drawn arrow** từ note "Click ngay →" trỏ tới Primary CTA (hero + final CTA section)
3. **Section divider** dashed gradient uốn lượn giữa Pain ↔ Solution, Process ↔ Trust
4. **Hand-drawn frame** quanh About section photo (artisan touch)

Tất cả `pathLength` draw on viewport, scroll re-trigger.

## Implementation Order (when reaching Phase 08)
1. Hero backdrop: layer A6 (3 streak divs) + A5 (shimmer overlay) behind existing mesh
2. Owner photo wrapper: B5 morph border-radius + B4 sparkles abs positioned
3. Headline: split words via React + SketchUnderline component dưới keyword
4. ServiceCard component: parent stagger variants + per-card spotlight cursor tracking
5. PrimaryCTA component: magnetic motion + shine overlay group-hover
6. SectionDivider, SketchArrow, SketchFrame, SketchUnderline as reusable components
7. Verify reduced-motion fallback tất cả hiệu ứng

## Skills Active
- `frontend-design` - Polished animations, avoid AI slop, premium feel
- `shader` - GLSL fragment shaders cho aurora/mesh background (optional advanced)
- `react-best-practices` - Performance patterns (lazy load, RSC, dynamic import)
- `ui-ux-pro-max` - Micro-interaction guidelines
- `web-design-guidelines` - Reduced motion, accessibility
- `chrome-devtools` - Performance profiling, FPS check
- `threejs` - Optional 3D accents (use sparingly)

## Objective
Add cohesive animation system across all sections. Apply patterns/sketches/decorations đúng tone. Ensure 60fps mobile, respect reduced motion. Final polish pass.

## Key Insights
- Animation phải "feel intentional", không phải "thêm cho vui" → mỗi animation có lý do (reveal info, guide attention, give feedback)
- 3 layers of motion:
  1. **Entrance** - section/element reveal on scroll
  2. **Continuous** - background mesh, edge pulse, subtle drift
  3. **Interaction** - hover, click, focus feedback
- Stagger reveal > all-at-once → eye follows naturally
- Micro-interactions = trust signals (premium feel)
- Performance budget: motion budget < 8% main thread, no GC spikes

## Animation System (Centralized)

### Variant Library (`src/lib/motion/variants.ts`)
```ts
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2,0,0,1] } }
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.2,0,0,1] } }
};

export const slideInRight = { /* ... */ };
export const slideInLeft = { /* ... */ };
export const drawPath = { /* SVG path animation */ };
```

### Reusable Hook (`src/hooks/use-section-reveal.ts`)
```ts
export function useSectionReveal(threshold = 0.2) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold, once: true });
  return { ref, animate: inView ? 'visible' : 'hidden' };
}
```

### Reduced Motion Hook (`src/hooks/use-prefers-reduced-motion.ts`)
```ts
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
```

When `reduced = true`:
- Disable continuous animations (mesh blob drift, edge pulse)
- Reveal animations: instant (no transition)
- Keep hover/focus feedback (these aid interaction, not decoration)

## Per-Section Animations

### Hero
- Stagger entrance (Phase 03 spec)
- Mesh blobs continuous drift (slow, GPU-only transform)
- Sketch lines path-draw on mount
- Owner photo: parallax mild on scroll (translate Y -10%)
- CTA hover: scale 1.02 + shadow-glow ramp

### About
- Photo scale-in
- Bullets stagger fade-up
- Sketch frame border draw (SVG path)

### Services
- Cards stagger reveal
- Card hover: lift + border glow + icon scale 1.05
- Highlight bullet: subtle pulse on first reveal (drawing attention to differentiator)

### Tech Graph
- Nodes scale-in stagger (0.05s gap)
- Edges path-draw sequential
- Pulse dots loop continuous (offset stagger)
- Sketch annotations: type-on / hand-drawn fade

### Process Journey
- Spine line: scroll-driven `pathLength` (Framer `useScroll` + `useTransform`)
- Step cards: alternating slide-in from left/right (stagger by viewport)
- Number badges: scale + rotate-in
- Active step (closest to viewport center): subtle violet glow

### Trust Strip
- Icons fade-up stagger
- Hover: icon color shift to brand-secondary

### FAQ
- Accordion: shadcn built-in (Radix grid trick - smooth height)
- Icon `+ → ×` rotate 200ms

### Booking Section
- Step transitions: AnimatePresence với slide direction-aware
- DateChip selected: spring scale + bg gradient cross-fade
- SlotButton hover: subtle scale + bg shift
- Submit button: ripple click + loading spinner morph
- ThankYou checkmark: SVG path-draw + confetti

## Patterns / Decorations System

### Reusable Decoration Components
- `<DotPattern variant="dense|sparse" color="violet|white" />`
- `<SketchLines count={3-5} />` - hand-drawn squiggles
- `<NoiseTexture opacity={0.03} />` - SVG turbulence filter
- `<MeshBlob color="violet|blue" size="lg|md" position={{x,y}} />`
- `<GradientOrb />` - radial blur orb behind sections
- `<SketchFrame />` - hand-drawn border (SVG path)
- `<SketchAnnotation text="..." pointTo="ref" />` - note + arrow
- `<GridLines spacing={32} />` - subtle architectural grid

### Pattern Placement Strategy
| Section | Decorations |
|---|---|
| Hero | Mesh blobs + dot pattern + sketch lines + noise |
| About | Sketch frame around photo + 1-2 sketch lines |
| Services | Subtle dot pattern bg + gradient orb behind highlight card |
| Tech Graph | Light dot grid + 2-3 sketch annotations |
| Process | Spine line + step number badges (decorative gradient) |
| Trust Strip | Plain (let copy breathe) |
| FAQ | Plain |
| Booking | Subtle gradient orb top + dot pattern bottom |
| Footer | Top border gradient line |

### Sketch Lines (SVG hand-drawn feel)
Generated via Bezier curves với slight random control points:
```tsx
<svg width="200" height="40">
  <path
    d="M 10 20 C 50 5, 100 35, 190 20"
    stroke="rgba(255,255,255,0.15)"
    strokeWidth="2"
    strokeLinecap="round"
    fill="none"
  />
</svg>
```

Use `getStroke` library hoặc manual paths. Animate via `pathLength: 0 → 1`.

### Optional: Aurora Shader Background
Apply `shader` skill cho Tech Graph section background:
- Fragment shader with simplex noise + sin/cos waves
- Color palette: violet → blue
- Mounted via `<canvas>` or react-three-fiber
- ⚠️ Test perf - may disable on mobile

## Performance Budget

### Targets
- LCP: < 2.0s (mobile), < 1.5s (desktop)
- CLS: < 0.05
- FID/INP: < 100ms
- Total JS: < 200KB compressed
- Animation frame: 60fps consistent
- No long tasks > 50ms

### Optimizations
1. **Code splitting:**
   - Booking section: dynamic import (below fold)
   - Tech graph SVG: dynamic
   - Aurora shader: dynamic + only desktop
2. **Image optimization:**
   - Owner photo: `next/image` priority + AVIF/WebP
   - Decorative SVGs: inline (small) hoặc CSS background
3. **Font:**
   - Subset Vietnamese + Latin only
   - Preload critical weights (400, 600, 800)
   - `display: swap`
4. **Animation perf:**
   - Use `transform` + `opacity` only (GPU)
   - `will-change` sparingly
   - Throttle scroll listeners (Framer handles internally)
5. **Lazy reveal heavy sections:** Tech graph, FAQ
6. **RSC:** Hero, About, Services, Process, FAQ, Footer là Server Components (static)
7. **Client-only components:** Booking section, animation wrappers

## Files to Create
- `src/lib/motion/variants.ts` - central variant library
- `src/lib/motion/eases.ts` - custom cubic-bezier presets
- `src/hooks/use-section-reveal.ts`
- `src/hooks/use-prefers-reduced-motion.ts`
- `src/components/decoration/dot-pattern.tsx` (refine từ Phase 03)
- `src/components/decoration/sketch-lines.tsx`
- `src/components/decoration/noise-texture.tsx`
- `src/components/decoration/mesh-blob.tsx`
- `src/components/decoration/gradient-orb.tsx`
- `src/components/decoration/sketch-frame.tsx`
- `src/components/decoration/sketch-annotation.tsx`
- `src/components/decoration/grid-lines.tsx`
- Optional: `src/components/decoration/aurora-shader.tsx` - react-three-fiber + GLSL
- `src/components/motion/reveal.tsx` - wrapper applying useSectionReveal + variants

## Implementation Steps
1. Build central variant library (8-10 reusable variants)
2. Build `useSectionReveal` + `usePrefersReducedMotion` hooks
3. Wrap each section với `<Reveal>` component
4. Build all decoration components (8 components)
5. Integrate decorations per section per Pattern Placement Strategy
6. Implement scroll-driven spine line cho Process Journey
7. Implement edge pulse cho Tech Graph
8. Implement step transitions cho Booking section
9. Optional: aurora shader (perf-gate desktop only)
10. Profile via Chrome DevTools → identify long tasks, layout thrashing
11. Run `react-best-practices` audit
12. Validate all animations respect reduced motion
13. Bundle analyze: `next/bundle-analyzer`
14. Lighthouse mobile + desktop run

## Todo
- [ ] Variant library
- [ ] useSectionReveal hook
- [ ] usePrefersReducedMotion hook
- [ ] Reveal wrapper component
- [ ] DotPattern component (variants)
- [ ] SketchLines component
- [ ] NoiseTexture component
- [ ] MeshBlob component
- [ ] GradientOrb component
- [ ] SketchFrame component
- [ ] SketchAnnotation component
- [ ] GridLines component
- [ ] Apply decorations per section
- [ ] Scroll-driven spine animation
- [ ] Edge pulse animation
- [ ] Booking step transitions
- [ ] Aurora shader (optional)
- [ ] DevTools perf profile
- [ ] Reduced motion test
- [ ] Bundle analyze
- [ ] Lighthouse run

## Success Criteria
- All sections feel cohesive (same easing, similar timing)
- 60fps animations on mid-tier mobile
- Reduced motion mode: page vẫn beautiful, không broken
- Lighthouse Performance: 90+ mobile, 95+ desktop
- CLS = 0 (no shift on font/image load)
- Bundle: critical JS < 200KB compressed
- No layout thrashing detected in profile

## Risks
- **Animation overdose** - too many sims feel busy. Mitigate: limit continuous animations to 2-3 per viewport
- **Mobile perf cliff** - older Android devices may stutter. Mitigate: feature-detect device class, simplify on low-end
- **Aurora shader bundle bloat** - react-three-fiber adds ~80KB. Mitigate: dynamic import + only enable when in viewport
- **Scroll-driven animation jank** - Framer's `useScroll` is optimized but heavy use can lag. Mitigate: limit to 1-2 places (spine line)

## Open Questions
- Có muốn cursor effect (custom cursor + trail) cho desktop không? (skill `frontend-design` có pattern). Risk: gimmicky
- Có muốn confetti khi submit thành công không? (perf cost ~30KB lib hoặc DIY). Recommend: DIY 8-10 SVG particles
- Aurora shader: enable hay skip cho v1? (recommend skip - add v1.5 nếu user muốn premium feel hơn)

## Next
→ Phase 09 (Responsive · A11y · Test · Deploy)
