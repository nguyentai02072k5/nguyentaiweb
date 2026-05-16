/**
 * thank-you-content.tsx — Client component for /thank-you page.
 *
 * Receives validated booking data as props from the Server Component parent.
 * Renders ThankYouTech variant with real booking data (no MOCK).
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Hexagon,
  MessageCircle,
  Smartphone,
  Video,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Ripple } from '@/components/ui/ripple';

type Props = {
  bookingId: string;
  dateLabel: string;
  timeRange: string;
  phoneMask: string;
};

export function ThankYouContent({ bookingId, dateLabel, timeRange, phoneMask }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 shadow-2xl min-h-[520px]">
      {/* Tech grid backdrop (mobile only — desktop uses full-page grid from page.tsx) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] md:hidden"
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
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{ y: [0, 520, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className="relative">
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />

        <div className="flex flex-col items-center text-center pt-4 pb-2">
          {/* "Booking confirmed" — above icon, centered */}
          <p className="font-display text-[11px] uppercase tracking-[0.32em] text-cyan-400/90 mb-4 inline-flex items-center justify-center gap-2">
            <Hexagon className="w-3.5 h-3.5" strokeWidth={2} />
            Booking confirmed
          </p>

          {/* Ripple checkmark — 1.5x larger, centered via flex parent */}
          <div className="relative flex h-44 w-44 items-center justify-center mb-4 text-brand-violet">
            <Ripple
              mainCircleSize={180}
              mainCircleOpacity={0.28}
              numCircles={6}
              className="[mask-image:radial-gradient(circle_at_center,black_30%,transparent_75%)]"
            />

            {/* Soft glow halo — continuous pulse behind gradient circle */}
            <motion.span
              aria-hidden
              className="absolute h-36 w-36 rounded-full bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink blur-2xl"
              initial={{ scale: 0.9, opacity: 0.35 }}
              animate={{ scale: [0.95, 1.18, 0.95], opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Ring pulse — crisp outer ring expanding rhythmically */}
            <motion.span
              aria-hidden
              className="absolute h-36 w-36 rounded-full ring-2 ring-brand-violet/60"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
            />

            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{
                scale: [1, 1.06, 1],
                rotate: 0,
              }}
              transition={{
                scale: {
                  duration: 2.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.6,
                },
                rotate: { type: 'spring', stiffness: 200, damping: 14 },
              }}
              className="relative grid place-items-center w-36 h-36 rounded-full bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink shadow-2xl shadow-brand-violet/50"
            >
              <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-[5.25rem] h-[5.25rem] stroke-white"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.polyline
                  points="4 12 9 17 20 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                />
              </motion.svg>
            </motion.div>
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-2">
            Đã Nhận Lịch Meet!
          </h1>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Tôi sẽ liên hệ Zalo xác nhận trong 24 giờ.
            <br />
            <span className="text-cyan-400/80 font-mono text-xs mt-1 inline-block">
              ID: {bookingId.slice(0, 12)}…
            </span>
          </p>

          {/* Detail rows */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4 mb-6 max-w-sm mx-auto text-left">
            <TechRow icon={<CalendarDays className="w-4 h-4 text-cyan-400/80" />} label="DATE"     value={dateLabel} />
            <TechRow icon={<Clock        className="w-4 h-4 text-cyan-400/80" />} label="TIME"     value={timeRange} />
            <TechRow icon={<Video        className="w-4 h-4 text-cyan-400/80" />} label="PLATFORM" value="Google Meet" />
            <TechRow icon={<Smartphone   className="w-4 h-4 text-cyan-400/80" />} label="ZALO"     value={phoneMask} last />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Primary CTA — PulsatingButton style via CSS */}
            <Link
              href="/"
              className="relative inline-flex items-center gap-2 h-11 px-6 rounded-xl font-display text-sm font-semibold text-white
                         bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink
                         shadow-lg shadow-brand-violet/30
                         hover:scale-[1.02] active:scale-[0.98] transition-transform
                         pulsating-btn"
            >
              Quay về trang chủ
            </Link>

            {/* Secondary — Zalo direct contact */}
            <a
              href="https://zalo.me/0345324467"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white font-display text-sm font-semibold hover:bg-white/10 hover:border-brand-violet transition"
            >
              <MessageCircle className="w-4 h-4" />
              Liên hệ Zalo Ngay
            </a>
          </div>

          <p className="mt-6 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            Powered by Tài AI Automation
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TechRow({
  icon, label, value, last,
}: { icon: ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-2 ${last ? '' : 'border-b border-white/[0.06]'}`}>
      <span className="inline-flex items-center justify-center w-5 shrink-0">{icon}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 w-16 shrink-0">
        {label}
      </span>
      <span className="flex-1 text-sm text-slate-200 font-medium">{value}</span>
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
  return (
    <span className={`pointer-events-none absolute ${map[pos]} border-cyan-400/40 w-4 h-4`} />
  );
}
