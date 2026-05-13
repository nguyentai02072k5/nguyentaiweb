# Phase 09 - Responsive · A11y · Testing · SEO · Deploy

**Status:** Pending
**Priority:** P0 (final gate before live)
**Depends on:** All phases 01-08

## Skills Active
- `web-testing` - Playwright E2E, Vitest unit, Lighthouse audit
- `web-design-guidelines` - Web Interface Guidelines compliance audit
- `react-best-practices` - Final perf review
- `chrome-devtools` - Performance profiling, screenshot diff
- `agent-browser` - Self-verifying booking flow test
- `seo` - SEO audit, JSON-LD, meta, Core Web Vitals
- `deploy` - Vercel deploy + custom domain
- `security-scan` - Final OWASP + secrets scan
- `mermaidjs-v11` - N/A
- `analytics` - Optional GA4 / Plausible setup

## Objective
Final gate. Validate responsive across breakpoints, accessibility, performance, security, SEO. Deploy to Vercel với custom domain.

## Responsive Breakpoints

### Test Matrix
| Device | Width | Test focus |
|---|---|---|
| iPhone SE | 375px | Smallest modern mobile, touch targets, text wrap |
| iPhone 14 Pro | 393px | Common iOS |
| iPhone 14 Pro Max | 430px | Larger iOS |
| Pixel 7 | 412px | Android |
| iPad Mini | 768px | Tablet portrait |
| iPad Pro | 1024px | Tablet landscape |
| Laptop | 1280px | Common desktop |
| Desktop | 1440px | Standard monitor |
| Wide | 1920px | Large monitor |

### Breakpoint Rules
- **< 640px (sm):** Mobile - single column, stack everything, horizontal scroll chips for date picker
- **640-768px (md):** Large mobile - slight loosening
- **768-1024px (lg):** Tablet - 2-column where reasonable
- **> 1024px (xl):** Desktop - full layout with side-by-side
- **> 1280px (2xl):** Wide - max-width container 1280px, no over-stretch

### Critical Mobile Checks
- No horizontal scroll (except intentional like date chips)
- Touch targets ≥ 48x48px (CTA buttons, slot buttons, accordion headers)
- Form inputs ≥ 16px font (prevent iOS zoom)
- Tap delay = 0 (CSS `touch-action: manipulation`)
- Smooth scroll between sections
- Sticky CTA optional (re-evaluate UX vs noise)
- Bottom safe area (iOS notch) - `env(safe-area-inset-bottom)`

## Accessibility Audit (`web-design-guidelines`)

### WCAG 2.2 AA Checklist
- [ ] Color contrast: ≥ 4.5:1 for body, ≥ 3:1 for large text + UI
- [ ] All images có `alt` (decorative: `alt=""`)
- [ ] Form fields có visible label + `<label htmlFor>`
- [ ] Focus indicators visible (custom focus ring brand-secondary)
- [ ] Keyboard navigation: Tab order logical, no traps
- [ ] Skip-to-content link
- [ ] Headings hierarchy: H1 once, H2 → H3 logical
- [ ] ARIA: accordion `aria-expanded`, modal `role=dialog`
- [ ] aria-live announcements cho booking step changes
- [ ] Reduced motion respected
- [ ] Screen reader test (NVDA Win, VoiceOver Mac)
- [ ] Color không phải sole indicator (vd: error icon + text, không chỉ red)
- [ ] Vietnamese `lang="vi"` + sub-content `lang="en"` nếu có

### Focus Management (Booking Flow)
- Step change → auto focus first interactive element của step mới
- Form errors → focus first invalid field
- Modal/dialog → trap focus inside
- ESC closes dialogs

## Testing Strategy

### Unit Tests (Vitest)
- `src/lib/booking/availability-engine.test.ts` - slot computation
- `src/lib/booking/block-rule.test.ts` - 3h overlap edge cases
- `src/lib/booking/slot-curator.test.ts` - pick 3-5 logic
- `src/lib/format/phone-vn.test.ts` - phone formatter
- `src/lib/format/date-vn.test.ts` - date formatter
- `src/lib/booking/ics-generator.test.ts`
- `src/lib/validators/booking-schema.test.ts`

### E2E Tests (Playwright)
**Golden Path:**
1. Visit `/`
2. Scroll to booking
3. Click date chip → select day
4. Click slot → select time
5. Confirm → click "Tiếp tục"
6. Fill form (name, phone)
7. Submit
8. Assert thank-you screen
9. Assert booking exists in DB (via API or direct query)

**Edge Cases:**
- Submit with required field empty → error inline
- Phone invalid format → error
- Click already-booked slot → disabled state
- Network failure → graceful error message
- Concurrent booking → conflict handled

**Mobile Test:**
- Run E2E với viewport 375x667 (iPhone SE)
- Touch interactions (tap, swipe horizontal date chips)

**A11y Test:**
- `@axe-core/playwright` integration → automated WCAG checks
- Keyboard-only navigation E2E

### Visual Regression (Optional)
- Playwright screenshot comparisons
- Per breakpoint key sections

### Lighthouse CI
Targets:
- Performance ≥ 90 mobile, ≥ 95 desktop
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

Run: `pnpm lhci` trong CI pipeline.

## SEO (`seo` skill)

### Meta Tags
```tsx
// app/layout.tsx metadata
export const metadata = {
  metadataBase: new URL('https://nguyenvantai.com'),
  title: 'Tài AI Automation - Chatbot AI bán hàng tự động + Marketing đa kênh',
  description: 'Chatbot AI nhận dạng hình ảnh, tư vấn 24/7, chốt đơn tự động. Marketing tự động đa kênh. Đặt lịch Meet 1-1 demo 20 phút.',
  keywords: ['Chatbot AI Việt Nam', 'AI bán hàng tự động', 'Marketing automation', 'Tài AI'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [{ rel: 'icon', url: '/icon-192.png', sizes: '192x192' }, { rel: 'icon', url: '/icon-512.png', sizes: '512x512' }],
  },
  openGraph: {
    title: 'Tài AI Automation - Đặt lịch demo 20 phút',
    description: '...',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'vi_VN',
    type: 'website',
    url: 'https://nguyenvantai.com',
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  alternates: { canonical: 'https://nguyenvantai.com' },
  robots: { index: true, follow: true },
};
```

### JSON-LD (Schema.org)
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Tài AI Automation",
  "description": "AI Automation services: Chatbot AI tư vấn bán hàng, nhận dạng hình ảnh, marketing automation",
  "url": "https://nguyenvantai.com",
  "image": "https://nguyenvantai.com/og-image.png",
  "areaServed": "VN",
  "serviceType": ["AI Chatbot Development", "Marketing Automation"],
  "founder": { "@type": "Person", "name": "Tài" }
}
```

Plus FAQ JSON-LD cho FAQ section.

### OG Image
- 1200x630 PNG/WebP
- Brand colors gradient bg
- Headline + tagline
- Owner photo (small)
- Generate via `banner-design` skill hoặc `ai-artist`

### Sitemap + Robots
- `app/sitemap.ts` - Next.js auto sitemap
- `app/robots.ts` - allow all

### Performance for SEO (Core Web Vitals)
- LCP: ≤ 2.5s mobile (target 1.5s)
- INP: ≤ 200ms (target < 100ms)
- CLS: ≤ 0.1 (target < 0.05)

### Vietnamese SEO
- `lang="vi"` set
- Subset font có dấu
- Title + description tiếng Việt natural
- H1 chứa keyword chính ("Chatbot AI", "Bán hàng tự động", "AI Automation")

## Security Final Audit (`security-scan`)

### Checklist
- [ ] No secrets in client bundle (verify via build analyze) - đặc biệt `SUPABASE_SERVICE_ROLE_KEY`
- [ ] All API endpoints validate input (Zod)
- [ ] Rate limiting trên `/api/book` (đề xuất: max 5 lần / IP / hour qua Upstash hoặc in-memory LRU)
- [ ] CORS: only same-origin allow write
- [ ] CSRF protection (Next.js Route Handlers default safe with same-origin POST)
- [ ] SQL injection: parameterized via Supabase client
- [ ] XSS: React auto-escape, no `dangerouslySetInnerHTML` từ user input
- [ ] Captcha: **không cần v1** (per user brief). Monitor spam → add v1.5 nếu cần
- [ ] Phone validation server-side (regex VN format)
- [ ] Expectations array slug whitelist enforced (DB constraint + Zod enum)
- [ ] Headers: CSP, HSTS, X-Frame-Options, Referrer-Policy
- [ ] `next.config.ts` headers configured (whitelist R2 domain cho images)
- [ ] Env vars: only `NEXT_PUBLIC_*` in client
- [ ] Dependency audit: `pnpm audit --prod`
- [ ] Phone display masking trong logs (không log full phone, chỉ last 4 digits)
- ⏸️ ~~`/api/cron/refresh-zalo-token` protected~~ → v1.5

### Headers Config (`next.config.ts`)
```ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: '...' }, // tune per assets used
    ],
  }];
}
```

## Deployment (`deploy` skill)

### Pre-deploy Checklist (v1 - Zalo deferred)
- [ ] All tests pass (unit + E2E + Lighthouse)
- [ ] Build local pass: `pnpm build`
- [x] Env vars defined in Vercel project settings (v1 minimal set: `NEXT_PUBLIC_SITE_URL`)
- [ ] Supabase migrations applied to production project (region Singapore `ap-southeast-1`)
- [x] DNS/domain at `nguyenvantai.com` verified in Vercel
- [ ] Git repository linked to Vercel project
- [ ] First production deployment exists
- ⏸️ ~~Zalo OA verified + ZNS template approved~~ → **v1.5**

### Deploy Steps (v1)
1. Push to GitHub repo
2. Connect Vercel → import repo
3. Set env vars in Vercel (**v1 minimal**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `NEXT_PUBLIC_SITE_URL=https://nguyenvantai.com`
   - `IP_HASH_SALT` (random 32-char string)
4. Deploy preview → smoke test
5. Custom domain setup (Cloudflare DNS):
   - Vercel: Settings → Domains → Add `nguyenvantai.com`
   - Cloudflare DNS dashboard cho `nguyenvantai.com`:
     - Add apex/root record → target `cname.vercel-dns.com` hoặc Vercel-managed apex mapping
     - **Proxy status: "DNS only" (gray cloud)** - KHÔNG bật orange proxy vì Vercel cần handle SSL trực tiếp
     - TTL: Auto
   - Verify: apex DNS resolves to Vercel target
   - Current verified state 2026-05-12: apex `nguyenvantai.com` primary; `www.nguyenvantai.com` redirects to apex with `308`
6. SSL auto via Let's Encrypt (Vercel handles trong 5-15 phút sau khi DNS propagate)
7. Production deploy
8. Post-deploy v1 smoke test:
   - Hit `/api/availability/days` → 200
   - Hit `/api/availability/slots?date=2026-05-10` → 200
   - Đặt lịch test → check DB ghi nhận via Supabase Studio
   - Owner training: cách vào Supabase Studio xem bookings table

### v1.5 Deploy Additions (deferred)
Sau khi Zalo OA + ZNS sẵn sàng:
- Add env vars: `ZALO_OA_*`, `ZNS_TEMPLATE_*`, `OWNER_ZALO_PHONE`, `CRON_SECRET`
- Configure Vercel Cron (`vercel.json`) refresh OA token mỗi 12h
- Deploy → verify Zalo notify gửi tới owner + customer

### Post-deploy Monitoring (optional v1.5)
- Vercel Analytics enabled
- Sentry cho error tracking
- Plausible/GA4 cho traffic
- UptimeRobot ping

## Files to Create
- `playwright.config.ts`
- `vitest.config.ts`
- `tests/e2e/booking-flow.spec.ts` - golden path
- `tests/e2e/booking-edge-cases.spec.ts`
- `tests/e2e/a11y.spec.ts` - axe checks
- `tests/e2e/responsive.spec.ts` - multiple viewports
- `tests/unit/availability-engine.test.ts`
- `tests/unit/block-rule.test.ts`
- `tests/unit/slot-curator.test.ts`
- `tests/unit/phone-vn.test.ts`
- `tests/unit/booking-schema.test.ts`
- `lighthouserc.json` - Lighthouse CI config
- `.github/workflows/ci.yml` - run lint + test + build on PR
- `.github/workflows/lighthouse.yml` - Lighthouse CI on preview
- `app/sitemap.ts`
- `app/robots.ts`
- `app/opengraph-image.tsx` - dynamic OG image
- `next.config.ts` - headers + image domains
- `public/og-image.png` - fallback OG

## Implementation Steps
1. Setup Playwright + Vitest configs
2. Write unit tests cho availability + block rule + formatters
3. Write E2E golden path
4. Write E2E edge cases
5. Add `@axe-core/playwright` a11y test
6. Add responsive test với multiple viewports
7. Set up Lighthouse CI config
8. Write GitHub Actions workflow CI
9. Configure SEO metadata + JSON-LD
10. Generate OG image (via `banner-design` hoặc Next.js dynamic OG)
11. Configure security headers in `next.config.ts`
12. Run `security-scan` skill final audit
13. Run dependency audit (`pnpm audit`)
14. Apply Supabase migrations to production
15. Configure Vercel env vars
16. Connect GitHub → deploy preview
17. Smoke test preview
18. Configure custom domain
19. Production deploy
20. Post-deploy verification

## Todo
- [ ] Playwright config
- [ ] Vitest config
- [ ] E2E golden path
- [ ] E2E edge cases
- [ ] E2E a11y axe
- [ ] E2E responsive
- [ ] Unit tests for booking logic
- [ ] Lighthouse CI config
- [ ] GitHub Actions CI
- [ ] SEO metadata
- [ ] JSON-LD scripts
- [ ] OG image
- [ ] Sitemap + robots
- [ ] next.config security headers
- [ ] `security-scan` final
- [ ] `pnpm audit`
- [ ] Production Supabase migrations
- [ ] Vercel env vars
- [ ] Vercel deploy preview
- [ ] Custom domain setup
- [ ] Production deploy
- [ ] Smoke test live
- [ ] Lighthouse production score check

## Success Criteria
- All E2E tests pass (golden + edge + a11y + responsive)
- All unit tests pass với ≥ 80% coverage cho booking logic
- Lighthouse: Performance 90+ mobile, 95+ desktop, A11y 95+, SEO 95+
- Security headers verified via securityheaders.com
- No hardcoded secrets in repo (gitleaks pass)
- `pnpm audit` no high/critical vulnerabilities
- Production booking flow works end-to-end
- DB receives bookings, owner receives notification (if enabled)
- Custom domain HTTPS works
- OG preview render đẹp khi share Facebook/Zalo

## Risks
- **Production Supabase quota** - free tier có giới hạn. Monitor usage post-launch
- **DNS propagation** - domain có thể mất vài giờ. Plan deploy sớm hơn launch announcement
- **SSL cert delay** - Let's Encrypt tự động nhưng có thể queue 5-15p
- **Lighthouse mobile score** - actual mobile thường thấp hơn dev tool. Test trên thiết bị thật
- **Supabase region** - chọn Singapore hoặc Tokyo cho latency VN tốt
- **CSP headers** - nếu strict quá có thể block legitimate scripts (analytics, fonts). Tune iteratively

## Resolved (2026-05-09 PM - UPDATED)
- ✅ Domain: `nguyenvantai.com` (root domain - cần access DNS provider của nguyenvantai.com)
- ✅ Captcha: **không enable v1**
- ✅ Email confirmation: **không enable v1**
- ⏸️ Notify mechanism: **Zalo OA + ZNS deferred to v1.5**
- ✅ v1 launch: chỉ cần Supabase + Vercel + domain DNS

## Open Questions (v1)
- ✅ Vercel account đã có
- ✅ DNS: **Cloudflare** (NS: heidi + buck) - sẽ add CNAME DNS-only mode
- ❓ Supabase region: confirm Singapore `ap-southeast-1`? (recommend cho latency VN)
- ❓ Có muốn Vercel Analytics? (free 100k events/month - có thể skip v1)
- ❓ Sentry error tracking: enable v1? (free tier 5k events/month - recommend skip v1, add khi có traffic)

## v1.5 Open Questions (sau khi v1 stable)
- ❓ Zalo OA account đã verified chưa?
- ❓ ZNS template đã apply duyệt chưa? (delay 1-3 ngày)
- ❓ Owner Zalo phone số nào?

## v1.5 Roadmap (Post-launch)
- Admin dashboard xem/quản lý bookings
- Auto reschedule UI
- Testimonials section (collect real social proof)
- Blog / case studies
- Multi-language (EN version)
- WhatsApp/Zalo deep links
- Notion/Sheets sync
- Stripe/Sepay deposit booking (gate against no-show)

## Final
🎉 Live launch checklist:
- [ ] Production URL responsive đẹp trên 5+ devices test
- [ ] Booking flow đặt thử thành công, DB ghi nhận
- [ ] Email/Zalo notification về owner
- [ ] Lighthouse production scores ≥ targets
- [ ] OG preview test share Zalo/Facebook
- [ ] Owner training: cách xem bookings (Supabase Studio walkthrough)
- [ ] Backup plan: nếu bug critical, rollback strategy

→ **DONE** 🚀
