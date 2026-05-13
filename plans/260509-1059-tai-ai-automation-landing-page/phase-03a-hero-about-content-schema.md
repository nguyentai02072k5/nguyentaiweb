# Phase 03a - Hero + About + Content Schema

**Status:** ⏭ Next (P0 - start ngay)
**Priority:** P0
**Effort:** 2-3 days
**Ship gate:** Owner visual review (Aurora rendering · headline mobile · About avatar)
**Depends on:** Phase 01 tokens (Aurora Glow REAL in `globals.css` + `semantic.ts`) + Phase 02 copy locked
**Cross-decisions:** xem [phase-03 overview](./phase-03-hero-about-sections.md) - D1, D3-D8, D10, D12

## Source-of-Truth
- Copy: `./content-copy.md` S1 Hero + S6 About + S10 sub-decisions
- S6 visual ref: `./visuals/s6-about-preview.html` (Variant A locked)
- Palette: Aurora Glow `#6366F1` · `#A855F7` · `#EC4899` · `#06B6D4` trên `#FAF7FF`
- Fonts: Space Grotesk (display) · Be Vietnam Pro (body)

## Skills Active
- `frontend-design` · `ui-ux-pro-max` · `web-design-guidelines` · `ai-multimodal` · `react-best-practices`

---

## STEP 0 - Content Schema (P0 #1 fix - bắt buộc trước)

### File: `src/content/landing.ts`

```ts
// Brand voice types ------------------------------------------------------------
export type StorySegmentType = 'text' | 'strong' | 'highlight';

export type StorySegment = {
  type: StorySegmentType;
  value: string;
};

export type StoryLabel = 'background' | 'insight' | 'difference' | 'mission';

export type AboutStoryParagraph = {
  label: StoryLabel;
  labelDisplay: string;        // VN: "Background" | "Insight" | "Khác biệt" | "Mission"
  segments: StorySegment[];
};

// CTA model --------------------------------------------------------------------
export type CtaLocation =
  | 'hero_primary'
  | 'hero_secondary'
  | 'sticky_mobile'
  | 'about_inline'
  | 'module_1'
  | 'module_2'
  | 'module_3'
  | 'thank_you_calendar';

export type Cta = {
  label: string;
  href: string;             // anchor `#booking` hoặc deep link
  ariaLabel: string;        // a11y full description
  analyticsId: CtaLocation; // data-cta-location attribute
};

// Section content models -------------------------------------------------------
export type TrustBadge = {
  icon: string;             // emoji or lucide icon name
  label: string;
};

export type HeroContent = {
  eyebrow: string;
  headlineParts: string[];  // for manual mobile wrap with <br className="sm:hidden" />
  body: string;             // contains <strong> markers parsed at render
  uspClose: string;         // contains <strong> markers
  primaryCta: Cta;
  secondaryCta: Cta;
  trustBullets: string[];
  floatingBadgesDesktop: TrustBadge[];  // 3 badges desktop only
  mobilePills: TrustBadge[];            // 3 inline pills mobile only (D5)
};

export type AboutContent = {
  title: string;
  story: AboutStoryParagraph[];
  bullets: string[];
  photoCaption: string;
  inlineCta: Cta;
};

export type StickyCtaContent = {
  cta: Cta;
  showAfterAnchor: string;  // '#hero' - show when scrolled past
  hideAtAnchor: string;     // '#booking' - hide when in view
};

// Root content object ----------------------------------------------------------
export type LandingContent = {
  hero: HeroContent;
  about: AboutContent;
  stickyMobile: StickyCtaContent;
};

// Data initialization ----------------------------------------------------------
export const LANDING: LandingContent = {
  hero: {
    eyebrow: 'TÀI AI AUTOMATION',
    headlineParts: [
      'Setup một lần.',
      'Có ngay trợ lý chốt sale không nghỉ ngơi.'
    ],
    body: 'Không trôi tin nhắn, không bỏ lỡ khách hàng ngoài giờ hành chính. <strong>AI tiếp nhận hình ảnh, hiểu rõ ý định và tư vấn đúng trọng tâm.</strong> Một giải pháp thực tế để anh/chị tối ưu chi phí vận hành mà vẫn duy trì doanh thu đều đặn.',
    uspClose: '<strong>→ Đặc biệt, không phụ thuộc Tài.</strong> Bàn giao toàn bộ - Tài hướng dẫn, hỗ trợ anh/chị trong quá trình sử dụng <strong>trọn đời</strong>.',
    primaryCta: {
      label: 'Đặt lịch Meet 1-1 - xem demo 20 phút',
      href: '#booking',
      ariaLabel: 'Đặt lịch Meet 1-1 xem demo 20 phút',
      analyticsId: 'hero_primary'
    },
    secondaryCta: {
      label: 'Xem cách hoạt động ↓',
      href: '#tech-graph',
      ariaLabel: 'Xem cách AI hoạt động trong workflow',
      analyticsId: 'hero_secondary'
    },
    trustBullets: [
      'Không cam kết - coi demo trước, quyết định sau',
      'Bàn giao tài khoản chatbot + nền tảng 100%, hỗ trợ sử dụng trọn đời',
      'Tinh chỉnh dễ dàng - tự sửa nội dung, sản phẩm'
    ],
    floatingBadgesDesktop: [
      { icon: '📸', label: 'Nhận diện hình ảnh' },
      { icon: '⏱', label: '20 phút demo' },
      { icon: '🔓', label: 'Bàn giao 100%' }
    ],
    mobilePills: [
      { icon: '📸', label: 'Nhận diện hình ảnh' },
      { icon: '⏱', label: '20 phút demo' },
      { icon: '🔓', label: 'Bàn giao 100%' }
    ]
  },
  about: {
    title: 'Tôi là Tài - và đây là lý do tôi làm dịch vụ này',
    story: [
      {
        label: 'background',
        labelDisplay: 'Background',
        segments: [
          { type: 'text',      value: 'Từ ' },
          { type: 'strong',    value: '2024' },
          { type: 'text',      value: ', đi làm AI thực chiến cho cả B2B (' },
          { type: 'strong',    value: 'xưởng Loma' },
          { type: 'text',      value: ') lẫn B2C (' },
          { type: 'strong',    value: 'mỹ phẩm, spa' },
          { type: 'text',      value: '), tôi nhận ra: Anh/chị chủ không cần một hệ thống AI quá hàn lâm hay phức tạp. Cái mọi người thực sự cần là một công cụ ' },
          { type: 'strong',    value: 'tinh gọn, chi phí hợp lý' },
          { type: 'text',      value: ', và quan trọng nhất - ' },
          { type: 'highlight', value: 'tự tay làm chủ được mà không cần biết nhiều về code hay kỹ thuật' },
          { type: 'text',      value: '.' }
        ]
      },
      {
        label: 'insight',
        labelDisplay: 'Insight',
        segments: [
          { type: 'text',   value: 'Thói quen mua hàng của khách Việt là ' },
          { type: 'strong', value: 'lười gõ' },
          { type: 'text',   value: '. Họ lướt, chụp màn hình rồi quăng cái ảnh vô inbox: "Mẫu này còn không shop?" hay "Giá". Mà khó ở chỗ, chatbot cũ chỉ biết đọc từ khóa nên thấy hình là ' },
          { type: 'strong', value: '"tịt"' },
          { type: 'text',   value: '. Bot đứng hình, nhân sự phải nhảy vào check thủ công. Khách đang "nóng" muốn mua mà bắt phải chờ là ' },
          { type: 'strong', value: 'rớt khách liền' },
          { type: 'text',   value: '.' }
        ]
      },
      {
        label: 'difference',
        labelDisplay: 'Khác biệt',
        segments: [
          { type: 'text',      value: 'Nhìn ra được điểm nghẽn đó, thay vì nhồi nhét tính năng rườm rà, tôi dồn lực giải quyết một lõi duy nhất: ' },
          { type: 'highlight', value: 'AI phải "đọc hiểu" được hình ảnh' },
          { type: 'text',      value: ' và ' },
          { type: 'strong',    value: 'tư vấn thực tế, không chỉ dựa vào từ khoá' },
          { type: 'text',      value: '. Khách ném ảnh qua, hệ thống ' },
          { type: 'strong',    value: 'tự động đối chiếu kho hàng' },
          { type: 'text',      value: ' rồi tư vấn đúng trọng tâm ngay lập tức. Giải quyết trực tiếp nhu cầu, thắc mắc của người mua, không vòng vo.' }
        ]
      },
      {
        label: 'mission',
        labelDisplay: 'Mission',
        segments: [
          { type: 'text',      value: 'Mục tiêu của tôi không phải là bán "con bot công nghệ" để trưng bày. ' },
          { type: 'strong',    value: 'Cốt lõi của kinh doanh là doanh thu và lợi nhuận.' },
          { type: 'text',      value: ' Thứ tôi mang đến là một ' },
          { type: 'strong',    value: '"trợ lý AI" trực 24/7' },
          { type: 'text',      value: ', xử lý gọn gàng khâu tư vấn lặp lại. Tóm lại: ' },
          { type: 'highlight', value: 'Đêm không rớt đơn, ngày không quá tải' },
          { type: 'text',      value: '. Anh/chị rảnh tay tập trung lo nguồn hàng, làm chiến lược, thay vì cứ ôm khư khư cái điện thoại.' }
        ]
      }
    ],
    bullets: [
      'Thực chiến từ 2024 - Loma (B2B xưởng) · mỹ phẩm · spa (B2C)',
      'AI "đọc hiểu" hình ảnh + tư vấn thực tế - không phải bot từ khoá',
      'Tự tay làm chủ - không cần code, không cần kỹ thuật',
      'Đêm không rớt đơn, ngày không quá tải - payoff thực tế'
    ],
    photoCaption: '- Tài, người trực tiếp demo và làm việc với anh/chị',
    inlineCta: {
      label: 'Đặt lịch nói chuyện trực tiếp →',
      href: '#booking',
      ariaLabel: 'Đặt lịch nói chuyện trực tiếp với Tài',
      analyticsId: 'about_inline'
    }
  },
  stickyMobile: {
    cta: {
      label: 'Demo miễn phí - 20 phút →',
      href: '#booking',
      ariaLabel: 'Đặt lịch demo miễn phí 20 phút',  // synthesis D2 unified
      analyticsId: 'sticky_mobile'
    },
    showAfterAnchor: '#hero',
    hideAtAnchor: '#booking'
  }
};
```

### Why segment array (KISS - synthesis D1)
- Type-safe rendering - không cần parser
- Phase 04/05 reuse cùng schema cho Module CTAs, Process steps
- Test-friendly (snapshot per segment)
- Không markdown plugin dependency

---

## STEP 1 - Inspect owner photo qua `ai-multimodal`
- Verify aspect ratio thực tế của `public/brand/owner-tai.png`
- Decide bg removal (RMBG via `media-processing` skill) nếu bg phức tạp
- Output v1: `public/brand/owner-tai-cutout.webp` (nếu cần)

---

## STEP 2 - Hero Section Build

### Copy refs (từ `LANDING.hero`)
- Eyebrow · Headline (2 parts) · Body · USP Close · Primary CTA · Secondary CTA · Trust bullets · Badges

### Headline rendering (synthesis D12)
```tsx
<h1 className="hero-headline">
  {LANDING.hero.headlineParts[0]}
  <br className="sm:hidden" />
  {' '}
  {LANDING.hero.headlineParts[1]}
</h1>
```
Mobile (360/375/414) test wrap clean.

### Layout - Desktop (>1024px)
2 cột: text trái (eyebrow → headline → body → USP close → CTAs → trust bullets) · photo phải (portrait + 3 floating badges)

### Layout - Mobile (<768px)
Stack column:
1. Eyebrow
2. Headline (2 parts với `<br className="sm:hidden" />`)
3. Body (≤3 lines)
4. USP Close highlight block
5. Owner photo 200px circular (sketch frame F1)
6. Primary CTA full-width
7. Secondary CTA full-width
8. Trust bullets (3 dòng ✓)
9. **Mobile pills** (3 inline pills replace floating badges - synthesis D5)
10. Scroll hint F1 sketch arrow

### Aurora Background - 6 layers (light theme, D8 mobile tier)

| Layer | Desktop | Mobile (D8) | Reduced-motion |
|---|---|---|---|
| 1. Base `#FAF7FF` | solid | solid | unchanged |
| 2. Aurora blobs (A6) | 3 blobs drift | 1-2 blobs drift | **Static positions** |
| 3. Silk shimmer (A5) | cross-screen pass | **Disabled** | **Disabled** |
| 4. Dot grid pattern | static | static | unchanged |
| 5. Sketch lines (F1) | one-shot reveal | one-shot reveal | **Static** |
| 6. Bottom gradient fade | yes | yes | unchanged |

### Mobile Pills Component (synthesis D5)
```
[📸 Nhận diện hình ảnh] [⏱ 20 phút demo] [🔓 Bàn giao 100%]
```
- Display: `flex` mobile only, `hidden md:hidden` desktop (desktop dùng floating badges quanh photo)
- Padding: 6px 12px, gap 8px, rounded-full
- Bg: white với border indigo `#6366F1` opacity 0.18
- Font: Space Grotesk 12px font-semibold
- Animation: D7 viewport stagger 100ms (disabled if reduced-motion)

### Sticky position trong Hero - **không có** (Sticky CTA là Phase 03b)

### CTA Buttons (analytics + a11y - synthesis D3)
**Primary:**
```tsx
<button
  data-cta-location="hero_primary"
  aria-label={LANDING.hero.primaryCta.ariaLabel}
  onClick={trackCtaClick}
>
  {LANDING.hero.primaryCta.label}
</button>
```
- Style: gradient Aurora `linear-gradient(135deg, #6366F1, #A855F7, #EC4899)` + E3 magnetic + E1 shine sweep 8s
- Reduced-motion: disable E3 + E1, keep gradient

**Secondary:**
- outline indigo, no magnetic
- icon arrow-down lucide, animate bounce on hover (disabled reduced-motion)

---

## STEP 3 - About Section Build

### Layout
```
[Title centered, Space Grotesk display]
[Avatar 96-120px circular - synthesis D6, crop từ Hero photo]
[Story 4 paragraphs với sentence-label badges + segment array render]
[Bullets 4 items ✦]
[Inline CTA: "Đặt lịch nói chuyện trực tiếp →"]
```

### About Avatar (synthesis D6 - locked)
- **Size:** 96-120px diameter (NHỎ - không phải hero-size)
- **Source:** crop từ `public/brand/owner-tai.png` (cùng portrait) - KHÔNG cố tạo "góc ảnh khác"
- **Frame:** rounded-full + sketch frame F1
- **Placement:** trước title hoặc bên trái story panel (mobile: above title)
- **Fallback if visual lặp quá mạnh:** drop avatar lớn, dùng **story panel + avatar nhỏ inline** trong title hoặc bullets corner

### Story Rendering - Segment Array

```tsx
function renderSegments(segments: StorySegment[]) {
  return segments.map((seg, i) => {
    switch (seg.type) {
      case 'text':      return <span key={i}>{seg.value}</span>;
      case 'strong':    return <strong key={i}>{seg.value}</strong>;
      case 'highlight': return <Highlight key={i}>{seg.value}</Highlight>;
    }
  });
}
```

### Highlight Component
CSS background gradient F1 pink sketch underline:
```css
.highlight {
  background: linear-gradient(180deg, transparent 60%, rgba(236, 72, 153, 0.18) 60%);
  padding: 0 2px;
  font-weight: 500;
}
```
- **Cross-browser test:** Safari iOS hay vỡ - verify trên iOS 16+
- Reduced-motion: hiện sẵn (no animation entry)

### Sentence Label Badges (4 variants màu)
- Background → indigo `#6366F1`
- Insight → violet `#A855F7`
- Khác biệt → pink `#EC4899`
- Mission → cyan `#06B6D4`

### Italic toàn paragraph
Báo first-person voice của Tài - không phải marketing copy.

### Bullets (4 items với ✦)
- Animation D7 viewport stagger 100ms (disabled reduced-motion)

### Inline CTA (analytics)
```tsx
<a
  href={LANDING.about.inlineCta.href}
  data-cta-location="about_inline"
  aria-label={LANDING.about.inlineCta.ariaLabel}
>
  {LANDING.about.inlineCta.label}
</a>
```

---

## STEP 4 - Page Wire

### `src/app/page.tsx` - REPLACE M1.2 preview mock
**⚠️ Destructive migration note:** `page.tsx` hiện là Phase 01 preview mock. Phase 03a sẽ thay hoàn toàn. Backup strategy: commit M1.2 preview lên branch riêng trước replace.

```tsx
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { LANDING } from '@/content/landing';

export default function HomePage() {
  return (
    <>
      <Hero content={LANDING.hero} />
      <About content={LANDING.about} />
      {/* Phase 03b sẽ add <StickyCtaBar /> */}
      {/* Phase 04+ sẽ add các sections khác */}
    </>
  );
}
```

### `src/app/layout.tsx` - light-only force (synthesis D10)
```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
```

### Analytics hook (preparing for D3)
```ts
// src/lib/analytics/track-cta-click.ts
export function trackCtaClick(location: CtaLocation) {
  // v1: console.log + window.dataLayer push (no UTM)
  // v1.5: wire Vercel Analytics / Plausible
}
```

---

## Files to Create

### Content
- `src/content/landing.ts` - typed LandingContent + LANDING export

### Components - Hero
- `src/components/sections/hero.tsx`
- `src/components/decoration/hero-aurora-bg.tsx` - 6 layers
- `src/components/decoration/dot-pattern.tsx`
- `src/components/decoration/sketch-lines.tsx`
- `src/components/decoration/floating-badge.tsx` - desktop variant
- `src/components/ui/mobile-pills.tsx` - mobile inline pills (D5)
- `src/components/ui/gradient-text.tsx`
- `src/components/ui/usp-close-block.tsx`
- `src/lib/motion/hero-variants.ts`

### Components - About
- `src/components/sections/about.tsx`
- `src/components/about/sentence-label-badge.tsx`
- `src/components/about/story-highlight.tsx` - `.highlight` render
- `src/components/about/story-paragraph.tsx` - segment renderer
- `src/components/about/avatar-small.tsx` - 96-120px crop

### Analytics
- `src/lib/analytics/track-cta-click.ts`

### Page wire
- Modify `src/app/page.tsx` (replace M1.2 preview)
- Modify `src/app/layout.tsx` (light-only force)

### Brand assets
- `public/brand/owner-tai.png` ✅ already exists
- `public/brand/owner-tai-cutout.webp` (optional, after Step 1)

---

## Implementation Steps
1. **Inspect owner photo** qua `ai-multimodal` → decide RMBG yes/no
2. **Write `src/content/landing.ts`** - full schema + LANDING data (Step 0)
3. Build decoration components: `<HeroAuroraBg>`, `<DotPattern>`, `<SketchLines>`, `<FloatingBadge>`, `<MobilePills>`, `<GradientText>`, `<UspCloseBlock>`
4. Build `<Hero>` consuming `LANDING.hero` - wire Framer Motion C1 split + reduced-motion respect
5. Build About components: `<SentenceLabelBadge>`, `<StoryHighlight>`, `<StoryParagraph>`, `<AvatarSmall>`
6. Build `<About>` consuming `LANDING.about`
7. Wire `<HomePage>` (`src/app/page.tsx`) - replace M1.2 preview
8. Force light-only theme (`src/app/layout.tsx`)
9. Wire analytics stub `trackCtaClick`
10. Test contrast (Lighthouse a11y) - verify no pink body text
11. Test reduced-motion (prefers-reduced-motion media query in DevTools)
12. Test mobile 360/375/414/768/1024/1280
13. Test headline `<br className="sm:hidden" />` wrap clean trên iOS Safari
14. Lighthouse perf gate: LCP < 1.5s desktop · < 2.5s mobile 4× CPU · CLS = 0 · bundle delta < 80KB gzipped
15. Owner visual review → 03a ship gate

---

## Todo

### Content schema (P0 #1)
- [ ] `landing.ts` types + LANDING data
- [ ] Verify schema match nhu cầu Phase 04/05 (Module cards · Process steps)

### Hero
- [ ] HeroAuroraBg 6 layers (desktop + mobile tier)
- [ ] DotPattern · SketchLines · FloatingBadge · MobilePills · GradientText · UspCloseBlock
- [ ] `<Hero>` component build
- [ ] Headline `<br className="sm:hidden" />` (D12)
- [ ] CTA E3 magnetic + E1 shine sweep (desktop)
- [ ] Trust bullets render
- [ ] Mobile pills replace floating badges (D5)

### About
- [ ] SentenceLabelBadge 4 variants (Background · Insight · Khác biệt · Mission)
- [ ] StoryHighlight + StoryParagraph segment renderer
- [ ] AvatarSmall 96-120px crop (D6)
- [ ] Story panel + avatar nhỏ fallback nếu visual lặp
- [ ] Bullets 4 items với ✦

### Page wire
- [ ] Replace `page.tsx` M1.2 preview
- [ ] Force light theme `layout.tsx`
- [ ] Analytics hook stub

### A11y + Perf
- [ ] Contrast audit - no pink body text (D4)
- [ ] Reduced-motion matrix per-element (D7)
- [ ] CLS = 0
- [ ] LCP < 1.5s desktop / < 2.5s mobile
- [ ] Bundle delta < 80KB gzipped

### Cross-browser
- [ ] iOS Safari highlight gradient render
- [ ] Headline wrap 360/375/414

---

## Success Criteria
- All Todo checked
- `npm run build` clean (TypeScript strict pass)
- Lighthouse perf ≥ 90 desktop, ≥ 80 mobile 4× CPU
- a11y ≥ 95
- CLS = 0
- Owner visual review: "Hero ấn tượng 3 giây · About story authentic · Mobile clean"
- Phase 04+ có thể consume `LANDING.hero` + `LANDING.about` reference cho navigation/breadcrumbs

---

## Risks
- **Owner photo aspect** - Step 1 verify trước. Nếu portrait dài, crop 96-120px About có thể hỏng tỷ lệ
- **iOS Safari highlight gradient** - `linear-gradient(180deg, transparent 60%, rgba(236,72,153,0.18) 60%)` test cross-browser; fallback `background-color` solid pink-100 nếu vỡ
- **Headline wrap mobile 360px** - Space Grotesk display size có thể vẫn 3 lines; fallback giảm font-size mobile clamp(28px, 7vw, 36px)
- **Reduced-motion implementation** - phải test thực tế qua DevTools `prefers-reduced-motion: reduce`; risk dev quên handle 1 animation
- **Bundle delta** - Framer Motion + Aurora layers có thể vượt 80KB; mitigation: dynamic import sketch-lines + sparkles
- **page.tsx M1.2 replace** - destructive; backup commit M1.2 lên branch `phase-01/m1.2-preview-backup` trước
- **`next-themes` force light** - phải pass `enableSystem={false}` + remove dark mode CSS variables nếu có dư

---

## Resolved (synthesis 2026-05-12)
- ✅ D1 Highlight render = segment array (KISS)
- ✅ D3 Analytics event không UTM
- ✅ D4 Pink chỉ accent, không body
- ✅ D5 Mobile pills replace floating badges
- ✅ D6 Avatar crop 96-120px từ Hero photo
- ✅ D7 Reduced-motion = static elegant
- ✅ D8 Mobile animation tier
- ✅ D10 Light-only v1
- ✅ D12 Headline `<br className="sm:hidden" />`

---

## Owner Decisions Resolved (2026-05-12 post-build review)
- [x] **G1 RMBG cutout:** **SKIP** - accept RAW photo. Rounded mask + sketch frame F1 đủ hide background phức tạp. Avatar tight face crop + Hero photo desktop-only (`hidden lg:flex`) giảm impact visual.
- [x] **G2 E3 magnetic:** **v1 = hover/tap scale only**, defer true pointer-tracking magnetic sang v1.5.
  - Desktop hover: `scale-[1.03]`
  - Active/tap: `scale: 0.98`
  - Reduced-motion: no scale animation, instant color/shadow state
  - Rationale: mobile không hưởng lợi (no hover/pointer fine) · KISS, conversion-first · ít perf risk · v1 đã đủ visual affordance (gradient + shine + tap scale + sticky)
  - v1.5 condition: only if Lighthouse healthy post-launch

## Owner Decisions Pending (defer non-blocking)
- [ ] Highlight fallback iOS Safari (live test trên thiết bị thật khi có cơ hội)
- [ ] Bundle budget verify (Phase 06+ tổng sau khi wire booking)

---

## Next
→ [Phase 03b - Mobile Sticky CTA](./phase-03b-mobile-sticky-cta.md) sau khi 03a ship gate pass
