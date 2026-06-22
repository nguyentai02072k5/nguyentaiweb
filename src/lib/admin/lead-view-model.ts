/**
 * lead-view-model.ts - Chuyển LeadRow (DB) → view-model serializable cho client CMS.
 *
 * Server component build sẵn (dùng formatLeadValue/hasLeadValue + field config) rồi
 * truyền xuống client explorer. Nhờ vậy client KHÔNG cần import field config nặng
 * hay các helper chạy server, chỉ render + lọc trên dữ liệu phẳng.
 *
 * Lead tách theo NGUỒN (sourceGroup): 'infor' (wizard infor.*) vs 'mooly' (form.*).
 * Mỗi nhóm có BỘ FIELD riêng → answers + cột export khớp đúng nguồn, không trộn.
 * Field tài liệu upload (business_doc_*) dùng chung cho cả 2 nhóm.
 */

import 'server-only';
import type { LeadRow } from '@/lib/admin/fetch-leads';
import { LEAD_FIELDS, LEAD_DOC_FIELDS, formatLeadValue, hasLeadValue } from '@/lib/leads/lead-field-config';
import { MOOLY_DISPLAY_FIELDS } from '@/lib/leads/mooly-field-config';
import { formatVnPhoneDisplay } from '@/lib/format/phone-vn';

export type SourceGroup = 'infor' | 'mooly';

// LEAD_FIELDS đã gồm sẵn LEAD_DOC_FIELDS; MOOLY thì nối thêm để cùng hiển thị file.
const INFOR_FIELDS = LEAD_FIELDS;
const MOOLY_FIELDS_VIEW = [...MOOLY_DISPLAY_FIELDS, ...LEAD_DOC_FIELDS];

export type LeadAnswer = { key: string; label: string; value: string };

export type LeadView = {
  id: string;
  phone: string;
  phoneDisplay: string;
  fullName: string | null;
  status: string;
  source: string | null;
  sourceGroup: SourceGroup;
  note: string | null;
  openedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  answers: LeadAnswer[];
};

/** Cột field cho từng nguồn (header export + thứ tự render). */
export const INFOR_FIELD_COLUMNS: { key: string; label: string }[] = INFOR_FIELDS.map((f) => ({
  key: f.key,
  label: f.label,
}));
export const MOOLY_FIELD_COLUMNS: { key: string; label: string }[] = MOOLY_FIELDS_VIEW.map((f) => ({
  key: f.key,
  label: f.label,
}));

/** Nhóm nguồn từ chuỗi source ('mooly%' → mooly, còn lại infor). Khớp source_group ở DB. */
export function sourceGroupOf(source: string | null): SourceGroup {
  return source?.startsWith('mooly') ? 'mooly' : 'infor';
}

function toLeadView(row: LeadRow): LeadView {
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const group = sourceGroupOf(row.source);
  const fields = group === 'mooly' ? MOOLY_FIELDS_VIEW : INFOR_FIELDS;

  const answers: LeadAnswer[] = [];
  for (const f of fields) {
    const raw = payload[f.key];
    if (hasLeadValue(f, raw)) {
      answers.push({ key: f.key, label: f.label, value: formatLeadValue(f, raw) });
    }
  }

  return {
    id: row.id,
    phone: row.phone,
    phoneDisplay: formatVnPhoneDisplay(row.phone),
    fullName: row.full_name,
    status: row.status,
    source: row.source,
    sourceGroup: group,
    note: row.note,
    openedAt: row.opened_at ?? null,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    answers,
  };
}

export function toLeadViews(rows: LeadRow[]): LeadView[] {
  return rows.map(toLeadView);
}
