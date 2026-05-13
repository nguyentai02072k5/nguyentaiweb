# Phase 03c - og:image Banner

**Status:** ✅ Complete (locked 2026-05-12, PoC passed → Option C adopted)
**Priority:** P1
**Effort:** 0.5-1 day
**Ship gate:** PoC pass VN font test + production preview validated trên 3 platforms (FB · Twitter · LinkedIn)
**Depends on:** Phase 03a (`LANDING` schema available cho dynamic banner)
**Cross-decisions:** xem [phase-03 overview](./phase-03-hero-about-sections.md) - D11

## Source-of-Truth
- Headline: `LANDING.hero.headlineParts` từ Phase 03a
- Tagline: slogan `Đêm không rớt đơn, ngày không quá tải` (Phase 02 lock)
- Owner photo: `public/brand/owner-tai.png`
- Palette: Aurora Glow · Space Grotesk + Be Vietnam Pro

## Skills Active
- `banner-design` · `ai-artist` · `frontend-design`

---

## Specs
- **Size:** 1200 × 630 px (Open Graph + Twitter Card large)
- **File path final:** `public/og/og-image.png` (fallback static) hoặc `/api/og` (dynamic)
- **Used in:** `metadata.openGraph.images` + `metadata.twitter.images` (Next.js layout.tsx)

---

## STEP 0 - PoC `@vercel/og` VN Font Test (synthesis D11 - bắt buộc trước commit Option)

### Acceptance criteria (PASS = adopt Option C, FAIL = fallback Option A)
| Test | Pass criteria |
|---|---|
| **Font load** | Space Grotesk + Be Vietnam Pro load qua Edge runtime success |
| **VN diacritics** | Render câu test `Đêm không rớt đơn, ngày không quá tải` đầy đủ dấu, không bị tofu |
| **Render headline** | `Setup một lần. Có ngay trợ lý chốt sale không nghỉ ngơi.` clean, không cắt chữ |
| **Bundle size** | Route `/api/og` build < 1MB (Edge function limit) |
| **Render time** | < 500ms cold start, < 100ms warm |
| **Image quality** | 1200×630 sharp, không pixelate |

### PoC script
```bash
# Create test route: src/app/api/og-test/route.tsx
# Hit: http://localhost:3000/api/og-test
# Visual inspect → save screenshot
# Compare diacritics với Be Vietnam Pro reference
```

### Fallback decision tree
```
PoC PASS → Option C (@vercel/og dynamic)
PoC FAIL → Option A (static PNG from HTML/Playwright)
  - Render HTML page locally tại `/og-design.html`
  - Use Playwright screenshot 1200×630
  - Output: public/og/og-image.png
```

---

## STEP 1 - Art Direction Brief

### Composition
```
┌──────────────────────────────────────────────────┐
│ TÀI AI AUTOMATION                                │  ← Eyebrow top-left
│                                                  │
│ ┌─────────┐  ┌─────────────────────────────────┐│
│ │         │  │ Setup một lần.                  ││
│ │ Owner   │  │ Có ngay trợ lý chốt sale        ││
│ │ photo   │  │ không nghỉ ngơi.                ││
│ │ sketch  │  │                                 ││
│ │ frame   │  │ - Đêm không rớt đơn,            ││
│ │ F1      │  │   ngày không quá tải            ││
│ │         │  │                                 ││
│ └─────────┘  └─────────────────────────────────┘│
│                                                  │
│                              nguyenvantai.com    │  ← Bottom-right small
└──────────────────────────────────────────────────┘
[bg: Aurora mesh + dot grid + sketch lines F1]
```

### Visual specs
- **Left 35%:** Owner photo `public/brand/owner-tai.png` với sketch frame F1 + B4 sparkles decoration (static)
- **Right 65%:**
  - **Eyebrow:** `TÀI AI AUTOMATION` - Space Grotesk 18px uppercase tracking-wide indigo
  - **Headline:** 2 dòng `Setup một lần. / Có ngay trợ lý chốt sale không nghỉ ngơi.` - Space Grotesk 48-56px font-bold, gradient Aurora text
  - **Tagline:** `- Đêm không rớt đơn, ngày không quá tải` - Be Vietnam Pro 22px italic muted (`#5B5275`)
- **Top-left:** Eyebrow padding 48px from edges
- **Bottom-right:** `nguyenvantai.com` - Space Grotesk 14px muted
- **Bg:** Aurora mesh (indigo + violet + pink blobs) trên `#FAF7FF` + dot grid + 2-3 sketch lines F1

### Anti-patterns (KHÔNG)
- ❌ Không CTA button trong og:image (purpose = awareness, không click)
- ❌ Không gradient cho body text (chỉ headline) - match D4 contrast rule
- ❌ Không overlay đen vì làm xấu Aurora light theme

---

## Implementation Options

### Option C - `@vercel/og` dynamic (em recommend nếu PoC pass)

**Pros:**
- Single source of truth - consume `LANDING` schema
- Auto update khi đổi copy
- A/B test variants dễ qua query params
- Vercel-native, không extra build

**Cons:**
- VN font Edge runtime risk (D11 mitigation: PoC trước)
- Build size impact (~500KB-1MB)
- Cold start latency

**Files:**
- `src/app/api/og/route.tsx`

**Pattern:**
```tsx
import { ImageResponse } from 'next/og';
import { LANDING } from '@/content/landing';

export const runtime = 'edge';

export async function GET() {
  const spaceGrotesk = await fetch(
    new URL('../../../assets/fonts/SpaceGrotesk-Bold.ttf', import.meta.url)
  ).then(r => r.arrayBuffer());

  return new ImageResponse(
    (
      <div style={{ /* Aurora bg + composition */ }}>
        {/* eyebrow */}
        {/* headline gradient text */}
        {/* tagline */}
        {/* owner photo */}
        {/* domain bottom-right */}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Space Grotesk', data: spaceGrotesk, weight: 700 }]
    }
  );
}
```

### Option A - Static PNG (fallback nếu PoC fail)

**Pros:**
- Zero runtime risk
- Sharp text rendering guaranteed
- No bundle impact

**Cons:**
- Manual rebuild khi đổi copy
- A/B test variants tốn công

**Files:**
- `og-design.html` (local development)
- Script: `pnpm run og:generate` → Playwright screenshot
- Output: `public/og/og-image.png`

**Pattern:**
```ts
// scripts/generate-og.ts
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto('http://localhost:3000/og-design.html');
await page.screenshot({ path: 'public/og/og-image.png', type: 'png' });
await browser.close();
```

---

## STEP 2 - Wire Next.js metadata

```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://nguyenvantai.com'),
  title: 'Tài AI Automation - Chatbot AI bán hàng 24/7 cho SMB Việt',
  description: 'Chatbot AI hiểu hình ảnh, chốt đơn 24/7. Marketing automation đa kênh. Bàn giao 100% tài khoản. Demo miễn phí 20 phút qua Google Meet - đặt lịch ngay.',
  openGraph: {
    title: 'Tài AI Automation - AI chốt khách thay anh/chị 24/7',
    description: 'Chatbot AI nhận diện hình ảnh + Marketing tự động cho SMB Việt. Demo miễn phí 20 phút.',
    url: 'https://nguyenvantai.com',
    siteName: 'Tài AI Automation',
    images: [
      {
        // Option C dynamic
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Tài AI Automation - Setup một lần, có ngay trợ lý chốt sale'
      }
      // Option A static fallback path:
      // url: '/og/og-image.png'
    ],
    locale: 'vi_VN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tài AI Automation',
    description: 'Demo miễn phí 20 phút qua Google Meet',
    images: ['/api/og']  // hoặc '/og/og-image.png'
  }
};
```

---

## STEP 3 - Validate Production Preview

### Test platforms
- **Facebook:** [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter/X:** [Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn:** [Post Inspector](https://www.linkedin.com/post-inspector/)
- **Slack/Discord unfurl:** paste link manual test

### Acceptance
- Image renders đúng size, không bị crop
- VN diacritics đầy đủ
- Headline + tagline readable < 200ms scroll-by glance test
- Owner photo không bị cắt mặt

---

## Files to Create

### Option C
- `src/app/api/og/route.tsx`
- `src/assets/fonts/SpaceGrotesk-Bold.ttf` (download local cho Edge fetch)
- `src/assets/fonts/BeVietnamPro-Italic.ttf` (cho tagline)

### Option A
- `og-design.html` (root or `public/`)
- `scripts/generate-og.ts`
- `public/og/og-image.png`

### Both
- Modify `src/app/layout.tsx` metadata config

---

## Todo
- [ ] **STEP 0 PoC `@vercel/og`** - fetch fonts + render test route
- [ ] PoC validate VN diacritics đầy đủ
- [ ] PoC validate bundle size < 1MB
- [ ] Decide Option C or A based on PoC result
- [ ] **If C:** build `/api/og` route consuming `LANDING`
- [ ] **If A:** build `og-design.html` + Playwright script
- [ ] Wire metadata trong `layout.tsx`
- [ ] Test FB Sharing Debugger
- [ ] Test Twitter Card Validator
- [ ] Test LinkedIn Post Inspector
- [ ] Test Slack/Discord unfurl

---

## Success Criteria
- og:image render đúng spec composition
- VN diacritics 100% đầy đủ
- 3 platforms preview clean (FB · Twitter · LinkedIn)
- Render time < 500ms cold (Option C)
- Bundle delta < 200KB cho `/api/og` route (Option C)
- Static PNG < 300KB optimized (Option A)

---

## Risks
- **Space Grotesk VN subset thiếu** - không phải mọi diacritics được embed. Mitigation: download full character set version từ Google Fonts (Latin Extended)
- **`@vercel/og` Edge runtime memory limit** - 1MB. Mitigation: WOFF2 thay TTF, hoặc giảm font weight loaded (chỉ Bold cho headline)
- **Static PNG rebuild** - owner đổi copy → quên rebuild. Mitigation: CI hook `og:generate` mỗi khi `LANDING` đổi
- **R2 fallback đầu hero photo nếu local fail** - load owner photo qua `pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev` direct
- **iOS messages app cache** - sau khi update og:image, iMessage có thể cache 24-48h. Mitigation: append `?v=1` query param

---

## Resolved (synthesis 2026-05-12)
- ✅ D11 Option C không lock ngay - PoC first

---

## Owner Decisions Pending
- [ ] PoC kết quả → Option C or A (em sẽ run + report)
- [ ] og:image variant per-section sau? (S1 hero variant, S6 about variant, S8 booking variant) - defer v1.5

---

## Next
→ Phase 03 close-out - owner final review 03a/03b/03c → Phase 04 (Services + Tech Graph)
