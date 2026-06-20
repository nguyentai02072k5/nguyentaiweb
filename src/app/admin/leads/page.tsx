/**
 * /admin/leads - CMS danh sách thông tin khách thu từ link infor.nguyenvantai.com.
 *
 * KHUNG SƯỜN: bảng tối giản hiển thị SĐT / họ tên / trạng thái / mốc mở-gửi.
 * Khi anh chốt các trường câu hỏi, cột payload sẽ render chi tiết tại đây.
 */

import type { Metadata } from 'next';
import { Users, Eye, Send, PhoneCall } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { StatCard } from '@/components/admin/stat-card';
import {
  fetchLeads,
  computeLeadStats,
  type LeadStatusFilter,
  type LeadRow,
} from '@/lib/admin/fetch-leads';
import { formatVnPhoneDisplay } from '@/lib/format/phone-vn';
import { LEAD_FIELDS, formatLeadValue, hasLeadValue } from '@/lib/leads/lead-field-config';
import { MOOLY_DISPLAY_FIELDS } from '@/lib/leads/mooly-field-config';

// Field hiển thị trong CMS = wizard infor + form Mooly. Mỗi lead chỉ chứa key
// của nguồn tương ứng (key 2 nhóm không trùng) nên card chỉ hiện đúng phần của nó.
const DISPLAY_FIELDS = [...LEAD_FIELDS, ...MOOLY_DISPLAY_FIELDS];

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Leads · Admin',
  robots: { index: false, follow: false },
};

const VALID_STATUS: LeadStatusFilter[] = [
  'all', 'opened', 'submitted', 'contacted', 'converted', 'spam', 'archived',
];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status: rawStatus, q } = await searchParams;
  const status = (VALID_STATUS as string[]).includes(rawStatus ?? '')
    ? (rawStatus as LeadStatusFilter)
    : 'all';

  const { data: leads, error } = await fetchLeads({ status, search: q });
  const stats = computeLeadStats(leads);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <AdminHeader />

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tổng lead" value={stats.total} icon={Users} accent="indigo" />
        <StatCard label="Đã mở link" value={stats.opened} hint="Chưa gửi form" icon={Eye} accent="violet" />
        <StatCard label="Đã gửi form" value={stats.submitted} icon={Send} accent="cyan" />
        <StatCard label="Đã liên hệ" value={stats.contacted} icon={PhoneCall} accent="pink" />
      </section>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      <section className="mt-6">
        {leads.length === 0 && !error ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </section>

      <p className="text-text-tertiary mt-8 text-center text-xs">
        Hiển thị tối đa 200 lead gần nhất · Server-side render · Cập nhật khi reload trang
      </p>
    </main>
  );
}

function LeadCard({ lead }: { lead: LeadRow }) {
  const payload = (lead.payload ?? {}) as Record<string, unknown>;
  // Hiển thị theo THỨ TỰ config, chỉ field có giá trị.
  const answered = DISPLAY_FIELDS.filter((f) => hasLeadValue(f, payload[f.key]));

  return (
    <article className="rounded-2xl border border-border-default bg-white/85 p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-border-default/60 pb-3">
        <div>
          <p className="text-text-primary font-display text-lg font-bold tabular-nums">
            {formatVnPhoneDisplay(lead.phone)}
          </p>
          <p className="text-text-secondary text-sm">{lead.full_name ?? '— chưa có tên —'}</p>
        </div>
        <StatusBadge status={lead.status} />
      </header>

      {answered.length > 0 ? (
        <dl className="mt-3 space-y-2">
          {answered.map((f) => (
            <div key={f.key}>
              <dt className="text-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
                {f.label}
              </dt>
              <dd className="text-text-primary whitespace-pre-wrap text-sm">
                {formatLeadValue(f, payload[f.key])}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-text-tertiary mt-3 text-sm italic">Mới mở link, chưa gửi phiếu.</p>
      )}

      <footer className="text-text-tertiary mt-3 flex gap-4 border-t border-border-default/60 pt-2 text-[11px]">
        <span>Mở: {fmtDate(lead.opened_at)}</span>
        <span>Gửi: {fmtDate(lead.submitted_at)}</span>
      </footer>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    opened: 'bg-violet-50 text-violet-700 border-violet-200',
    submitted: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    contacted: 'bg-pink-50 text-pink-700 border-pink-200',
    converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    spam: 'bg-amber-50 text-amber-700 border-amber-200',
    archived: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${map[status] ?? map.archived}`}>
      {status}
    </span>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

function EmptyState() {
  return (
    <div className="border-border-default flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white/60 px-6 py-16 text-center">
      <Users className="text-text-tertiary mb-3 h-8 w-8" />
      <h2 className="text-text-primary font-display text-lg font-semibold">Chưa có lead nào</h2>
      <p className="text-text-secondary mt-1 max-w-sm text-sm">
        Khách mở link infor.nguyenvantai.com/&lt;sđt&gt; sẽ xuất hiện tại đây.
      </p>
    </div>
  );
}
