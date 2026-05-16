/**
 * Variant F1: Desktop unified ticket (2026-05-15).
 *
 * 1 horizontal big-ticket card chứa cả schedule (LEFT) + form (RIGHT).
 *   - Vertical dashed perforation @ 58% chia 2 nửa
 *   - 2 notches (semicircle r=12px) tại top + bottom edge @ 58%
 *   - Header bar full-width (brand · live · slot count)
 *   - Left  (58%): 7-day strip + 4-col slot grid + selected summary
 *   - Right (42%): contact form (phone / email / name / needs / consent / CTA)
 *
 * Aesthetic: tech / modern
 *   - Subtle 24px grid backdrop (4% opacity violet)
 *   - 4 corner brackets (L-shaped, brand color)
 *   - Drop-shadow follow masked silhouette
 *   - Mono/tabular-nums cho time & numbers
 */

'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Sparkles,
  Phone,
  Target,
  ShieldCheck,
  MessageCircle,
  Camera,
  ShoppingCart,
  PhoneCall,
  Pencil,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_DAYS,
  MOCK_SLOTS_BY_DAY,
  MOCK_EXPECTATIONS,
} from '@/components/booking/_mock-data';

// Map MOCK_EXPECTATIONS slug → Lucide icon (replaces emoji from mock data).
const EXP_ICON: Record<string, LucideIcon> = {
  'consult-24-7': MessageCircle,
  'image-recognition': Camera,
  'close-order': ShoppingCart,
  'lead-capture': PhoneCall,
  other: Pencil,
};

const TICKET_STYLE: CSSProperties = {
  // CSS vars consumed by .ticket-card mask + .ticket-perforation
  ['--ticket-stub-x' as string]: '58%',
  ['--ticket-notch-r' as string]: '12px',
  filter: 'drop-shadow(0 20px 40px rgba(99,102,241,0.12))',
};

export function DesktopTicket() {
  const days = MOCK_DAYS.slice(0, 7);
  const firstAvailable =
    days.find((d) => d.availableCount > 0)?.date ?? days[0].date;

  const [date, setDate] = useState(firstAvailable);
  const [slot, setSlot] = useState<{ iso: string; time: string } | null>(null);
  const [exps, setExps] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const ticketId = date.replaceAll('-', '').slice(2);

  const totalSlots = useMemo(
    () =>
      Object.values(MOCK_SLOTS_BY_DAY).reduce(
        (acc, s) => acc + s.filter((x) => x.available).length,
        0,
      ),
    [],
  );

  const dayData = days.find((d) => d.date === date);
  const slots =
    dayData?.availableCount === 0 ? [] : (MOCK_SLOTS_BY_DAY[date] ?? []);
  const availableNow = slots.filter((s) => s.available).length;

  const toggleExp = (slug: string) =>
    setExps((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  return (
    <div
      className="ticket-card relative rounded-[1.75rem] border-[1.5px] border-border-strong bg-white"
      style={TICKET_STYLE}
    >
      {/* 4 corner brackets — L-shape, top/bottom × left/right */}
      <CornerBracket pos="tl" />
      <CornerBracket pos="tr" />
      <CornerBracket pos="bl" />
      <CornerBracket pos="br" />

      {/* Header strip — deep midnight-cyan gradient (cool tech booklet binding).
          Subtle scanline overlay + cyan-tinted binding dots. */}
      <header
        className="relative flex items-center justify-between px-7 pt-5 pb-4 text-white overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(90deg, #0a1428 0%, #0d2236 30%, #0f2a3d 50%, #0d2236 70%, #0a1428 100%)',
        }}
      >
        {/* Subtle horizontal scanlines (tech detail) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(34, 211, 238, 0.6) 0px, rgba(34, 211, 238, 0.6) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* Binding-hole dots (perforation rows) — top + bottom */}
        <BindingDots position="top" />
        <BindingDots position="bottom" />

        <div className="relative flex items-center gap-3">
          <span className="grid place-items-center size-9 rounded-xl bg-cyan-400/10 backdrop-blur-sm border border-cyan-300/30 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <Calendar className="size-4" strokeWidth={2.4} />
          </span>
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-cyan-300/80 font-bold leading-none">
              ⬢ Booking Ticket · #M-{ticketId}
            </p>
            <p className="mt-1 font-display text-sm font-bold text-white leading-none">
              Đặt lịch Meet · Tài AI Automation
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-cyan-400/10 backdrop-blur-sm border border-cyan-300/35 text-cyan-200 text-[10px] font-display font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            ● Live
          </span>
          <span className="font-display text-xs text-slate-300">
            <span className="font-bold tabular-nums text-cyan-200">
              {totalSlots}
            </span>{' '}
            slot · 7 ngày
          </span>
        </div>
      </header>

      {/* Vertical dashed perforation between left/right */}
      <span
        aria-hidden
        className="pointer-events-none absolute w-0 border-l-[1.5px] border-dashed border-brand-violet/30"
        style={{ left: '58%', top: 82, bottom: 24 }}
      />

      <div className="grid grid-cols-[58%_42%]">
        {/* ============ LEFT: SCHEDULE ============ */}
        <div className="relative p-7 pr-9">
          {/* 24px grid backdrop — full LEFT column, kéo dài tới perforation
              (right edge của column @ 58%). Không fade-out. */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07] pointer-events-none text-brand-violet"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Wrap content in relative để nằm trên grid backdrop */}
          <div className="relative">
          <SectionHeader
            icon={<Sparkles className="size-3.5 text-brand-violet" strokeWidth={2.4} />}
            title="Chọn ngày"
            meta={`${days.length} ngày tới`}
          />
          <p className="mb-3 text-[11px] text-text-tertiary">
            Lock 7 ngày kể từ hôm nay · timezone Asia/Ho_Chi_Minh
          </p>

          {/* 7-day strip */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const isActive = date === day.date;
              const disabled = day.availableCount === 0;
              const [wd, datePart = ''] = day.label.split(' ');
              const [dn, mn] = datePart.split('/');
              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={disabled}
                  onClick={() => setDate(day.date)}
                  className={cn(
                    'group relative rounded-xl border-[1.5px] py-2.5 px-1 transition-all',
                    'flex flex-col items-center gap-0.5 select-none',
                    disabled &&
                      'opacity-40 cursor-not-allowed bg-surface-subtle/60 border-border-default',
                    !disabled &&
                      isActive &&
                      'border-brand-violet bg-gradient-to-b from-violet-50 to-white shadow-[0_4px_14px_rgba(168,85,247,0.18)] scale-[1.04]',
                    !disabled &&
                      !isActive &&
                      'border-border-default bg-white hover:border-brand-violet/45 hover:-translate-y-0.5',
                  )}
                >
                  {day.isToday && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-brand-indigo text-white font-display text-[8px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">
                      ✦ Today
                    </span>
                  )}
                  <span
                    className={cn(
                      'font-display font-bold uppercase tracking-[0.18em] text-[9px] leading-none',
                      isActive ? 'text-brand-violet' : 'text-text-tertiary',
                    )}
                  >
                    {wd}
                  </span>
                  <span
                    className={cn(
                      'font-display font-extrabold text-[22px] leading-none tabular-nums',
                      disabled
                        ? 'text-text-tertiary line-through'
                        : isActive
                          ? 'text-brand-indigo'
                          : 'text-text-primary',
                    )}
                  >
                    {dn}
                  </span>
                  <span
                    className={cn(
                      'font-display font-bold uppercase tracking-[0.12em] text-[8px] leading-none',
                      isActive ? 'text-brand-violet/70' : 'text-text-tertiary/80',
                    )}
                  >
                    Th {mn}
                  </span>
                  <span
                    className={cn(
                      'mt-1 px-1.5 py-0.5 rounded-full font-display text-[9px] font-bold tabular-nums leading-none',
                      disabled
                        ? 'bg-rose-50/60 text-rose-400'
                        : day.availableCount > 15
                          ? 'bg-emerald-50 text-emerald-700'
                          : day.availableCount > 5
                            ? 'bg-violet-50 text-brand-violet'
                            : 'bg-rose-50 text-rose-600',
                    )}
                  >
                    {disabled ? 'Hết' : day.availableCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slot grid */}
          <div className="mt-5">
            <SectionHeader
              icon={<Clock />}
              title="Chọn Giờ"
              meta={`${availableNow} slot · 30 phút`}
            />
            {slots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-default p-8 text-center bg-surface-subtle/50">
                <p className="font-display text-sm text-text-tertiary">
                  Ngày này đã hết slot. Vui lòng chọn ngày khác.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {slots.map((s) => {
                  const isPicked = slot?.iso === s.iso;
                  const blocked = !s.available;
                  return (
                    <button
                      key={s.iso}
                      type="button"
                      disabled={blocked}
                      onClick={() => setSlot({ iso: s.iso, time: s.time })}
                      className={cn(
                        'rounded-lg border-[1.5px] py-2 font-display font-bold text-sm tabular-nums transition-all',
                        blocked &&
                          'opacity-30 line-through cursor-not-allowed border-border-default bg-surface-subtle/50',
                        !blocked &&
                          !isPicked &&
                          'border-border-default bg-white text-text-primary hover:border-brand-violet/55 hover:bg-violet-50/40 hover:-translate-y-0.5',
                        !blocked &&
                          isPicked &&
                          'border-transparent bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink text-white shadow-md shadow-brand-violet/35 scale-[1.04]',
                      )}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected slot summary */}
          <AnimatePresence>
            {slot && dayData && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 rounded-xl border-[1.5px] border-brand-violet/40 bg-gradient-to-r from-violet-50/80 via-white to-indigo-50/60 p-3 flex items-center gap-3"
              >
                <span className="grid place-items-center size-9 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet text-white shadow-md">
                  <CheckCircle2 className="size-4" strokeWidth={2.4} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[10px] uppercase tracking-wider text-brand-violet font-bold leading-none mb-1">
                    Slot đã chọn
                  </p>
                  <p className="font-display text-sm font-bold text-text-primary leading-none truncate">
                    {dayData.label.replace(' ', ' · ')} ·{' '}
                    <span className="text-brand-indigo tabular-nums">{slot.time}</span>
                    <span className="text-text-tertiary font-normal"> (20&apos;)</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>{/* /relative content wrapper (sits above grid backdrop) */}
        </div>

        {/* ============ RIGHT: FORM (sectioned · C2 style) ============ */}
        <div className="relative p-7 pl-9 bg-gradient-to-b from-white via-violet-50/15 to-indigo-50/30 rounded-r-[1.75rem]">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-pink animate-pulse" />
            Thông Tin Booking
            <span className="ml-auto font-display text-[10px] font-bold tracking-wider text-text-tertiary uppercase">
              3 bước
            </span>
          </h3>

          <div className="space-y-2.5">
            {/* ====== Section 1: Liên hệ ====== */}
            <Section step="01" title="Liên Hệ" icon={Phone}>
              <div className="space-y-2.5">
                <Field label="SĐT Zalo" required hint="Tôi sẽ Zalo xác nhận lịch">
                  <input
                    type="tel"
                    placeholder="0xxx xxx xxx"
                    inputMode="tel"
                    className="w-full h-10 px-3 rounded-lg border-[1.5px] border-border-default bg-white text-sm focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 outline-none transition"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Email">
                    <input
                      type="email"
                      placeholder="email@…"
                      className="w-full h-10 px-3 rounded-lg border-[1.5px] border-border-default bg-white text-sm focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 outline-none transition"
                    />
                  </Field>
                  <Field label="Họ tên">
                    <input
                      type="text"
                      placeholder="A/C tên là…"
                      className="w-full h-10 px-3 rounded-lg border-[1.5px] border-border-default bg-white text-sm focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 outline-none transition"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* ====== Section 2: Nhu cầu ====== */}
            <Section step="02" title="Nhu Cầu" icon={Target} subtitle="Chọn 1 hoặc nhiều">
              <div className="grid grid-cols-1 gap-1.5">
                {MOCK_EXPECTATIONS.slice(0, 4).map((e) => {
                  const checked = exps.includes(e.slug);
                  const ExpIcon = EXP_ICON[e.slug] ?? Pencil;
                  return (
                    <label
                      key={e.slug}
                      className={cn(
                        'flex items-center gap-2.5 cursor-pointer rounded-lg border-[1.5px] px-2.5 py-1.5 transition-all',
                        checked
                          ? 'border-brand-violet bg-violet-50/70 shadow-sm shadow-brand-violet/15'
                          : 'border-border-default bg-white hover:border-brand-violet/40',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExp(e.slug)}
                        className="size-4 accent-brand-violet"
                      />
                      <ExpIcon
                        className={cn(
                          'size-4 shrink-0 transition-colors',
                          checked ? 'text-brand-violet' : 'text-text-secondary',
                        )}
                        strokeWidth={2.2}
                      />
                      <span className="font-display text-[12.5px] font-semibold text-text-primary leading-tight">
                        {e.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Section>

            {/* ====== Section 3: Xác nhận ====== */}
            <Section step="03" title="Xác Nhận" icon={ShieldCheck}>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 accent-brand-violet"
                />
                <span className="text-xs flex-1 leading-snug">
                  Tôi đồng ý nhận tin Zalo xác nhận lịch{' '}
                  <span className="text-brand-pink">*</span>
                </span>
              </label>
            </Section>

            {/* CTA + footer */}
            <button
              type="button"
              disabled={!slot || !consent}
              className={cn(
                'w-full h-12 rounded-xl font-display font-bold text-sm transition-all mt-1',
                slot && consent
                  ? 'bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-lg shadow-brand-violet/30 hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-surface-subtle text-text-tertiary cursor-not-allowed',
              )}
            >
              {!slot
                ? 'Chọn slot để tiếp tục'
                : !consent
                  ? 'Tick đồng ý để xác nhận'
                  : `Xác nhận booking · ${slot.time} →`}
            </button>
            <p className="text-center font-mono text-[10px] text-text-tertiary tracking-wide">
              Miễn phí · 20 phút · Google Meet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({
  icon,
  title,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
        <span className="-mt-0.5">{icon}</span>
        {title}
      </h3>
      <span className="font-display text-[11px] text-text-tertiary">{meta}</span>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-display text-[10.5px] font-bold uppercase tracking-wider text-text-primary mb-1">
        {label}{' '}
        {required && (
          <span className="text-brand-pink normal-case tracking-normal">*</span>
        )}
      </label>
      {children}
      {hint && (
        <p className="mt-0.5 text-[10px] text-text-tertiary leading-tight">
          ↳ {hint}
        </p>
      )}
    </div>
  );
}

// Section card (C2 style) — numbered step + icon + title + subtitle.
// Uses a tiny "step badge" chip on the left of header for tech vibe.
function Section({
  step,
  title,
  icon: Icon,
  subtitle,
  children,
}: {
  step: string;
  title: string;
  icon: LucideIcon;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-[1.5px] border-border-default bg-white/85 p-3 transition-colors hover:border-brand-violet/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="grid place-items-center min-w-7 h-5 px-1.5 rounded-md bg-gradient-to-br from-brand-indigo to-brand-violet text-white font-display font-bold text-[9px] tracking-widest tabular-nums shadow-sm">
          {step}
        </span>
        <Icon className="size-4 text-brand-violet" strokeWidth={2.2} />
        <h4 className="font-display font-bold text-[13px] uppercase tracking-wider text-text-primary leading-none">
          {title}
        </h4>
        {subtitle && (
          <span className="ml-auto text-[10px] text-text-tertiary font-normal leading-none">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// Binding-hole dots — row of small circles giả lò xo / perforation
// của cuốn lịch (gáy lịch treo tường).
function BindingDots({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 flex items-center justify-around px-10',
        position === 'top' ? 'top-1.5' : 'bottom-1.5',
      )}
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="size-1 rounded-full bg-cyan-300/40 shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),_0_0_4px_rgba(34,211,238,0.3)]"
        />
      ))}
    </div>
  );
}

// L-shaped corner bracket (cyberpunk hint).
// Top brackets sit on the dark gradient header → use white/50 for contrast.
// Bottom brackets sit on white body → use violet/55.
function CornerBracket({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const isTop = pos === 'tl' || pos === 'tr';
  const base = cn(
    'absolute size-3.5 pointer-events-none z-10',
    isTop ? 'text-cyan-300/60' : 'text-brand-violet/55',
  );
  const map: Record<typeof pos, string> = {
    tl: 'top-2.5 left-2.5 border-l-2 border-t-2 rounded-tl-md',
    tr: 'top-2.5 right-2.5 border-r-2 border-t-2 rounded-tr-md',
    bl: 'bottom-2.5 left-2.5 border-l-2 border-b-2 rounded-bl-md',
    br: 'bottom-2.5 right-2.5 border-r-2 border-b-2 rounded-br-md',
  };
  return <span aria-hidden className={cn(base, map[pos])} style={{ borderColor: 'currentColor' }} />;
}

// Lucide clock icon swap (avoid extra import dance)
function Clock() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      className="size-3.5 text-brand-violet"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
