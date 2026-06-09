# Code Review — Phase 4 (SEO Complete)

Date: 2026-06-09 | Reviewer: code-reviewer | Branch: main (uncommitted working tree)
Scope: 9 created + 4 modified files (~255 LOC new SEO). Next 16.2.6 / React 19.2 / Vercel.
Method: read all files, verified against Velite output (`.velite/templates.json`), built artifacts (`.next/prerender-manifest.json`, OG `.body`/`.meta`), live dev server (3001) JSON-LD + meta tags, `tsc --noEmit` (exit 0), Next docs.

## Verdict: PASS WITH NITS

Core acceptance criteria all met and verified at runtime. No Critical/blocker. Two findings worth fixing before relying on the SSOT claim (incomplete metadataBase migration) and rich-result image. Rest are nits.

---

## Findings

### [HIGH] Incomplete metadataBase SSOT — homepage canonical + og:url still hardcoded — `src/app/layout.tsx:56,74` [verified]
Phase goal #1 = "metadataBase via site.ts SSOT". The diff changed ONLY `metadataBase` (line 36) to `SITE_URL`. Two homepage URLs remain hardcoded:
- `openGraph.url: "https://nguyenvantai.com"` (L56)
- `alternates.canonical: "https://nguyenvantai.com"` (L74)

Live proof (dev, env=`http://localhost:3001`): homepage emits `canonical=https://nguyenvantai.com`, `og:url=https://nguyenvantai.com`, but `og:image=http://localhost:3001/og/og-image.png` (env-driven via metadataBase). Split-brain: image URL follows env, canonical/og:url don't.
- **Prod impact today:** none — prod env is `nguyenvantai.com`, so both happen to agree. NOT prod-breaking.
- **Risk:** SSOT is a half-truth; if the domain ever changes (or a preview/staging deploy gets indexed), canonical+og:url will point at the wrong host while og:image points at the deploy host. Preview deploys with hardcoded prod canonical can also cause indexing confusion.
- **Fix:** `url: SITE_URL` (L56) and `alternates: { canonical: SITE_URL }` (L74). With `metadataBase` set, canonical can also just be `'/'` (resolves against base). Either makes layout truly SSOT.

### [MEDIUM] TechArticle missing `image` → loses image-bearing rich result + RRT warning — `src/lib/seo/json-ld.ts:30-46` [verified]
Google's Article/TechArticle rich-result guidance treats `headline, image, datePublished, author` as the qualifying set; `image` is the only one missing. Rendered JSON-LD (verified on `/templates/mau-bds-thu-lead`) has no `image`. Rich Results Test will warn "missing field image" and the article won't be eligible for the image-rich treatment.
- The image already exists for free: the per-route OG endpoint `/templates/<slug>/opengraph-image` (prerendered, 1200×630 ≥ Google's 1200px min).
- **Fix:** add `image: absoluteUrl(\`${template.url}/opengraph-image\`)` (or the og PNG URL). Same applies to consistency with `mainEntityOfPage: absoluteUrl(template.url)` (recommended, not required).
- Acceptance #4 says "TechArticle fields đúng schema.org" — technically valid schema.org (no *required* props), but fails Google's *rich-result* bar. Flagging because the phase intent is SEO.

### [MEDIUM] `new URL(SITE_URL)` throws if env set without protocol — `src/lib/seo/site.ts:6-8`, consumed `layout.tsx:36` [verified]
`site.ts` only strips trailing slash; it does NOT guarantee a scheme. Verified: `new URL('nguyenvantai.com')` → throws `Invalid URL`; `new URL('localhost:3001')` → silently wrong (`localhost:` treated as protocol). The hardcoded fallback (`https://nguyenvantai.com`) is safe, and current envs include scheme, so today it works. But `NEXT_PUBLIC_SITE_URL=nguyenvantai.com` (a very plausible Vercel env typo) crashes every page at render (layout metadataBase) — whole-site outage with green CI.
- **Fix:** normalize in `site.ts`: prepend `https://` if no `^https?://`. e.g. `const raw = (process.env... || 'https://nguyenvantai.com'); SITE_URL = (/^https?:\/\//.test(raw) ? raw : \`https://${raw}\`).replace(/\/$/,'')`. Cheap insurance for an env-driven SSOT.

### [LOW] OG image routes lack `dynamicParams = false` while their pages have it — `src/app/templates/[slug]/opengraph-image.tsx`, `nganh/[industry]/opengraph-image.tsx` [verified]
Page routes export `dynamicParams = false` (404 on unknown slug); the colocated `opengraph-image.tsx` routes do NOT. Verified all OG routes ARE in `prerender-manifest.json` (fully static at build), and `process.cwd()` resolves to project dir on Vercel (Next docs confirm), so font reads happen at BUILD time — concern #1 is RESOLVED, no serverless `readFile` risk for known slugs.
- Residual: an unknown slug's OG route could be requested on-demand. Since the *page* 404s, crawlers won't reference it, so practically unreachable. But if hit, the Node-runtime route would `readFile('public/fonts/...')` at runtime — `public/` is not guaranteed bundled into the serverless function, so it *could* 500 instead of 404.
- **Fix (defensive, cheap):** add `export const dynamicParams = false` to both OG routes to mirror the pages → static 404 for unknown params, no runtime font read path at all. Not blocking.

### [LOW] Demo/showcase routes are indexable — robots.ts only disallows /admin + /api — `src/app/robots.ts:13`, routes `/animations /brand /components /logo` [verified]
robots.ts (a Phase 4 deliverable) disallows only `/admin` + `/api`. Internal verification pages (`/brand` "M1.4 verification", `/components` "M1.3 verification", `/animations` "Anh xem các choice", `/logo` "Production preview") have no `robots:noindex` and are crawlable. They're correctly absent from sitemap, but Google can still find/index them via links or direct hits → thin/internal pages in the index.
- Pre-existing pages, but robots.ts is in-scope this phase, so it's the right place to address.
- **Fix:** either add these to robots `disallow`, or add `robots:{index:false}` to each demo page's metadata, or delete them before prod (comments say "Replaced khi build hero section thật ở Phase 03+" — they may be dead). Owner call.

### [LOW] `clampTitle` slices by UTF-16 code units, not graphemes — `src/lib/seo/og-card.tsx:10-12` [suspect, low risk]
`title.slice(0, max-1)` on VN text: Be Vietnam Pro diacritics are mostly single precomposed code points (NFC), so `slice` is safe for typical input. Edge: a decomposed combining mark at the boundary could split a base+mark pair. With `max=92` and titles capped at 120 chars by velite schema, most titles never clamp. Cosmetic only (OG card), no correctness/security impact. Leave as-is unless a clipped diacritic is observed.

---

## Verified-correct (no action)

- **OG build-time font read [verified]:** all 6 OG routes prerendered; `process.cwd()=project dir` per Next docs; fonts 263KB total, OG PNG 76KB (<< 8MB FB limit). Safe on Vercel build.
- **`s.isodate()` output [verified]:** emits full ISO `2026-06-05T00:00:00.000Z` (not bare date). `new Date(...)` in sitemap valid; JSON-LD `datePublished`/`dateModified` are proper datetimes.
- **BreadcrumbList [verified]:** 1-based `position`, `@context`/`@type`/`ListItem`/`item` absolute URLs — schema-valid (live-checked on detail page).
- **CollectionPage+ItemList [verified]:** valid structure, `numberOfItems` + 1-based ListItem with url+name.
- **XSS via `dangerouslySetInnerHTML` [verified]:** `JSON.stringify` over first-party frontmatter (title/description from velite-validated MDX). JSON.stringify escapes `<,>,&` inside strings as data; no `</script>` break vector for first-party content. `suppressHydrationWarning` correct. Acceptable. (If any field ever becomes user-supplied, add `.replace(/</g,'\\u003c')` — not needed now.)
- **OG image merge [verified by build+runtime]:** per-page `generateMetadata` sets `openGraph` WITHOUT `images`; file-based `opengraph-image` is auto-merged by Next (not suppressed). Build produced all OG routes; prompt confirms OG renders. type `article` (detail) vs `website` (listing/industry) correct; twitter `summary_large_image` correct.
- **sitemap coverage [verified]:** static (/ /templates /booking /privacy /terms) + pSEO (industries-with-templates only) + 5 detail routes. `/thank-you` correctly excluded (it sets `robots:noindex`). Filtered client views correctly excluded (no URL). priorities sane. lastModified `new Date()` valid.
- **`dynamicParams=false` on pSEO/detail pages [verified]:** unknown industry/slug → 404, blocks thin-content + arbitrary param indexing. Good.
- **Velite `prepare` count-guard [verified existing]:** config throws if resolved doc count ≠ source .mdx count — closes the silent-drop gap noted in prior memory. Good defensive addition.
- **Modularity/types:** all 7 new files 13–69 LOC (< 200). `tsc --noEmit` exit 0. DRY: OgCard/OG_SIZE shared across 3 routes, site.ts SSOT for URL helpers. No `any`, no lint-suppression, no catch-and-swallow.

---

## Nits (optional)
- `og-fonts.ts` loads BOTH weights for every card, but `/templates` + `/nganh` cards only use weight 600. Build-time only, negligible. Skip.
- `json-ld.ts:1-7` comment references `schemaType: 'howto'` future use; velite declares `schemaType` enum but `buildTemplateJsonLd` ignores it (always TechArticle). Intentional per comment (avoid incomplete HowTo markup) — fine, but the velite field is currently dead config. Leave; documented intent.

---

## Acceptance criteria status
1. metadataBase SSOT — PARTIAL (metadataBase yes; homepage canonical+og:url still hardcoded — see HIGH).
2. generateMetadata for 3 routes — DONE (verified).
3. OG dynamic, next/og, local VN font, SSG — DONE (verified prerendered + build-time fonts).
4. JSON-LD TechArticle+BreadcrumbList / CollectionPage+ItemList, safe inject — DONE for structure; TechArticle missing `image` for rich-result eligibility (MEDIUM).
5. sitemap + robots — DONE (robots scope nit re demo pages, LOW).

## Recommended actions (priority order)
1. [HIGH] layout.tsx:56,74 → use `SITE_URL` for og:url + canonical (complete the SSOT).
2. [MEDIUM] json-ld.ts → add `image` (+ `mainEntityOfPage`) to TechArticle.
3. [MEDIUM] site.ts → normalize protocol so a scheme-less env var can't crash the site.
4. [LOW] add `dynamicParams=false` to both OG dynamic routes (defensive).
5. [LOW] robots/noindex for /animations /brand /components /logo (or delete) — owner decision.

## Unresolved questions
- Are `/animations /brand /components /logo` shipped to prod or dev-only? Determines whether finding #5 is "noindex" vs "delete". Comments suggest they're verification stubs.
- Prod `NEXT_PUBLIC_SITE_URL` confirmed to include `https://`? (Fallback is safe; finding #3 is about a future misconfig, not current state.)
