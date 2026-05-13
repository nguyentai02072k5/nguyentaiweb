# Red Team Review - Phase 03 Plan

**Date:** 2026-05-12 10:58
**Plan reviewed:** plans/260509-1059-tai-ai-automation-landing-page/phase-03-hero-about-sections.md
**Reviewer mode:** Adversarial - no flattery
**Final Status:** REWORK_RECOMMENDED

---

## 1. Executive Verdict

**REWORK NEEDED - split scope + close 6 P0 holes trước khi dev claim task.**

Plan đẹp về vision, sạch về copy lock, nhưng có scope inflation đáng kể (4 deliverables - Hero + About + Sticky CTA + og:image dynamic route) đóng gói 1 phase. Critical path bị nuốt bởi side-quest @vercel/og Edge runtime, và specs xung yếu (==highlight== parser, reduced-motion exact behavior, animation perf budget, mobile floating badge replacement) defer ngầm - chính là những thứ dev sẽ stuck.

Đếm holes:
- P0 (block dev start): 6
- P1 (verify trong dev): 8
- P2 (polish): 5

Cộng với fact rằng lucide-react@^1.14.0 trong package.json ngờ vực (latest stable ~0.x - pinning 1.14 nghĩa là package khác hoặc typo), build có thể chết ngay step npm install.

---

## 2. Critical Holes (P0 - block dev start)

### P0-1. src/content/landing.ts chưa lock schema - ghi ẩn trong step 5
Plan ghi: "Step 5: Build Hero consume S1 từ content (src/content/landing.ts - sẽ tạo trong Phase này)".

Vấn đề:
- Schema chưa định nghĩa - dev tự đẻ shape
- Phase 04 (Services + Tech Graph), Phase 05 (Process + FAQ) cũng phải consume cùng file → Phase 03 đẻ shape ad-hoc, Phase 04 phải refactor
- ==highlight== markers (S6) cần là field riêng (array of segments) hay raw string + parse runtime? Chưa quyết
- Trust micro-bullets, USP Close, sentence labels - đâu là content vs render concern? Chưa tách

**Fix:** Tách thành step riêng "Step 0: Define src/content/landing.ts schema (Hero/About/Sticky/Footer)" trước khi build component. Schema spec gồm types, fields per section, highlight segment model, render note.

### P0-2. ==highlight== parser chưa có spec - phase blocking
Content-copy.md S6 dùng custom syntax ==text== cho 3 cụm highlight (xác nhận via grep - line 304, 310, 313). Plan note "render .highlight (gradient F1 underline)" nhưng:
- Markdown processor nào? react-markdown + remark-supersub? MDX? Hay regex split runtime?
- Plan KHÔNG mention dep mới - phải thêm remark-* plugin? Phá build CI?
- Nested **bold** bên trong ==highlight== - priority parse? Plan chưa quyết
- Fallback nếu parser miss markers - text rendered literally với == visible

**Fix:** Quyết tiếp cận: (A) content schema lưu segments array với type field (highlight/bold/normal) - component render thuần, không cần markdown parser (KISS); hoặc (B) install unified pipeline với plugin custom. Recommend (A) - single phase, không cần extra deps.

### P0-3. og:image Option C @vercel/og Vietnamese font support chưa verified
Plan recommend Option C nhưng KHÔNG mention known constraints:
- @vercel/og Edge runtime cần fonts load qua fetch ArrayBuffer
- Space Grotesk KHÔNG có Vietnamese subset đầy đủ - "Đêm không rớt đơn" dấu nặng/sắc/huyền hỗn hợp dễ miss glyph fallback
- Be Vietnam Pro 4 weights × 2 fonts = 8 files load mỗi request - Edge function bundle size limit 1MB free / 4MB pro
- Edge runtime KHÔNG có Node fs - dynamic font load qua relative path quirky trên Vercel
- ISR caching cho OG image - chưa spec revalidate/Cache-Control strategy

**Fix:** Trước commit Option C, build PoC ngắn (1 route, headline VN-only) để verify. Nếu fail - fallback Option A (static PNG export 1 lần qua Playwright + HTML template - DRY với hero) hoặc Option B (Nano Banana). DO NOT lock Option C as "recommend" ở mức plan - flip status sang "PoC required first".

### P0-4. Floating badges mobile-hide = nuốt 3 trust signals không có replacement
Plan ghi "Floating badges (decorative, mobile hide)" với content:
- Nhận diện hình ảnh - USP differentiator
- 20 phút demo - friction reducer
- Bàn giao 100% - vendor-lock-in defuser

Đây KHÔNG phải decorative - đây là 3 trust signals trực tiếp. Mobile (>70% traffic VN cho lead-gen) mất sạch.

**Fix:** Mobile cần thay thế:
- Option A: inline pills row dưới CTA mobile (chips, không floating)
- Option B: merge vào trust micro-bullets (đã có 3 dòng locked) - nhưng content khác
- Option C: keep floating nhưng compact (badge dot dưới photo)

Plan PHẢI spec replacement, không defer.

### P0-5. Aurora Glow trên light theme - contrast risk chưa flag accessibility
Stack 6 layers trên #FAF7FF cream-violet base:
- Aurora mesh (indigo 25% + violet 30% + pink 20%) - kết hợp có thể đẩy bg luminance cao
- Body text #1A1A2E deep navy-violet trên cream-violet base: ~14:1 AA
- Đè violet blob 30% alpha - effective bg ~#D8C8F2 zone - contrast tụt ~7-8:1 - vẫn AA OK
- Tuy nhiên silk shimmer A5 + dot pattern overlay + gradient text headline - headline gradient (#6366F1 → #EC4899) trên #D8C8F2 zone có thể fail AA vì pink #EC4899 contrast với cream-violet #FAF7FF chỉ ~3.5:1 - fail AA cho text dưới 18pt
- Headline 32-56px - large text rule (AA 3:1) - pass
- Body text trong gradient mode? Plan chưa quyết - nếu apply gradient text vào body cũng - fail

**Fix:** Plan phải có check:
- Gradient text chỉ apply heading >=24pt (large text rule)
- Đo contrast actual khi 3 blobs overlap với DevTools
- Trust bullets text plain solid color, NOT gradient
- Sketch lines opacity 0.10 OK (decorative)

Không flag - ship - user feedback "đọc không nổi".

### P0-6. Animation perf budget không có threshold cụ thể
Plan ghi "benchmark mobile mid-tier (4x throttle CPU). Aurora mesh có thể nặng - fallback CSS-only nếu cần". Vấn đề:
- KHÔNG có threshold cụ thể - bao nhiêu fps là pass? 30? 45? 60?
- Concurrent animations Hero alone: A5 + A6 (3 blobs) + B4 (10 sparkles) + B5 (liquid blob morph SVG) + C1 (split stagger 8 spans) + F1 (sketch pathLength) + E1 (CTA shine) + E3 (CTA magnetic) = ~20+ concurrent transform/opacity animations
- Add sticky CTA E1 shine sweep 8s periodic + D4 spotlight (later) - mobile mid-tier Android (Snapdragon 6xx) chắc chắn dropframe
- B5 liquid blob morph = SVG path morph - main thread blocker, không phải compositor

**Fix:**
- Set budget: >=45fps mobile mid-tier (Moto G Power equivalent, 4x CPU throttle)
- Tier mobile: A5 silk shimmer DISABLE, A6 reduce 3 to 1 blob, B4 reduce 10 to 3 sparkles, B5 swap CSS keyframe scale (không path morph)
- Tier desktop: full stack
- Plan phải có "Mobile Animation Tier" spec rõ, không phải "fallback nếu cần"

---

## 3. High-Risk Assumptions (P1)

### P1-1. lucide-react@^1.14.0 - dependency version sai
Confirmed via package.json. Lucide-react chính thức latest ~0.460 (2025-2026). 1.14.0 có thể là typo (1 thay vì 0), khác package, hoặc pre-release tag. Step build component sẽ chết khi import icon. Verify trước.

### P1-2. Owner photo "crop khác angle" giả định sai
Plan: "v1 dùng cùng owner-tai.png cho cả hero + about (crop khác angle)". Nếu ảnh nguồn là portrait headshot single-angle - crop khác = vẫn cùng angle, chỉ khác framing. Visual repetition risk: 2 ảnh trên same page = brand cheap.

**Fix:** Owner phải gửi ảnh thứ 2 (working angle - Tài cầm laptop, tại bàn, talking to camera) HOẶC plan defer owner photo về Phase 03 chỉ Hero, About dùng illustration/icon thay cho v1.

### P1-3. Sticky CTA + Hero secondary CTA mobile UX conflict
Cả hai cùng visible mobile sau khi user scroll qua hero ~50%:
- Hero secondary: "Xem cách hoạt động" - S4
- Sticky bottom: "Demo miễn phí - 20 phút" - S8

Plan note "acceptable vì mục đích khác (educate vs convert)" - nhưng không có user test, là giả định. Mobile user nhìn 2 CTAs cùng frame có thể decision-paralyze. Sticky đang gradient nổi bật - secondary bị nuốt visual.

**Fix:** Test 2 variants:
- V1: Sticky show NGAY khi Hero out (current spec)
- V2: Sticky show sau khi user scroll qua S4 Tech Graph (đã được educated)

Acceptable rủi ro nếu owner OK A/B test sau, nhưng plan phải ghi rõ giả định + KPI để invalidate.

### P1-4. Hero CTA microcopy lệch Sticky CTA
- Hero: "Đặt lịch Meet 1-1 - xem demo 20 phút"
- Sticky: "Demo miễn phí - 20 phút"

Cùng anchor #booking nhưng "Demo miễn phí" emphasize free, "Đặt lịch Meet 1-1" emphasize commitment. Brand voice lệch. Không phá conversion nhưng inconsistent.

**Fix:** Pick 1 frame - recommend Sticky đổi sang "Đặt lịch demo 20 phút" (drop "miễn phí" word - đã ngụ ý). Consistent với header CTA + hero primary.

### P1-5. Headline mobile 360px wrap fallback
"Setup một lần. Có ngay trợ lý chốt sale không nghỉ ngơi." = 56 chars, ~11 word units. Mobile 360px Space Grotesk @ clamp(28px, 8vw, 40px):
- 28px line-height 1.1 - ~310px width per line - 3-4 lines
- text-wrap: balance chỉ smooth wrap, không giảm số lines
- Safari iOS 17 text-wrap: balance support: Yes (since iOS 17.4) - nhưng iOS 16 không
- Tailwind v4 text-balance utility: yes

**Risks:**
- iOS 16 fallback = natural wrap (acceptable)
- 4-line headline trên 360px = cảm giác wall-of-text, nuốt secondary CTA xuống fold

**Fix:** Test mobile screenshot 360/375/414 trước lock. Nếu 4-line - consider:
- A: 2 dòng break artificial via br tag mobile (CSS :before trick)
- B: Reduce headline size mobile clamp 26px min
- C: Split headline "Setup một lần." (line 1) + "Có ngay trợ lý chốt sale không nghỉ ngơi." (line 2) - natural Vietnamese punctuation break

### P1-6. Reduced-motion exact disable list chưa spec
Plan: "Reduced motion: animations disable - static elegant version vẫn đẹp". Quá vague. Cần spec từng animation:

| Animation | Reduced-motion behavior |
|---|---|
| A5 silk shimmer | DISABLE |
| A6 aurora drift | DISABLE static gradient hay slow 60s loop? |
| B4 sparkles | DISABLE |
| B5 liquid blob | DISABLE static SVG |
| C1 split stagger | Replace simple fade-in (no transform Y) hay disable? |
| F1 sketch pathLength | DISABLE (show full path immediately) |
| D7 viewport stagger | Replace fade-in 200ms hay disable? |
| E1 shine sweep | DISABLE |
| E3 magnetic | DISABLE |

Plan phải có bảng này, không defer.

### P1-7. prefers-color-scheme dark user với light-only theme
next-themes đã setup trong layout. Plan ghi "Aurora Glow là light theme - KHÔNG dùng dark base". Nhưng user OS dark mode + browser respect - trang flash dark hay stay light?
- Nếu defaultTheme=light + enableSystem=false - ép light - OK
- Nếu enableSystem=true - user dark - toàn page broken (chưa có dark variant)

**Fix:** Check theme-provider.tsx config. Plan phải spec: lock light-only v1, defer dark mode Phase 09 polish. Current prod-logo.tsx cũng có light/dark variants - break nếu force light without coordinator.

### P1-8. og:image bottom-right nguyenvantai.com - DNS chưa setup chắc
Plan ghi domain locked nhưng status DNS chưa confirmed trong plan.md (mặc dù plan.md có ghi locked, deploy/DNS chưa). Nếu Vercel preview deploy dùng *.vercel.app - og:image hard-code nguyenvantai.com thấy hơi tự tin sớm. Acceptable nếu DNS sẽ setup Phase 09 deploy, nhưng plan nên flag.

---

## 4. Scope Discussion - Phase 03 4 Deliverables: SPLIT

Đếm dev work realistic:

| Deliverable | Realistic effort (1 dev) |
|---|---|
| Hero (6 layers bg + photo + 10 animations + 2 CTAs + USP block) | 1.5-2 days |
| About (4 paragraphs + highlight parser + sentence labels + bullets) | 0.5-1 day |
| Sticky CTA (component + intersection observer + animations) | 0.5 day |
| og:image (Option C @vercel/og + font load + PoC + fallback) | 0.5-1 day (risk-heavy) |
| src/content/landing.ts schema + populate | 0.5 day |
| Testing (mobile 6 viewports + reduced-motion + Lighthouse) | 0.5-1 day |

Total: 3.5-6 dev-days realistic. Plan = single phase, no checkpoint.

**Recommendation: SPLIT vào sub-phases checkpoint hoặc bóc og:image ra Phase 03.5:**

- Phase 03a (P0): Hero + About + src/content/landing.ts schema - 2-3 days - ship staging - owner review visual
- Phase 03b (P0): Sticky CTA - 0.5 day - ship
- Phase 03c (P1): og:image (PoC Option C first; fallback A nếu fail) - 0.5-1 day - ship khi Phase 04+ assets ready

Lý do split:
1. Owner review checkpoint trước khi commit toàn bộ visual language
2. og:image cần Hero design lock trước - naturally sequential
3. Risk isolation - @vercel/og fail không block Hero ship

---

## 5. Animation Performance Budget

### Worst-case concurrent count (above-fold Hero, mobile, scroll position 0)
- A5 silk shimmer: 1 element, transform translateX 12s loop
- A6 aurora drift: 3 blobs x {x,y} keyframes 14-18s
- B4 sparkles: ~6-10 nodes opacity+scale loop random delay
- B5 liquid blob: 1 SVG path morph 8s OR CSS scale fallback
- C1 split stagger: ~8-11 word spans, played once on mount
- F1 sketch lines: 3-5 SVG paths pathLength on mount + animate redraw on scroll trigger
- E3/E1 CTA: idle (no hover mobile) - chỉ B5 nếu CTA glow loop

Compositor-heavy ops: A5, A6 (translate), B4 (scale, opacity), C1 (translateY)
Main-thread blockers: B5 SVG path d morph, F1 SVG pathLength if animated continuous

### Mobile mid-tier budget (Pixel 4a / Snapdragon 730G class, 4x CPU throttle)
- Compositor budget: ~60fps if all GPU-cheap
- Main thread budget: ~16.6ms/frame - SVG morph + JS scroll listener can blow

### Concrete asks
1. Eliminate SVG path morph (B5). Replace layered radial-gradient div animated via transform scale + rotate. Cùng visual, GPU-only.
2. F1 pathLength = one-shot only. Không loop. Stop animation after mount.
3. A6 aurora drift mobile = 1 blob max. 3 blobs giữ desktop.
4. B4 sparkles mobile = 3 nodes max. Desktop 10 OK.
5. will-change transform only on actively animating layers. Hero parent KHÔNG dùng - leak memory.

Plan phải có section "Mobile Animation Tier" spec rõ.

---

## 6. Accessibility Red Flags

1. **Gradient text headline contrast** - đo realtime với Wave/Axe khi 3 blobs overlap pink+violet zones. Pink #EC4899 over #FAF7FF = 3.4:1 - fail AA normal text, pass AA large.
2. **Floating badges position-absolute** - screen reader order khó kiểm - must aria-hidden=true nếu decorative; nếu carry content (badges có 3 USPs) - phải có equivalent text trong DOM flow above-fold mobile.
3. **Sticky CTA z-index** - cover FAQ accordion buttons? Test focus order. Tabbing qua sticky - enter trigger smooth scroll - focus lost. Need aria-label + focus management.
4. **em italic toàn paragraph About** - quá nhiều italic Vietnamese diacritics + ascender (đ, g, j) - readability tụt. Test với native VN reader.
5. **role=banner cho Hero?** Plan không spec semantic landmarks. Should be header page-level hay section aria-labelledby=hero-headline?
6. **Touch target >=48px** - sticky CTA bar height 56px OK, nhưng tap area chỉ là text/button bên trong? Toàn bar tappable? Spec rõ.

---

## 7. Missing Specifications

### Gap 1. src/content/landing.ts schema spec
Đã nói ở P0-1. Cần spec đầy đủ: section interfaces, highlight segment model, CTA model.

### Gap 2. Sticky CTA accessibility + dismiss
- Có dismiss button không? Plan không spec. UX best practice: subtle close X để user dismiss khi scroll lâu.
- Nếu không có dismiss - phải spec đủ accessibility (aria-label, focus management, keyboard accessible).
- Lifetime: dismiss persist localStorage hay session-only?

### Gap 3. Wireframe/Figma lock
ASCII layout duy nhất. Dev sẽ interpret độ rộng cột, spacing, photo aspect, decoration position khác nhau - drift vision. Recommend:
- Hoặc lock visuals/ HTML preview cho Hero giống cách Phase 02 lock s6-about-preview.html
- Hoặc Phase 03 step 0 = generate Hero static HTML mockup qua frontend-design skill, owner approve, then convert React

### Gap 4. Image processing pipeline spec
Step 1: "Download + analyze owner photo qua ai-multimodal" - nhưng owner-tai.png đã có sẵn trong public/brand/ (confirmed via filesystem). Step thực ra là:
- Verify file present
- Inspect aspect + lighting
- Decide RMBG hay không
- Generate WebP variants

Plan cần step rõ hơn: input file path, output formats, sizes (srcSet breakpoints), placeholder blur strategy.

### Gap 5. next/image config
- quality=90 ghi rõ
- Nhưng sizes responsive prop chưa spec
- loader Next default (built-in optimization) hay external?
- AVIF support? Next 16 default formats: avif + webp

### Gap 6. SEO completeness
Plan focus og:image but:
- Twitter Card type: summary_large_image confirm
- og:image:alt text (accessibility) chưa spec
- og:locale = vi_VN
- JSON-LD Person/Organization structured data - defer Phase 09 nhưng nên flag

### Gap 7. Existing page.tsx migration
Current src/app/page.tsx là M1.2 preview mock (confirmed via grep). Phase 03 phải REPLACE nội dung. Plan KHÔNG mention destructive migration. Dev có thể merge thay vì replace - leftover code.

### Gap 8. dark mode interaction
next-themes provider live. Aurora Glow light-only v1. Plan phải force defaultTheme=light + enableSystem=false HOẶC explicitly remove ThemeProvider.

---

## 8. Recommendations (sorted)

### P0 - Do NOT start dev until resolved
1. **Add Step 0** to plan: define src/content/landing.ts schema + populate (Hero + About + Sticky + Footer content). Include highlight as segment array model - kill markdown parser dep.
2. **Decide highlight rendering** = segment array (recommend) hoặc markdown plugin. Lock choice in plan.
3. **og:image Option C - PoC required first.** Sub-task: 30-min spike test Edge runtime + VN font load. If fail - defer Phase 03c hoặc fallback Option A static.
4. **Spec mobile replacement for floating badges.** Inline pill row dưới CTA recommended.
5. **Accessibility contrast check spec.** Bảng kiểm gradient text + body text + sticky CTA + trust bullets contrast trên overlapped blob zones.
6. **Reduced-motion behavior matrix** - bảng 10 animations × disable/replace/keep, locked trong plan.

### P1 - Verify trong dev cycle
7. **Verify lucide-react@^1.14.0** - sửa version về ^0.460.0 hoặc latest stable trước npm install.
8. **Lock theme-provider config** light-only v1 - set defaultTheme=light + enableSystem=false hoặc strip provider tạm.
9. **Animation perf budget table** - desktop tier vs mobile tier per animation, ghi rõ disable/reduce.
10. **Headline mobile wrap test** - screenshot 360/375/414 trước commit, có fallback plan nếu 4-line.
11. **Sticky CTA microcopy** consistent - đổi sang "Đặt lịch demo 20 phút".
12. **About photo decision** - owner cung cấp ảnh 2 OR plan downgrade About visual sang illustration (drop owner photo).
13. **Replace SVG path morph (B5)** = CSS scale fallback chính thức, không "if needed".
14. **Wireframe lock** - generate Hero HTML preview qua frontend-design skill, owner approve before React build.

### P2 - Polish/post-launch
15. Sticky CTA dismiss UX research - add X button v1.1.
16. og:image:alt text spec.
17. Hero semantic landmarks (section role=region aria-labelledby).
18. JSON-LD Person/Organization - Phase 09.
19. Sticky CTA shine sweep interval 8s - owner decision pending; recommend 12s (less spammy).

---

## 9. Unresolved Questions

1. **==highlight== rendering**: segment array (KISS) hay markdown plugin (DRY across phases)?
2. **@vercel/og Vietnamese font support**: ai run PoC? Plan owner hay dev assigned?
3. **About photo**: owner gửi ảnh angle 2 (timeline?) hay drop owner photo About v1?
4. **Floating badges mobile replacement**: inline pills below CTA, badge below photo, hay merge với trust bullets?
5. **Sticky CTA dismiss**: có nút X v1 không? Có persist dismiss state?
6. **Phase split decision**: keep 4-in-1 hay split 03a/03b/03c như recommendation §4?
7. **Reduced-motion C1 stagger**: replace fade-only hay disable hoàn toàn?
8. **Dark mode v1**: force light-only hoặc keep theme switcher (chỉ Hero phải lock light)?
9. **DNS canonical** nguyenvantai.com: setup khi nào - affect og:image URL absolute path?
10. **next/image placeholder=blur**: Sharp generated build-time hay external service? Build time impact?

---

**Status:** REWORK_RECOMMENDED
**Summary:** Plan có vision tốt, copy locked, tokens real. Nhưng 6 P0 holes (content schema, highlight parser, og:image VN font risk, mobile badge replacement, contrast accessibility, anim perf budget) đủ block dev nửa chừng. Split scope thành 03a/b/c giảm risk + cho checkpoint owner review.
**Concerns/Blockers:** Trước khi dev start: add Step 0 content schema, decide highlight render, PoC og:image, spec mobile replacement, accessibility check matrix, reduced-motion behavior table. Verify lucide-react version.
