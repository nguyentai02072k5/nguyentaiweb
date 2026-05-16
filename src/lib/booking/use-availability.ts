/**
 * use-availability.ts — SWR hooks for booking availability API.
 *
 * Two hooks:
 *   useDays()          → GET /api/availability/days
 *   useSlots(date)     → GET /api/availability/slots?date=YYYY-MM-DD (skip if null)
 *
 * SWR config:
 *   - revalidateOnFocus: false  (availability changes slowly, not on tab switch)
 *   - dedupingInterval: 30s     (collocated renders share same request)
 *   - errorRetryCount: 2        (transient DB hiccups)
 */

'use client';

import useSWR from 'swr';
import type { DayAvailability, SlotsForDay } from '@/lib/booking/types';

// ---------------------------------------------------------------------------
// Types returned by the API
// ---------------------------------------------------------------------------

export type DaysResponse = {
  days: DayAvailability[];
  total_available: number;
  recent_bookings_24h: number;
};

export type UseDaysResult = {
  data: DayAvailability[] | undefined;
  stats: { total_available: number; recent_bookings_24h: number } | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
};

export type UseSlotsResult = {
  data: SlotsForDay | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
};

// ---------------------------------------------------------------------------
// Shared fetcher — throws on non-ok HTTP so SWR enters error state
// ---------------------------------------------------------------------------

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      (body as { message?: string }).message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  dedupingInterval: 30_000,
  errorRetryCount: 2,
} as const;

// ---------------------------------------------------------------------------
// useDays — next 7 available dates with slot counts + stats
// ---------------------------------------------------------------------------

export function useDays(): UseDaysResult {
  const { data, error, isLoading, mutate } = useSWR<DaysResponse>(
    '/api/availability/days',
    fetcher,
    SWR_OPTIONS,
  );

  return {
    data: data?.days,
    stats:
      data !== undefined
        ? {
            total_available: data.total_available,
            recent_bookings_24h: data.recent_bookings_24h,
          }
        : undefined,
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
}

// ---------------------------------------------------------------------------
// useSlots — slots for a specific HCM date (pass null to skip fetch)
// ---------------------------------------------------------------------------

export function useSlots(date: string | null): UseSlotsResult {
  const { data, error, isLoading, mutate } = useSWR<SlotsForDay>(
    date ? `/api/availability/slots?date=${date}` : null,
    fetcher,
    SWR_OPTIONS,
  );

  return {
    data,
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
}
