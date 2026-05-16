/**
 * Variant B: Sectioned cards form.
 * 3 card sections: Contact / Nhu cầu / Đồng ý.
 * Pros: chia chunk rõ ràng, dễ đọc, mỗi section như 1 "task" nhỏ.
 * Cons: thêm visual chrome, tốn vertical space vì padding kép.
 */

'use client';

import { useState } from 'react';
import { ExpectationRow } from '@/components/booking/foundation/expectation-row';
import { BookingProgress } from '@/components/booking/foundation/booking-progress';
import { MOCK_EXPECTATIONS } from '@/components/booking/_mock-data';

export function FormSectioned() {
  const [exps, setExps] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  const toggle = (slug: string) =>
    setExps((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  return (
    <div className="rounded-2xl border border-border-default bg-surface-subtle p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Thông Tin Liên Hệ</h3>
        <BookingProgress current={4} total={4} className="hidden sm:flex max-w-[200px]" />
      </div>
      <BookingProgress current={4} total={4} className="sm:hidden mb-4" />

      <div className="space-y-3">
        <Section title="1. Liên Hệ" icon="📞">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-display font-semibold uppercase tracking-wide text-text-secondary mb-1">
                Zalo phone <span className="text-brand-pink">*</span>
              </label>
              <input
                type="tel"
                placeholder="0xxx xxx xxx"
                className="w-full h-12 px-4 rounded-lg border border-border-default bg-white text-base focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none"
                inputMode="tel"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email (tùy chọn)"
                className="w-full h-12 px-4 rounded-lg border border-border-default bg-white text-sm focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none"
              />
              <input
                type="text"
                placeholder="Họ tên (tùy chọn)"
                className="w-full h-12 px-4 rounded-lg border border-border-default bg-white text-sm focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none"
              />
            </div>
          </div>
        </Section>

        <Section title="2. Nhu Cầu" icon="🎯" subtitle="Chọn 1 hoặc nhiều">
          <div className="space-y-2">
            {MOCK_EXPECTATIONS.map((e) => (
              <ExpectationRow
                key={e.slug}
                slug={e.slug}
                icon={e.icon}
                label={e.label}
                description={e.description}
                checked={exps.includes(e.slug)}
                onToggle={toggle}
              />
            ))}
          </div>
        </Section>

        <Section title="3. Xác Nhận" icon="✓">
          <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-brand-violet"
            />
            <span className="text-sm flex-1">
              Tôi đồng ý nhận tin Zalo xác nhận lịch <span className="text-brand-pink">*</span>
            </span>
          </label>
        </Section>

        <button
          type="button"
          disabled={!consent}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white font-display font-semibold text-base shadow-lg shadow-brand-violet/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          Xác nhận đặt lịch →
        </button>
      </div>
    </div>
  );
}

function Section({
  title, icon, subtitle, children,
}: {
  title: string; icon: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h4 className="font-display font-semibold text-sm">{title}</h4>
        {subtitle && (
          <span className="text-xs text-text-tertiary font-normal">{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  );
}
