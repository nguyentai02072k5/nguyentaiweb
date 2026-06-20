/**
 * infor-basic-form.tsx - Form thông tin CƠ BẢN (Họ tên / SĐT / Email).
 *
 * Bước 1 landing: khách nhấn "Xác Nhận Thông Tin" → POST /api/infor/capture ghi
 * nhận lead → gọi onCaptured(contact) để flow mở modal pop-out bước 2.
 * Tracking: GTM dataLayer + Meta pixel.
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle, User, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pushToDataLayer } from '@/lib/analytics/gtm';
import { trackMetaCustomEvent, trackMetaStandardEvent } from '@/lib/analytics/meta-pixel';
import { normalizeVnPhone } from '@/lib/format/phone-vn';
import type { LeadCaptureInput } from '@/lib/leads/capture-schema';
import { inputCls, FieldShell } from '../infor-field';

export type ContactInfo = { full_name: string; phone: string; email: string };

type Props = { onCaptured: (contact: ContactInfo) => void; done: boolean };

export function InforBasicForm({ onCaptured, done }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadCaptureInput>({ defaultValues: { full_name: '', phone: '', email: '' } });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const phone = normalizeVnPhone(data.phone);
    if (!phone) {
      setServerError('Số điện thoại không đúng định dạng. Ví dụ: 0901234567');
      return;
    }

    pushToDataLayer({ event: 'infor_capture_attempt' });
    trackMetaCustomEvent('InforCaptureAttempt');

    let res: Response;
    try {
      res = await fetch('/api/infor/capture', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ full_name: data.full_name, phone, email: data.email }),
      });
    } catch {
      setServerError('Lỗi kết nối. Kiểm tra internet và thử lại.');
      return;
    }

    if (res.status === 201) {
      pushToDataLayer({ event: 'infor_lead_captured' });
      trackMetaStandardEvent('Lead', { content_category: 'infor-capture' });
      onCaptured({ full_name: data.full_name, phone, email: data.email });
      return;
    }
    const json = await res.json().catch(() => null);
    setServerError(json?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
  });

  if (done) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3.5 text-sm text-emerald-800">
        <Loader2 className="size-5 shrink-0 animate-spin text-emerald-500" />
        Đã nhận thông tin của anh/chị. Đang chuyển sang trang quà tặng…
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3.5">
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        <FieldShell label="Họ và tên" required error={errors.full_name?.message}>
          <div className="relative">
            <User className="text-text-tertiary absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              aria-label="Họ và tên"
              className={cn(inputCls, 'h-11 pl-9', errors.full_name && 'border-rose-400')}
              {...register('full_name', {
                required: 'Vui lòng nhập họ tên',
                minLength: { value: 2, message: 'Tên quá ngắn' },
              })}
            />
          </div>
        </FieldShell>

        <FieldShell label="Số điện thoại" required error={errors.phone?.message}>
          <div className="relative">
            <Phone className="text-text-tertiary absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <input
              type="tel"
              inputMode="tel"
              placeholder="0901 234 567"
              aria-label="Số điện thoại"
              className={cn(inputCls, 'h-11 pl-9 font-semibold', errors.phone && 'border-rose-400')}
              {...register('phone', {
                required: 'Vui lòng nhập SĐT',
                minLength: { value: 9, message: 'SĐT quá ngắn' },
                pattern: { value: /^[\d\s+\-().]+$/, message: 'SĐT không hợp lệ' },
              })}
            />
          </div>
        </FieldShell>
      </div>

      <FieldShell label="Email" required error={errors.email?.message} wide>
        <div className="relative">
          <Mail className="text-text-tertiary absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <input
            type="email"
            inputMode="email"
            placeholder="email@cuaban.com"
            aria-label="Email"
            className={cn(inputCls, 'h-11 pl-9', errors.email && 'border-rose-400')}
            {...register('email', {
              required: 'Vui lòng nhập email',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
            })}
          />
        </div>
      </FieldShell>

      {serverError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'font-display h-12 w-full rounded-2xl text-sm font-bold transition-all',
          isSubmitting
            ? 'bg-surface-subtle text-text-tertiary cursor-not-allowed'
            : 'from-brand-indigo via-brand-violet to-brand-pink shadow-brand-violet/30 bg-gradient-to-r text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]',
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Đang gửi…
          </span>
        ) : (
          'Xác Nhận Thông Tin'
        )}
      </button>
    </form>
  );
}
