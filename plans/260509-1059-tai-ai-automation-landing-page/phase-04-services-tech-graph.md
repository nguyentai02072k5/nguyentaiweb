# Phase 04 - Services + Tech Graph Section

**Status:** Pending
**Priority:** P0
**Depends on:** Phase 01 (tokens), Phase 02 (copy)

## Skills Active
- `frontend-design` - Polished interactive cards, SVG art
- `mermaidjs-v11` - Reference diagram syntax (sẽ render bằng custom SVG để control animation)
- `ai-artist` - Generate icon-style illustrations cho service module headers
- `shader` - Optional GLSL background cho tech graph (aurora effect)
- `ui-ux-pro-max` - Card UX guidelines, hover patterns
- `react-best-practices` - `useInView` hook, lazy reveal
- `threejs` - Optional 3D node graph (nếu user thích premium tech feel)

## Objective
Build Services section (3 module cards) + Tech Graph (animated SVG node-edge diagram visualizing AI workflow).

## Key Insights
- Service cards must show benefit + concrete bullets, không chung chung
- Image recognition là **core differentiator** → highlight rõ ràng
- Tech Graph để **show, not tell** - visual flow nhanh hơn 3 đoạn text
- Animated graph có line pulse → người xem hiểu ngay là "data flow"
- Mobile: graph stack vertical thay vì horizontal nodes
- Cần tránh AI slop look - dùng custom SVG, không phải template generic

## Services Section Layout

### Desktop
3 cards grid, equal width, gap 24px:
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Module 1 │  │ Module 2 │  │ Module 3 │
│ Chatbot  │  │Marketing │  │ Bàn giao │
│ AI       │  │Automation│  │ + Hỗ trợ │
└──────────┘  └──────────┘  └──────────┘
```

### Tablet
2 cards row + 1 below (stack at 768px)

### Mobile
Stack 3 cards vertical, full-width

### Card Anatomy
```
┌─────────────────────────────┐
│ [Icon-illustration 64px]    │ ← AI-generated or Lucide composite
│ [Module title h2]           │
│ [Sub line - italic]         │
│                             │
│ ✓ Bullet 1                  │
│ ✓ Bullet 2                  │
│ ✓ Bullet 3                  │  ← bullets có icon riêng (📸 🛒 ⚙️)
│ ★ HIGHLIGHT bullet          │  ← differentiator (image recognition)
│                             │
│ [Module 1 of 3 indicator]   │
└─────────────────────────────┘
```

### Card Design Spec
- Background: `surface-base` với subtle gradient overlay
- Border: 1px `border-default` → on hover: `border-brand-secondary` + shadow-glow
- Radius: `lg` (16px)
- Padding: 32px desktop / 24px mobile
- Icon area: 80x80, gradient bg `gradient-hero` opacity 0.1, contains icon (white via mix-blend hoặc raw)
- Highlight bullet: bg `violet-50` strip, icon ★ (sparkle), font-semibold

### Card Hover Animations
- Card lift: `translateY(-4px)` + shadow-md → shadow-lg
- Icon area: gradient opacity 0.1 → 0.2 + scale 1.05
- Border color shift
- Internal bullets có subtle stagger reveal on first viewport entry (initial only, not on hover)

### Card Variants (per module có signature color)
- **Module 1 (Chatbot AI):** primary blue accent
- **Module 2 (Marketing):** violet accent
- **Module 3 (Bàn giao):** mixed gradient (signature)

## Tech Graph Section Layout

### Title + Sub
- H2: `Cách AI hoạt động trong workflow của anh/chị`
- Sub: `Inbox → Vision AI → Chatbot → Sản phẩm/CRM → Marketing → Báo cáo`

### Graph Visualization

#### Desktop: Horizontal flow (7 nodes)
```
[Inbox đa kênh] → [Vision AI] → [Chatbot AI] → [Knowledge base]
                                      ↓
                               [Đơn hàng/CRM]
                                      ↓
[Báo cáo] ← [Lịch đăng/Quảng cáo]
```

Nodes positioned via SVG `<g transform="translate(x,y)">` với coordinates explicit. Edges connecting via `<path>` với cubic bezier.

#### Mobile: Vertical stack
Same nodes nhưng top-to-bottom, edges là vertical lines với arrow.

### Node Component
- Shape: rounded rect (8px radius)
- Bg: `surface-elevated` với subtle gradient
- Border: 1px `border-default`
- Inner: icon (32px Lucide) + label (12-14px)
- Hover: scale 1.05 + shadow-glow

### Edge Animation (signature feature)
- Static line: `stroke="rgba(139,92,246,0.3)"` 1.5px
- **Pulse:** small dot travels along path (using `<animateMotion>` SVG hoặc Framer Motion `motion.circle` với `motionPath`)
- Pulse duration: 2s loop, stagger different edges 200ms apart
- Color: violet bright (`#A78BFA`)

### Implementation Approach: Custom SVG (NOT Mermaid)
- Mermaid không cho fine-grained animation control
- Dùng React component build SVG với explicit coordinates
- Reference shape/concept từ `mermaidjs-v11` flowchart, render bằng tay

```tsx
// pseudocode
<svg viewBox="0 0 1200 400">
  <defs>
    <linearGradient id="edge-gradient">...</linearGradient>
  </defs>
  {nodes.map(n => <Node key={n.id} {...n} />)}
  {edges.map(e => <Edge key={e.id} from={...} to={...} animate />)}
</svg>
```

### Background Treatment
Behind graph:
- Subtle dot grid (lighter than hero)
- Optional: aurora shader background (skill `shader`) - soft moving violet/blue gradient
- Decorative sketch annotations (hand-drawn arrow notes pointing to key nodes như "đây là điểm khác biệt")

## Files to Create
- `src/components/sections/services.tsx`
- `src/components/sections/tech-graph.tsx`
- `src/components/services/service-card.tsx`
- `src/components/services/service-icon.tsx` - composite icon component
- `src/components/tech-graph/graph-svg.tsx`
- `src/components/tech-graph/graph-node.tsx`
- `src/components/tech-graph/graph-edge.tsx`
- `src/components/tech-graph/graph-pulse.tsx` - animated dot
- `src/components/decoration/sketch-annotation.tsx` - hand-drawn note + arrow
- `src/lib/tech-graph-data.ts` - node + edge config (positions, labels)
- Optional: `src/components/decoration/aurora-shader.tsx` (GLSL via `shader` skill)

## Implementation Steps
1. Build `<ServiceCard />` component theo spec card anatomy
2. Wire 3 cards consume `src/content/services.ts`
3. Add Framer Motion stagger reveal on viewport
4. Build SVG graph layout với positioned nodes (desktop coords)
5. Build mobile vertical version (separate `<MobileTechGraph />` hoặc responsive transform)
6. Implement edge pulse animation (start with simple, optimize if smooth)
7. Add sketch annotation decoration
8. Optional: add aurora shader background (assess perf first)
9. Test: hover states, viewport reveal, mobile stack
10. A11y: SVG có `<title>`, `<desc>`, role="img", node labels readable

## Todo
- [ ] ServiceCard component
- [ ] 3 service cards consume copy
- [ ] Service icon composite (Lucide + bg)
- [ ] Stagger reveal on scroll
- [ ] Tech graph data file (nodes + edges + positions)
- [ ] GraphSVG container
- [ ] GraphNode component
- [ ] GraphEdge with pulse
- [ ] Mobile vertical version
- [ ] Sketch annotation decoration
- [ ] Aurora shader (optional, perf-gated)
- [ ] A11y SVG markup
- [ ] Lighthouse perf check (< 50ms scripting on graph mount)

## Success Criteria
- Service cards mobile + desktop responsive đúng
- Card hover states polished, không giật
- Tech graph render dưới 100ms
- Edge pulse animation smooth ở 60fps trên mobile mid-tier
- Reduced motion: pulse → static thicker stroke
- Accessibility: graph nodes labeled, screen reader có thể narrate flow

## Risks
- **SVG perf** với multiple animated edges → optimize: batch animations, will-change, GPU layers
- **Mobile graph readability** - text quá nhỏ → tăng node padding, dùng accordion-style alternative nếu cần
- **AI-generated icons** có thể slop → ưu tiên Lucide composite + custom SVG glyph

## Open Questions
- Có muốn 3D graph (Three.js skill) cho desktop? Risk: heavy bundle, perf
- Có muốn click node show tooltip detail? (interactive layer)
- Aurora shader có muốn enable? (cần test perf trên mobile thật)

## Next
→ Phase 05 (Process + Trust + FAQ)
