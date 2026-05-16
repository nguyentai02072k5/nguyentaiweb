import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accent?: 'indigo' | 'violet' | 'pink' | 'cyan' | 'amber';
};

const ACCENT: Record<NonNullable<StatCardProps['accent']>, string> = {
  indigo: 'from-indigo-500/15 to-indigo-500/0 text-indigo-600 ring-indigo-200',
  violet: 'from-violet-500/15 to-violet-500/0 text-violet-600 ring-violet-200',
  pink: 'from-pink-500/15 to-pink-500/0 text-pink-600 ring-pink-200',
  cyan: 'from-cyan-500/15 to-cyan-500/0 text-cyan-600 ring-cyan-200',
  amber: 'from-amber-500/15 to-amber-500/0 text-amber-700 ring-amber-200',
};

export function StatCard({ label, value, hint, icon: Icon, accent = 'indigo' }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-default/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-90',
          ACCENT[accent],
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wider">
            {label}
          </p>
          <p className="text-text-primary mt-2 font-display text-3xl font-semibold tracking-tight">
            {value}
          </p>
          {hint && <p className="text-text-secondary mt-1 text-xs">{hint}</p>}
        </div>
        <span
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1',
            ACCENT[accent],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}
