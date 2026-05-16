# Meta Conversions API Plan

## Status
- Complete

## Goal
- Send server-side Meta Conversions API events for real booking conversions.
- Improve match quality with hashed user data and browser click cookies.
- Keep the access token out of source code.

## Implementation
1. Add server-only CAPI helper in `src/lib/analytics/`.
2. Send `Lead` and `Schedule` after `/api/book` creates a booking.
3. Use `booking_id`-derived event IDs for browser/server deduplication.
4. Include hashed `em`, `ph`, `fn`, `ln`, plus `fbp`, `fbc`, IP, user agent, and source URL.
5. Document required env vars in `.env.local.example`.

## Validation
- `pnpm.cmd build` passed.
- `pnpm.cmd lint` passed with 1 unrelated warning in `.tmp/screenshot-mobile.mjs`.

## Security
- Do not commit the real Meta CAPI access token.
- Do not send raw phone, email, name, or booking ID in event custom data.
