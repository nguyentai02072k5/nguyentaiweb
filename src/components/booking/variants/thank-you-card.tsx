/**
 * Variant A: Inline thank-you card.
 * Compact, fits within preview frame. Static checkmark, detail rows.
 * Pros: tối giản, không "noisy", phù hợp với brand tone clean.
 * Cons: kém celebratory.
 */

'use client';

import Link from 'next/link';
import { MOCK_THANK_YOU } from '@/components/booking/_mock-data';

export function ThankYouCard() {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-6 shadow-sm text-center">
      <div className="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-indigo to-brand-violet shadow-lg shadow-brand-violet/30">
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 stroke-white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h3 className="font-display text-xl font-bold mb-1">
        Đã Nhận Lịch Meet
      </h3>
      <p className="text-sm text-text-secondary mb-5">
        Tôi sẽ liên hệ Zalo xác nhận trong 24 giờ.
      </p>

      <div className="space-y-2 mb-5 rounded-xl bg-surface-subtle border border-border-default p-4 text-left">
        <Row icon="📅" label="Ngày" value={MOCK_THANK_YOU.dateLabel} />
        <Row icon="🕒" label="Giờ" value={MOCK_THANK_YOU.timeRange} />
        <Row icon="💻" label="Nền tảng" value="Google Meet (link gửi qua Zalo)" />
        <Row icon="📱" label="Số Zalo" value={MOCK_THANK_YOU.phoneMask} />
      </div>

      <div className="flex gap-2">
        <Link
          href="/"
          className="flex-1 h-12 grid place-items-center rounded-xl border border-border-default bg-white font-display text-sm font-semibold hover:border-brand-violet/60 transition"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-base">{icon}</span>
      <span className="text-text-tertiary uppercase tracking-wide text-[10px] font-display w-16">{label}</span>
      <span className="text-text-primary font-medium flex-1">{value}</span>
    </div>
  );
}
