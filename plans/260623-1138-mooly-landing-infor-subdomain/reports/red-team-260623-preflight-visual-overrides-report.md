# Red-Team: Preflight Visual Overrides — Mooly Landing

**Date:** 260623 · **Scope:** read-only · **Status:** DONE

## Setup (verified)
- Tailwind **v4** — `src/app/globals.css:1` `@import "tailwindcss"` → ships Preflight (`node_modules/tailwindcss/preflight.css`, read in full).
- Landing renders **inside global document** (`src/app/landing/page.tsx:13-21` injects `<style>{LANDING_CSS}</style>` + `<div id="mooly-lp">`). Root layout still loads globals → **Preflight DOES reach `#mooly-lp`**. So preflight is a live risk surface, not isolated.
- Scoped CSS: `src/app/landing/landing-styles.ts` (prefix `#mooly-lp`, auto-gen from `mooly-landing.html`).
- **Specificity law:** scoped rules `#mooly-lp X` = (0,1,0,1) **beat** every preflight selector (element-level 0,0,1 or `:where()` 0,0,0). ⇒ Divergence is possible **only where the original relied on a browser UA default that landing never set explicitly**, because preflight overrides that UA default while the original standalone HTML kept it.

## Per-element verdict

| # | Element | Preflight reset | Landing sets? | Original (standalone) relied on | Verdict |
|---|---------|-----------------|---------------|-------------------------------|---------|
| 1 | **h1–h4 weight** | `font-weight:inherit` (preflight:79) | YES `font-weight:700` (`landing-styles.ts` head rule; orig `mooly-landing.html:45`) | explicit 700 | ✅ OK (already explicit — the earlier fix you applied to globals is belt-and-suspenders; landing self-covers) |
| 2 | **button** (`.btn`,`.fq`,`.burger`,`.seg button`,`.mnav-x`,submit) | `font:inherit;bg:transparent;radius:0;border:0;appearance:button` | YES — every button class sets bg/border/cursor/font/padding/radius (orig:63,102,299,408,553) | nothing UA-specific | ✅ OK — all buttons fully styled; `appearance:button` is harmless (custom radius/bg already set) |
| 3 | **a** | `color:inherit;text-decoration:inherit` | YES `#mooly-lp a{color:inherit;text-decoration:none}` (orig:46) | `text-decoration:none` | ✅ OK — explicit. `.nav-links`/`.foot-links`/`.pnote a` all inherit from this + own color |
| 4 | **ul/ol/li** | `list-style:none` | `.pfeats`,`.cbul` set `list-style:none` (orig:314,420). `.nav-links`/`.foot-links` are **flex `<a>` rows, not lists** | no bullets wanted anywhere | ✅ OK — no list in design needs a marker; preflight `list-style:none` matches intent |
| 5 | **b / strong** | `font-weight:bolder` (preflight:97) | partial — only `.feat-card p b`,`.order-card .row b`(color),`.pfeats li b`,`.cost-sub b` etc. **Bare `<b>` w/o weight:** `.chat-h b`(167),`.st b`(206),`.cost-split b`(344),`.tc .who b`(380),`.oc .a b`(364); `<small><strong>`(hero-trust) | **UA default `bold`=700** | ⚠️ **Low-risk, effectively OK.** `bolder` from a normal/600 parent computes to **700 = same as UA bold**. Only differs (→900) if an ancestor already ≥600 AND no nearer weight set. None of these bare `<b>` sit in a ≥600 chain without their own size context → renders 700. **No visible regression.** (If you want zero ambiguity, see fix #1.) |
| 6 | **input/select/textarea** | `font:inherit;color:inherit;bg:transparent;radius:0` | YES `.fld input,.fld select` set width/padding/border/radius/font/color/**bg:#fff** (orig:434); `:focus` outline:none + ring (orig:436); `::placeholder` color (orig:435) | nothing UA-specific | ✅ OK — form fully self-styled incl. focus ring + placeholder |
| 7 | **img / svg** | `display:block;vertical-align:middle;img max-width:100%;height:auto` | YES `#mooly-lp img{max-width:100%;display:block}` + `#mooly-lp svg{display:block}` (orig has both) | UA inline | ✅ OK — matches; preflight `height:auto` on img is same as orig intent. `.brand .logo`/`.avatars img` set explicit w/h |
| 8 | **table/hr/blockquote/h-margins** | resets present | **none used** in markup (grep: 0 table/hr/blockquote) | n/a | ✅ N/A |
| 9 | **`*` box-sizing/margin/padding** | `*,::before,::after{box-sizing;margin:0;padding:0;border:0 solid}` (0,0,0) | `#mooly-lp *{box-sizing;margin:0;padding:0}` (0,1,0) **wins**; orig:42 identical | same `*` reset | ✅ OK — scoped `*` overrides; the extra preflight `border:0 solid` is identical to original behavior (orig also 0-border by default) |
| 10 | **::placeholder / :focus / ::selection** | `::placeholder{opacity:1;color:color-mix(...50%)}`; `:-moz-focusring` | placeholder color set (orig:435); focus ring set (orig:436). **No `::selection`** in either | n/a | ✅ OK — placeholder color explicit overrides preflight color-mix; no selection styling in original either |

## Conclusion
**No additional CONFIRMED visual regression in the same family as the heading-weight bug.** The heading bug was real because globals' `@layer base h1-h6{font-weight:inherit}` (globals.css:373-382 sets font but NOT weight, and preflight zeroes weight) — but **`#mooly-lp` itself already sets `h1-h4{font-weight:700}`**, so the landing headings were actually protected by the scoped rule. The earlier globals fix helps non-landing pages; landing was self-covered.

The **only theoretical residual** is bare `<b>` weight (#5), and analysis shows `bolder`→700 matches UA `bold` in every actual context here. Visual: **identical**.

## Fix checklist (optional hardening — none strictly required)
- [ ] **#1 (cosmetic, optional):** In source `mooly-landing.html`, add a defensive `#…/b,strong{font-weight:700}` (becomes `#mooly-lp b,#mooly-lp strong{font-weight:700}` after scoping) to lock `<b>` at exactly 700 regardless of inherited weight → eliminates the `bolder`-could-be-900 edge entirely. Then re-run `scope-landing-css-transform.mjs`. Low value (no current regression) but removes ambiguity.
- [ ] **#2:** No change needed for buttons/links/inputs/img/svg/lists/tables — all explicitly styled.
- [ ] **#3 (verify visually):** Confirm `.seg .sl` slider & `.fa` max-height animations unaffected (pure JS-driven inline styles, not preflight-sensitive — not in scope of preflight family, flagged only for completeness).

## Open questions
1. Was the globals `h1-h6{font-weight:inherit}` fix intended to also benefit **non-landing** pages (blog/admin)? If yes it's correct; if it was solely for landing, note that landing never needed it (scoped rule already wins). Confirm desired scope.
2. Do you want fix #1 applied (lock `<b>`→700) for safety, or leave as-is since no regression is observable? (Recommend: leave as-is per YAGNI; apply only if a designer reports a heavy `<b>` somewhere.)
