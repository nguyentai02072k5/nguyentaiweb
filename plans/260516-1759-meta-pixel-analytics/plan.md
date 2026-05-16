# Meta Pixel Analytics Plan

## Status
- Complete

## Goal
- Install Meta Pixel ID `1658487875083016`.
- Track high-signal funnel events without sending personal data.
- Keep implementation small and aligned with Next.js App Router.

## Implementation
1. Add a typed Meta Pixel helper in `src/lib/analytics/`.
2. Add a client tracker component that loads the pixel once and sends `PageView` on route changes.
3. Mount tracker in `src/app/layout.tsx`.
4. Extend existing CTA tracking to also send Meta custom events.
5. Track booking funnel events:
   - booking section viewed
   - slot selected
   - mobile form step viewed
   - submit attempt
   - booking success as `Lead` and `Schedule`

## Validation
- Run `pnpm.cmd build`.
- Run `pnpm.cmd lint`.

## Notes
- Do not send phone, email, name, or booking ID to Meta Pixel.
- Use standard events only for strong signals; custom events for intent steps.

## Result
- `pnpm.cmd build` passed.
- `pnpm.cmd lint` passed with 1 unrelated warning in `.tmp/screenshot-mobile.mjs`.
