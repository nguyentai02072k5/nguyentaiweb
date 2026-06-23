/**
 * /admin/leads - CMS danh sách thông tin khách thu từ infor.* + form.* (Bot Mooly).
 *
 * Server: fetch toàn bộ lead gần nhất (≤200) + tính stats tổng.
 * Client (LeadsExplorer): lọc trạng thái/thời gian, sắp xếp mới-cũ, đổi chế độ xem
 * (thẻ / danh sách), expand-collapse từng lead, export CSV tập đang hiển thị.
 */

import type { Metadata } from 'next';
import { Users, Eye, Send, PhoneCall } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import { StatCard } from '@/components/admin/stat-card';
import { fetchLeads, computeLeadStats } from '@/lib/admin/fetch-leads';
import { toLeadViews, INFOR_FIELD_COLUMNS, MOOLY_FIELD_COLUMNS } from '@/lib/admin/lead-view-model';
import { LeadsExplorer } from '@/components/admin/leads/leads-explorer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Leads · Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  const { data: leads, error } = await fetchLeads({ status: 'all' });
  const stats = computeLeadStats(leads);
  const views = toLeadViews(leads);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <AdminHeader />

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tổng lead" value={stats.total} icon={Users} accent="indigo" />
        <StatCard label="Đã mở link" value={stats.opened} hint="Chưa gửi form" icon={Eye} accent="violet" />
        <StatCard label="Done" value={stats.submitted} hint="Khách đã điền xong" icon={Send} accent="cyan" />
        <StatCard label="Đã liên hệ" value={stats.contacted} icon={PhoneCall} accent="pink" />
      </section>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      <section className="mt-6">
        <LeadsExplorer
          leads={views}
          inforColumns={INFOR_FIELD_COLUMNS}
          moolyColumns={MOOLY_FIELD_COLUMNS}
        />
      </section>

      <p className="text-text-tertiary mt-8 text-center text-xs">
        Hiển thị tối đa 200 lead gần nhất · Lọc &amp; export chạy trên trình duyệt · Cập nhật khi reload trang
      </p>
    </main>
  );
}
