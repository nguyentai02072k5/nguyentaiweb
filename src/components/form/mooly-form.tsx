/**
 * mooly-form.tsx - Form khai thác thông tin Bot Mooly (1 trang, config-driven).
 *
 * Cấu trúc:
 *   - Khối liên hệ (Tên + SĐT/Zalo) → bắt buộc, để lead gọi/nhắn lại được.
 *   - Các trường nội dung từ MOOLY_FIELDS (text/textarea + FAQ dạng repeater Q&A).
 *   - Thanh tiến độ hoàn thành (MoolyProgress) theo số mục BẮT BUỘC đã điền.
 *   - Submit → POST /api/form/submit (tái dùng RPC submit_lead, source='mooly-form').
 *   - Tracking GTM dataLayer: start / submit / success.
 */

'use client';

import { useMemo, useRef, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { CheckCircle2, User, Phone, Send, Loader2, ShieldCheck, UploadCloud, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pushToDataLayer } from '@/lib/analytics/gtm';
import { MOOLY_FIELDS } from '@/lib/leads/mooly-field-config';
import type { MoolySubmitInput } from '@/lib/leads/mooly-schema';
import { MoolyFieldRow } from './mooly-field';
import { MoolyProgress } from './mooly-progress';
import { MoolyDocUpload } from './mooly-doc-upload';

const inputCls = cn(
  'w-full rounded-xl border-[1.5px] border-border-default bg-white px-3.5 text-[15px] text-text-primary',
  'placeholder:text-text-tertiary/70 transition outline-none',
  'focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/12',
);

const FAQ_FIELD = MOOLY_FIELDS.find((f) => f.type === 'repeater');
const REQUIRED_CONTENT = MOOLY_FIELDS.filter((f) => f.required);
// Tổng mục bắt buộc = 2 contact + các field nội dung required.
const TOTAL_REQUIRED = 2 + REQUIRED_CONTENT.length;

/** Seed payload: FAQ có sẵn vài dòng trống cho khách điền ngay. */
function seedPayload(): Record<string, unknown> {
  if (!FAQ_FIELD) return {};
  const rows = Array.from({ length: FAQ_FIELD.seedRows ?? 2 }, () =>
    Object.fromEntries((FAQ_FIELD.subFields ?? []).map((s) => [s.key, ''])),
  );
  return { [FAQ_FIELD.key]: rows };
}

type MoolyFormProps = {
  /** Link form.nguyenvantai.com/<sđt>: SĐT điền sẵn từ URL. */
  phone?: string;
  /** Tên đã có trên hệ thống (nếu lead từng được thu) → prefill, trống thì điền sau. */
  defaultFullName?: string | null;
  /** Lead này từng submit trước đó → hiện nhắc nhẹ. */
  alreadySubmitted?: boolean;
};

export function MoolyForm({ phone, defaultFullName, alreadySubmitted }: MoolyFormProps = {}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [mode, setMode] = useState<'manual' | 'upload'>('manual');
  const started = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MoolySubmitInput>({
    defaultValues: { phone: phone ?? '', full_name: defaultFullName ?? '', payload: seedPayload() },
  });

  const faqArray = useFieldArray({ control, name: 'payload.faqs' as never });

  // Theo dõi toàn form để tính tiến độ + tick "đã điền" từng ô.
  const watched = useWatch({ control }) as Partial<MoolySubmitInput> | undefined;
  const payload = useMemo(() => (watched?.payload ?? {}) as Record<string, unknown>, [watched?.payload]);

  const filledRequired = useMemo(() => {
    const has = (v: unknown) => String(v ?? '').trim() !== '';
    let n = 0;
    if (has(watched?.full_name)) n += 1;
    if (has(watched?.phone)) n += 1;
    for (const f of REQUIRED_CONTENT) if (has(payload[f.key])) n += 1;
    return n;
  }, [watched?.full_name, watched?.phone, payload]);

  const fireStart = () => {
    if (started.current) return;
    started.current = true;
    pushToDataLayer({ event: 'mooly_form_start' });
  };

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    pushToDataLayer({ event: 'mooly_form_submit_attempt' });

    const cleanPayload = cleanMoolyPayload(data.payload);

    let res: Response;
    try {
      res = await fetch('/api/form/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, full_name: data.full_name, payload: cleanPayload }),
      });
    } catch {
      setServerError('Lỗi kết nối. Kiểm tra internet và thử lại.');
      return;
    }

    if (res.status === 201) {
      setDone(true);
      pushToDataLayer({ event: 'mooly_lead_submitted' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const json = await res.json().catch(() => null);
    setServerError(json?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
  });

  if (mode === 'upload') {
    return (
      <MoolyDocUpload
        phone={phone}
        defaultFullName={defaultFullName}
        onBack={() => setMode('manual')}
      />
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-6 py-14 text-center shadow-sm">
        <CheckCircle2 className="size-14 text-emerald-500" />
        <h2 className="font-display text-2xl font-bold text-emerald-900">Đã nhận thông tin! 🎉</h2>
        <p className="max-w-md text-sm leading-relaxed text-emerald-700">
          Cảm ơn anh/chị. Đội ngũ sẽ dùng những thông tin này để &quot;huấn luyện&quot; Mooly đúng văn phong
          shop và liên hệ lại trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onFocusCapture={fireStart} noValidate>
      <MoolyProgress filled={filledRequired} total={TOTAL_REQUIRED} />

      {alreadySubmitted && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-800">
          Anh/chị đã gửi thông tin trước đó. Gửi lại sẽ cập nhật thông tin mới nhất.
        </div>
      )}

      {/* Lối tắt: đã có sẵn tài liệu → bỏ qua điền tay, chuyển sang upload file. */}
      <button
        type="button"
        onClick={() => {
          setMode('upload');
          pushToDataLayer({ event: 'mooly_mode_upload' });
        }}
        className="group border-brand-violet/30 from-brand-indigo/5 to-brand-pink/5 hover:border-brand-violet/50 mb-5 flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-dashed bg-gradient-to-r px-4 py-3.5 text-left transition"
      >
        <span className="from-brand-indigo to-brand-violet flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm">
          <UploadCloud className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold leading-snug text-text-primary">
            Đã có sẵn File mô tả shop &amp; quy trình bán hàng?
          </span>
          <span className="block text-[12.5px] leading-snug text-text-secondary">
            Bấm vào đây để upload — khỏi điền tay từng mục.
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-brand-violet transition-transform group-hover:translate-x-0.5" />
      </button>

      <div className="space-y-6">
        {/* ---- Khối liên hệ ---- */}
        <section className="rounded-2xl border border-border-default bg-white/90 p-4 shadow-sm sm:p-5">
          <header className="mb-3.5 flex items-center gap-2">
            <span className="from-brand-indigo to-brand-violet flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-bold text-white shadow-sm">
              01
            </span>
            <h3 className="font-display text-[15px] font-bold capitalize tracking-tight text-text-primary">
              Thông tin liên hệ
            </h3>
          </header>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <User className="size-4 shrink-0 text-brand-violet" />
                <label htmlFor="full_name" className="text-[13.5px] font-semibold capitalize text-text-primary">
                  Họ tên người liên hệ <span className="text-brand-pink">*</span>
                </label>
              </div>
              <input
                id="full_name"
                type="text"
                placeholder="VD: Chị Loma"
                aria-label="Họ và tên"
                aria-invalid={!!errors.full_name}
                className={cn(inputCls, 'h-12', errors.full_name && 'border-rose-400 focus:ring-rose-500/12')}
                {...register('full_name', {
                  required: 'Vui lòng nhập họ tên',
                  minLength: { value: 2, message: 'Tên quá ngắn' },
                })}
              />
              {errors.full_name && (
                <p className="mt-1 text-[12px] font-medium text-rose-500">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-brand-violet" />
                <label htmlFor="phone" className="text-[13.5px] font-semibold capitalize text-text-primary">
                  Số điện thoại / Zalo <span className="text-brand-pink">*</span>
                </label>
              </div>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="0901 234 567"
                aria-label="Số điện thoại"
                aria-invalid={!!errors.phone}
                className={cn(inputCls, 'h-12 font-semibold', errors.phone && 'border-rose-400 focus:ring-rose-500/12')}
                {...register('phone', {
                  required: 'Vui lòng nhập SĐT',
                  minLength: { value: 9, message: 'SĐT quá ngắn' },
                  pattern: { value: /^[\d\s+\-().]+$/, message: 'SĐT không hợp lệ' },
                })}
              />
              {errors.phone ? (
                <p className="mt-1 text-[12px] font-medium text-rose-500">{errors.phone.message}</p>
              ) : phone ? (
                <p className="text-text-tertiary mt-1 text-[11px]">↳ Đã điền sẵn từ link — sửa nếu chưa đúng</p>
              ) : null}
            </div>
          </div>
        </section>

        {/* ---- Khối nội dung huấn luyện bot ---- */}
        <section className="rounded-2xl border border-border-default bg-white/90 p-4 shadow-sm sm:p-5">
          <header className="mb-4 flex items-center gap-2">
            <span className="from-brand-indigo to-brand-violet flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-bold text-white shadow-sm">
              02
            </span>
            <h3 className="font-display text-[15px] font-bold capitalize tracking-tight text-text-primary">
              Thông tin để huấn luyện Mooly
            </h3>
          </header>

          <div className="space-y-5">
            {MOOLY_FIELDS.map((field) => (
              <MoolyFieldRow
                key={field.key}
                field={field}
                register={register}
                error={errors.payload?.[field.key] as never}
                filled={hasFieldValue(field.type, payload[field.key])}
                arr={field.type === 'repeater' ? faqArray : undefined}
              />
            ))}
          </div>
        </section>

        {serverError && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {serverError}
          </div>
        )}

        {/* ---- CTA gửi ---- */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl',
              'bg-aurora font-display text-base font-bold text-white shadow-lg transition-all',
              'hover:shadow-glow-violet active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70',
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Đang gửi…
              </>
            ) : (
              <>
                <Send className="size-5" />
                Gửi thông tin cho Mooly
              </>
            )}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[var(--gradient-shine)] transition-transform duration-700 group-hover:translate-x-full" />
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-text-tertiary">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            Thông tin chỉ dùng để cấu hình bot · Bảo mật tuyệt đối, không chia sẻ cho bên thứ ba.
          </p>
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Field đã có giá trị thực? (repeater: ít nhất 1 dòng có nội dung). */
function hasFieldValue(type: string, value: unknown): boolean {
  if (type === 'repeater') {
    return Array.isArray(value) && value.some((row) =>
      Object.values((row ?? {}) as Record<string, unknown>).some((v) => String(v ?? '').trim() !== ''),
    );
  }
  return String(value ?? '').trim() !== '';
}

/** Bỏ ô/dòng rỗng để payload gọn (scalar trống bỏ key; repeater bỏ dòng trống). */
function cleanMoolyPayload(payload: Record<string, unknown> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload ?? {})) {
    if (Array.isArray(value)) {
      const rows = value
        .map((row) => {
          const r = (row ?? {}) as Record<string, unknown>;
          const cleaned = Object.fromEntries(Object.entries(r).filter(([, v]) => String(v ?? '').trim() !== ''));
          return Object.keys(cleaned).length ? cleaned : null;
        })
        .filter(Boolean);
      if (rows.length) out[key] = rows;
      continue;
    }
    if (String(value ?? '').trim() !== '') out[key] = value;
  }
  return out;
}
