/**
 * leads-csv.ts - Build chuỗi CSV từ danh sách lead (chạy được ở client để export).
 *
 * - Có BOM (﻿) để Excel mở đúng tiếng Việt.
 * - SĐT dùng dạng có khoảng trắng ("0345 324 467") nên Excel giữ là text, không
 *   nuốt số 0 đầu.
 * - Mỗi field 1 cột (cột truyền vào theo nguồn: infor/mooly); lead thiếu field → ô trống.
 */

import type { LeadView } from '@/lib/admin/lead-view-model';

const META_COLUMNS = ['SĐT', 'Họ tên', 'Trạng thái', 'Nguồn', 'Mở lúc', 'Gửi lúc'] as const;

function escapeCsv(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function fmtTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

export function buildLeadsCsv(
  leads: LeadView[],
  columns: { key: string; label: string }[],
): string {
  const header = [...META_COLUMNS, ...columns.map((c) => c.label)];
  const lines = leads.map((l) => {
    const valueByKey = new Map(l.answers.map((a) => [a.key, a.value]));
    const cells = [
      l.phoneDisplay,
      l.fullName ?? '',
      l.status,
      l.source ?? '',
      fmtTime(l.openedAt),
      fmtTime(l.submittedAt),
      ...columns.map((c) => valueByKey.get(c.key) ?? ''),
    ];
    return cells.map(escapeCsv).join(',');
  });
  return '﻿' + [header.map(escapeCsv).join(','), ...lines].join('\r\n');
}

/** Tên file export theo nguồn + ngày: leads-{group}-YYYYMMDD.csv. */
export function csvFileName(group?: string): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const tag = group ? `${group}-` : '';
  return `leads-${tag}${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.csv`;
}
