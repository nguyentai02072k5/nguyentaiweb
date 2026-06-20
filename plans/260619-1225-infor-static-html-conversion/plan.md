# Infor Static HTML Conversion

## Context
- Source page: `src/app/infor/page.tsx`
- Component sources: `src/components/infor/**`, `src/lib/leads/**`
- Output: `public/infor-static/index.html`, `public/infor-static/styles.css`, `public/infor-static/script.js`

## Requirements
- Convert `/infor` landing page to standalone HTML/CSS/JS.
- Preserve current copy, layout, colors, spacing, modal flow, dynamic detail form, validation, and API payloads.
- Keep implementation dependency-light and readable.
- Do not change the existing Next.js route.

## Implementation Steps
1. Mirror page structure: hero, video, features, registration flow.
2. Translate Tailwind token styling into plain CSS custom properties/classes.
3. Port form state and config-driven detail form to vanilla JS.
4. Keep fetch calls compatible with `/api/infor/capture` and `/api/infor/submit`.
5. Validate file syntax and run project compile command if feasible.

## Success Criteria
- Static page renders without React/Next runtime.
- Basic form validates, posts capture, opens modal, then reveals detail form.
- Detail form changes sections by selected model, supports repeaters, validates required fields, and posts submit payload.
- Existing app still builds.

## Unresolved Questions
- None.
