/**
 * mooly-doc-upload.tsx - Chế độ "đã có sẵn tài liệu" của form Mooly.
 *
 * Thay cho điền tay từng mục: khách nhập Tên + SĐT/Zalo (vẫn map đủ) và đính kèm
 * 1 file mô tả shop & quy trình bán hàng → POST multipart /api/form/upload.
 *
 * - File bất kỳ định dạng, tối đa 2MB (validate trùng với bucket + server).
 * - Tracking GTM dataLayer: mở mode / chọn file / gửi / thành công.
 * - Style đồng bộ form Mooly (input cao, CTA gradient aurora, ghi chú bảo mật).
 */

'use client';

import { useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Phone,
  ShieldCheck,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pushToDataLayer } from '@/lib/analytics/gtm';

const MAX_BYTES = 2 * 1024 * 1024;

const inputCls = cn(
  'w-full rounded-xl border-[1.5px] border-border-default bg-white px-3.5 text-[15px] text-text-primary',
  'placeholder:text-text-tertiary/70 transition outline-none',
  'focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/12',
);

type Props = {
  /** SĐT điền sẵn từ link form.nguyenvantai.com/<sđt>. */
  phone?: string;
  /** Tên đã có trên hệ thống → prefill. */
  defaultFullName?: string | null;
  /** Quay lại chế độ điền tay. */
  onBack: () => void;
};

export function MoolyDocUpload({ phone: initPhone, defaultFullName, onBack }: Props) {
  const [phone, setPhone] = useState(initPhone ?? '');
  const [fullName, setFullName] = useState(defaultFullName ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    setFieldError(null);
    setServerError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setFieldError('File vượt quá 2MB. Vui lòng chọn file nhỏ hơn.');
      return;
    }
    setFile(f);
    pushToDataLayer({ event: 'mooly_doc_selected' });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const cleanName = fullName.trim();
    if (cleanName.length < 2) {
      setFieldError('Vui lòng nhập họ và tên.');
      return;
    }
    if (phone.trim().length < 9) {
      setFieldError('Vui lòng nhập số điện thoại / Zalo hợp lệ.');
      return;
    }
    if (!file) {
      setFieldError('Vui lòng chọn file để upload.');
      return;
    }

    setSubmitting(true);
    pushToDataLayer({ event: 'mooly_doc_submit_attempt' });

    const body = new FormData();
    body.append('phone', phone);
    body.append('full_name', cleanName);
    body.append('file', file);

    let res: Response;
    try {
      res = await fetch('/api/form/upload', { method: 'POST', body });
    } catch {
      setSubmitting(false);
      setServerError('Lỗi kết nối. Kiểm tra internet và thử lại.');
      return;
    }

    setSubmitting(false);
    if (res.status === 201) {
      setDone(true);
      pushToDataLayer({ event: 'mooly_doc_submitted' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const json = await res.json().catch(() => null);
    setServerError(json?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-6 py-14 text-center shadow-sm">
        <CheckCircle2 className="size-14 text-emerald-500" />
        <h2 className="font-display text-2xl font-bold text-emerald-900">Đã nhận file! 🎉</h2>
        <p className="max-w-md text-sm leading-relaxed text-emerald-700">
          Cảm ơn anh/chị. Đội ngũ sẽ đọc tài liệu để &quot;huấn luyện&quot; Mooly đúng văn phong shop và
          liên hệ lại trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="text-text-secondary hover:text-brand-violet inline-flex items-center gap-1.5 text-[13.5px] font-semibold transition"
      >
        <ArrowLeft className="size-4" />
        Quay lại điền tay
      </button>

      {/* ---- Liên hệ ---- */}
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
              <label htmlFor="mu_name" className="text-[13.5px] font-semibold capitalize text-text-primary">
                Họ tên người liên hệ <span className="text-brand-pink">*</span>
              </label>
            </div>
            <input
              id="mu_name"
              type="text"
              placeholder="VD: Chị Loma"
              aria-label="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={cn(inputCls, 'h-12')}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand-violet" />
              <label htmlFor="mu_phone" className="text-[13.5px] font-semibold capitalize text-text-primary">
                Số điện thoại / Zalo <span className="text-brand-pink">*</span>
              </label>
            </div>
            <input
              id="mu_phone"
              type="tel"
              inputMode="tel"
              placeholder="0901 234 567"
              aria-label="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={cn(inputCls, 'h-12 font-semibold')}
            />
          </div>
        </div>
      </section>

      {/* ---- Upload file ---- */}
      <section className="rounded-2xl border border-border-default bg-white/90 p-4 shadow-sm sm:p-5">
        <header className="mb-3.5 flex items-center gap-2">
          <span className="from-brand-indigo to-brand-violet flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm">
            <UploadCloud className="size-4" />
          </span>
          <h3 className="font-display text-[15px] font-bold capitalize tracking-tight text-text-primary">
            Tải lên tài liệu shop
          </h3>
        </header>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          aria-label="Chọn file tài liệu"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="border-brand-violet/40 bg-brand-violet/5 flex items-center gap-3 rounded-xl border-[1.5px] p-3.5">
            <FileText className="text-brand-violet size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-text-primary truncate text-sm font-semibold">{file.name}</p>
              <p className="text-text-tertiary text-[11px]">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => pickFile(null)}
              aria-label="Bỏ file đã chọn"
              className="text-text-tertiary hover:bg-rose-50 hover:text-rose-500 flex size-7 items-center justify-center rounded-md transition"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border-brand-violet/40 text-brand-violet hover:bg-brand-violet/5 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed py-8 text-sm font-semibold transition"
          >
            <UploadCloud className="size-6" />
            Bấm để chọn file
            <span className="text-text-tertiary text-[11px] font-normal">
              Mọi định dạng (PDF, Word, ảnh…) · tối đa 2MB
            </span>
          </button>
        )}

        {fieldError && <p className="mt-2 text-[12px] font-medium text-rose-500">{fieldError}</p>}
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
          disabled={submitting}
          className={cn(
            'group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl',
            'bg-aurora font-display text-base font-bold text-white shadow-lg transition-all',
            'hover:shadow-glow-violet active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70',
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Đang gửi…
            </>
          ) : (
            <>
              <UploadCloud className="size-5" />
              Gửi tài liệu cho Mooly
            </>
          )}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[var(--gradient-shine)] transition-transform duration-700 group-hover:translate-x-full" />
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-text-tertiary">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          Thông tin chỉ dùng để cấu hình bot · Bảo mật tuyệt đối, không chia sẻ cho bên thứ ba.
        </p>
      </div>
    </form>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
