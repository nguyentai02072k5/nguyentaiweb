/**
 * booking/types.ts — Domain types for the booking flow.
 *
 * Distinct from src/lib/supabase/database-types.ts (auto-gen row shapes).
 * These are business concepts shared between UI, API, and tests.
 */

// ---------------------------------------------------------------------------
// Enums (closed sets — TS narrows beyond DB `text` columns)
// ---------------------------------------------------------------------------

export const EXPECTATION_SLUGS = [
  'consult-24-7',
  'image-recognition',
  'close-order',
  'lead-capture',
  'other',
] as const;
export type ExpectationSlug = (typeof EXPECTATION_SLUGS)[number];

export const TIME_PERIODS = ['morning', 'midday', 'afternoon', 'evening', 'night'] as const;
export type TimePeriod = (typeof TIME_PERIODS)[number];

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'rescheduled'
  | 'cancelled'
  | 'completed'
  | 'no-show';

// ---------------------------------------------------------------------------
// Availability — what UI renders for date/slot pickers
// ---------------------------------------------------------------------------

export type DayAvailability = {
  /** ISO date `YYYY-MM-DD` in Asia/Ho_Chi_Minh */
  date: string;
  /** 0=Sun ... 6=Sat */
  dayOfWeek: number;
  /** Display label e.g. `T2 11/05` */
  label: string;
  isToday: boolean;
  /** Number of 30-min slots still bookable today */
  availableCount: number;
};

export type Slot = {
  /** Wall-clock display `HH:mm` in Asia/Ho_Chi_Minh */
  time: string;
  /** Absolute ISO instant for API call */
  iso: string;
  available: boolean;
  period: TimePeriod;
  /** Why unavailable (debug + UI hint) */
  reason?: 'past' | 'too-soon' | 'blocked-by-booking' | 'manual-block';
};

export type SlotsForDay = {
  date: string;
  slots: Slot[];
  /** Subset of `slots` curated for default display (≤5) */
  curatedPicks: string[];
};

// ---------------------------------------------------------------------------
// API contracts
// ---------------------------------------------------------------------------

export type BookingPayload = {
  phone_zalo: string;
  email?: string;
  full_name?: string;
  expectations: ExpectationSlug[];
  expectation_other?: string;
  consent_zalo: true;
  meeting_start_iso: string;
};

export type BookingCreated = {
  success: true;
  booking_id: string;
  meeting_start: string;
  meeting_end: string;
  phone_mask: string;
};

export type BookingError =
  | { success: false; error: 'slot-taken'; message: string }
  | { success: false; error: 'validation'; message: string; details?: unknown }
  | { success: false; error: 'server'; message: string };

export type BookingResponse = BookingCreated | BookingError;
