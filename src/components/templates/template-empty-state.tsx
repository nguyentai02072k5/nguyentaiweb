import { SearchX } from 'lucide-react';

/**
 * template-empty-state.tsx — Khi không có template khớp bộ lọc.
 */
export function TemplateEmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface-subtle/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
        <SearchX className="h-6 w-6 text-text-tertiary" aria-hidden />
      </div>
      <h2 className="font-display text-lg font-semibold text-text-primary">
        Không có template nào khớp
      </h2>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Thử bỏ bớt bộ lọc hoặc tìm bằng từ khoá khác.
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="
            mt-5 inline-flex items-center rounded-full
            bg-brand-violet/10 px-5 py-2.5
            font-display text-sm font-semibold text-brand-violet
            transition-colors hover:bg-brand-violet/20
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet
          "
        >
          Xoá bộ lọc
        </button>
      )}
    </div>
  );
}
