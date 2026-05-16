/**
 * /thank-you — Booking confirmation page (Server Component).
 *
 * Reads searchParams: booking_id, phone_mask, date, time
 * Validates required fields → redirect to / if booking_id missing.
 * Renders ThankYouContent client component with real data.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ThankYouContent } from './thank-you-content';

export const metadata: Metadata = {
  title: 'Đặt Lịch Thành Công',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  booking_id?: string;
  phone_mask?: string;
  date?: string;
  time?: string;
}>;

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  // booking_id is required — missing means user navigated here directly
  if (!params.booking_id) {
    redirect('/');
  }

  const bookingId = params.booking_id;
  const phoneMask = params.phone_mask ?? 'ẩn';
  const dateLabel = params.date ?? '';
  const timeRange = params.time ?? '';

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
      {/* Full-page tech grid (desktop only) — fades out toward edges via radial mask */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,85,247,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.7) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          WebkitMaskImage:
            'radial-gradient(ellipse 55% 65% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.4) 65%, transparent 90%)',
          maskImage:
            'radial-gradient(ellipse 55% 65% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.4) 65%, transparent 90%)',
        }}
      />
      {/* Soft blurred glow layer behind grid for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background:
            'radial-gradient(ellipse 50% 55% at center, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative w-full max-w-lg">
        <ThankYouContent
          bookingId={bookingId}
          phoneMask={phoneMask}
          dateLabel={dateLabel}
          timeRange={timeRange}
        />
      </div>
    </main>
  );
}
