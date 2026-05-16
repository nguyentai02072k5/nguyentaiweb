# Project Changelog

## 2026-05-16

### Added
- Added Meta Conversions API server-side booking conversion dispatch.
- Added `Lead` and `Schedule` server events after successful booking creation.
- Added browser/server deduplication with booking-derived `eventID`.
- Added hashed Meta user data matching fields for email, phone, first name, last name, external ID, `_fbp`, `_fbc`, IP, and user agent.
- Documented Meta CAPI environment variables in `.env.local.example`.
- Added optional `META_CAPI_TEST_EVENT_CODE` support for Meta Events Manager testing.
- Installed Meta Pixel `1658487875083016` via Next.js `Script`.
- Added client-side `PageView` tracking for initial load and route changes.
- Added CTA click custom event tracking.
- Added booking funnel events: booking section view, day select, slot select, mobile form view, submit attempt, submit errors.
- Added successful booking conversion tracking with Meta standard `Lead` and `Schedule` events.

### Privacy
- Meta CAPI token is read from `META_CAPI_ACCESS_TOKEN`; real token is not stored in source code.
- Pixel events do not send phone, email, name, or booking ID.
