/**
 * step-card.tsx — Individual process step card for Process Journey timeline.
 *
 * Layout: body-only (mobile — badge rendered externally on spine for compactness);
 *         badge + body side-by-side (desktop md+).
 * Output indicator uses sr-only prefix for screen reader accessibility.
 */

import { StepNumberBadge } from '@/components/process/step-number-badge';
import type { ProcessStep } from '@/content/landing';

type StepCardProps = {
  step: ProcessStep;
  index: number;
};

export function StepCard({ step }: StepCardProps) {
  return (
    <article
      className="group relative flex flex-col gap-1.5 overflow-hidden rounded-xl border border-white/40 bg-white/55 p-3 shadow-[0_5px_16px_rgba(99,102,241,0.08)] backdrop-blur-xl backdrop-saturate-150 transition-all hover:border-white/60 hover:bg-white/65 hover:shadow-[0_10px_28px_rgba(168,85,247,0.14)] sm:gap-2 sm:p-4 md:flex-row md:gap-3 md:p-4 md:shadow-[0_6px_22px_rgba(99,102,241,0.10)]"
      aria-label={`Bước ${step.number}: ${step.title}`}
    >
      {/* Specular highlight — top edge sheen */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
      {/* Inner glow gradient */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(120%_120%_at_100%_0%,rgba(255,255,255,0.35),transparent_55%)]"
      />
      {/* Badge — desktop only (mobile renders externally on spine) */}
      <div className="relative z-10 hidden shrink-0 md:block">
        <StepNumberBadge number={step.number} />
      </div>

      {/* Body — compact font scale */}
      <div className="relative z-10 flex min-w-0 flex-col">
        <h3 className="font-display text-[15px] font-semibold leading-snug text-text-primary sm:text-base md:text-lg">
          {step.title}
        </h3>
        <p className="mt-1 font-body text-[13px] leading-snug text-text-secondary sm:text-sm md:mt-1.5">
          {step.description}
        </p>
        <p className="mt-1.5 text-[11px] font-medium italic text-brand-violet sm:text-xs md:mt-2">
          <span className="sr-only">Kết quả: </span>
          {'→ Kết quả: '}
          {step.output}
        </p>
      </div>
    </article>
  );
}
