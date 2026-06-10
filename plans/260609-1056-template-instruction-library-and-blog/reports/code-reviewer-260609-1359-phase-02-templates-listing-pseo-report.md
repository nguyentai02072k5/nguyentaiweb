# Code Review - Phase 2: Templates Listing + Filter + pSEO

Date: 2026-06-09 | Reviewer: code-reviewer | Branch: main
Scope: `/templates`, `/templates/nganh/[industry]`, 5 template components, `template-filters.ts`, `queries.ts` (modified), 5 MDX
Verification baseline: tsc PASS, eslint PASS (re-run by reviewer), Tailwind CLI compile (empirical CSS check)

## Verdict: PASS WITH NITS

Boundary, filter logic, pSEO, and queries regression are all clean and correct. Two real defects found, both cosmetic/UX (not blocking, not security/data): a dead hover style and diacritic-insensitive search. Acceptance criteria 1-4 are met functionally.

---

## [LOW] Dead hover style - `hover:border-aurora-tint` produces no CSS [verified]

`src/components/templates/template-card.tsx:21` - `hover:border-aurora-tint`

`.border-aurora-tint` is authored as plain CSS inside `@layer utilities` (globals.css:592), NOT via the v4 `@utility` directive. In Tailwind v4, the `hover:` variant only attaches to registered utilities (core or `@utility`); a raw-CSS class in `@layer utilities` is emitted as-is but the `hover:` prefix is silently dropped.

Empirically verified: compiled `globals.css` against test content containing `hover:border-aurora-tint` + `group-hover:bg-aurora-soft`. Output contained only the bare `.border-aurora-tint` / `.bg-aurora-soft` rules - NO `.hover\:border-aurora-tint:hover` and NO `.group-hover\:bg-aurora-soft` rule. (76 other `hover:` token-based rules compiled fine, so the variant system works - just not for these custom classes.)

Impact: card hover border-tint never applies. Card still has `hover:-translate-y-1 hover:shadow-lg` (token-based, those DO work), so hover feedback exists - the border accent is just missing. Cosmetic only.

Fix options:
- Convert to a registered utility: `@utility border-aurora-tint { border-color: ... }` in globals.css (then `hover:` works). This also fixes the pre-existing `group-hover:bg-aurora-soft` at `animations/page.tsx:939` which is broken the same way.
- Or drop the dead class and use a token: `hover:border-brand-violet/40`.

Note: `bg-aurora-soft` on the cover (template-card.tsx:27) is used WITHOUT a variant → works fine. Cover gradient fallback (AC #4) is correct.

---

## [LOW] Search is diacritic-sensitive - misses common Vietnamese no-tone queries [verified]

`src/lib/content/template-filters.ts:32-35` - `haystack.includes(q)` on `toLowerCase()` only.

Verified runtime: title "Chatbot Mỹ Phẩm..." → query `"my pham"` returns false, `"pham"` returns false; only `"mỹ phẩm"` / `"phẩm"` match. Vietnamese users routinely type without tone marks. For a VN-audience product, search returning zero hits for "my pham" is a real UX gap.

Fix: normalize both haystack and query with NFD + strip combining marks before compare:
```ts
const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
```
Apply to both `q` and the haystack. (đ→d needs explicit replace; NFD does not decompose đ.) Keep it in `template-filters.ts` so logic stays data-free and reused.

---

## Verified Correct (no action)

**Client/server boundary (AC concern #1) [verified]**
- Only `templates-explorer.tsx` has `'use client'`. `template-grid`, `template-card`, `template-empty-state`, `template-filter-bar` have no `'use client'` and no client-only hooks → render in both server (pSEO) and client (explorer) contexts.
- `template-filters.ts` imports `type Template` (type-only, erased) + types from taxonomy - NO `templates` data import. Data flows via props from server. No JSON pulled into client bundle. Boundary is clean.
- pSEO page uses `TemplateGrid` directly server-side; explorer wraps it client-side. DRY shared grid (AC #4) achieved correctly.

**Filter logic (AC #1, #2, #6) [verified]**
- `handleModel` resets industry to null on model change (explorer:30-33) → AC #2 satisfied.
- Industry chips scoped by model: `model ? getIndustriesByModel(model) : INDUSTRIES` (filter-bar:82) → AC #2.
- Cross-dimension edge ("model A selected, industry of model B still active?"): cannot occur - selecting a model clears industry; industry chips only render for the active model. Safe.
- 3-dim + search AND-combination correct (filter-filters.ts:28-38). Empty/reset wired: explorer `reset()` clears all 4; `onReset` passed to grid→empty-state; button only renders when `onReset` defined (undefined on pSEO path). Correct.

**pSEO (AC #3) [verified]**
- `dynamicParams = false` + `generateStaticParams` returns only `getIndustriesWithTemplates()` (industries with ≥1 template). Unknown/empty industry → not pre-rendered → 404. Defense-in-depth: page also `notFound()` when `!ind || templates.length === 0` (page:45).
- `await params` used correctly (Next 16) in both `generateMetadata` and the page component.
- Canonical correct: `/templates/nganh/${ind.slug}` (page:33). Intro uses `ind.description` (full sentence, not bare label) → thin-content guard met.
- `generateMetadata` returns `{}` when `!ind` - acceptable since route is non-dynamic; that branch is effectively unreachable for valid params.

**queries.ts regression (AC concern #4) [verified]**
- `filterTemplates` fully removed from queries.ts and relocated to `template-filters.ts`. Grep confirms only importer is `templates-explorer.tsx` from the new module. No stale import anywhere.
- `getTemplates` / `getTemplatesByIndustry` / `getIndustriesWithTemplates` / `getRelatedTemplates` / `getTemplateBySlug` all present, referenced, type-correct. `getTemplateBySlug` + `getRelatedTemplates` exported but not yet consumed in Phase 2 (reserved for Phase 3 detail page) - not a regression.

**Content / taxonomy [verified]**
- All 5 MDX frontmatter valid; each `industry` belongs to its `businessModel` (velite `.refine` would drop mismatches and `prepare()` would throw). Schema uses `industry: s.string()` not `s.enum` - typos still caught via cross-field refine. Acceptable.
- Nav: `/templates` wired in `landing.ts:268` via `isPage: true`; nav-bar branches page-links (href direct) vs hash-links (resolveHashHref). Correct.

---

## a11y notes (informational, non-blocking)

- Chips: `aria-pressed={active}` present; `focus-visible:ring-2 ring-brand-violet` present. Good.
- Result count: `aria-live="polite"` (filter-bar:138). Announces on every keystroke during instant filter - slightly chatty for SR but acceptable for polite. Optional: debounce or wrap count in a phrase ("12 template khớp").
- Search input: `aria-label="Tìm template"` + decorative icon `aria-hidden`. Good.
- Minor: on reset/filter the grid swaps content (incl. empty-state) without moving focus. Focus can land on a detached node after the "Xoá bộ lọc" button removes itself. Low impact; consider returning focus to the search input or filter bar after reset.

---

## Metrics
- tsc: PASS (0 errors) | eslint: PASS (0 issues, re-run on phase-2 files) | Module sizes: all < 200 lines (largest = filter-bar 144)
- DRY/KISS: good - shared `TemplateGrid`, pure `filterTemplates`, taxonomy single-source. No parallel reimplementation, no `any`, no swallowed errors, no scope drift.

## Unresolved Questions
1. Diacritic search: fix now (Phase 2) or defer? It is a real VN-UX gap but low effort. Recommend fix now.
2. `hover:border-aurora-tint` is also broken pre-existing at `animations/page.tsx:939` (`group-hover:bg-aurora-soft`). Converting the classes to `@utility` would fix both - in scope for Phase 2 or separate cleanup?

**Status:** DONE_WITH_CONCERNS
**Summary:** Phase 2 PASS WITH NITS - boundary/filter/pSEO/queries all correct and verified; two LOW defects (dead `hover:border-aurora-tint`, diacritic-insensitive search) recommended to fix.
**Concerns/Blockers:** Both findings are observational/UX (non-correctness, non-security). Diacritic search is the more user-visible of the two for a VN audience.
