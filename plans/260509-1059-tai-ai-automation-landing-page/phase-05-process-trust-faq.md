# Phase 05 - Process Journey + Trust + FAQ Sections

**Status:** Pending
**Priority:** P1
**Depends on:** Phase 01 (tokens), Phase 02 (copy)

## Skills Active
- `frontend-design` - Timeline UX, accordion, polished interactions
- `marketing-psychology` - Apply commitment & consistency, authority, reciprocity ở process step
- `ui-ux-pro-max` - Timeline pattern, FAQ accordion best practices
- `web-design-guidelines` - A11y FAQ (ARIA expanded, keyboard nav)
- `frontend-development` - `<details>` native vs Radix Accordion (use Radix for animation)

## Objective
Build 3 sections:
1. **Process Journey** - vertical timeline 6 chặng
2. **Trust strip** - micro reassurance bullets giữa Process và FAQ
3. **FAQ** - accordion 6 Q&A handle objections

## Process Journey Section

### Layout
**Title centered:** `Quy trình hợp tác - minh bạch từng bước`
**Sub:** `Anh/chị biết trước mỗi bước làm gì, kết quả ra sao.`

### Desktop: Vertical center timeline
```
                    ┃
   [Step 1 card] ───●  Đặt lịch Meet 1-1
                    ┃
                    ●─── [Step 2 card]   Làm rõ kỳ vọng
                    ┃
   [Step 3 card] ───●   Khảo sát doanh nghiệp
                    ┃
                    ●─── [Step 4 card]   Đề xuất + Báo giá
                    ┃
   [Step 5 card] ───●   Hẹn ngày + Demo
                    ┃
                    ●─── [Step 6 card]   Bàn giao 100%
```
Alternating left-right cards với center spine line.

### Mobile: Single column, all left-aligned
```
●─ Step 1
│  [Card]
●─ Step 2
│  [Card]
...
```
Spine line bên trái, tất cả cards lệch phải.

### Step Card Anatomy
- Number badge (1-6) gradient bg, 40x40 circle
- Title (h2)
- Description (1-2 dòng)
- Optional: tiny icon (clock, chat, doc, etc.)
- Subtle outcome indicator: `→ Kết quả: [...]` italic

### Spine Line Animation (signature)
- SVG vertical line, gradient from blue-900 → violet-600
- On scroll progress: line "draws" from top to bottom (`pathLength` based on scroll)
- Active step: dot pulses violet glow
- Use `useScroll` + `useTransform` from Framer Motion

### Step Reveal
- Stagger reveal cards as they enter viewport
- Number badge: scale-in + rotate slight
- Card: slide from left/right (alternating)

## Trust Strip Section (between Process and FAQ)

### Layout
Compact horizontal row, 4 trust signals:
```
[icon] Không cam kết tối thiểu  |  [icon] Bàn giao 100% tài khoản  |  [icon] 30 ngày hỗ trợ free  |  [icon] Demo trước khi quyết
```

Mobile: 2x2 grid hoặc carousel auto-scroll

### Visual
- Bg: `surface-subtle` (#F8FAFC)
- Padding 24px y
- Icon: 24px Lucide, brand-secondary color
- Text: body-sm, font-medium

### Use of `marketing-psychology` skill
- **Reciprocity:** "Demo trước khi quyết" - give before ask
- **Authority:** "30 ngày hỗ trợ" - expertise commitment
- **Loss aversion (reversed):** "Không cam kết tối thiểu" - remove friction

## FAQ Section

### Layout
**Title centered:** `Câu hỏi thường gặp`
**Sub:** `Anh/chị có thắc mắc gì mà không thấy ở đây? Cứ đặt Meet - tôi giải đáp trực tiếp.`

### Container
- Max-width 800px (centered, narrow)
- Each item: collapsible accordion

### Accordion Item
- Library: shadcn `<Accordion>` (Radix-based) → đã có animation built-in
- Closed state:
  - Question với icon `+` bên phải
  - Border bottom subtle
  - Padding 16px y
- Open state:
  - Icon rotate `+` → `×` (animate 200ms)
  - Reveal answer below với fade + slide-down
  - Background subtle highlight (`surface-subtle`)

### FAQ Content Source
Pull từ `src/content/faq.ts` sau Phase 03 materialize từ `content-copy.md`:
1. Chatbot có thay thế nhân viên không?
2. Không rành kỹ thuật có dùng được không?
3. Giá bao nhiêu?
4. Cam kết bao lâu?
5. Có sửa được sau triển khai?
6. Vision AI nhận hình mọi sản phẩm?

### Final CTA Below FAQ
"Vẫn còn thắc mắc? [Đặt lịch Meet 1-1 →]" - link smooth scroll xuống booking section

## Files to Create
- `src/components/sections/process-journey.tsx`
- `src/components/sections/trust-strip.tsx`
- `src/components/sections/faq.tsx`
- `src/components/process/timeline-spine.tsx` - animated SVG line
- `src/components/process/step-card.tsx`
- `src/components/process/step-number-badge.tsx`
- `src/components/faq/faq-item.tsx` (wrapping shadcn Accordion)
- `src/lib/motion/timeline-variants.ts`

## Implementation Steps
1. Build `<StepCard />` component
2. Build `<TimelineSpine />` SVG với scroll-driven `pathLength`
3. Build `<ProcessJourney />` layout - alternating left-right desktop, single column mobile
4. Stagger card reveals on viewport intersect
5. Build `<TrustStrip />` - 4 items horizontal/grid
6. Build `<Faq />` consume `src/content/faq.ts`
7. Wrap shadcn Accordion với custom motion (smooth open/close)
8. Add A11y: `aria-expanded`, `aria-controls`, keyboard nav (space/enter to toggle)
9. Final CTA link với smooth scroll
10. Test mobile + desktop + reduced motion

## Todo
- [ ] StepCard component
- [ ] TimelineSpine animated SVG
- [ ] ProcessJourney section build
- [ ] Stagger viewport reveals
- [ ] TrustStrip 4 items
- [ ] FaqItem wrapper với motion
- [ ] FAQ section build
- [ ] A11y audit accordion (keyboard, ARIA)
- [ ] Mobile vertical timeline
- [ ] Reduced motion fallback
- [ ] Final CTA smooth scroll

## Success Criteria
- Timeline spine animate đúng theo scroll progress (test smooth)
- 6 steps reveal stagger, không bị flicker
- Mobile timeline single column readable
- FAQ accordion: keyboard accessible (Tab, Space, Enter, Arrow)
- All animations respect `prefers-reduced-motion`
- Lighthouse a11y 100 cho FAQ section

## Risks
- **Timeline scroll perf** trên mobile → optimize: throttle scroll listener qua Framer's `useTransform` (built-in optimization)
- **Long FAQ answers wrap awkward** trên mobile → max-width content, line-height 1.6+
- **Accordion animation jitter** với content height transition → dùng Radix native (handles via grid trick)

## Open Questions
- Có muốn timeline desktop horizontal thay vì vertical không? (vd: `process flow horizontal carousel`) - risk: less elegant, mobile pain
- Có muốn add 1 step "Sau bàn giao" / "Maintenance ongoing" không? → 7 steps (lẻ, OK)
- FAQ có muốn search/filter không? (overkill cho 6 items, skip)

## Next
→ Phase 06 (Booking UI / Smart Calendar) - heart of conversion
