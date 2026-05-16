/**
 * Variant E1m: Unified schedule (REDESIGN v5 2026-05-15).
 *
 * Feedback iteration:
 *   v1-v3 — layout tinkering (slot list → period accordion → flat 4-col grid)
 *   v4    — ticket aesthetic (notches + perforation)
 *   v5    — natural flow for embed (bỏ internal scroll + sticky header/CTA),
 *           widget grows tự nhiên trong landing-page section
 *
 * Layout (collapsed):
 *   pl-3 | stub 60px (weekday/day/month) | perforation @80px | body 1fr | meta auto
 *
 * Heights (~total ≈ 760px with default-open firstAvailable day):
 *   header 60px + (6 collapsed × 64px) + (1 expanded × 290px) + gaps 48px + CTA 96px
 *
 * Ticket shape applied via `.ticket-card` (mask-image 2 radial notches).
 * Shadow via filter:drop-shadow để theo masked silhouette.
 */

'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
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
import type { Slot } from '@/lib/booking/types';

// Slug → Lucide icon map (replaces emoji from MOCK data).
const EXP_ICON: Record<string, LucideIcon> = {
  'consult-24-7': MessageCircle,
  'image-recognition': Camera,
  'close-order': ShoppingCart,
  'lead-capture': PhoneCall,
  other: Pencil,
};

export function UnifiedScheduleMobile() {
  const days = MOCK_DAYS.slice(0, 7);
  const firstAvailable = days.find((d) => d.availableCount > 0)?.date ?? days[0].date;

  const [openDate, setOpenDate] = useState<string>(firstAvailable);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    iso: string;
    time: string;
  } | null>(null);
  const [exps, setExps] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  // 2-step wizard state (dot pagination).
  // dir tracks animation direction: +1 forward, -1 back.
  const [step, setStep] = useState<'schedule' | 'form'>('schedule');
  const [dir, setDir] = useState<1 | -1>(1);
  const goForward = () => {
    setDir(1);
    setStep('form');
  };
  const goBack = () => {
    setDir(-1);
    setStep('schedule');
  };

  const toggleExp = (slug: string) =>
    setExps((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  const dayData = useMemo(
    () =>
      days.map((day) => {
        const allSlots = MOCK_SLOTS_BY_DAY[day.date] ?? [];
        // Respect MOCK day-level override (availableCount=0 → simulate "Hết slot")
        const slots = day.availableCount === 0 ? [] : allSlots;
        const availableCount = slots.filter((s) => s.available).length;
        const earliest = slots.find((s) => s.available)?.time ?? null;
        return { day, slots, earliest, availableCount };
      }),
    [days],
  );

  return (
    <div className="bg-gradient-to-b from-violet-100/70 via-violet-50/40 to-indigo-100/50">
      {/* Header — natural flow, NOT sticky (embed widget) */}
      <header className="px-4 pt-4 pb-3 border-b border-border-default bg-white/70">
        <div className="flex items-center justify-between mb-1">
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-brand-violet font-semibold">
            ⬢ Đặt lịch Meet
          </p>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-display font-semibold uppercase tracking-wider">
            ● Live
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-text-primary leading-tight flex-1 min-w-0">
            {step === 'schedule'
              ? `7 ngày tới · ${dayData.reduce((a, d) => a + d.availableCount, 0)} slot trống`
              : 'Thông Tin Liên Hệ'}
          </h2>
          {/* 2-dot pagination indicator */}
          <DotIndicator step={step} />
        </div>
      </header>

      {/* ===== 2-step wizard body — slide left/right giữa schedule & form ===== */}
      <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false} custom={dir}>
      {step === 'schedule' && (
      <motion.div
        key="schedule"
        custom={dir}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
      {/* Day list — natural flow, NO internal scroll */}
      <div>
        <div className="px-4 pt-3 pb-3 space-y-2">
          {dayData.map(({ day, slots, earliest, availableCount }) => {
            const isOpen = openDate === day.date;
            const disabled = availableCount === 0;
            const selected = selectedSlot?.date === day.date;
            const compact = !isOpen && !selected && !day.isToday;
            const [weekday, datePart = ''] = day.label.split(' ');
            const [dateNumber] = datePart.split('/');

            const dropShadow = disabled
              ? 'none'
              : selected
                ? 'drop-shadow(0 14px 26px rgba(168,85,247,0.22))'
                : isOpen
                  ? 'drop-shadow(0 10px 22px rgba(99,102,241,0.14))'
                  : 'drop-shadow(0 4px 10px rgba(99,102,241,0.07))';

            const perforationColor = selected
              ? 'text-brand-violet/55'
              : isOpen
                ? 'text-brand-violet/40'
                : 'text-border-strong';

            return (
              <motion.div
                layout
                key={day.date}
                transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
                style={{ filter: dropShadow }}
                className="relative"
              >
                <div
                  className={cn(
                    'ticket-card rounded-[1.25rem] border-[1.5px] transition-[background-color,border-color,opacity] duration-300',
                    disabled ? 'border-border-strong bg-surface-subtle/70 opacity-60' :
                    selected ? 'border-brand-violet bg-white' :
                    isOpen ? 'border-brand-violet/65 bg-white' :
                    'border-border-strong bg-white',
                  )}
                >
                  {/* Vertical dashed perforation between date stub & body.
                      Height locked to ~button area only — doesn't extend down
                      into the time-grid panel when expanded. */}
                  <span
                    aria-hidden
                    className={cn('ticket-perforation', perforationColor)}
                    style={{ bottom: 'auto', height: 56 }}
                  />

                  {/* Day row — grid: [stub 60px | body 1fr | meta auto] */}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpenDate(isOpen ? '' : day.date)}
                    aria-expanded={isOpen}
                    className={cn(
                      'relative w-full grid items-center gap-3 text-left rounded-[1.25rem]',
                      'grid-cols-[60px_minmax(0,1fr)_auto]',
                      'py-2 pl-3 pr-3',
                      !disabled && 'active:bg-violet-50/40',
                    )}
                  >
                    {/* === Ticket stub: weekday / day (always 2-line, ko đổi
                        chiều cao khi mở rộng → giữ button height đồng nhất). */}
                    <div className="flex flex-col items-center justify-center select-none">
                      <span
                        className={cn(
                          'font-display font-bold uppercase tracking-[0.18em] leading-none text-[10px]',
                          selected ? 'text-brand-violet/75' :
                          isOpen ? 'text-brand-indigo/80' :
                          'text-text-tertiary',
                        )}
                      >
                        {weekday}
                      </span>
                      <span
                        className={cn(
                          'mt-1 font-display font-extrabold leading-none tabular-nums text-[22px]',
                          selected ? 'text-brand-violet' :
                          isOpen ? 'text-brand-indigo' :
                          'text-text-primary',
                        )}
                      >
                        {dateNumber}
                      </span>
                    </div>

                    {/* === Body === */}
                    <div className="min-w-0 pl-3">
                      {(day.isToday || selected) && (
                        <div className="mb-1 flex items-center gap-1.5">
                          {day.isToday && <TodayShinyBadge />}
                          {selected && (
                            <span className="rounded-full bg-violet-50 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-brand-violet">
                              Đã chọn
                            </span>
                          )}
                        </div>
                      )}
                      <p
                        className={cn(
                          'truncate font-display font-bold leading-tight text-text-primary',
                          compact ? 'text-[13px]' : 'text-sm',
                        )}
                      >
                        {selected
                          ? `Đã chọn ${selectedSlot?.time}`
                          : disabled
                            ? 'Hết slot'
                            : `${availableCount} slot từ ${earliest}`}
                      </p>
                      {!compact && (
                        <p className="mt-1 truncate text-[11px] leading-tight text-text-tertiary">
                          {selected
                            ? 'Tap để đổi giờ'
                            : disabled
                              ? 'Chọn ngày khác'
                              : isOpen ? 'Chọn giờ bên dưới' : 'Tap để xem giờ'}
                        </p>
                      )}
                    </div>

                    {/* === Meta (count + chevron) === */}
                    {!disabled ? (
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 font-display text-[10px] font-bold tabular-nums',
                            availableCount > 15 ? 'bg-emerald-50 text-emerald-700' :
                            availableCount > 5 ? 'bg-violet-50 text-brand-violet' :
                            'bg-rose-50 text-rose-600',
                          )}
                        >
                          {availableCount}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className={cn(
                            'grid place-items-center rounded-full border bg-white text-brand-violet shadow-sm',
                            compact ? 'size-5' : 'size-6',
                            isOpen ? 'border-brand-violet/30' : 'border-border-default',
                          )}
                        >
                          <ChevronDown className={compact ? 'size-3' : 'size-3.5'} strokeWidth={2.4} />
                        </motion.span>
                      </div>
                    ) : (
                      <span className="rounded-full bg-white/70 px-2 py-1 font-display text-[10px] font-bold text-text-tertiary">
                        0
                      </span>
                    )}
                  </button>

                  {/* Expanded — full time grid (no period grouping) */}
                  <AnimatePresence initial={false}>
                    {isOpen && !disabled && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-2 bg-white">
                          <TimeGrid
                            slots={slots}
                            selectedIso={selectedSlot?.iso ?? null}
                            onSelect={(slot) =>
                              setSelectedSlot({ date: day.date, iso: slot.iso, time: slot.time })
                            }
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      </motion.div>
      )}

      {step === 'form' && (
      <motion.div
        key="form"
        custom={dir}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
      {/* ===== Form section (C2 sectioned · 3 cards) ·
            Dùng font-body (Be Vietnam Pro) cho mềm/humanist hơn font-display
            (Space Grotesk) — form input vibe thay vì heading vibe. */}
      <div className="px-4 pt-4 pb-3 space-y-2.5 bg-white/60 font-body">
        <h3 className="text-[12px] font-semibold tracking-wide text-text-primary flex items-center gap-2 mb-1">
          <span className="size-1.5 rounded-full bg-brand-pink animate-pulse" />
          Thông tin booking
          <span className="ml-auto text-[10px] font-medium text-text-tertiary">
            3 bước
          </span>
        </h3>

        {/* Section 1: Liên hệ */}
        <Section step="01" title="Liên Hệ" icon={Phone}>
          <div className="space-y-2">
            <Field label="SĐT Zalo" required hint="Tôi sẽ Zalo xác nhận lịch">
              <input
                type="tel"
                inputMode="tel"
                placeholder="0xxx xxx xxx"
                className="w-full h-10 px-3 rounded-md border-[1.5px] border-border-default bg-white text-sm focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 outline-none transition"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Email">
                <input
                  type="email"
                  placeholder="email@…"
                  className="w-full h-10 px-3 rounded-md border-[1.5px] border-border-default bg-white text-[13px] focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 outline-none transition"
                />
              </Field>
              <Field label="Họ tên">
                <input
                  type="text"
                  placeholder="A/C tên là…"
                  className="w-full h-10 px-3 rounded-md border-[1.5px] border-border-default bg-white text-[13px] focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 outline-none transition"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Section 2: Nhu cầu — giãn rộng hơn (gap-2.5 + py-2.5) cho thoáng */}
        <Section step="02" title="Nhu Cầu" icon={Target} subtitle="Chọn 1 hoặc nhiều">
          <div className="grid grid-cols-1 gap-2 mt-0.5">
            {MOCK_EXPECTATIONS.slice(0, 4).map((e) => {
              const checked = exps.includes(e.slug);
              const ExpIcon = EXP_ICON[e.slug] ?? Pencil;
              return (
                <label
                  key={e.slug}
                  className={cn(
                    'flex items-center gap-3 cursor-pointer rounded-md border-[1.5px] px-3 py-2.5 transition-all',
                    checked
                      ? 'border-brand-violet bg-violet-50/70 shadow-sm shadow-brand-violet/15'
                      : 'border-border-default bg-white active:bg-violet-50/40',
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
                    strokeWidth={2}
                  />
                  <span className="text-[13px] font-medium text-text-primary leading-snug">
                    {e.label}
                  </span>
                </label>
              );
            })}
          </div>
        </Section>

        {/* Section 3: Xác nhận */}
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
      </div>
      </motion.div>
      )}
      </AnimatePresence>
      </div>

      {/* ===== CTA — sticky bottom (đổi label & buttons theo step) ===== */}
      <div className="sticky bottom-0 z-10 px-3 pt-2 pb-2.5 border-t border-border-default bg-white/95 backdrop-blur-md shadow-[0_-6px_18px_rgba(168,85,247,0.06)]">
        {step === 'schedule' ? (
          // STEP 1 → 1 button "Tiếp tục"
          <button
            type="button"
            disabled={!selectedSlot}
            onClick={goForward}
            className={cn(
              'w-full h-11 rounded-xl font-display font-bold text-[13.5px] transition-all',
              selectedSlot
                ? 'bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-md shadow-brand-violet/25 active:scale-[0.98]'
                : 'bg-surface-subtle text-text-tertiary cursor-not-allowed',
            )}
          >
            {selectedSlot
              ? `Tiếp tục · ${selectedSlot.time} →`
              : 'Chọn ngày + giờ để tiếp tục'}
          </button>
        ) : (
          // STEP 2 → 2 buttons "Quay lại" + "Xác nhận"
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <button
              type="button"
              onClick={goBack}
              className="h-11 px-4 rounded-xl border-[1.5px] border-border-strong bg-white font-display font-bold text-[13.5px] text-text-secondary active:bg-surface-subtle transition-all"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              disabled={!consent}
              className={cn(
                'h-11 rounded-xl font-display font-bold text-[13.5px] transition-all',
                consent
                  ? 'bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-md shadow-brand-violet/25 active:scale-[0.98]'
                  : 'bg-surface-subtle text-text-tertiary cursor-not-allowed',
              )}
            >
              {consent ? `Xác nhận · ${selectedSlot?.time} →` : 'Tick đồng ý để xác nhận'}
            </button>
          </div>
        )}
        <p className="text-center text-[9.5px] text-text-tertiary mt-1.5 leading-none">
          Miễn phí · 20 phút · Google Meet
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide variants (left/right wizard transitions)
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

// ---------------------------------------------------------------------------
// DotIndicator — 2 chấm pagination ở header (active = brand-violet pill)
// ---------------------------------------------------------------------------

function DotIndicator({ step }: { step: 'schedule' | 'form' }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0" aria-label="Tiến trình booking">
      <span
        className={cn(
          'rounded-full transition-all duration-300',
          step === 'schedule'
            ? 'w-5 h-1.5 bg-gradient-to-r from-brand-indigo to-brand-violet'
            : 'w-1.5 h-1.5 bg-border-strong',
        )}
        aria-current={step === 'schedule' ? 'step' : undefined}
      />
      <span
        className={cn(
          'rounded-full transition-all duration-300',
          step === 'form'
            ? 'w-5 h-1.5 bg-gradient-to-r from-brand-violet to-brand-pink'
            : 'w-1.5 h-1.5 bg-border-strong',
        )}
        aria-current={step === 'form' ? 'step' : undefined}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section card (C2 style) — step badge + Lucide icon + title + subtitle.
// ---------------------------------------------------------------------------

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
    <div className="rounded-md border-[1.5px] border-border-default bg-white p-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="grid place-items-center min-w-6 h-4 px-1 rounded-sm bg-gradient-to-br from-brand-indigo to-brand-violet text-white font-display font-bold text-[8.5px] tracking-widest tabular-nums shadow-sm">
          {step}
        </span>
        <Icon className="size-4 text-brand-violet" strokeWidth={2} />
        <h4 className="text-[12.5px] font-semibold uppercase tracking-wide text-text-primary leading-none">
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
      <label className="block text-[10.5px] font-semibold uppercase tracking-wide text-text-secondary mb-1.5">
        {label}{' '}
        {required && (
          <span className="text-brand-pink normal-case tracking-normal">*</span>
        )}
      </label>
      {children}
      {hint && (
        <p className="mt-0.5 text-[9.5px] text-text-tertiary leading-tight">
          ↳ {hint}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TodayShinyBadge — gradient pill with periodic shine sweep
// ---------------------------------------------------------------------------

function TodayShinyBadge() {
  return (
    <span className="relative inline-flex items-center overflow-hidden rounded-md px-1.5 py-0.5 bg-gradient-to-r from-brand-indigo/15 via-brand-violet/20 to-brand-indigo/15 border border-brand-indigo/25 shadow-sm">
      <span className="relative z-10 font-display text-[9px] font-bold uppercase tracking-wider text-brand-indigo">
        ✦ Hôm nay
      </span>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
        animate={{ x: ['-150%', '350%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// TimeGrid — flat 4-col grid, no period grouping, all 30-min slots visible
// ---------------------------------------------------------------------------

function TimeGrid({
  slots, selectedIso, onSelect,
}: {
  slots: Slot[];
  selectedIso: string | null;
  onSelect: (slot: Slot) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {slots.map((slot) => {
        const isSelected = selectedIso === slot.iso;
        const disabled = !slot.available;
        return (
          <button
            key={slot.iso}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(slot)}
            aria-pressed={isSelected}
            className={cn(
              'rounded-lg border min-h-[36px] px-1 font-display font-semibold text-[13px] transition-all tabular-nums',
              disabled && 'cursor-not-allowed opacity-25 line-through bg-surface-subtle/30 border-border-default',
              !disabled && !isSelected && 'border-border-default bg-white text-text-primary active:scale-[0.96] active:bg-violet-50',
              !disabled && isSelected && 'border-transparent bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink text-white shadow shadow-brand-violet/30 scale-[1.04]',
            )}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
