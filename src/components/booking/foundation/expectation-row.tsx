/**
 * ExpectationRow — single full-row clickable checkbox option.
 * Touch target ≥ 48px (entire row, not just checkbox).
 */

'use client';

import { cn } from '@/lib/utils';

export type ExpectationRowProps = {
  slug: string;
  icon: string;
  label: string;
  description: string;
  checked?: boolean;
  onToggle?: (slug: string) => void;
};

export function ExpectationRow({
  slug, icon, label, description, checked, onToggle,
}: ExpectationRowProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-all',
        'min-h-[60px]',
        checked
          ? 'border-brand-violet bg-violet-50 shadow-sm'
          : 'border-border-default bg-surface-elevated hover:border-brand-violet/40 hover:bg-violet-50/30',
      )}
    >
      <input
        type="checkbox"
        checked={!!checked}
        onChange={() => onToggle?.(slug)}
        className="mt-1 h-5 w-5 cursor-pointer accent-brand-violet"
        aria-label={label}
      />
      <span className="text-xl leading-none mt-0.5">{icon}</span>
      <span className="flex-1">
        <span className="block font-display font-semibold text-text-primary">{label}</span>
        <span className="block text-sm text-text-secondary mt-0.5">{description}</span>
      </span>
    </label>
  );
}
