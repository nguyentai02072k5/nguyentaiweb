import { ChevronDown, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  BUSINESS_MODELS,
  getIndustriesByModel,
  type BusinessModelSlug,
  type IndustrySlug,
} from '@/lib/content/taxonomy';

/**
 * template-filter-bar.tsx — Bộ lọc gọn: mô hình + mục tiêu = segmented control,
 * ngành = dropdown (nhóm theo mô hình khi chưa chọn), search. State do explorer giữ.
 */

type FilterBarProps = {
  model: BusinessModelSlug | null;
  industry: IndustrySlug | null;
  query: string;
  onModel: (m: BusinessModelSlug | null) => void;
  onIndustry: (i: IndustrySlug | null) => void;
  onQuery: (q: string) => void;
  onReset: () => void;
  resultCount: number;
};

/** Segmented control nhỏ gọn (ít option) — cuộn ngang nếu hẹp. */
function Segmented<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T | null) => void;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex max-w-full shrink-0 gap-0.5 overflow-x-auto rounded-full border border-border-default bg-surface-subtle/70 p-0.5"
    >
      <SegButton active={value === null} onClick={() => onChange(null)}>
        Tất cả
      </SegButton>
      {options.map((o) => (
        <SegButton
          key={o.value}
          active={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </SegButton>
      ))}
    </div>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        whitespace-nowrap rounded-full px-3.5 py-1.5
        font-display text-sm transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40
        ${
          active
            ? 'bg-surface-elevated font-semibold text-text-primary shadow-sm'
            : 'font-medium text-text-tertiary hover:text-text-secondary'
        }
      `}
    >
      {children}
    </button>
  );
}

export function TemplateFilterBar({
  model,
  industry,
  query,
  onModel,
  onIndustry,
  onQuery,
  onReset,
  resultCount,
}: FilterBarProps) {
  const hasActive = !!(model || industry || query.trim());

  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated/60 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Segmented
          ariaLabel="Lọc theo mô hình kinh doanh"
          value={model}
          options={BUSINESS_MODELS.map((m) => ({ value: m.slug, label: m.label }))}
          onChange={(m) => onModel(m)}
        />

        {/* Ngành = dropdown (nhóm theo mô hình khi chưa chọn mô hình) */}
        <div className="relative w-full sm:w-56 lg:w-52">
          <select
            value={industry ?? ''}
            onChange={(e) =>
              onIndustry((e.target.value || null) as IndustrySlug | null)
            }
            aria-label="Lọc theo ngành"
            className="
              h-9 w-full appearance-none cursor-pointer rounded-full
              border border-border-default bg-surface-subtle/70 pl-4 pr-9
              font-display text-sm font-medium text-text-secondary
              transition-colors hover:border-border-strong hover:text-text-primary
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40
            "
          >
            <option value="">Tất cả ngành</option>
            {model
              ? getIndustriesByModel(model).map((i) => (
                  <option key={i.slug} value={i.slug}>
                    {i.label}
                  </option>
                ))
              : BUSINESS_MODELS.map((m) => (
                  <optgroup key={m.slug} label={m.label}>
                    {getIndustriesByModel(m.slug).map((i) => (
                      <option key={i.slug} value={i.slug}>
                        {i.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden
          />
        </div>

        {/* Search — chiếm phần còn lại trên desktop */}
        <div className="relative w-full lg:flex-1 lg:min-w-[160px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Tìm template..."
            aria-label="Tìm template"
            className="h-9 rounded-full border-border-default bg-surface-subtle/70 pl-9 focus-visible:ring-brand-violet/40"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-text-tertiary" aria-live="polite">
          {resultCount} template
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="
              inline-flex items-center gap-1 rounded-full px-2.5 py-1
              text-sm font-medium text-text-tertiary
              transition-colors hover:text-text-primary
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40
            "
          >
            <X className="h-3.5 w-3.5" aria-hidden /> Xoá lọc
          </button>
        )}
      </div>
    </div>
  );
}
