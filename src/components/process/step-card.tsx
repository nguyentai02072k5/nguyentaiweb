/**
 * step-card.tsx — Individual process step card for Process Journey timeline.
 *
 * Layout: badge top + body (mobile); badge + body side-by-side (desktop).
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
      className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:gap-4 sm:p-6"
      aria-label={`Bước ${step.number}: ${step.title}`}
    >
      {/* Badge */}
      <div className="shrink-0">
        <StepNumberBadge number={step.number} />
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-col">
        <h3 className="font-display text-h-2 font-semibold text-text-primary">
          {step.title}
        </h3>
        <p className="mt-2 font-body text-base leading-relaxed text-text-secondary">
          {step.description}
        </p>
        <p className="mt-3 text-sm font-medium italic text-brand-violet">
          <span className="sr-only">Kết quả: </span>
          {'→ Kết quả: '}
          {step.output}
        </p>
      </div>
    </article>
  );
}
