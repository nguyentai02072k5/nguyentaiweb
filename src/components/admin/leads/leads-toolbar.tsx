'use client';

/**
 * leads-toolbar.tsx - Thanh điều khiển CMS leads (client).
 *
 * Gom: tìm kiếm, lọc trạng thái (chip), lọc thời gian, sắp xếp mới/cũ,
 * đổi chế độ xem (thẻ / danh sách), mở-thu tất cả, export CSV.
 * Toàn bộ state nằm ở explorer cha; toolbar chỉ là controlled UI.
 */

import type { ReactNode } from 'react';
import {
  Search, Download, LayoutGrid, List, ChevronsDownUp, ChevronsUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  STATUS_LABELS,
  type StatusFilter, type TimeRange, type SortOrder, type ViewMode, type SourceGroup,
} from '@/components/admin/leads/leads-explorer-types';

const SOURCE_TABS: { value: SourceGroup; label: string }[] = [
  { value: 'infor', label: 'Infor' },
  { value: 'mooly', label: 'Form Mooly' },
];

const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'opened', label: STATUS_LABELS.opened },
  { value: 'submitted', label: STATUS_LABELS.submitted },
  { value: 'contacted', label: STATUS_LABELS.contacted },
  { value: 'converted', label: STATUS_LABELS.converted },
  { value: 'spam', label: STATUS_LABELS.spam },
  { value: 'archived', label: STATUS_LABELS.archived },
];

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'all', label: 'Mọi lúc' },
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
];

const selectCls =
  'h-9 rounded-lg border border-border-default bg-white/80 px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40';

export type LeadsToolbarProps = {
  group: SourceGroup;
  groupCounts: Record<SourceGroup, number>;
  onGroup: (v: SourceGroup) => void;
  search: string;
  status: StatusFilter;
  timeRange: TimeRange;
  sort: SortOrder;
  view: ViewMode;
  shown: number;
  total: number;
  selectedCount: number;
  allVisibleSelected: boolean;
  onSearch: (v: string) => void;
  onStatus: (v: StatusFilter) => void;
  onTimeRange: (v: TimeRange) => void;
  onSort: (v: SortOrder) => void;
  onView: (v: ViewMode) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExportAll: () => void;
  onExportSelected: () => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
};

export function LeadsToolbar(props: LeadsToolbarProps) {
  const {
    group, groupCounts, onGroup,
    search, status, timeRange, sort, view, shown, total, selectedCount, allVisibleSelected,
    onSearch, onStatus, onTimeRange, onSort, onView, onExpandAll, onCollapseAll,
    onExportAll, onExportSelected, onToggleSelectAll, onClearSelection,
  } = props;

  return (
    <div className="rounded-2xl border border-border-default/80 bg-white/70 p-3 shadow-sm backdrop-blur-sm sm:p-4">
      {/* Tab nguồn: tách list Infor vs Form Mooly */}
      <div className="mb-3 flex items-center gap-1 rounded-xl border border-border-default bg-white/70 p-1">
        {SOURCE_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onGroup(t.value)}
            aria-pressed={group === t.value}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              group === t.value
                ? 'bg-brand-violet/10 text-brand-violet shadow-sm'
                : 'text-text-secondary hover:bg-white hover:text-text-primary',
            )}
          >
            {t.label}
            <span className="text-text-tertiary tabular-nums">({groupCounts[t.value]})</span>
          </button>
        ))}
      </div>

      {/* Hàng 1: tìm kiếm + sắp xếp + thời gian + view + export */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-text-tertiary pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm SĐT, tên, nội dung..."
            className="h-9 w-full rounded-lg border border-border-default bg-white/80 pl-9 pr-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40"
            aria-label="Tìm kiếm lead"
          />
        </div>

        <select className={selectCls} value={sort} onChange={(e) => onSort(e.target.value as SortOrder)} aria-label="Sắp xếp">
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>

        <select className={selectCls} value={timeRange} onChange={(e) => onTimeRange(e.target.value as TimeRange)} aria-label="Lọc thời gian">
          {TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-lg border border-border-default bg-white/70 p-1">
          <ViewBtn active={view === 'card'} onClick={() => onView('card')} label="Xem thẻ"><LayoutGrid className="h-4 w-4" /></ViewBtn>
          <ViewBtn active={view === 'list'} onClick={() => onView('list')} label="Xem danh sách"><List className="h-4 w-4" /></ViewBtn>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onExportAll} className="rounded-lg border-border-default bg-white/80 hover:bg-white" disabled={shown === 0}>
          <Download className="h-4 w-4" aria-hidden />
          Xuất tất cả
        </Button>
      </div>

      {/* Hàng 2: chip trạng thái + mở/thu tất cả */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {STATUS_CHIPS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onStatus(c.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              status === c.value
                ? 'border-brand-violet bg-brand-violet/10 text-brand-violet'
                : 'border-border-default bg-white/70 text-text-secondary hover:bg-white',
            )}
          >
            {c.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-text-tertiary text-xs tabular-nums">
            {shown}/{total} lead
          </span>
          <Button type="button" variant="ghost" size="xs" onClick={onExpandAll} className="text-text-secondary">
            <ChevronsUpDown className="h-3 w-3" aria-hidden />
            Mở hết
          </Button>
          <Button type="button" variant="ghost" size="xs" onClick={onCollapseAll} className="text-text-secondary">
            <ChevronsDownUp className="h-3 w-3" aria-hidden />
            Thu hết
          </Button>
        </div>
      </div>

      {/* Hàng 3: chọn nhiều để xuất riêng */}
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border-default/60 pt-3">
        <label className="text-text-secondary flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={onToggleSelectAll}
            disabled={shown === 0}
            aria-label="Chọn tất cả lead đang hiển thị"
            className="accent-brand-violet h-4 w-4 cursor-pointer"
          />
          Chọn tất cả đang hiện
        </label>

        {selectedCount > 0 && (
          <>
            <span className="text-brand-violet text-xs font-medium tabular-nums">
              Đã chọn {selectedCount}
            </span>
            <Button type="button" variant="ghost" size="xs" onClick={onClearSelection} className="text-text-tertiary">
              Bỏ chọn
            </Button>
          </>
        )}

        <Button
          type="button"
          size="sm"
          onClick={onExportSelected}
          disabled={selectedCount === 0}
          className="ml-auto rounded-lg"
        >
          <Download className="h-4 w-4" aria-hidden />
          Xuất đã chọn ({selectedCount})
        </Button>
      </div>
    </div>
  );
}

function ViewBtn({ active, onClick, label, children }: {
  active: boolean; onClick: () => void; label: string; children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
        active ? 'bg-brand-violet/10 text-brand-violet' : 'text-text-tertiary hover:bg-white hover:text-text-primary',
      )}
    >
      {children}
    </button>
  );
}
