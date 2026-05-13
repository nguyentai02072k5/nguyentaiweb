/**
 * step-number-badge.tsx — Circular gradient badge showing step number (1-6).
 *
 * Uses Aurora gradient background with glow shadow.
 * aria-hidden since parent step card title provides context.
 */

type StepNumberBadgeProps = {
  number: number;
};

export function StepNumberBadge({ number }: StepNumberBadgeProps) {
  return (
    <div
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-aurora shadow-glow-violet md:size-12"
    >
      <span className="font-display text-base font-bold leading-none text-white md:text-lg">
        {number}
      </span>
    </div>
  );
}
