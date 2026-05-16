/**
 * legal-section.tsx — numbered section primitive used by /privacy & /terms.
 *
 * Renders an anchorable <section id> with the section number rendered as
 * a small Aurora-tinted chip beside the h2 title. Body content is whatever
 * children the consumer passes (paragraphs, tables, bullet lists, etc.).
 *
 * Anchor id pattern: `sec-{number}` (e.g. `sec-3-1`) so consumers can deep-link.
 */

import { cn } from '@/lib/utils';

type LegalSectionProps = {
  /** Section number string, e.g. "1", "3.1". Drives id + chip text. */
  number: string;
  title: string;
  children: React.ReactNode;
  /** Optional subdued style for sub-sections (3.1, 3.2…). */
  variant?: 'main' | 'sub';
};

export function LegalSection({
  number,
  title,
  children,
  variant = 'main',
}: LegalSectionProps) {
  const id = `sec-${number.replace(/\./g, '-')}`;
  const isMain = variant === 'main';

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        'scroll-mt-24',
        isMain ? '' : 'pl-3 sm:pl-4 border-l-2 border-brand-violet/25',
      )}
    >
      <div className="flex items-baseline gap-3 flex-wrap">
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex items-center justify-center shrink-0',
            'rounded-md font-display font-semibold tabular-nums',
            isMain
              ? 'px-2 py-0.5 text-xs bg-aurora text-text-on-brand shadow-[0_2px_10px_-4px_rgba(168,85,247,0.6)]'
              : 'px-1.5 py-0.5 text-[11px] bg-surface-subtle text-brand-violet border border-brand-violet/20',
          )}
        >
          {number}
        </span>
        <h2
          id={`${id}-title`}
          className={cn(
            'font-display font-semibold text-text-primary text-balance',
            isMain ? 'text-h-2' : 'text-lg sm:text-xl',
          )}
        >
          {title}
        </h2>
      </div>

      <div
        className={cn(
          'mt-4 flex flex-col gap-4',
          'font-body text-body-lg text-text-secondary leading-relaxed',
          '[&_strong]:text-text-primary [&_strong]:font-semibold',
          '[&_a]:text-brand-indigo [&_a]:underline [&_a]:underline-offset-4',
          '[&_a:hover]:text-brand-violet',
        )}
      >
        {children}
      </div>
    </section>
  );
}
