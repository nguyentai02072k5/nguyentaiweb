# Phase 01 - Project Setup & Design System

**Status:** Complete
**Priority:** P0 (blocker for all phases)
**Depends on:** Master plan decisions locked in `plan.md` (2026-05-09 PM)

## Source of Truth Back-Port
`plan.md` is the final source of truth for Phase 01. Earlier Phase 01 choices were superseded by the locked decisions in `plan.md`: Aurora Glow palette, Space Grotesk display font, Be Vietnam Pro body font, Next.js 16 runtime, and production logo assets served from R2.

## Skills Active
- `web-frameworks` - Next.js 16 App Router, RSC, static generation
- `frontend-development` - TypeScript strict, React patterns
- `design-system` - Three-layer tokens: primitive → semantic → component
- `ui-styling` - shadcn/ui (Radix) + Tailwind v4 theme
- `ui-ux-pro-max` - Validate color palette + font pairing
- `bootstrap` - Auto mode for Next.js init
- `docs-seeker` - Pull latest Next.js 16 / shadcn / Tailwind v4 docs
- 🆕 **`logo-design`** - Generate logo Tài AI Automation (55 styles, Gemini Nano Banana)
- 🆕 **`ai-multimodal`** - Optimize favicon từ R2 source nếu cần edit
- 🆕 **`ai-artist`** - Generate complementary brand visuals nếu cần

## Objective
Bootstrap project. Lock toàn bộ design tokens theo **Aurora Glow** (color, typography, spacing, radius, shadow, motion). Install shadcn/ui primitives. Configure fonts (**Space Grotesk + Be Vietnam Pro**). Wire production logo, favicon, and owner photo from R2/local optimized assets. Validate Vietnamese rendering before building later landing page sections.

## Brand Assets (Locked)
- **Owner photo:** https://pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev/LDP-schedule/tai-ai-automation.png
- **Tab favicon source:** https://pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev/LDP-schedule/tai-auto-blank.png
- **Logo:** production PNG served from R2 via `src/components/brand/prod-logo.tsx`
  - Light: `https://pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev/LDP-schedule/lg-prod-duong.png`
  - Dark: `https://pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev/LDP-schedule/lg-prod-am.png`
- **Domain:** `nguyenvantai.com` (root domain)

## Logo Design Workflow (`logo-design` skill)

### Brief cho `logo-design`
- **Brand name:** Tài AI Automation
- **Industry:** Tech / AI / SaaS / Vietnamese SMB-focused
- **Style preferences (top 3 to test):**
  1. **Minimalist + geometric** - wordmark "Tài" với glyph AI subtle
  2. **Modern + abstract mark** - symbol gợi flow/automation + wordmark
  3. **Tech + gradient** - lettermark "T" gradient blue→violet
- **Colors:** Aurora Glow palette (indigo + violet + pink + cyan on cream-violet base)
- **Mood:** premium, modern, technical, không cliché
- **Don't:** robot mascot, cliché AI brain, over-decorated

### Deliverables
- Production light logo from R2: `lg-prod-duong.png`
- Production dark logo from R2: `lg-prod-am.png`
- Logo component wired in `src/components/brand/prod-logo.tsx`
- Exploration SVGs saved in `public/brand/ta-logo-explorations/`
- Logo preview route available at `/logo`
- Favicon and app icons wired through `src/app/favicon.ico`, `src/app/icon.png`, and `src/app/apple-icon.png`

### Steps
1. Activate `logo-design` skill → generate exploration variants
2. User-selected production mark exported to R2 as light/dark PNG assets
3. Wire production assets into `ProdLogo` and `NavLogo`
4. Verify logo contexts on `/logo`
5. Phase 03+ consumes `NavLogo`/`ProdLogo` directly

## Favicon Wiring
Tab icon từ R2: download → optimize → place into App Router icon files:
- `src/app/favicon.ico`
- `src/app/icon.png`
- `src/app/apple-icon.png`
- `public/brand/favicon-source.png` for preview/debug

Next.js App Router auto-detects these icon files and injects icon metadata.

## Key Insights
- Tailwind v4 dùng CSS-first config → cần `@theme` block trong `globals.css`, không dùng `tailwind.config.ts` legacy
- shadcn/ui generate components vào `src/components/ui` → có thể edit trực tiếp khi cần custom
- **Be Vietnam Pro** tối ưu cho dấu tiếng Việt > Inter (đặc biệt là dấu nặng, ngã, ô có dấu)
- **Space Grotesk** làm display font → geometric, soft modern, matched locked Aurora design direction
- Lock tokens TRƯỚC → tránh rework component sau

## Stack Lock
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 App Router | RSC, static generation, image optimization |
| Language | TypeScript strict | Type safety |
| Styling | Tailwind CSS v4 | Atomic, CSS-first |
| Components | shadcn/ui (Radix primitives) | Accessible, copy-own, customizable |
| Animation | Framer Motion v12 | Best-in-class declarative |
| Icons | Lucide React | Clean SVG, tree-shakable |
| Forms | React Hook Form + Zod | Validation, perf |
| Date | date-fns | Booking date utilities; timezone logic deferred to booking/backend phases |
| DB | Supabase | Deferred to Phase 07 backend |
| Email | Not in v1 | Zalo/automation deferred to v1.5 |
| Hosting | Vercel | Native Next.js |
| Fonts | Space Grotesk + Be Vietnam Pro | Aurora display + VN-optimized body |

## Color Tokens (Locked by `plan.md`)

### Aurora Brand
```
indigo:      #6366F1
indigo-deep: #4F46E5
violet:      #A855F7
violet-soft: #C084FC
pink:        #EC4899
cyan:        #06B6D4
```

### Semantic
| Token | Value | Use |
|---|---|---|
| `brand-indigo` | #6366F1 | Primary CTA, links |
| `brand-indigo-deep` | #4F46E5 | Active/pressed emphasis |
| `brand-violet` | #A855F7 | Main accent, rings, highlight |
| `brand-violet-soft` | #C084FC | Soft highlight |
| `brand-pink` | #EC4899 | Glow, badges, CTA accent |
| `brand-cyan` | #06B6D4 | Secondary fresh accent |
| `surface-base` | #FAF7FF | Page background |
| `surface-elevated` | #FFFFFF | Cards, nav, modals |
| `surface-subtle` | #F2EDFA | Section alternation |
| `text-primary` | #1A1A2E | Body text |
| `text-secondary` | #52527A | Caption, helper |
| `text-on-brand` | #FFFFFF | On gradient/dark bg |
| `border-default` | #EBE7F2 | Default border |

### Signature Gradients
- `aurora`: `linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)`
- `aurora-soft`: `linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #F0ABFC 100%)`
- `aurora-cool`: `linear-gradient(135deg, #06B6D4 0%, #6366F1 50%, #A855F7 100%)`
- `text-aurora`: `linear-gradient(90deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)`
- `mesh-aurora`: radial aurora mesh for hero/preview backgrounds

## Typography Scale (clamp-based fluid)
| Token | Size (mobile → desktop) | Weight | Use |
|---|---|---|---|
| display-1 | clamp(2.5rem, 8vw, 5rem) | 800 | Hero headline |
| display-2 | clamp(2rem, 6vw, 3.5rem) | 700 | Section H1 |
| h1 | clamp(1.75rem, 4vw, 2.5rem) | 700 | Sub-section |
| h2 | clamp(1.5rem, 3.5vw, 2rem) | 600 | Card title |
| body-lg | 1.125rem (18px) | 400 | Lead paragraph |
| body | 1rem (16px) | 400 | Body - **min 16px chống mobile zoom** |
| body-sm | 0.875rem | 400 | Caption |
| label | 0.875rem | 600 | Form label |

Font assignment:
- Headings: **Space Grotesk** (display)
- Body: **Be Vietnam Pro** (Vietnamese diacritics)
- Mono (optional): JetBrains Mono cho code accents

## Spacing (8pt grid)
`1/0.25rem · 2/0.5 · 3/0.75 · 4/1 · 6/1.5 · 8/2 · 12/3 · 16/4 · 24/6 · 32/8 · 48/12 · 64/16 · 96/24`

## Radius
`xs/6 · sm/10 · md/14 · lg/20 · xl/28 · 2xl/40 · full/9999`

## Shadow
- `shadow-sm`: `0 2px 4px rgba(99,102,241,0.06)`
- `shadow-md`: `0 8px 24px rgba(99,102,241,0.08)`
- `shadow-lg`: `0 24px 60px rgba(99,102,241,0.12)`
- `shadow-card`: subtle elevated card shadow
- `shadow-glow-violet`: violet neon glow
- `shadow-glow-pink`: pink neon glow
- `shadow-glow-indigo`: indigo neon glow
- `shadow-glow-cyan`: cyan neon glow

## Motion Tokens
- duration: `fast/150ms · base/250ms · slow/400ms · epic/700ms`
- easing: `standard cubic-bezier(0.2,0,0,1) · emphasized · bounce`
- Framer springs: `smooth {stiffness:120,damping:20}` · `bouncy {stiffness:400,damping:14}`
- **Respect `prefers-reduced-motion`** → disable epic animations

## Files Delivered
- `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`
- `src/app/globals.css` - Aurora Glow variables + Tailwind v4 `@theme` block
- `src/lib/tokens/primitive.ts` - raw reference color values
- `src/lib/tokens/semantic.ts` - Aurora semantic tokens, gradients, shadows, radius
- `src/lib/tokens/typography.ts` - type scale
- `src/lib/tokens/motion.ts` - animation presets
- `src/lib/utils.ts` - `cn()` helper (clsx + tailwind-merge)
- `src/app/layout.tsx` - Space Grotesk + Be Vietnam Pro, `<html lang="vi">`, metadata
- `src/components/ui/*` - shadcn primitives
- `.gitignore`, `README.md`
- `src/components/brand/prod-logo.tsx` - production logo wiring from R2
- `src/components/brand/logo-mark-wordmark.tsx` - local logo mark/wordmark variant
- `src/app/brand/page.tsx` - owner photo + favicon verification page
- `src/app/logo/page.tsx` - production logo verification page
- `src/app/components/page.tsx` - shadcn/Aurora component verification page
- `src/app/animations/page.tsx` - motion/design verification page
- **Brand assets:**
  - `public/brand/owner-tai.png`
  - `public/brand/favicon-source.png`
  - `public/brand/ta-logo-explorations/*.svg`
  - `src/app/favicon.ico`
  - `src/app/icon.png`
  - `src/app/apple-icon.png`

## Deferred Out of Phase 01
- `.env.local.example` - deferred until Supabase/API work in Phase 07
- `@supabase/supabase-js` install - deferred until Phase 07 backend
- Zalo Notify / automation keys - deferred to v1.5

## Implementation Steps
1. Scaffold Next.js App Router project with TypeScript strict and Tailwind v4.
2. Install UI/runtime dependencies used by Phase 01: Framer Motion, Lucide, React Hook Form, Zod, date-fns, clsx, tailwind-merge, CVA, next-themes, shadcn/Radix primitives.
3. Init shadcn New York style and add core primitives.
4. Create token files and mirror Aurora tokens in `globals.css`.
5. Wire Space Grotesk + Be Vietnam Pro in `layout.tsx`.
6. Set `<html lang="vi">`, metadata, canonical, OG/Twitter metadata.
7. Download owner photo and favicon source from R2.
8. Generate and review logo explorations, then wire production R2 logo assets.
9. Add `/brand`, `/logo`, `/components`, `/animations` verification pages.
10. Validate with `pnpm.cmd lint` and `pnpm.cmd build`.

## Todo
- [x] Bootstrap Next.js
- [x] Install Phase 01 dependencies
- [x] Init shadcn/ui primitives
- [x] Write primitive token file
- [x] Write semantic token file
- [x] Write typography token
- [x] Write motion token
- [x] Configure `globals.css` Tailwind v4 theme with Aurora Glow
- [x] Wire fonts (Space Grotesk + Be Vietnam Pro)
- [x] Download owner photo from R2 → `public/brand/owner-tai.png`
- [x] Download favicon source from R2 + generate app icons
- [x] Wire favicon/app icons through Next App Router file conventions
- [x] Generate logo variants and store explorations
- [x] Wire production logo R2 assets into `ProdLogo`/`NavLogo`
- [x] Vietnamese diacritic test via verification pages
- [x] Token swatches demo page
- [x] Logo/photo/favicon verification pages
- [x] `pnpm.cmd lint` pass
- [x] `pnpm.cmd build` pass

## Success Criteria
- `pnpm build` passes 0 errors
- `pnpm lint` passes 0 errors
- Tailwind classes resolve from semantic tokens (e.g. `bg-brand-violet`, `bg-aurora`, `text-on-brand`)
- Vietnamese diacritics render đẹp ở all weights (300/400/600/700/800)
- Token swatches page render đầy đủ color/type/shadow
- `/brand`, `/logo`, `/components`, `/animations` render as verification surfaces

## Risks
- **Tailwind v4 + shadcn/ui compat** → check shadcn version explicitly supports v4. Fallback: Tailwind v3.4 nếu cần
- **Font loading FOUT** → use `display: swap` + preload critical weights only
- **CSS-first config quirks** → `@theme` block phải đúng syntax mới

## Next
→ Phase 02 (Copywriting) chạy parallel sau khi token locked + Phase 03 (Hero) sau Phase 02
