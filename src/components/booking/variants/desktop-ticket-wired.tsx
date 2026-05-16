/**
 * desktop-ticket-wired.tsx — DesktopTicket wired to real API (SWR + form submit).
 *
 * Replaces MOCK_DAYS / MOCK_SLOTS_BY_DAY with useDays() + useSlots() hooks.
 * Uses BookingFormWired for form submit.
 *
 * States:
 *   - Loading: skeleton day chips + slot grid (animate-pulse)
 *   - Error:   inline retry button
 *   - Empty:   "Hết slot" message
 *   - Normal:  interactive ticket
 */

'use client';

import { useMemo, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Calendar, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDays, useSlots } from '@/lib/booking/use-availability';
import { BookingFormWired, type SelectedSlotInfo, type FormSuccessData } from '@/components/booking/booking-form-wired';
import { useRouter } from 'next/navigation';

const TICKET_STYLE: CSSProperties = {
  ['--ticket-stub-x' as string]: '58%',
  ['--ticket-notch-r' as string]: '12px',
};

export function DesktopTicketWired() {
  const router = useRouter();
  const { data: days, isLoading: daysLoading, error: daysError, mutate: mutateDays } = useDays();

  const firstAvailable = useMemo(
    () => days?.find((d) => d.availableCount > 0)?.date ?? days?.[0]?.date ?? null,
    [days],
  );

  const [date, setDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotInfo | null>(null);

  // Use firstAvailable as initial date when data loads (only once)
  const activeDate = date ?? firstAvailable;
  const ticketId = activeDate ? activeDate.replaceAll('-', '').slice(2) : 'LIVE';

  const { data: slotsData, isLoading: slotsLoading, error: slotsError, mutate: mutateSlots } = useSlots(activeDate);

  const slots = slotsData?.slots ?? [];
  const availableNow = slots.filter((s) => s.available).length;

  const dayData = days?.find((d) => d.date === activeDate);

  const totalSlots = useMemo(
    () => days?.reduce((acc, d) => acc + d.availableCount, 0) ?? 0,
    [days],
  );

  const handleSlotConflict = useCallback(() => {
    setSelectedSlot(null);
    void mutateDays();
    void mutateSlots();
  }, [mutateDays, mutateSlots]);

  const handleSuccess = useCallback(
    (data: FormSuccessData) => {
      const params = new URLSearchParams({
        booking_id: data.bookingId,
        phone_mask: data.phoneMask,
        date: data.dateLabel,
        time: data.timeRange,
      });
      router.push(`/thank-you?${params.toString()}`);
    },
    [router],
  );

  const handleDaySelect = (newDate: string) => {
    setDate(newDate);
    // Clear slot if changing to a different day
    if (selectedSlot && activeDate !== newDate) {
      setSelectedSlot(null);
    }
  };

  return (
    <div
      className="desktop-ticket-layer ticket-card relative rounded-[1.75rem] border-[1.5px] border-border-strong bg-white"
      style={TICKET_STYLE}
    >
      <CornerBracket pos="tl" />
      <CornerBracket pos="tr" />
      <CornerBracket pos="bl" />
      <CornerBracket pos="br" />

      {/* Header */}
      <header
        className="relative flex items-center justify-between px-7 pt-5 pb-4 text-white overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(90deg, #0a1428 0%, #0d2236 30%, #0f2a3d 50%, #0d2236 70%, #0a1428 100%)',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(34,211,238,0.6) 0px, rgba(34,211,238,0.6) 1px, transparent 1px, transparent 3px)',
          }}
        />
        <BindingDots position="top" />
        <BindingDots position="bottom" />

        <div className="relative flex items-center gap-3">
          <span className="grid place-items-center size-9 rounded-xl bg-cyan-400/10 border border-cyan-300/30 text-cyan-200">
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
          <span className="px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-300/35 text-cyan-200 text-[10px] font-display font-bold uppercase tracking-wider">
            ● Live
          </span>
          {!daysLoading && (
            <span className="font-display text-xs text-slate-300">
              <span className="font-bold tabular-nums text-cyan-200">{totalSlots}</span>{' '}
              slot · 7 ngày
            </span>
          )}
        </div>
      </header>

      {/* Vertical perforation */}
      <span
        aria-hidden
        className="pointer-events-none absolute w-0 border-l-[1.5px] border-dashed border-brand-violet/30"
        style={{ left: '58%', top: 82, bottom: 24 }}
      />

      <div className="grid grid-cols-[58%_42%]">
        {/* ===== LEFT: SCHEDULE ===== */}
        <div className="relative p-7 pr-9">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07] pointer-events-none text-brand-violet"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <SectionHeader
              icon={<Sparkles className="size-3.5 text-brand-violet" strokeWidth={2.4} />}
              title="Chọn ngày"
              meta={`${days?.length ?? 7} ngày tới`}
            />
            <p className="mb-3 text-[11px] text-text-tertiary">
              Lock 7 ngày kể từ hôm nay · timezone Asia/Ho_Chi_Minh
            </p>

            {/* Day strip — loading skeleton */}
            {daysLoading && (
              <div className="grid grid-cols-7 gap-1.5 mb-5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border-default bg-surface-subtle animate-pulse h-20"
                  />
                ))}
              </div>
            )}

            {/* Day strip — error */}
            {daysError && !daysLoading && (
              <div className="mb-5 rounded-xl border border-dashed border-rose-300 bg-rose-50/50 p-4 text-center">
                <p className="text-xs text-rose-600 mb-2">Không tải được lịch. Thử lại?</p>
                <button
                  type="button"
                  onClick={() => void mutateDays()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  <RefreshCw className="size-3" />
                  Thử lại
                </button>
              </div>
            )}

            {/* Day strip — data */}
            {!daysLoading && !daysError && days && days.length > 0 && (
              <div className="grid grid-cols-7 gap-1.5">
                {days.slice(0, 7).map((day) => {
                  const isActive = activeDate === day.date;
                  const disabled = day.availableCount === 0;
                  const [wd, datePart = ''] = day.label.split(' ');
                  const [dn, mn] = datePart.split('/');
                  return (
                    <button
                      key={day.date}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDaySelect(day.date)}
                      aria-label={`Chọn ngày ${day.label}, còn ${day.availableCount} slot`}
                      aria-pressed={isActive}
                      className={cn(
                        'group relative rounded-xl border-[1.5px] py-2.5 px-1 transition-all',
                        'flex flex-col items-center gap-0.5 select-none',
                        disabled && 'opacity-40 cursor-not-allowed bg-surface-subtle/60 border-border-default',
                        !disabled && isActive && 'border-brand-violet bg-violet-50',
                        !disabled && !isActive && 'border-border-default bg-white hover:border-brand-violet/45 hover:bg-violet-50/40',
                      )}
                    >
                      {day.isToday && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-brand-indigo text-white font-display text-[8px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">
                          ✦ Today
                        </span>
                      )}
                      <span className={cn('font-display font-bold uppercase tracking-[0.18em] text-[9px] leading-none', isActive ? 'text-brand-violet' : 'text-text-tertiary')}>
                        {wd}
                      </span>
                      <span className={cn('font-display font-extrabold text-[22px] leading-none tabular-nums', disabled ? 'text-text-tertiary line-through' : isActive ? 'text-brand-indigo' : 'text-text-primary')}>
                        {dn}
                      </span>
                      <span className={cn('font-display font-bold uppercase tracking-[0.12em] text-[8px] leading-none', isActive ? 'text-brand-violet/70' : 'text-text-tertiary/80')}>
                        Th {mn}
                      </span>
                      <span className={cn('mt-1 px-1.5 py-0.5 rounded-full font-display text-[9px] font-bold tabular-nums leading-none', disabled ? 'bg-rose-50/60 text-rose-400' : day.availableCount > 15 ? 'bg-emerald-50 text-emerald-700' : day.availableCount > 5 ? 'bg-violet-50 text-brand-violet' : 'bg-rose-50 text-rose-600')}>
                        {disabled ? 'Hết' : day.availableCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Slot grid */}
            <div className="mt-5">
              <SectionHeader
                icon={<ClockIcon />}
                title="Chọn Giờ"
                meta={`${availableNow} slot · 30 phút`}
              />

              {/* Slots loading skeleton */}
              {slotsLoading && activeDate && (
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-border-default bg-surface-subtle animate-pulse h-9" />
                  ))}
                </div>
              )}

              {/* Slots error */}
              {slotsError && !slotsLoading && (
                <div className="rounded-xl border border-dashed border-rose-300 bg-rose-50/50 p-4 text-center">
                  <p className="text-xs text-rose-600 mb-2">Không tải được slot. Thử lại?</p>
                  <button
                    type="button"
                    onClick={() => void mutateSlots()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <RefreshCw className="size-3" />
                    Thử lại
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!slotsLoading && !slotsError && activeDate && slots.length === 0 && (
                <div className="rounded-xl border border-dashed border-border-default p-8 text-center bg-surface-subtle/50">
                  <p className="font-display text-sm text-text-tertiary">
                    Ngày này đã hết slot. Vui lòng chọn ngày khác.
                  </p>
                </div>
              )}

              {/* Slot grid — data */}
              {!slotsLoading && !slotsError && slots.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map((s) => {
                    const isPicked = selectedSlot?.iso === s.iso;
                    const blocked = !s.available;
                    return (
                      <button
                        key={s.iso}
                        type="button"
                        disabled={blocked}
                        onClick={() => setSelectedSlot({ iso: s.iso, time: s.time, dateLabel: dayData?.label ?? '' })}
                        aria-label={`Đặt giờ ${s.time} ngày ${dayData?.label ?? ''}`}
                        aria-pressed={isPicked}
                        className={cn(
                          'rounded-lg border-[1.5px] py-2 font-display font-bold text-sm tabular-nums transition-all',
                          blocked && 'opacity-30 line-through cursor-not-allowed border-border-default bg-surface-subtle/50',
                          !blocked && !isPicked && 'border-border-default bg-white text-text-primary hover:border-brand-violet/55 hover:bg-violet-50/40',
                          !blocked && isPicked && 'border-brand-violet bg-brand-violet text-white',
                        )}
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected summary */}
            {selectedSlot && dayData && (
                <div
                  className="mt-5 rounded-xl border-[1.5px] border-brand-violet/35 bg-violet-50/70 p-3 flex items-center gap-3"
                  aria-live="polite"
                >
                  <span className="grid place-items-center size-9 rounded-lg bg-brand-violet text-white">
                    <CheckCircle2 className="size-4" strokeWidth={2.4} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[10px] uppercase tracking-wider text-brand-violet font-bold leading-none mb-1">
                      Slot đã chọn
                    </p>
                    <p className="font-display text-sm font-bold text-text-primary leading-none truncate">
                      {dayData.label.replace(' ', ' · ')} ·{' '}
                      <span className="text-brand-indigo tabular-nums">{selectedSlot.time}</span>
                      <span className="text-text-tertiary font-normal"> (20&apos;)</span>
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* ===== RIGHT: FORM ===== */}
        <div className="relative p-7 pl-9 bg-gradient-to-b from-white via-violet-50/15 to-indigo-50/30 rounded-r-[1.75rem]">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-pink animate-pulse" />
            Thông tin booking
            <span className="ml-auto font-display text-[10px] font-bold tracking-wider text-text-tertiary uppercase">
              3 bước
            </span>
          </h3>

          <BookingFormWired
            selectedSlot={selectedSlot}
            onSuccess={handleSuccess}
            onSlotConflict={handleSlotConflict}
            layout="desktop"
          />

          <p className="text-center font-mono text-[10px] text-text-tertiary tracking-wide mt-2">
            Miễn phí · 20 phút · Google Meet
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (shared with original desktop-ticket aesthetic)
// ---------------------------------------------------------------------------

function SectionHeader({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
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

function BindingDots({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 flex items-center justify-around px-10', position === 'top' ? 'top-1.5' : 'bottom-1.5')}>
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="size-1 rounded-full bg-cyan-300/40 shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),_0_0_4px_rgba(34,211,238,0.3)]" />
      ))}
    </div>
  );
}

function CornerBracket({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const isTop = pos === 'tl' || pos === 'tr';
  const base = cn('absolute size-3.5 pointer-events-none z-10', isTop ? 'text-cyan-300/60' : 'text-brand-violet/55');
  const map: Record<typeof pos, string> = {
    tl: 'top-2.5 left-2.5 border-l-2 border-t-2 rounded-tl-md',
    tr: 'top-2.5 right-2.5 border-r-2 border-t-2 rounded-tr-md',
    bl: 'bottom-2.5 left-2.5 border-l-2 border-b-2 rounded-bl-md',
    br: 'bottom-2.5 right-2.5 border-r-2 border-b-2 rounded-br-md',
  };
  return <span aria-hidden className={cn(base, map[pos])} style={{ borderColor: 'currentColor' }} />;
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="size-3.5 text-brand-violet">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
