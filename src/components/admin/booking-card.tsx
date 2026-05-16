import { Calendar, Clock, Mail, Phone, Sparkles, User } from 'lucide-react';
import { formatVnPhoneDisplay } from '@/lib/format/phone-vn';
import { formatDateLong, formatMeetingRange } from '@/lib/format/date-vn';
import { StatusBadge } from './status-badge';
import type { BookingRow } from '@/lib/admin/fetch-bookings';

const EXPECTATION_LABEL: Record<string, string> = {
  'consult-24-7': 'Tư vấn 24/7',
  'image-recognition': 'Nhận dạng hình ảnh',
  'close-order': 'Chốt đơn tự động',
  'lead-capture': 'Thu thập lead',
  other: 'Khác',
};

export function BookingCard({ booking }: { booking: BookingRow }) {
  const start = new Date(booking.meeting_start);
  const end = new Date(booking.meeting_end);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border-default/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(99,102,241,0.10)]">
      {/* Header: tên + status */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-indigo/15 via-brand-violet/15 to-brand-pink/15 text-brand-violet">
            <User className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-text-primary truncate font-display text-base font-semibold">
              {booking.full_name?.trim() || 'Khách chưa nêu tên'}
            </h3>
            <p className="text-text-tertiary mt-0.5 text-xs">
              Đặt lúc{' '}
              {new Intl.DateTimeFormat('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(booking.created_at))}
            </p>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </header>

      {/* Khung giờ hẹn (nhấn mạnh) */}
      <div className="mt-4 rounded-xl border border-brand-indigo/15 bg-gradient-to-br from-indigo-50/60 via-violet-50/40 to-pink-50/40 p-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-brand-violet h-4 w-4" aria-hidden />
          <p className="text-text-primary text-sm font-semibold">{formatDateLong(start)}</p>
        </div>
        <div className="text-text-secondary mt-1.5 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" aria-hidden />
          <span className="font-medium">{formatMeetingRange(start, end)}</span>
        </div>
      </div>

      {/* Liên hệ */}
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Phone className="text-text-tertiary h-4 w-4 shrink-0" aria-hidden />
          <dt className="sr-only">Số điện thoại</dt>
          <dd className="text-text-primary min-w-0 truncate">
            <a
              href={`tel:${booking.phone_zalo}`}
              className="hover:text-brand-violet font-medium tabular-nums transition"
            >
              {formatVnPhoneDisplay(booking.phone_zalo)}
            </a>
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="text-text-tertiary h-4 w-4 shrink-0" aria-hidden />
          <dt className="sr-only">Email</dt>
          <dd className="text-text-secondary min-w-0 truncate">
            {booking.email ? (
              <a
                href={`mailto:${booking.email}`}
                className="hover:text-brand-violet transition"
              >
                {booking.email}
              </a>
            ) : (
              <span className="text-text-tertiary italic">Chưa cung cấp</span>
            )}
          </dd>
        </div>
      </dl>

      {/* Expectations */}
      {booking.expectations.length > 0 && (
        <div className="mt-4 border-t border-border-default/60 pt-3">
          <p className="text-text-tertiary mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Khách quan tâm
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {booking.expectations.map((slug) => (
              <li
                key={slug}
                className="text-text-secondary rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-medium ring-1 ring-border-default"
              >
                {EXPECTATION_LABEL[slug] ?? slug}
              </li>
            ))}
          </ul>
          {booking.expectation_other && (
            <p className="text-text-secondary mt-2 rounded-lg bg-surface-subtle/60 px-3 py-2 text-xs italic">
              “{booking.expectation_other}”
            </p>
          )}
        </div>
      )}

      {/* Meeting link nếu có */}
      {booking.meet_link && (
        <a
          href={booking.meet_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-indigo mt-4 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
        >
          Mở Google Meet →
        </a>
      )}
    </article>
  );
}
