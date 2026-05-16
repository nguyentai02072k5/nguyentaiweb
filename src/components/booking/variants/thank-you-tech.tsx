/**
 * Variant D3: Tech thank-you (new — phase 06 redesign 2026-05-14).
 *
 * AI-automation aesthetic:
 *   - Animated mesh gradient bg (3 blurred orbs drifting)
 *   - Tech grid overlay
 *   - Sonar pulse rings around checkmark
 *   - Glassmorphism card with gradient border
 *   - Light bg animations — không chói, không distract
 *
 * Uses framer-motion for smooth animations. All animations respect
 * `prefers-reduced-motion` via the motion library's defaults.
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MOCK_THANK_YOU } from '@/components/booking/_mock-data';

type ThankYouTechProps = {
  bookingId?: string;
  dateLabel?: string;
  timeRange?: string;
  phoneMask?: string;
};

/** ThankYouTech — accepts real props, falls back to MOCK for /booking preview. */
export function ThankYouTech({
  bookingId   = MOCK_THANK_YOU.bookingId,
  dateLabel   = MOCK_THANK_YOU.dateLabel,
  timeRange   = MOCK_THANK_YOU.timeRange,
  phoneMask   = MOCK_THANK_YOU.phoneMask,
}: ThankYouTechProps = {}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 shadow-2xl min-h-[520px]">
      {/* Tech grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,85,247,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Drifting gradient orbs */}
      <motion.div
        className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-indigo/30 blur-3xl"
        animate={{ x: [0, 30, -20, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-brand-pink/30 blur-3xl"
        animate={{ x: [0, -25, 15, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-violet/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Scanning line */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-cyan to-transparent"
        animate={{ y: [0, 520, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content card */}
      <div className="relative">
        {/* Corner brackets — tech HUD vibe */}
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />

        <div className="text-center pt-4 pb-2">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-brand-cyan/80 mb-6">
            ⬢ Booking confirmed
          </p>

          {/* Sonar checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-brand-violet"
              animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-brand-indigo"
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="relative grid place-items-center w-24 h-24 rounded-full bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink shadow-2xl shadow-brand-violet/50"
            >
              <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-14 h-14 stroke-white"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.polyline
                  points="20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                />
              </motion.svg>
            </motion.div>
          </div>

          <h3 className="font-display text-2xl font-bold text-white mb-2">
            Đã nhận lịch
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Tôi sẽ liên hệ Zalo xác nhận trong 24 giờ.
            <br />
            <span className="text-brand-cyan/80 font-mono text-xs mt-1 inline-block">
              ID: {bookingId.slice(0, 12)}…
            </span>
          </p>

          {/* Detail rows in glass panel */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4 mb-6 max-w-sm mx-auto">
            <TechRow icon="📅" label="DATE"     value={dateLabel} />
            <TechRow icon="🕒" label="TIME"     value={timeRange} />
            <TechRow icon="💻" label="PLATFORM" value="Google Meet" />
            <TechRow icon="📱" label="ZALO"     value={phoneMask} last />
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white font-display text-sm font-semibold hover:bg-white/10 hover:border-brand-violet transition"
          >
            Về trang chủ →
          </Link>

          <p className="mt-6 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            Powered by Tài AI Automation
          </p>
        </div>
      </div>
    </div>
  );
}

function TechRow({
  icon, label, value, last,
}: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-2 ${last ? '' : 'border-b border-white/[0.06]'}`}>
      <span className="text-base">{icon}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 w-16 text-left">
        {label}
      </span>
      <span className="flex-1 text-left text-sm text-slate-200 font-medium">{value}</span>
    </div>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const map = {
    tl: 'top-2 left-2 border-l-2 border-t-2',
    tr: 'top-2 right-2 border-r-2 border-t-2',
    bl: 'bottom-2 left-2 border-l-2 border-b-2',
    br: 'bottom-2 right-2 border-r-2 border-b-2',
  };
  return <span className={`pointer-events-none absolute ${map[pos]} border-brand-cyan/40 w-4 h-4`} />;
}
