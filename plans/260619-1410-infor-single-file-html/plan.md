# Infor Single-File HTML Export

## Context
- Source static version: `public/infor-static/`
- Output requested: `infor.html` at repository root.

## Requirements
- Create a separate self-contained HTML file outside the static target folder.
- Include CSS and JS inside the HTML file.
- Preserve the `/infor` landing content and visual style.
- Keep contact form compatible with GHL external tracking:
  - Native `<form>`.
  - `input type="email"`.
  - `input type="submit"`.
  - No iframe form.
  - No JS submit/click binding on the form or submit control.
- Include the external tracking script with tracking id.

## Success Criteria
- `infor.html` opens directly in browser.
- Form markup satisfies GHL auto-sync requirements.
- Inline JS has no syntax errors.

## Unresolved Questions
- None.
