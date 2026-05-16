/**
 * unified-schedule-mobile-wired.tsx — Mobile booking widget wired to real API.
 *
 * Replaces MOCK_DAYS / MOCK_SLOTS_BY_DAY with useDays() + useSlots() hooks.
 * Uses BookingFormWired for form submit.
 *
 * Layout: same 2-step wizard (schedule → form) as unified-schedule-mobile.tsx.
 * States per step:
 *   - Loading: grey skeleton chips / slot grid (animate-pulse)
 *   - Error:   inline "Thử lại?" banner + retry
 *   - Empty:   "Chọn ngày khác" message
 *   - Normal:  interactive
 */

'use client';

import { useMemo, useState, useCallback, useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDays, useSlots } from '@/lib/booking/use-availability';
import { BookingFormWired, type SelectedSlotInfo, type FormSuccessData } from '@/components/booking/booking-form-wired';
import type { Slot } from '@/lib/booking/types';
import { useRouter } from 'next/navigation';

export function UnifiedScheduleMobileWired() {
  const router = useRouter();
  const formId = useId();
  const { data: days, isLoading: daysLoading, error: daysError, mutate: mutateDays } = useDays();

  const firstAvailable = useMemo(
    () => days?.find((d) => d.availableCount > 0)?.date ?? days?.[0]?.date ?? null,
    [days],
  );

  const [openDate, setOpenDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotInfo | null>(null);
  const [formActionState, setFormActionState] = useState({ consent: false, isSubmitting: false });

  // Step wizard
  const [step, setStep] = useState<'schedule' | 'form'>('schedule');
  const [dir, setDir] = useState<1 | -1>(1);

  // Auto-advance to form right after slot selection. Short delay lets the user
  // perceive the slot "selected" gradient flash before the slide transition.
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);
  useEffect(() => clearAutoAdvance, [clearAutoAdvance]);

  const goForward = useCallback(() => { clearAutoAdvance(); setDir(1); setStep('form'); }, [clearAutoAdvance]);
  const goBack = useCallback(() => { clearAutoAdvance(); setDir(-1); setStep('schedule'); }, [clearAutoAdvance]);

  const handleSlotPick = useCallback(
    (info: SelectedSlotInfo) => {
      setSelectedSlot(info);
      clearAutoAdvance();
      // Skip auto-advance if user already moved to form (defensive — TimeGrid only renders on schedule step).
      autoAdvanceTimerRef.current = setTimeout(() => {
        setDir(1);
        setStep('form');
      }, 280);
    },
    [clearAutoAdvance],
  );

  // Resolve active expanded day: explicit open OR default to firstAvailable
  const activeOpen = openDate ?? firstAvailable;

  const { data: slotsData, isLoading: slotsLoading, error: slotsError, mutate: mutateSlots } = useSlots(activeOpen);

  // Merge API slots into day list for display
  const dayDataList = useMemo(() => {
    if (!days) return [];
    return days.map((day) => {
      const isExpanded = activeOpen === day.date;
      const slots: Slot[] = isExpanded && slotsData?.slots ? slotsData.slots : [];
      const availableCount = isExpanded ? slots.filter((s) => s.available).length : day.availableCount;
      const earliest = isExpanded ? slots.find((s) => s.available)?.time ?? null : null;
      return { day, slots, earliest, availableCount: isExpanded ? availableCount : day.availableCount };
    });
  }, [days, activeOpen, slotsData]);

  const totalSlots = useMemo(
    () => days?.reduce((a, d) => a + d.availableCount, 0) ?? 0,
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

  return (
    <div
      className="rounded-[1.5rem] bg-gradient-to-b from-violet-100/70 via-violet-50/40 to-indigo-100/50"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-t-[1.5rem] border-x-[1.5px] border-t-[1.5px] border-border-strong">
      {/* Header */}
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
              ? daysLoading
                ? 'Đang tải lịch…'
                : `7 ngày tới · ${totalSlots} slot trống`
              : 'Thông Tin Liên Hệ'}
          </h2>
          <DotIndicator step={step} />
        </div>
      </header>

      {/* Wizard body */}
      <div className="relative overflow-hidden pb-24">
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
              {/* Days loading skeleton */}
              {daysLoading && (
                <div className="px-4 pt-3 pb-3 space-y-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="rounded-[1.25rem] border border-border-default bg-white animate-pulse h-16" />
                  ))}
                </div>
              )}

              {/* Days error */}
              {daysError && !daysLoading && (
                <div className="mx-4 mt-3 rounded-xl border border-dashed border-rose-300 bg-rose-50/50 p-4 text-center">
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

              {/* Day list */}
              {!daysLoading && !daysError && days && days.length > 0 && (
                <div className="px-4 pt-3 pb-3 space-y-2">
                  {dayDataList.map(({ day, slots, earliest, availableCount }) => {
                    const isOpen = activeOpen === day.date;
                    const disabled = day.availableCount === 0;
                    const selected = selectedSlot !== null && selectedSlot.iso !== '' && slots.some((s) => s.iso === selectedSlot?.iso);
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
                            disabled ? 'border-border-strong bg-surface-subtle/70 opacity-60'
                              : selected ? 'border-brand-violet bg-white'
                              : isOpen ? 'border-brand-violet/65 bg-white'
                              : 'border-border-strong bg-white',
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn('ticket-perforation', perforationColor)}
                            style={{ bottom: 'auto', height: 56 }}
                          />

                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => setOpenDate(isOpen ? '' : day.date)}
                            aria-expanded={isOpen}
                            aria-label={`${day.label}, còn ${availableCount} slot${isOpen ? ', đang mở' : ''}`}
                            className={cn(
                              'relative w-full grid items-center gap-3 text-left rounded-[1.25rem]',
                              'grid-cols-[60px_minmax(0,1fr)_auto]',
                              'py-2 pl-3 pr-3',
                              !disabled && 'active:bg-violet-50/40',
                            )}
                          >
                            {/* Stub */}
                            <div className="flex flex-col items-center justify-center select-none">
                              <span className={cn('font-display font-bold uppercase tracking-[0.18em] leading-none text-[10px]', selected ? 'text-brand-violet/75' : isOpen ? 'text-brand-indigo/80' : 'text-text-tertiary')}>
                                {weekday}
                              </span>
                              <span className={cn('mt-1 font-display font-extrabold leading-none tabular-nums text-[22px]', selected ? 'text-brand-violet' : isOpen ? 'text-brand-indigo' : 'text-text-primary')}>
                                {dateNumber}
                              </span>
                            </div>

                            {/* Body */}
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
                              <p className={cn('truncate font-display font-bold leading-tight text-text-primary', compact ? 'text-[13px]' : 'text-sm')}>
                                {selected
                                  ? `Đã chọn ${selectedSlot?.time}`
                                  : disabled
                                    ? 'Hết slot'
                                    : earliest
                                      ? `${availableCount} slot từ ${earliest}`
                                      : `${day.availableCount} slot`}
                              </p>
                              {!compact && (
                                <p className="mt-1 truncate text-[11px] leading-tight text-text-tertiary">
                                  {selected ? 'Tap để đổi giờ' : disabled ? 'Chọn ngày khác' : isOpen ? 'Chọn giờ bên dưới' : 'Tap để xem giờ'}
                                </p>
                              )}
                            </div>

                            {/* Meta */}
                            {!disabled ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className={cn('rounded-full px-1.5 py-0.5 font-display text-[10px] font-bold tabular-nums', day.availableCount > 15 ? 'bg-emerald-50 text-emerald-700' : day.availableCount > 5 ? 'bg-violet-50 text-brand-violet' : 'bg-rose-50 text-rose-600')}>
                                  {day.availableCount}
                                </span>
                                <motion.span
                                  animate={{ rotate: isOpen ? 180 : 0 }}
                                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                  className={cn('grid place-items-center rounded-full border bg-white text-brand-violet shadow-sm', compact ? 'size-5' : 'size-6', isOpen ? 'border-brand-violet/30' : 'border-border-default')}
                                >
                                  <ChevronDown className={compact ? 'size-3' : 'size-3.5'} strokeWidth={2.4} />
                                </motion.span>
                              </div>
                            ) : (
                              <span className="rounded-full bg-white/70 px-2 py-1 font-display text-[10px] font-bold text-text-tertiary">0</span>
                            )}
                          </button>

                          {/* Expanded time grid */}
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
                                  {slotsLoading ? (
                                    <div className="grid grid-cols-4 gap-1.5">
                                      {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="rounded-lg border border-border-default bg-surface-subtle animate-pulse h-9" />
                                      ))}
                                    </div>
                                  ) : slotsError ? (
                                    <div className="text-center py-3">
                                      <p className="text-xs text-rose-600 mb-1.5">Không tải được slot.</p>
                                      <button
                                        type="button"
                                        onClick={() => void mutateSlots()}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600"
                                      >
                                        <RefreshCw className="size-3" />
                                        Thử lại
                                      </button>
                                    </div>
                                  ) : slots.length === 0 ? (
                                    <p className="text-center text-xs text-text-tertiary py-3">
                                      Hết slot ngày này. Chọn ngày khác.
                                    </p>
                                  ) : (
                                    <TimeGrid
                                      slots={slots}
                                      selectedIso={selectedSlot?.iso ?? null}
                                      onSelect={(s) =>
                                        handleSlotPick({ date: day.date, iso: s.iso, time: s.time, dateLabel: day.label } as SelectedSlotInfo & { date: string })
                                      }
                                      dayLabel={day.label}
                                    />
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {!daysLoading && !daysError && (!days || days.length === 0) && (
                <div className="mx-4 mt-3 rounded-xl border border-dashed border-border-default p-8 text-center bg-white/50">
                  <p className="text-sm text-text-tertiary">Hiện không có slot trống. Quay lại sau.</p>
                </div>
              )}
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
              <div className="px-4 pt-4 pb-3 space-y-2.5 bg-white/60 font-body">
                <h3 className="text-[12px] font-semibold tracking-wide text-text-primary flex items-center gap-2 mb-1">
                  <span className="size-1.5 rounded-full bg-brand-pink animate-pulse" />
                  Thông tin booking
                  <span className="ml-auto text-[10px] font-medium text-text-tertiary">3 bước</span>
                </h3>

                <BookingFormWired
                  formId={formId}
                  selectedSlot={selectedSlot}
                  onSuccess={handleSuccess}
                  onSlotConflict={handleSlotConflict}
                  layout="mobile"
                  showSubmitButton={false}
                  onSubmitStateChange={setFormActionState}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-10 rounded-b-[1.5rem] border-x-[1.5px] border-b-[1.5px] border-t border-border-strong bg-white/95 px-3 pt-2 pb-2.5 backdrop-blur-md shadow-[0_-6px_18px_rgba(168,85,247,0.06)]">
        {step === 'schedule' ? (
          <button
            type="button"
            disabled={!selectedSlot}
            onClick={goForward}
            aria-label={selectedSlot ? `Tiếp tục với slot ${selectedSlot.time}` : 'Chọn ngày và giờ để tiếp tục'}
            className={cn(
              'w-full h-11 rounded-xl font-display font-bold text-[13.5px] transition-all',
              selectedSlot
                ? 'bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-md shadow-brand-violet/25 active:scale-[0.98]'
                : 'bg-surface-subtle text-text-tertiary cursor-not-allowed',
            )}
          >
            {selectedSlot ? `Tiếp tục · ${selectedSlot.time} →` : 'Chọn ngày + giờ để tiếp tục'}
          </button>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <button
              type="button"
              onClick={goBack}
              className="h-11 px-4 rounded-xl border-[1.5px] border-border-strong bg-white font-display font-bold text-[13.5px] text-text-secondary active:bg-surface-subtle transition-all"
            >
              ← Quay lại
            </button>
            <button
              type="submit"
              form={formId}
              disabled={!selectedSlot || !formActionState.consent || formActionState.isSubmitting}
              className={cn(
                'h-11 rounded-xl font-display font-bold text-[13.5px] transition-all',
                selectedSlot && formActionState.consent && !formActionState.isSubmitting
                  ? 'bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-md shadow-brand-violet/25 active:scale-[0.98]'
                  : 'bg-surface-subtle text-text-tertiary cursor-not-allowed',
              )}
            >
              {formActionState.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Đang xác nhận…
                </span>
              ) : formActionState.consent ? (
                `Xác nhận · ${selectedSlot?.time} →`
              ) : (
                'Tick đồng ý để xác nhận'
              )}
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
// Animation variants
// ---------------------------------------------------------------------------

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

// ---------------------------------------------------------------------------
// DotIndicator
// ---------------------------------------------------------------------------

function DotIndicator({ step }: { step: 'schedule' | 'form' }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0" aria-label="Tiến trình booking">
      <span
        className={cn('rounded-full transition-all duration-300', step === 'schedule' ? 'w-5 h-1.5 bg-gradient-to-r from-brand-indigo to-brand-violet' : 'w-1.5 h-1.5 bg-border-strong')}
        aria-current={step === 'schedule' ? 'step' : undefined}
      />
      <span
        className={cn('rounded-full transition-all duration-300', step === 'form' ? 'w-5 h-1.5 bg-gradient-to-r from-brand-violet to-brand-pink' : 'w-1.5 h-1.5 bg-border-strong')}
        aria-current={step === 'form' ? 'step' : undefined}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// TodayShinyBadge
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
// TimeGrid
// ---------------------------------------------------------------------------

function TimeGrid({
  slots, selectedIso, onSelect, dayLabel,
}: {
  slots: Slot[];
  selectedIso: string | null;
  onSelect: (slot: Slot) => void;
  dayLabel: string;
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
            aria-label={`Đặt giờ ${slot.time} ngày ${dayLabel}`}
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
