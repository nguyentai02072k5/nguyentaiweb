/**
 * infor-phone-entry.tsx - Màn nhập SĐT khi khách vào thẳng infor.nvt.com (không có /sđt).
 *
 * Khách gõ SĐT → normalize client-side → điều hướng tới /infor/<sđt> để vào form
 * (trang đó sẽ auto-fire ghi nhận 'mở link' như link gửi sẵn).
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeVnPhone } from '@/lib/format/phone-vn';

export function InforPhoneEntry() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = () => {
    const phone = normalizeVnPhone(value);
    if (!phone) {
      setError('Số điện thoại không đúng định dạng. Ví dụ: 0901234567');
      return;
    }
    setError(null);
    setSubmitting(true);
    router.push(`/infor/${phone}`);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-text-primary font-display mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
          <Phone className="text-brand-violet size-3.5" />
          Số điện thoại của anh/chị
        </label>
        <input
          type="tel"
          inputMode="tel"
          placeholder="0xxx xxx xxx"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
          aria-label="Số điện thoại"
          className={cn(
            'border-border-default focus:border-brand-violet focus:ring-brand-violet/15 h-11 w-full rounded-lg border-[1.5px] bg-white px-3 text-sm font-semibold outline-none transition focus:ring-2',
            error && 'border-rose-400',
          )}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={submitting}
        className={cn(
          'flex h-12 w-full items-center justify-center gap-2 rounded-xl font-display text-sm font-bold transition-all',
          submitting
            ? 'bg-surface-subtle text-text-tertiary cursor-not-allowed'
            : 'from-brand-indigo via-brand-violet to-brand-pink shadow-brand-violet/30 bg-gradient-to-r text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]',
        )}
      >
        Tiếp tục
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
