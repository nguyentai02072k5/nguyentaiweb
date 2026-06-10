# Code Review - Phase 03 (Template Detail & CTA)

Date: 2026-06-09 | Reviewer: code-reviewer | Branch: main
Verdict: **PASS WITH NITS**

## Scope
- Created: `src/app/templates/[slug]/page.tsx`, `src/components/templates/{template-detail-header,template-attachments,template-cta,related-templates}.tsx`
- Modified: `src/content/landing.ts` (+`templates_cta` in `CtaLocation`)
- Reuse verified: `MDXContent`, `MdxCodeBlock`, `TemplateCard`, `getRelatedTemplates`/`getTemplateBySlug`, `formatDateLong`
- LOC: all 5 new files < 70 lines each (well under 200 limit)
- Method: read source + ran `velite` output inspection + grepped prerendered `.next/server/app/templates/*.html`

## Verification (runtime, not assumed)
- **SSG** [verified] - `prerender-manifest.json` + `.next/server/app/templates/*.html` contain all 5 detail pages (`mau-bds-thu-lead`, `mau-my-pham-chot-don`, `mau-nha-hang-nuoi-duong`, `mau-spa-chot-don`, `mau-thoi-trang-thu-lead`) as static HTML. `dynamicParams=false` + `generateStaticParams` from `getTemplates()`. [page.tsx:18-22]
- **Rendered content** [verified] in `mau-spa-chot-don.html`: `class="prose mt-8 max-w-none"` present; copy button `aria-label="Copy nội dung"` present; `<pre>` block rendered; `data-cta-location="templates_cta"` appears **2×** (both booking `<Link>` + Zalo `<a>`); "Template liên quan" section rendered.
- **Related edge** [verified] - spa page links exactly 1 related: `mau-my-pham-chot-don`. Self correctly excluded; industry `spa` has no peer → falls through to goal `chot-don` match. Logic + dedup (`seen` Set) sound. [queries.ts:40-59]
- **Date** [verified] - `s.isodate()` emits `2026-06-09T00:00:00.000Z`; `formatDateLong(new Date(...))` renders in HCM tz (+07:00) → `07:00` same calendar day, no day rollover. "Cập nhật" date is correct. `updatedAt` absent in all docs → falls back to `publishedAt` (correct). [template-detail-header.tsx:17-19]
- **Route nesting** [verified] - no template slug equals `nganh`; `/templates/nganh/[industry]` is deeper static segment, `/templates/[slug]` matches single segment. No collision. `/templates/nganh` (childless) would hit `[slug]` with `slug="nganh"` → not a generated param → 404 under `dynamicParams=false`. Safe.
- **CtaLocation regression** [verified] - `templates_cta` added to union [landing.ts:49]. `trackCtaClick`/`trackMetaCustomEvent` take `CtaLocation`/`string` respectively - no exhaustive switch anywhere on the union, so addition is non-breaking. No `Cta` object in `LANDING` uses it (only direct component call), so no required-field gap.
- **Badge variants** [verified] - `secondary`, `outline` both exist in `badge.tsx`. 3-axis badges render (businessModel/industry/goal).

## Findings

### [LOW] Double tracking call on CTA click - cosmetic, not a defect
`template-cta.tsx:27-28,44-45` - each button has BOTH `data-cta-location="templates_cta"` AND inline `onClick={() => trackCtaClick('templates_cta')}`. If a global delegated listener on `[data-cta-location]` exists elsewhere, this would double-count. [suspect]
- Checked: no global `data-cta-location` delegation found in analytics layer - `trackCtaClick` is only invoked via explicit `onClick`. So the `data-cta-location` attr here is currently **decorative/redundant** (other CTAs across the app may use it for a different mechanism, but this page fires only via `onClick`).
- Impact: none today. Risk only if a future global delegate is added → then templates_cta double-fires while older CTAs single-fire.
- Fix (optional): drop the inline `onClick` and rely on one consistent mechanism, OR drop `data-cta-location` here if delegation isn't used. Pick one path to avoid future divergence. YAGNI: leave as-is if other CTAs already pair both - match the established pattern.

### [LOW] Dead-code branches under `dynamicParams=false`
`page.tsx:31` (`if (!template) return {}` in generateMetadata) and `page.tsx:46` (`if (!template) notFound()`) are unreachable at runtime because only generated slugs resolve. [verified]
- Not a bug - these are correct TS narrowing guards (`getTemplateBySlug` returns `Template | undefined`; without the guard, `template.body` etc. would be type errors). Keep them. Mirrors the sibling `nganh/[industry]/page.tsx` pattern. No action.

### [LOW] `new Function(code)` MDX exec - acceptable here, document the trust boundary
`mdx-runtime.tsx:18-19` - `new Function(code)` executes Velite-compiled MDX. [verified server-only]
- Trust boundary is fine: `code` is `template.body` from build-time Velite compilation of **first-party** `.mdx` files in-repo, not user input. Runs in RSC (server) at build. No external/runtime injection vector.
- Note for future: if MDX ever sources from CMS/user submissions, this becomes an RCE/XSS vector. Currently safe. (Out of Phase 3 scope - flagging for the trust ledger only.)

### [LOW] `formatDateLong` semantic reuse
`date-vn.ts:71` docstring says "long display for confirm screen" but it's reused for the template "Cập nhật" label. [verified harmless]
- Output format `T3, 09/06/2026` is appropriate for an update date. Reuse is DRY-correct; only the stale docstring is slightly narrow. Optional: broaden comment to "long VN date display". Non-blocking.

## Checklist
- Concurrency: N/A (static render, no shared mutable state). `sortTemplates` copies with `[...list]` before sort - no source mutation. [verified queries.ts:12]
- Error boundaries: clipboard `catch{}` is intentional silent-fail (http/permission) with comment - acceptable for a copy button. [verified mdx-code-block.tsx:27-29]
- API contracts: `getTemplateBySlug` nullable handled; `attachments` optional handled (`!attachments || length===0` → null). [verified template-attachments.tsx:13]
- Backwards compat: `CtaLocation` widening is additive, non-breaking. [verified]
- Input validation: slug constrained to generated params (SSG). No runtime user input on this route.
- Auth/authz: N/A (public marketing pages).
- N+1/query: N/A (in-memory array ops over 5 items, build-time).
- Data leaks: none - first-party content only, no PII/secrets in render.

## Acceptance Criteria
1. SSG + 404 - **PASS** [verified prerender-manifest + dynamicParams=false]
2. MDX in prose + copy button - **PASS** [verified rendered HTML: prose wrapper, MdxCodeBlock not-prose, `<pre>` present]
3. Breadcrumb + 3-axis badges + update date - **PASS** [verified template-detail-header.tsx]
4. Attachments hide-when-empty - **PASS** [verified; all current docs have 0 attachments → section absent]
5. Soft CTA + `trackCtaClick('templates_cta')` - **PASS** [verified union extended + both buttons fire + data attr in HTML]
6. Related industry→goal→featured, hide-when-0 - **PASS** [verified runtime: correct fallback, self-excluded, dedup works]

## Patterns
- Aurora/minimal: CTA uses `bg-aurora animate-aurora` + `motion-reduce` guards [verified template-cta.tsx:31-33]. Consistent with TemplateCard.
- a11y: breadcrumb `aria-label="Breadcrumb"`, decorative icons `aria-hidden`, `focus-visible:ring` on all interactive els, external links `rel="noopener noreferrer"` + `target="_blank"`. Copy button has dynamic `aria-label`. Good.
- DRY: related reuses `TemplateCard`; all template access via `queries.ts`. Good.
- `not-prose` correctly isolates attachments/CTA/related/code-block from `.prose` cascade - no double-style conflict. [verified]

## Unresolved Questions
1. Is a global `[data-cta-location]` click delegate planned (Phase 4/5)? If yes, the inline `onClick` in `template-cta.tsx` will double-fire analytics for `templates_cta`. If no, the `data-cta-location` attr here is redundant. Confirm intended single mechanism to prevent drift.

---
**Status:** DONE
**Summary:** Phase 3 PASS WITH NITS. All 6 acceptance criteria verified against prerendered HTML + velite output, not assumed. Only LOW cosmetic nits (redundant CTA tracking dual-mechanism, stale docstring). No correctness/security/regression defects.
**Concerns/Blockers:** None blocking. One unresolved question re: CTA tracking mechanism (double-fire risk only if future global delegate added).
