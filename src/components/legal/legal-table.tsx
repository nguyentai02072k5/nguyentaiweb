/**
 * legal-table.tsx — Aurora-styled table for /privacy & /terms.
 *
 * Renders a header row + body rows from a typed schema. Mobile-friendly:
 * horizontally scrollable on narrow screens, padded cells, soft Aurora hairline
 * under the header. Pass cell content as ReactNode so consumers can embed
 * `<strong>`, lists, links, or emoji marks (✅ ❌ ✦).
 */

import { cn } from '@/lib/utils';

type Cell = React.ReactNode;

type LegalTableProps = {
  headers: string[];
  /** Row arrays must match headers.length. */
  rows: Cell[][];
  /** Optional caption shown above (visually hidden if `ariaOnly`). */
  caption?: string;
  ariaOnly?: boolean;
};

export function LegalTable({ headers, rows, caption, ariaOnly }: LegalTableProps) {
  return (
    <div
      className="
        overflow-x-auto rounded-2xl border border-border-default
        bg-surface-elevated shadow-[0_4px_18px_-12px_rgba(99,102,241,0.18)]
      "
    >
      <table className="w-full min-w-[520px] text-left font-body">
        {caption ? (
          <caption
            className={cn(
              'px-5 pt-4 text-sm text-text-secondary text-left',
              ariaOnly && 'sr-only',
            )}
          >
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="bg-surface-subtle/60">
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="
                  px-4 py-3 sm:px-5
                  font-display text-label uppercase text-brand-violet
                  border-b border-brand-violet/20
                "
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-border-default/70 last:border-b-0"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    'px-4 py-3 sm:px-5 align-top',
                    'text-sm sm:text-[15px] text-text-secondary leading-relaxed',
                    ci === 0 && 'font-medium text-text-primary',
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
