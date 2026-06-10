/**
 * blog-mdx-cards.tsx - Khối "thẻ" cho MDX blog: lưới thẻ icon/số (tín hiệu, lý do, tổ chức)
 * và các tầng nhận thức (Spiral Dynamics). Dùng Aurora token + `not-prose`.
 */

/** Lưới thẻ icon-hoặc-số + tiêu đề + nội dung. cols=2 cho dạng 2 cột. */
export function CardGrid({
  cols = 1,
  items,
}: {
  cols?: 1 | 2;
  items: { icon?: string; num?: number | string; title: string; body: string }[];
}) {
  return (
    <div
      className={`not-prose my-8 grid gap-4 ${cols === 2 ? 'sm:grid-cols-2' : ''}`}
      data-reveal
    >
      {items.map((c, i) => {
        const hasNum = c.num !== undefined && c.num !== null;
        return (
          <div
            key={i}
            className="flex items-start gap-4 rounded-lg border border-border-default bg-surface-elevated p-6 shadow-card"
          >
            {(hasNum || c.icon) && (
              <div
                className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-[13px] ${
                  hasNum
                    ? 'bg-aurora font-display text-xl font-bold text-white'
                    : 'bg-surface-subtle text-xl'
                }`}
              >
                <span aria-hidden>{hasNum ? c.num : c.icon}</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="mb-1.5 font-display text-base font-semibold text-text-primary">
                {c.title}
              </div>
              <p className="m-0 text-[0.96rem] leading-relaxed text-text-secondary">
                {c.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TIER_COLOR = {
  orange: {
    border: 'border-l-orange-500',
    dot: 'bg-orange-100 dark:bg-orange-950/40',
    tag: 'text-orange-600 dark:text-orange-400',
  },
  green: {
    border: 'border-l-emerald-500',
    dot: 'bg-emerald-100 dark:bg-emerald-950/40',
    tag: 'text-emerald-600 dark:text-emerald-400',
  },
  yellow: {
    border: 'border-l-yellow-500',
    dot: 'bg-yellow-100 dark:bg-yellow-950/40',
    tag: 'text-yellow-600 dark:text-yellow-500',
  },
} as const;

/** Các tầng nhận thức (Spiral Dynamics) - thẻ viền trái màu theo tầng. */
export function Tiers({
  items,
}: {
  items: {
    color: keyof typeof TIER_COLOR;
    emoji: string;
    tag: string;
    title: string;
    body: string;
  }[];
}) {
  return (
    <div className="not-prose my-8 grid gap-4" data-reveal>
      {items.map((t, i) => {
        const c = TIER_COLOR[t.color];
        return (
          <div
            key={i}
            className={`flex items-start gap-4 rounded-lg border border-border-default border-l-[5px] bg-surface-elevated p-6 shadow-card ${c.border}`}
          >
            <div
              className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-xl shadow-card ${c.dot}`}
            >
              <span aria-hidden>{t.emoji}</span>
            </div>
            <div className="min-w-0">
              <div
                className={`font-display text-xs font-semibold uppercase tracking-wide ${c.tag}`}
              >
                {t.tag}
              </div>
              <div className="mb-1 mt-0.5 font-display text-base font-semibold text-text-primary">
                {t.title}
              </div>
              <p className="m-0 text-[0.96rem] leading-relaxed text-text-secondary">
                {t.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
