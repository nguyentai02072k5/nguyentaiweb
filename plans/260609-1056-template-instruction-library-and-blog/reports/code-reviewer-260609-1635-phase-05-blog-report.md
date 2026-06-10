# Code Review - Phase 05 (Blog), Next.js 16 App Router

Date: 2026-06-09 | Reviewer: code-reviewer | Scope: Phase 5 Blog
Build PASS (47 pages) + runtime verified by author. Independent checks below.

## Verification run (this review)
- `tsc --noEmit` → **clean, 0 errors** [verified]
- `eslint` on all Phase-5 files → **clean, exit 0** [verified]
- velite installed = **0.3.1**; `s.metadata()` dist returns `{ readingTime, wordCount }`, `readingTime = time===0?1:time` (never 0) [verified node_modules/velite/dist/index.js:5060-5080]
- `.velite/index.d.ts` Post type derived from config `_output` → `metadata` present, survives `Omit<Post,'body'>` [verified]
- No dangling `template-cta`/`TemplateCta` refs anywhere in `src` [verified grep, 0 matches]
- `normalizeVN` functional test: `Mỹ Phẩm`→`my pham`, `Tự động hoá`→`tu dong hoa`, "my pham" matches "Mỹ Phẩm" [verified runtime]
- 3 blog MDX: no `draft` field (→default false=published), tags overlap (chatbot, cskh), 3 source=3 resolved → prepare-guard passes [verified]

## Verdict
**SHIP-ready.** No Critical/High. One Medium logic gap in `getRelatedPosts` (returns score-0 posts as "related" - contradicts "tag chung" spec). Two Low notes. Acceptance criteria 1–5 met.

---

## Critical
None.

## High
None.

## Medium

### M1 - getRelatedPosts surfaces zero-overlap posts as "related"
`src/lib/content/queries.ts:118-131` - scoring computes tag overlap then `slice(0, limit)` WITHOUT filtering `score > 0`. With only 3 posts it degrades to "most-recent other posts" regardless of tag relevance.
[verified] simulation:
- `chatbot-ai-tang-chot-don` → related includes `tu-dong-hoa-cskh-ngoai-gio` with **score 0** (no shared tag).
- `tu-dong-hoa-cskh-ngoai-gio` → related includes `chatbot-ai-tang-chot-don` with **score 0**.

Spec (criterion 3 + cần-soi #3) says related = "tag chung". Current code shows unrelated posts. Functionally harmless (still valid posts, related section just less precise), but violates stated intent and will look odd as catalog grows (a post with a niche tag pulls in random recent posts).

Fix:
```ts
const scored = pool
  .map((p) => ({ p, score: p.tags.filter((t) => current.tags.includes(t)).length }))
  .filter((s) => s.score > 0);          // keep only genuine tag overlap
scored.sort((a, b) => b.score - a.score || b.p.publishedAt.localeCompare(a.p.publishedAt));
return scored.slice(0, limit).map((s) => toPostSummary(s.p));
```
Edge case this also fixes: a single-post blog (or a post whose tags match nothing) → `related` becomes `[]` → `RelatedPosts` returns null (already handles empty, `related-posts.tsx:8`). So the "1 bài → ẩn" requirement (cần-soi #3) is ONLY satisfied today because pool is empty; with ≥2 posts and no shared tags it currently does NOT hide. Filter makes the hide behavior correct in all cases.

Note: contrast with `getRelatedTemplates` (queries.ts:65-89) which uses tiered fallback (industry→businessModel→featured) intentionally - that fallback is by-design for templates. Posts have no such documented fallback tier; the score-0 inclusion here looks unintentional, not a mirror of template behavior.

---

## Low

### L1 - generateStaticParams duplicated across page + opengraph-image (minor DRY)
`src/app/blog/[slug]/page.tsx:21-23` and `src/app/blog/[slug]/opengraph-image.tsx:11-13` both define identical `generateStaticParams` + `dynamicParams=false`. This is the Next.js-idiomatic pattern (each route segment file owns its params) and mirrors the existing templates route, so acceptable. Not worth extracting - flagging only for awareness. [verified - matches templates/[slug] convention]

### L2 - wordCount uses CJK heuristic; VN reading-time may read low
`node_modules/velite/dist/index.js:5076` computes `wordCount = latinWords + cjChars*0.56`. Vietnamese is Latin-script with spaces, so it counts as normal words - fine. But very short posts always floor to "1 phút đọc" (the `time===0?1:time` guard). All 3 current posts are short → all likely show "1 phút đọc". Cosmetic, accurate enough. No action. [verified math]

---

## Cần-soi checklist results

1. **Draft handling** - [verified] Draft filtered in `getPosts` (queries.ts:99), `getPostBySlug` (`!p.draft`, :104 → undefined → `notFound()` page.tsx:63), `generateStaticParams` (uses getPosts, page.tsx:22 + og:11-13), `getPostTags` (:111 continue), `getRelatedPosts` (:122), `sitemap` (uses getPosts, sitemap.ts:46). A draft slug → not in static params + `dynamicParams=false` → 404. **Correct.** prepare-guard does NOT false-fail on draft: draft is a valid doc (default false, not dropped by velite) so resolved count = source count. **Correct.**

2. **SoftCta refactor** - [verified] `templates/[slug]/page.tsx:90` uses `location="templates_cta"` + custom heading; `blog/[slug]/page.tsx:88` uses `location="blog_cta"` + custom heading. Both `'templates_cta'` and `'blog_cta'` exist in `CtaLocation` union (landing.ts:50-51). `trackCtaClick(location: CtaLocation)` accepts both (track-cta-click.ts:19). `template-cta.tsx` deleted, zero dangling imports. **Correct, no regression.**

3. **getRelatedPosts** - scoring computes shared-tag count + recency tiebreak, excludes self + draft (:122). **BUT** does not filter score>0 → see **M1**. Self-exclusion and draft-exclusion verified correct.

4. **metadata reading-time** - [verified] `s.metadata()` → `{readingTime, wordCount}`, readingTime≥1. Displayed in `post-card.tsx:57` and `post-detail-header.tsx:44` via `post.metadata.readingTime`. Type survives `PostSummary` (Omit body). **Correct.**

5. **JSON-LD BlogPosting** - [verified] `json-ld.ts:50-73`. Fields: `@type:BlogPosting`, headline/description/url/mainEntityOfPage/datePublished/dateModified/author(Person)/publisher(Organization)/image/keywords - all schema.org-valid. `image` → `absoluteUrl('/blog/<slug>/opengraph-image')` resolves to real static PNG route (og:1-27). datePublished uses ISO date from `s.isodate()`. **Valid.** Minor: `image` is a string; Google accepts string but prefers array - not a defect.

6. **DRY normalizeVN** - [verified] Single source `src/lib/text/normalize-vn.ts`. Consumed by `template-filters.ts:11` and `post-list-explorer.tsx:11`. No duplication. Regex range U+0300–U+036F (combining diacritics, stored as raw bytes in file - valid) + đ/Đ handling. Search behavior confirmed by runtime test. **Correct.**

7. **Patterns / module size / a11y** - [verified]
   - Aurora minimal tokens reused (bg-aurora, surface-*, text-*, brand-violet, shadow-glow-violet). Consistent.
   - All Phase-5 modules < 200 lines (largest: post-list-explorer 117, page 92).
   - a11y: `aria-pressed` on tag buttons, `role=group`+`aria-label` on filter, `aria-label` on search Input, `aria-hidden` on decorative icons, breadcrumb `aria-label="Breadcrumb"`, `aria-current="page"` on active nav link (nav-bar.tsx:101), motion-reduce variants present. **Solid.**

---

## Unresolved questions
1. **M1 intent:** Is showing score-0 posts as "related" intentional (fill-to-3 fallback like templates) or a miss? Spec says "tag chung" → I read it as a miss. If product wants always-3 related cards even without tag overlap, document it; otherwise apply the `score>0` filter.
