import { CalendarClock, CheckCircle2, ClipboardList, Inbox, XCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { AdminHeader } from '@/components/admin/admin-header';
import { BookingCard } from '@/components/admin/booking-card';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatCard } from '@/components/admin/stat-card';
import {
  computeStats,
  fetchBookings,
  type BookingStatusFilter,
} from '@/lib/admin/fetch-bookings';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Bookings · Admin',
  robots: { index: false, follow: false },
};

const VALID_STATUS: BookingStatusFilter[] = [
  'all',
  'pending',
  'confirmed',
  'rescheduled',
  'cancelled',
  'completed',
  'no-show',
];

type SearchParams = { status?: string; q?: string };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status: rawStatus, q } = await searchParams;
  const status = (VALID_STATUS as string[]).includes(rawStatus ?? '')
    ? (rawStatus as BookingStatusFilter)
    : 'all';

  const { data: bookings, error } = await fetchBookings({ status, search: q });
  const stats = computeStats(bookings);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <AdminHeader />

      {/* Stats */}
      <section
        aria-label="Tổng quan"
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <StatCard
          label="Tổng booking"
          value={stats.total}
          icon={ClipboardList}
          accent="indigo"
        />
        <StatCard
          label="Hôm nay"
          value={stats.today}
          hint="Tính theo Asia/Ho_Chi_Minh"
          icon={CalendarClock}
          accent="violet"
        />
        <StatCard
          label="Sắp tới"
          value={stats.upcoming}
          hint="Pending + confirmed"
          icon={Inbox}
          accent="pink"
        />
        <StatCard
          label="Đã xác nhận"
          value={stats.confirmed}
          icon={CheckCircle2}
          accent="cyan"
        />
        <StatCard
          label="Đã huỷ"
          value={stats.cancelled}
          icon={XCircle}
          accent="amber"
        />
      </section>

      {/* Filters */}
      <section aria-label="Bộ lọc" className="mt-6">
        <FilterBar />
      </section>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700"
        >
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      {/* List */}
      <section aria-label="Danh sách booking" className="mt-6">
        {bookings.length === 0 && !error ? (
          <EmptyState hasFilter={status !== 'all' || !!q} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      <p className="text-text-tertiary mt-8 text-center text-xs">
        Hiển thị tối đa 200 booking gần nhất · Server-side render · Cập nhật khi reload trang
      </p>
    </main>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="border-border-default flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white/60 px-6 py-16 text-center">
      <div className="bg-surface-subtle mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
        <Inbox className="text-text-tertiary h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-text-primary font-display text-lg font-semibold">
        {hasFilter ? 'Không có booking nào khớp bộ lọc' : 'Chưa có booking nào'}
      </h2>
      <p className="text-text-secondary mt-1 max-w-sm text-sm">
        {hasFilter
          ? 'Thử bỏ bộ lọc hoặc tìm kiếm bằng từ khoá khác.'
          : 'Khách đặt lịch trên landing page sẽ xuất hiện tại đây.'}
      </p>
    </div>
  );
}
