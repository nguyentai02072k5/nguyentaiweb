'use client';

import { useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentStatus = params.get('status') ?? 'all';
  const currentSearch = params.get('q') ?? '';

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === '' || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `/admin?${qs}` : '/admin');
    });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateParam('q', String(fd.get('q') ?? '').trim());
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
        <Search
          className="text-text-tertiary pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          name="q"
          defaultValue={currentSearch}
          placeholder="Tìm theo tên, SĐT, email…"
          className="text-text-primary placeholder:text-text-tertiary focus:border-brand-violet focus:ring-brand-violet/30 h-10 w-full rounded-xl border border-border-default bg-white/90 pl-9 pr-9 text-sm shadow-sm outline-none transition focus:ring-2"
        />
        {currentSearch && (
          <button
            type="button"
            aria-label="Xoá tìm kiếm"
            onClick={() => updateParam('q', '')}
            className="text-text-tertiary hover:text-text-primary absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Status pills */}
      <div
        role="tablist"
        aria-label="Lọc theo trạng thái"
        className={cn(
          'flex flex-wrap gap-1.5 rounded-xl border border-border-default bg-white/85 p-1 shadow-sm',
          pending && 'opacity-70',
        )}
      >
        {STATUS_OPTIONS.map((opt) => {
          const active = currentStatus === opt.value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={active}
              onClick={() => updateParam('status', opt.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                active
                  ? 'bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
