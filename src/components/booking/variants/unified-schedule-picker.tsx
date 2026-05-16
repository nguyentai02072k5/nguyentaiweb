/**
 * Variant E1: Unified schedule + slot picker (new — phase 06 redesign).
 *
 * Tech/modern aesthetic — phase 06 redesign 2026-05-14:
 *   - Lock window: 7 ngày tính từ now (`hcmToday()` + 6 days)
 *   - Top: 7 day pills with availability bar visualization
 *   - Below: slot grid for selected day with period color bands
 *   - Glass card outer, gradient borders, subtle hover glow
 *   - Single component → user thấy hết flow date→slot trong 1 widget
 *
 * UX wins vs separate A/B variants:
 *   - Tap day → slots reveal in same place (no step navigation)
 *   - Availability bar gives at-a-glance density (heatmap-like)
 *   - Less choice paralysis vs full 48-slot grid
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  MOCK_DAYS,
  MOCK_SLOTS_BY_DAY,
  PERIOD_META,
} from '@/components/booking/_mock-data';
import type { TimePeriod } from '@/lib/booking/types';

const PERIOD_ORDER: TimePeriod[] = ['morning', 'midday', 'afternoon', 'evening'];

export function UnifiedSchedulePicker() {
  const days = MOCK_DAYS.slice(0, 7); // 1-week lock
  const [selectedDate, setSelectedDate] = useState(days[0].date);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const maxCount = Math.max(...days.map((d) => d.availableCount));

  const daySlots = MOCK_SLOTS_BY_DAY[selectedDate] ?? [];
  const slotsByPeriod = new Map<TimePeriod, typeof daySlots>();
  for (const s of daySlots) {
    const list = slotsByPeriod.get(s.period) ?? [];
    list.push(s);
    slotsByPeriod.set(s.period, list);
  }

  return (
    <div className="relative rounded-2xl border border-brand-violet/20 bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/40 p-5 shadow-xl shadow-brand-violet/5 overflow-hidden">
      {/* Tech grid background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <p className="font-display text-label uppercase tracking-wider text-brand-violet">
              Lịch của bạn
            </p>
            <h3 className="font-display text-lg font-semibold mt-0.5">
              7 ngày tới <span className="text-text-tertiary font-normal text-sm">· {days.reduce((a, d) => a + d.availableCount, 0)} slot trống</span>
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand-violet/10 text-brand-violet text-xs font-display font-semibold uppercase tracking-wider">
            ● Live
          </span>
        </div>

        {/* Week strip with availability bars */}
        <div className="grid grid-cols-7 gap-1.5 mb-5">
          {days.map((day) => {
            const heightPct = maxCount > 0 ? (day.availableCount / maxCount) * 100 : 0;
            const selected = selectedDate === day.date;
            const disabled = day.availableCount === 0;
            const periodColor =
              day.availableCount > 15 ? 'from-emerald-400 to-cyan-400'
              : day.availableCount > 5 ? 'from-brand-indigo to-brand-violet'
              : 'from-brand-pink to-rose-500';

            return (
              <button
                key={day.date}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelectedDate(day.date);
                  setSelectedSlot(null);
                }}
                aria-pressed={selected}
                className={cn(
                  'group relative flex flex-col items-center rounded-xl border p-2 min-h-[92px] transition-all',
                  disabled && 'cursor-not-allowed opacity-30',
                  !disabled && !selected && 'border-border-default bg-white/60 hover:border-brand-violet/50 hover:bg-white active:scale-[0.97]',
                  !disabled && selected && 'border-brand-violet bg-white shadow-lg shadow-brand-violet/20 ring-2 ring-brand-violet/30 -translate-y-0.5',
                )}
              >
                {day.isToday && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-brand-indigo text-white text-[9px] font-display font-semibold uppercase tracking-wider whitespace-nowrap">
                    Hôm nay
                  </span>
                )}
                <span className="font-display text-[10px] uppercase tracking-wider text-text-tertiary mt-1">
                  {day.label.split(' ')[0]}
                </span>
                <span className={cn(
                  'font-display text-lg font-bold leading-tight',
                  selected ? 'text-aurora' : 'text-text-primary',
                )}>
                  {day.label.split(' ')[1].split('/')[0]}
                </span>
                {/* Availability bar (heatmap-style) */}
                <div className="w-full h-12 mt-1 relative flex items-end justify-center">
                  <div className="w-1.5 h-full rounded-full bg-border-default/50 relative overflow-hidden">
                    <div
                      className={cn('absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t transition-all duration-500', periodColor)}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                </div>
                <span className={cn(
                  'text-[10px] mt-1 font-display font-medium',
                  disabled ? 'text-text-tertiary' : selected ? 'text-brand-violet' : 'text-text-secondary',
                )}>
                  {disabled ? 'Hết' : day.availableCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider with selected day label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-violet/30 to-transparent" />
          <p className="font-display text-xs uppercase tracking-wider text-text-secondary">
            Slots trong {days.find((d) => d.date === selectedDate)?.label ?? ''}
          </p>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-violet/30 to-transparent" />
        </div>

        {/* Slot grid per period */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {PERIOD_ORDER.map((period) => {
              const slots = slotsByPeriod.get(period);
              if (!slots || slots.length === 0) return null;
              const meta = PERIOD_META[period];
              return (
                <div key={period} className="relative">
                  {/* Period color band */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('w-1 h-4 rounded-full bg-gradient-to-b', meta.gradient)} />
                    <span className="text-sm leading-none">{meta.emoji}</span>
                    <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-text-tertiary font-display">
                      {slots.filter((s) => s.available).length}/{slots.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot.iso;
                      const disabled = !slot.available;
                      return (
                        <button
                          key={slot.iso}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedSlot(slot.iso)}
                          aria-pressed={isSelected}
                          className={cn(
                            'relative rounded-lg border min-h-[44px] px-2 py-2 font-display font-semibold text-sm transition-all',
                            disabled && 'cursor-not-allowed opacity-30 line-through',
                            !disabled && !isSelected && 'border-border-default bg-white hover:border-brand-violet/60 hover:shadow-sm active:scale-[0.97]',
                            !disabled && isSelected && 'border-transparent bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-md shadow-brand-violet/30',
                          )}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="mt-5 pt-4 border-t border-border-default/60">
          <button
            type="button"
            disabled={!selectedSlot}
            className={cn(
              'w-full h-12 rounded-xl font-display font-semibold text-sm transition-all',
              selectedSlot
                ? 'bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-lg shadow-brand-violet/20 hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-surface-subtle text-text-tertiary cursor-not-allowed',
            )}
          >
            {selectedSlot
              ? `Tiếp tục với ${daySlots.find((s) => s.iso === selectedSlot)?.time ?? ''} →`
              : 'Chọn slot để tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  );
}
