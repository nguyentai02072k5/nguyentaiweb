/**
 * infor-wizard-nav.tsx - Thanh tiến trình + nút điều hướng cho wizard form.
 *
 * - WizardProgress: hiển thị "Bước X/N · Tiêu đề" + 3 đốt tiến trình (Zeigarnik).
 * - WizardNav: nút Quay lại / Tiếp tục, bước cuối → nút Gửi (loading state).
 */

'use client';

import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIZARD_STEPS, type WizardStep } from '@/lib/leads/lead-field-config';

export function WizardProgress({ step }: { step: WizardStep }) {
  const total = WIZARD_STEPS.length;
  const current = WIZARD_STEPS.find((s) => s.n === step);
  const pct = (step / total) * 100;

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-brand-violet font-display text-[13px] font-bold">
          Bước {step}/{total}
        </span>
        <span className="text-text-secondary text-[13px] font-medium">{current?.title}</span>
      </div>
      <div className="bg-surface-subtle h-2 w-full overflow-hidden rounded-full">
        <div
          className="from-brand-indigo via-brand-violet to-brand-pink h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function WizardNav({
  step,
  isLast,
  isSubmitting,
  onBack,
  onNext,
}: {
  step: WizardStep;
  isLast: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-3 pt-1">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="border-border-default text-text-secondary hover:bg-surface-subtle font-display flex h-12 items-center justify-center gap-1.5 rounded-2xl border px-5 text-sm font-bold transition disabled:opacity-50"
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </button>
      )}

      {isLast ? (
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'font-display flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all',
            isSubmitting
              ? 'bg-surface-subtle text-text-tertiary cursor-not-allowed'
              : 'from-brand-indigo via-brand-violet to-brand-pink shadow-brand-violet/30 bg-gradient-to-r text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]',
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Đang gửi…
            </>
          ) : (
            <>
              <Send className="size-4" /> Hoàn tất & Gửi
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="from-brand-indigo via-brand-violet to-brand-pink shadow-brand-violet/30 font-display flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Tiếp tục
          <ArrowRight className="size-4" />
        </button>
      )}
    </div>
  );
}
