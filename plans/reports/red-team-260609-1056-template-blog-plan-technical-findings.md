# Red-Team Technical Review — Template Library + Blog Plan

**Date:** 2026-06-09
**Reviewer posture:** Adversarial (red team). Hunt architectural/technical defects BEFORE cook.
**Plan:** `plans/260609-1056-template-instruction-library-and-blog/` (plan.md + phase-01..05)
**Verdict:** Plan is buildable but rests on a FALSE central research claim (zod compat). At least 2 BLOCKERs and several HIGH issues need resolution before Phase 1.

Legend: **[verified]** = checked against source/registry/code. **[suspect]** = needs hands-on check during cook.

---

## BLOCKER

### B1. [verified] Velite 0.3.x does NOT use project's zod 4 — research claim is false; `s.refine()` schema relies on a bundled zod whose API/version is opaque
- **Claim under attack:** Research report line 14, 69, 74-77: "Velite re-exports Zod internally; your project's zod^4.4.3 coexists safely." Version matrix marks zod row ✅ Safe.
- **Evidence (verified via npm registry):** `velite@0.3.1` `dependencies` = `{sharp, terser, esbuild, @mdx-js/mdx}` — **zod is NOT a dependency at all.** Velite bundles its validator into `dist` via tsup (esbuild, treeshake). The `s` helper (`import { s } from 'velite'`) is velite's OWN bundled schema lib, not your zod. Across all stable releases (0.2.1 → 0.3.1) zod = NONE. **Only `velite@1.0.0-alpha.2` declares `zod ^4.4.3`** as a real dependency.
  - Registry: `https://registry.npmjs.org/velite/0.3.1` → dependencies object (no zod).
  - Registry: `https://registry.npmjs.org/velite` versions → `1.0.0-alpha.1 zod=^4.1.13`, `1.0.0-alpha.2 zod=^4.4.3`.
- **Why it matters:** Two concrete failure modes:
  1. **API mismatch.** Velite 0.3.x's bundled `s`/zod is almost certainly zod **3** (velite 0.3 predates zod-4-era; the zod-4 move only happens in 1.0-alpha). Phase 1 step 3 plans `industry(string, refine thuộc model)`. zod 3 `.refine()` and zod 4 `.refine()` differ (error customization signature changed in zod 4: `{message}` → `{error}`). Any plan author muscle-memory from the project's zod 4 (`src/lib/validators/booking-schema.ts` uses zod 4) applied to velite's `s` will silently mis-shape or throw.
  2. **`s` is not `z`.** Velite exposes domain helpers (`s.slug()`, `s.mdx()`, `s.image()`, `s.isodate()`, `s.toc()`) that do NOT exist on the project's `zod`. You cannot mix `import { z } from 'zod'` with velite collections. The plan/research are inconsistent: research §8 fallback even shows `import { z } from 'zod'` for next-mdx-remote, reinforcing the confusion between two schema libs.
- **Fix:** Decide explicitly and pin:
  - **Option A (recommended, lowest risk):** Use stable `velite@0.3.1`, write ALL content schemas with velite's `s` ONLY (never `z` from project zod). Treat velite's validator as a black box; do not assume zod-4 APIs. Verify `s.enum`, `s.refine`/custom validation signatures against `node_modules/velite/dist/index.d.ts` BEFORE writing taxonomy refine logic.
  - **Option B:** If you need zod-4-identical API inside content schemas, you must use `velite@1.0.0-alpha.2` — but that is an **alpha**, contradicting Phase 1 success-criterion "version ≥0.3.1 (stable for production)". Do not ship alpha to a production landing without a spike.
  - Either way: **delete the "zod coexists safely" claim from the plan's locked decisions** — it's the wrong mental model and will cause schema bugs.
- **Action before cook:** Spike — `pnpm add velite@0.3.1`, open `dist/index.d.ts`, confirm exactly what `s.enum`/refine/`s.mdx` return and what zod version is bundled (`grep -i "zod" node_modules/velite/dist/index.js | head`).

### B2. [verified] `s.image()` requires `sharp` native binary at build time on Vercel — plan uses `cover: s.image()` but never accounts for sharp install/runtime
- **Claim under attack:** Phase 1 step 3 + research §5: `cover(image optional)` via `s.image()`; "Velite config to copy image to .velite/".
- **Evidence (verified):** `velite@0.3.1` hard-depends on `sharp@^0.34.5`. `s.image()` invokes sharp to read dimensions/blur placeholder and emit processed assets into `.velite/`. Project package.json has NO sharp and Next 16 no longer bundles sharp as a hard dep in all cases.
- **Why it matters:** sharp ships platform-specific prebuilt binaries. On Vercel (linux x64/arm), if sharp's optional native package isn't fetched at build (pnpm strict / `--frozen-lockfile` / `node-linker` quirks), `s.image()` throws at `velite.build()` inside next.config.ts → **build fails before Next even starts**, and the error surfaces as a cryptic next.config init crash, not a clear "sharp missing". Local Windows build can pass while Vercel fails (research Issue #2 territory, but root cause is sharp, not argv).
- **Fix:** Either (a) avoid `s.image()` for covers entirely — store covers in `public/templates/<slug>/cover.*` and put a plain `cover: s.string().optional()` path in frontmatter (research §5 "Best practice" already recommends this and Phase 2 card already does `next/image` + fallback gradient, so `s.image()` buys nothing here); or (b) if `s.image()` is wanted for blur placeholders, explicitly add sharp handling to deploy and test on a Vercel preview in Phase 1, not Phase 4. Recommendation: **drop `s.image()`, use string path** — KISS, removes the sharp build-coupling blocker.

---

## HIGH

### H1. [verified] Nav refactor will not type-check / will mis-highlight: `NavLink.sectionId` is required and active-state logic is hash/section-only
- **Claim under attack:** Phase 1 step 9 + plan §nav: "thêm entry Templates vào LANDING.nav.links (type page-link href `/templates`); active state theo pathname".
- **Evidence (verified):**
  - `src/content/landing.ts:101-107` — `NavLink` requires `sectionId: string` and `analyticsId: CtaLocation`. A `/templates` page-link has no section. Adding `{label:'Templates', href:'/templates'}` without `sectionId` → **TS error** (required field). Adding a dummy `sectionId` pollutes the IntersectionObserver model.
  - `CtaLocation` union (`landing.ts:35-47`) has no `nav_templates` member. `analyticsId` for the new link won't type-check unless you extend the union (plan never lists this edit).
  - `nav-bar.tsx:78-104` renders every link via `<a href={resolveHashHref(...)}>` with `aria-current` driven by `active === link.sectionId`. A page-link rendered as `<a>` (not `<Link>`) loses client-side nav/prefetch, and active state for `/templates` is never computed (no pathname check).
  - `resolveHashHref` (`resolve-hash-href.ts:10-14`) only transforms `#`-prefixed hrefs; `/templates` passes through unchanged — fine, but the plan's claim "resolve-hash-href đã hỗ trợ off-home" is misleading: it does nothing for page-links, the active-highlight problem is elsewhere.
- **Why it matters:** Either compile breaks (missing `sectionId`/`analyticsId` enum) or the new nav item never shows active on its own route, and uses a raw `<a>` (full reload) instead of `<Link>`.
- **Fix:** Model page-links as a discriminated type, e.g. `NavLink = HashLink | PageLink` where PageLink has `href` + optional `analyticsId`, no `sectionId`. In `nav-bar.tsx`/`nav-mobile-drawer.tsx`: render PageLink via `next/link`, set active by `pathname.startsWith(href)`. Extend `CtaLocation` with `nav_templates` (and later `nav_blog`). List these edits explicitly in Phase 1 (currently under-specified) and Phase 5.

### H2. [verified] `.velite` import path + tsconfig will fail type-check; plan's alias `#site/content` is half-specified and tsconfig include is wrong
- **Claim under attack:** Phase 1 step 5: "tsconfig.json include `.velite/*` + alias `#site/content` (nếu chọn)". Research §7 Issue #3 admits "tsc reports Cannot find module '.velite'".
- **Evidence (verified):**
  - Research imports `from '.velite'` (relative) AND `from '@/.velite'` (alias) inconsistently across sections (lines 145 vs 859). `.velite` lives at **repo root**, but `@/*` maps to `./src/*` (`tsconfig.json:21-23`) — so `@/.velite` resolves to `src/.velite`, which does NOT exist. That import is wrong as written.
  - `tsconfig.json` `include` is `**/*.ts(x)` with `exclude: node_modules` — `.velite/*.js` + `index.d.ts` are NOT `.ts`, so they won't be picked up by the `**/*.ts` glob; you need an explicit alias to the generated `index.d.ts` or to import via a path that TS can follow.
  - `.velite` is git-ignored (correct) → on a clean CI checkout, `.velite` does not exist until `velite.build()` runs. If `tsc`/`next build`'s type phase runs before velite output materializes, **module-not-found**. The next.config.ts `import('velite').then(...)` is **fire-and-forget (not awaited)** — see B3 — so ordering is not guaranteed.
- **Fix:** Add a real path alias (e.g. `"#site/content": ["./.velite"]` or `"@velite": ["./.velite"]`) AND `"#site/content/*"`, import consistently through it everywhere (kill the `@/.velite` and bare `.velite` mix). Commit a placeholder typing or run a one-shot `velite build` in a `prebuild`/CI step so `index.d.ts` exists before type-check. Pick ONE import convention and put it in the plan as a locked decision.

### H3. [verified] next.config.ts Velite init is fire-and-forget — no top-level await; race against build is real, not theoretical
- **Claim under attack:** Research §1 + Phase 1 step 4: `import('velite').then(m => m.build({...}))` "Generates .velite/ output before Turbopack sees bundling."
- **Evidence (verified):** The pattern is `import('velite').then(...)` — a dangling promise, never awaited. `export default nextConfig` returns synchronously while `velite.build()` is still resolving. Next.js does not wait for orphan promises spawned in config module evaluation. Whether `.velite` exists before the first route is compiled is **timing-dependent**, not guaranteed. Research itself flags Issue #2 (".velite not generated on Vercel") and Issue #3 (type-gen timing) — symptoms of exactly this race. The current `next.config.ts` (lines 1-11) is a plain sync object; bolting an async side-effect onto module eval is fragile.
- **Why it matters:** Build works locally (warm `.velite` from prior dev) but 404s/type-fails on cold Vercel build — the worst kind of "passes CI-ish locally, breaks in prod" bug.
- **Fix:** Don't rely on the orphan promise. Prefer the explicit, deterministic path the research lists as "Option B": `"build": "velite build && next build"` and a `predev`/`prebuild` hook, so `.velite` is guaranteed present before Next runs. This is more robust than programmatic init AND sidesteps H2's ordering problem. If keeping programmatic init for dev HMR, still add `prebuild: "velite build"` for the build path. The plan currently treats Option B as fallback-only; promote it for the build command.

### H4. [verified] `export const dynamic = 'force-static'` + `export const revalidate = 3600` are contradictory; plan/research mix them
- **Claim under attack:** Phase 2 step 1: `export const dynamic = 'force-static'`. Research §7: `export const revalidate = 3600` on the same listing/detail pages.
- **Evidence (verified):** In Next.js App Router, `dynamic = 'force-static'` forces full static (caches/empties dynamic APIs, no revalidation), while `revalidate = N` opts into ISR. Setting both on one route is contradictory; `force-static` effectively pins it and `revalidate` is ignored/confusing. For content-as-code that only changes on redeploy (the plan's storage model: "publish = deploy lại"), **ISR revalidate is pointless** — there's no external data source to re-fetch; new content only appears via rebuild. So `revalidate=3600` from research §7 is cargo-culted and should be dropped for templates/blog.
- **Fix:** For build-time MDX content: omit `revalidate` entirely; rely on SSG via `generateStaticParams` (default static). Use `force-static` only if you also need dynamic APIs disabled. Do NOT copy research §7's `revalidate = 3600`. Note: `dynamicParams` default `true` means an unknown slug renders on-demand → for a closed content set you likely want `export const dynamicParams = false` so bad slugs 404 statically (Phase 3 wants 404 on missing slug — this is the clean way).

### H5. [verified] OG `opengraph-image.tsx` + JSON-LD reference fields and font files that DON'T exist; will throw at build
- **Claim under attack:** Phase 4 step 3 + research §2/§3: `readFile('public/fonts/be-vietnam-pro-600.ttf')`; JSON-LD `template.steps.map(...)`, `post.author.name/url`, `post.updatedAt`.
- **Evidence (verified):**
  - `public/fonts/` **does not exist** (verified: only `public/og/og-image.png`, brand/, *.svg). `readFile(join(process.cwd(),'public/fonts/be-vietnam-pro-600.ttf'))` throws ENOENT at OG render → broken OG (or build error if pre-rendered). Plan acknowledges in Phase 4 risk ("Nếu repo chưa có font local → bổ sung subset") but does NOT make font-file acquisition a Phase 4 step/criterion. It's a silent prerequisite.
  - The app loads fonts via `next/font/google` (`layout.tsx:19-32`), so there are no local .ttf files to reuse. You must download + subset Be Vietnam Pro + Space Grotesk .ttf into `public/fonts/` (watch the 500KB OG bundle limit with Vietnamese diacritics — research §2 Font note).
  - JSON-LD HowTo (research §3, lines 367-378) maps `template.steps[]` with `{title, description, imageUrl}`. The Velite template schema in Phase 1 step 3 / research §6 (lines 823-839) has NO `steps` field in some variants and HAS it in another (research §6 includes `steps`, Phase 1 does not). Inconsistent. If `steps` is omitted from the actual schema, `template.steps.map` is a runtime crash. Blog `articleSchema` references `post.author.name`, `post.author.url`, `post.updatedAt` — Phase 5 schema has `author` (string, not object) and `updatedAt?` optional → `post.author.name` on a string is `undefined`, `post.author.url` crashes if author is a string. Research blog schema assumes `author: {name,url}` object.
- **Fix:** (a) Add explicit Phase 4 step: acquire + subset both fonts into `public/fonts/`, verify Vietnamese glyphs, keep under bundle limit; make it a success criterion. (b) Reconcile the Velite schema with JSON-LD field access in ONE place: decide author shape (string vs {name,url}) and whether `steps` exists. If HowTo steps come from MDX headings (Phase 4 step 4 hints "step từ headings nếu khả thi"), the schema has no `steps[]` and the research's `template.steps.map` must be replaced with heading extraction — non-trivial, spec it. Prefer `TechArticle`/`Article` (Phase 4 already lists as fallback) to avoid the steps problem entirely.

---

## MEDIUM

### M1. [verified] `useMDXComponent` helper name is misleading and the `new Function(code)` exec pattern needs validation against Velite 0.3 output shape
- **Evidence:** Research §3 names the helper `useMDXComponent` but it's NOT a React hook (no hooks used) — it's `const fn = new Function(code); return fn({...runtime}).default`. Calling it `use*` will trip `react-hooks/exhaustive-deps` ESLint and confuse rules-of-hooks lint (eslint-config-next is active). Also `new Function(code)` assumes Velite emits a bare function body returning `{default}` — true for velite's `s.mdx()` `code` output, but the exact runtime contract (does it expect `{...runtime, ...components}`? is it `fn(runtime).default` then `<Component components={}/>`?) must be confirmed against 0.3.1, not assumed from a blog pattern. RSC execution of `new Function` is fine (server), but CSP could block it if a strict `script-src` is ever added.
- **Fix:** Rename to `getMDXComponent`/`renderMDX` (not `use*`) to dodge hooks-lint. Verify the exact exec contract from `node_modules/velite` examples during the Phase 1 spike. Plan already names the file `mdx-runtime.ts` — keep the function non-hook-named to match.

### M2. [verified] `@tailwindcss/typography` v0.5.20 IS Tailwind-v4 compatible, but `@plugin` registration + prose-vs-tokens override is under-specified and will fight dark mode
- **Evidence:** Registry: `@tailwindcss/typography@0.5.20` peerDeps `tailwindcss: >=3.0.0 || >=4.0.0` → v4 supported (this part of the plan is CORRECT; `@plugin "@tailwindcss/typography";` in globals.css is valid v4 syntax). BUT: project uses class-based dark mode via `@custom-variant dark (&:where(.dark, .dark *))` (globals.css:4) and a custom token system, NOT Tailwind's default `prose-invert` trigger. `prose-invert` (research §6 line 908) keys off Tailwind's own dark detection, which won't auto-track the `.dark` class the way next-themes toggles it here. The prose color overrides (`prose-headings:text-text-primary prose-p:text-text-secondary`) will partially work but base prose colors (links, code, borders, blockquote) will use Tailwind defaults that clash with Aurora tokens in BOTH themes.
- **Fix:** Define a custom prose theme via `@plugin` options or a `.prose` token override block in globals.css mapping `--tw-prose-*` vars to Aurora tokens, and drive dark via the existing `.dark` variant (not `prose-invert`). Budget real time for this in Phase 1 step 10 (currently one line). Verify code-block styling doesn't double-up with the custom `pre`/`code` mdx-components mapping (Phase 1 step 7) — you'll have TWO styling sources for code (`prose` + custom `pre` component) that can conflict; pick one as authoritative.

### M3. [suspect] HMR content reload on Windows (this project's OS) — research flags as unresolved; plan accepts "restart nếu HMR lag"
- **Evidence:** Research Unresolved Q2 explicitly flags Windows file-watcher reliability for velite `--watch`. Plan Phase 1 success criterion accepts "(hoặc restart nếu HMR lag — chấp nhận)". Reasonable for DX, but the orphan-promise init (B3/H3) makes watch-mode lifecycle even less predictable — if `velite.build({watch:true})` is fire-and-forget in next.config, its watcher's lifetime vs Next's dev server is uncoupled.
- **Fix:** Acceptable as-is for v1 DX, but prefer the explicit `concurrently "velite --watch" "next dev"` (research Option B) on Windows for a deterministic, separately-logged watcher. Low stakes; note only.

### M4. [verified] Robots disallow `/api` will block the OG image route family if any OG uses `/api/og`, and sitemap/robots host hardcoding duplicates layout's metadataBase
- **Evidence:** Research §4 robots disallows `/api`; Phase 4 step 6 "disallow `/admin`, `/api`". The existing dynamic OG proxy is at `src/app/api/og/route.tsx`. Plan Phase 4 moves to file-convention `opengraph-image.tsx` (good — not under `/api`), but research §1/§3 STILL reference `/api/og?slug=...` in metadata images (research lines 116, 361, 423). If any of those `/api/og` references survive into code, robots `disallow:/api` tells crawlers not to fetch the OG → social previews/Google may skip it. Also every URL in sitemap/JSON-LD/robots hardcodes `https://nguyenvantai.com` while `layout.tsx:35` already sets `metadataBase`; Phase 4 step 1 wants env `NEXT_PUBLIC_SITE_URL` — three sources of truth for the domain.
- **Fix:** Use ONLY file-convention OG (no `/api/og` in metadata) so robots `/api` block is harmless. Centralize the site URL in ONE constant (e.g. `src/lib/seo/site.ts` reading `metadataBase`/env), consumed by sitemap, robots, JSON-LD. Strip the `/api/og?slug=` patterns from the implementation — they're research leftovers.

### M5. [verified] Phase/dependency ordering: Phase 5 (Blog) depends on [1,4] but reuses Phase 2/3 explorer + card + detail patterns not owned by Phase 4
- **Evidence:** Phase 5 frontmatter `dependencies: [1, 4]`. But Phase 5 architecture explicitly reuses "pattern explorer" (Phase 2), MDX detail render + CTA + related (Phase 3), opengraph builder (Phase 4). Declared deps omit 2 and 3. If Blog is built right after Phase 4 without 2/3 done, the reusable explorer/card/detail abstractions won't exist → fork or rework.
- **Fix:** Set Phase 5 `dependencies: [1,2,3,4]`. Also: to make Phase 2/3 components reusable by Blog (DRY, plan's own §5.1 goal), they must be generic over content type from the start — but Phase 2/3 hardcode `template`/taxonomy. Decide NOW whether `templates-explorer`/`template-card` are generic-izable or whether Blog gets its own (plan says reuse "explorer pattern" but creates separate `post-card`/`post-list-explorer` in Phase 5 — that's a copy, not reuse). Be honest: it's parallel reimplementation. Either extract a shared `<ContentExplorer>` in Phase 2 (more upfront work) or accept the duplication explicitly and stop claiming DRY.

---

## LOW

### L1. [verified] `next/og` needs no extra dep — plan is correct, but verify import path
- The reviewer brief asked whether `@vercel/og` must be added. **No.** `next/og` is built into Next 16 (wraps `@vercel/og` internally). Project has neither `@vercel/og` nor any current `ImageResponse` usage (verified: grep found none), so `import { ImageResponse } from 'next/og'` is the correct, dependency-free path. Plan Phase 4 already uses `next/og` — correct. No action.

### L2. [verified] `suppressHydrationWarning` on `<script>` JSON-LD is unnecessary in pure RSC
- Research §3 adds `suppressHydrationWarning` to every JSON-LD `<script>`. In a Server Component that never hydrates, this is noise. Harmless but cargo-culted. Drop it unless the script lands in a Client Component.

### L3. [suspect] `attachments[{label,href}]` with `target="_blank"` — ensure `rel="noopener noreferrer"` (Phase 3 says noopener only)
- Phase 3 step 4 / architecture: attachments `target _blank rel noopener`. Add `noreferrer` too for external links (minor security/privacy hardening). Trivial.

### L4. [verified] zod direct imports already exist in project (booking, mcp) using zod 4 — reinforces B1 confusion risk
- `src/lib/validators/booking-schema.ts:12`, `src/app/api/mcp/route.ts`, `booking-form-wired.tsx` import `z from 'zod'` (zod 4). Devs WILL reach for the same `z` in content schemas out of habit and hit B1. Make the velite-`s`-only rule loud in the plan.

---

## Top 3 — MUST fix before `cook`

1. **B1 — Kill the false zod-compat assumption.** Velite 0.3.x does not use your zod 4; `s` is a separate bundled validator (likely zod 3). Spike `node_modules/velite/dist/index.d.ts`, confirm refine/enum API, write content schemas with `s` ONLY, and remove the "zod coexists safely" locked decision. Decide stable-0.3.1-with-`s` vs alpha-1.0-with-zod4 (alpha = no for prod).

2. **H3 + H2 + B2 — De-risk the build pipeline deterministically.** Replace fire-and-forget `import('velite').then()` with explicit `"build": "velite build && next build"` (+ `prebuild`), add a real `#site/content → ./.velite` tsconfig alias with a guaranteed-present `index.d.ts`, and drop `s.image()` (use `public/` cover paths) to remove the sharp-on-Vercel build coupling. This is the cluster most likely to "pass locally, 404/crash on Vercel."

3. **H1 — Fix the nav type model before touching it.** Add a PageLink variant (no `sectionId`), extend `CtaLocation` with `nav_templates`/`nav_blog`, render page-links via `next/link` with `pathname`-based active state. Otherwise Phase 1 step 9 won't compile or will mis-highlight.

---

## Unresolved questions

1. **Velite 0.3.1 bundled zod version + exact `s.mdx()` `code` runtime contract** — must be read from installed `dist` during the Phase 1 spike. Can't confirm zod-3-vs-4 from registry metadata alone (it's bundled, not a dep). [drives B1, M1]
2. **HowTo `steps` source** — frontmatter array vs extracted from MDX headings? Determines whether JSON-LD `template.steps.map` is valid or a crash, and the actual Velite schema shape. [H5]
3. **Blog author shape** — string (Phase 5 schema) vs `{name,url}` object (research JSON-LD). Pick one; JSON-LD `BlogPosting.author` wants a Person/Organization object. [H5]
4. **DRY decision for explorer/card** — extract one generic `<ContentExplorer>` (Phase 2 cost) or accept Template/Blog duplication? Plan claims DRY but specs duplicate components. [M5]
5. **Are local font .ttf files licensed/available for subsetting?** Be Vietnam Pro + Space Grotesk are OFL (fine), but someone must produce subset .ttf in `public/fonts/` — owner action, not in any phase step. [H5]

---

**Status:** DONE
**Summary:** Plan is structurally sound and the Velite-via-programmatic + next/og + typography-v4 high-level choices are valid, but it rests on a verified-false research claim (Velite 0.3.x does NOT use the project's zod 4 — `s` is a separate bundled validator), plus a sharp/`s.image()` Vercel build-coupling blocker, a fragile fire-and-forget build race, and a nav type model that won't compile as planned. 2 BLOCKER, 5 HIGH, 5 MEDIUM, 4 LOW.
**Concerns:** B1 and the H2/H3/B2 build-pipeline cluster are "passes locally, breaks on Vercel" class — do the Phase 1 spike (read installed velite dist + a real Vercel preview deploy) BEFORE committing UI phases. Several research-report code snippets are inconsistent (zod vs s, `@/.velite` vs `.velite`, `/api/og` vs file-convention, author string vs object) and will propagate bugs if copy-pasted verbatim.
