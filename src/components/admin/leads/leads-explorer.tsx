'use client';

/**
 * leads-explorer.tsx - Khu vực tương tác CMS leads (client).
 *
 * Server fetch sẵn toàn bộ lead (≤200) → explorer lọc/sắp xếp/đổi view/expand
 * hoàn toàn client-side cho mượt. Export CSV dựng từ tập đang hiển thị.
 */

import { useMemo, useState, useCallback } from 'react';
import { Users } from 'lucide-react';
import { LeadsToolbar } from '@/components/admin/leads/leads-toolbar';
import { LeadCard, LeadListRow } from '@/components/admin/leads/lead-items';
import type {
  StatusFilter, TimeRange, SortOrder, ViewMode, SourceGroup,
} from '@/components/admin/leads/leads-explorer-types';
import { buildLeadsCsv, csvFileName } from '@/lib/admin/leads-csv';
import { deleteLeadAction } from '@/app/admin/leads/actions';
import type { LeadView } from '@/lib/admin/lead-view-model';

const TIME_WINDOW_MS: Record<Exclude<TimeRange, 'all' | 'today'>, number> = {
  '7d': 7 * 86_400_000,
  '30d': 30 * 86_400_000,
};

function matchesTime(createdAt: string, range: TimeRange): boolean {
  if (range === 'all') return true;
  const ts = new Date(createdAt).getTime();
  if (range === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return ts >= start.getTime();
  }
  return Date.now() - ts <= TIME_WINDOW_MS[range];
}

function matchesSearch(lead: LeadView, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  if (lead.phone.includes(needle) || lead.phoneDisplay.includes(needle)) return true;
  if (lead.fullName?.toLowerCase().includes(needle)) return true;
  return lead.answers.some((a) => a.value.toLowerCase().includes(needle));
}

export function LeadsExplorer({
  leads,
  inforColumns,
  moolyColumns,
}: {
  leads: LeadView[];
  inforColumns: { key: string; label: string }[];
  moolyColumns: { key: string; label: string }[];
}) {
  const [group, setGroup] = useState<SourceGroup>('infor');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [view, setView] = useState<ViewMode>('card');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Ẩn ngay lead vừa xoá (optimistic); reload trang sẽ lấy dữ liệu DB mới.
  const liveLeads = useMemo(
    () => leads.filter((l) => !removedIds.has(l.id)),
    [leads, removedIds],
  );

  // Đếm theo nguồn cho 2 tab.
  const groupCounts = useMemo(
    () => ({
      infor: liveLeads.filter((l) => l.sourceGroup === 'infor').length,
      mooly: liveLeads.filter((l) => l.sourceGroup === 'mooly').length,
    }),
    [liveLeads],
  );

  // Cột export + lead khả dụng theo nguồn đang chọn.
  const columns = group === 'mooly' ? moolyColumns : inforColumns;
  const groupLeads = useMemo(
    () => liveLeads.filter((l) => l.sourceGroup === group),
    [liveLeads, group],
  );

  // Đổi tab → bỏ chọn + thu gọn để không lẫn lead khác nguồn.
  const changeGroup = useCallback((g: SourceGroup) => {
    setGroup(g);
    setSelectedIds(new Set());
    setExpandedIds(new Set());
  }, []);

  const filtered = useMemo(() => {
    const out = groupLeads.filter(
      (l) =>
        (status === 'all' || l.status === status) &&
        matchesTime(l.createdAt, timeRange) &&
        matchesSearch(l, search),
    );
    out.sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sort === 'newest' ? diff : -diff;
    });
    return out;
  }, [groupLeads, status, timeRange, search, sort]);

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(
    () => setExpandedIds(new Set(filtered.map((l) => l.id))),
    [filtered],
  );
  const collapseAll = useCallback(() => setExpandedIds(new Set()), []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((l) => selectedIds.has(l.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const everyShown = filtered.length > 0 && filtered.every((l) => next.has(l.id));
      if (everyShown) filtered.forEach((l) => next.delete(l.id));
      else filtered.forEach((l) => next.add(l.id));
      return next;
    });
  }, [filtered]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const downloadCsv = useCallback(
    (list: LeadView[]) => {
      if (list.length === 0) return;
      const csv = buildLeadsCsv(list, columns);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = csvFileName(group);
      a.click();
      URL.revokeObjectURL(url);
    },
    [columns, group],
  );

  const handleExportAll = useCallback(() => downloadCsv(filtered), [downloadCsv, filtered]);
  const handleExportSelected = useCallback(
    () => downloadCsv(liveLeads.filter((l) => selectedIds.has(l.id))),
    [downloadCsv, liveLeads, selectedIds],
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Xoá lead này? Hành động không thể hoàn tác.')) return;
    setDeletingId(id);
    const res = await deleteLeadAction(id);
    setDeletingId(null);
    if (!res.ok) {
      window.alert(`Xoá thất bại: ${res.error ?? 'lỗi không xác định'}`);
      return;
    }
    setRemovedIds((prev) => new Set(prev).add(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      <LeadsToolbar
        group={group}
        groupCounts={groupCounts}
        onGroup={changeGroup}
        search={search}
        status={status}
        timeRange={timeRange}
        sort={sort}
        view={view}
        shown={filtered.length}
        total={groupLeads.length}
        selectedCount={selectedIds.size}
        allVisibleSelected={allVisibleSelected}
        onSearch={setSearch}
        onStatus={setStatus}
        onTimeRange={setTimeRange}
        onSort={setSort}
        onView={setView}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onExportAll={handleExportAll}
        onExportSelected={handleExportSelected}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
      />

      {filtered.length === 0 ? (
        <EmptyState filtered={groupLeads.length > 0} group={group} />
      ) : view === 'card' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              expanded={expandedIds.has(lead.id)}
              onToggle={() => toggle(lead.id)}
              selected={selectedIds.has(lead.id)}
              onSelect={() => toggleSelect(lead.id)}
              onDelete={() => handleDelete(lead.id)}
              deleting={deletingId === lead.id}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <LeadListRow
              key={lead.id}
              lead={lead}
              expanded={expandedIds.has(lead.id)}
              onToggle={() => toggle(lead.id)}
              selected={selectedIds.has(lead.id)}
              onSelect={() => toggleSelect(lead.id)}
              onDelete={() => handleDelete(lead.id)}
              deleting={deletingId === lead.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ filtered, group }: { filtered: boolean; group: SourceGroup }) {
  const sourceHint =
    group === 'mooly'
      ? 'Khách điền form tại form.nguyenvantai.com sẽ xuất hiện tại đây.'
      : 'Khách mở link infor.nguyenvantai.com/<sđt> sẽ xuất hiện tại đây.';
  return (
    <div className="border-border-default flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white/60 px-6 py-16 text-center">
      <Users className="text-text-tertiary mb-3 h-8 w-8" />
      <h2 className="text-text-primary font-display text-lg font-semibold">
        {filtered ? 'Không có lead khớp bộ lọc' : 'Chưa có lead nào'}
      </h2>
      <p className="text-text-secondary mt-1 max-w-sm text-sm">
        {filtered ? 'Thử đổi trạng thái, khoảng thời gian hoặc xoá từ khoá tìm kiếm.' : sourceHint}
      </p>
    </div>
  );
}
