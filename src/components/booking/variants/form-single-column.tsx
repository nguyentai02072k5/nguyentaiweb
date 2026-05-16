/**
 * Variant A: Single-column form (per phase 06 plan).
 * One field per row, minimal sections, sequential reading flow.
 * Pros: classic UX, low friction, mobile-natural.
 * Cons: long page khi mở rộng field — phải scroll dài.
 */

'use client';

import { useState } from 'react';
import { ExpectationRow } from '@/components/booking/foundation/expectation-row';
import { BookingProgress } from '@/components/booking/foundation/booking-progress';
import { MOCK_EXPECTATIONS } from '@/components/booking/_mock-data';

export function FormSingleColumn() {
  const [exps, setExps] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  const toggle = (slug: string) =>
    setExps((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Thông Tin Liên Hệ</h3>
        <BookingProgress current={4} total={4} className="hidden sm:flex max-w-[200px]" />
      </div>
      <BookingProgress current={4} total={4} className="sm:hidden mb-4" />

      <div className="space-y-4">
        <Field label="Số điện thoại Zalo" required hint="Tôi sẽ liên hệ Zalo xác nhận lịch">
          <input
            type="tel"
            placeholder="0xxx xxx xxx"
            className="w-full h-12 px-4 rounded-lg border border-border-default bg-white text-base focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none"
            inputMode="tel"
          />
        </Field>

        <Field label="Email (tùy chọn)" hint="Để gửi calendar invite Google Meet">
          <input
            type="email"
            placeholder="email@example.com"
            className="w-full h-12 px-4 rounded-lg border border-border-default bg-white text-base focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none"
          />
        </Field>

        <Field label="Họ tên (tùy chọn)">
          <input
            type="text"
            className="w-full h-12 px-4 rounded-lg border border-border-default bg-white text-base focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none"
          />
        </Field>

        <div>
          <label className="block font-display font-semibold text-text-primary mb-2">
            Anh/chị quan tâm điều gì? <span className="text-text-tertiary font-normal text-sm">(chọn 1 hoặc nhiều)</span>
          </label>
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
        </div>

        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border-default bg-surface-subtle px-4 py-3 min-h-[60px]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-5 w-5 accent-brand-violet"
          />
          <span className="text-sm flex-1">
            Tôi đồng ý nhận tin Zalo xác nhận lịch <span className="text-brand-pink">*</span>
          </span>
        </label>

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

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-display text-sm font-semibold text-text-primary mb-1.5">
        {label} {required && <span className="text-brand-pink">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-text-tertiary">↳ {hint}</p>}
    </div>
  );
}
