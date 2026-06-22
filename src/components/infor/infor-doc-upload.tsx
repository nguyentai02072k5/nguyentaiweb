/**
 * infor-doc-upload.tsx - Chế độ "đã có sẵn tài liệu" của phiếu set-up chatbot.
 *
 * Thay cho wizard điền tay: khách xác nhận SĐT/Tên (vẫn map đủ) + đính kèm 1 file
 * mô tả doanh nghiệp & quy trình bán hàng → POST multipart /api/infor/upload.
 *
 * - lockedContact: landing đã thu SĐT/Tên → chỉ hiện chip xác nhận.
 *   Ngược lại (link theo SĐT): cho sửa SĐT/Tên trước khi gửi.
 * - File bất kỳ định dạng, tối đa 2MB (validate trùng với bucket + server).
 * - Tracking: dataLayer + Meta pixel (mở mode / chọn file / gửi / thành công).
 */

'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, BadgeCheck, CheckCircle2, FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pushToDataLayer } from '@/lib/analytics/gtm';
import { trackMetaCustomEvent, trackMetaStandardEvent } from '@/lib/analytics/meta-pixel';
import { inputCls, FieldShell, Banner } from './infor-field';

const MAX_BYTES = 2 * 1024 * 1024;

type Props = {
  phone: string;
  defaultFullName?: string | null;
  lockedContact?: boolean;
  /** Quay lại chế độ điền tay (wizard). */
  onBack: () => void;
};

export function InforDocUpload({ phone, defaultFullName, lockedContact, onBack }: Props) {
  const [phoneVal, setPhoneVal] = useState(phone);
  const [nameVal, setNameVal] = useState(defaultFullName ?? '');
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
    pushToDataLayer({ event: 'infor_doc_selected' });
    trackMetaCustomEvent('InforDocSelected');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const cleanName = nameVal.trim();
    if (!lockedContact) {
      if (phoneVal.trim().length < 9) {
        setFieldError('Vui lòng nhập số điện thoại hợp lệ.');
        return;
      }
      if (cleanName.length < 2) {
        setFieldError('Vui lòng nhập họ và tên.');
        return;
      }
    }
    if (!file) {
      setFieldError('Vui lòng chọn file để upload.');
      return;
    }

    setSubmitting(true);
    pushToDataLayer({ event: 'infor_doc_submit_attempt' });
    trackMetaCustomEvent('InforDocSubmit');

    const body = new FormData();
    body.append('phone', phoneVal);
    body.append('full_name', cleanName);
    body.append('file', file);

    let res: Response;
    try {
      res = await fetch('/api/infor/upload', { method: 'POST', body });
    } catch {
      setSubmitting(false);
      setServerError('Lỗi kết nối. Kiểm tra internet và thử lại.');
      return;
    }

    setSubmitting(false);
    if (res.status === 201) {
      setDone(true);
      pushToDataLayer({ event: 'infor_doc_submitted' });
      trackMetaStandardEvent('Lead', { content_category: 'infor-upload' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const json = await res.json().catch(() => null);
    setServerError(json?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-6 py-12 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h2 className="font-display text-xl font-bold text-emerald-900">Đã nhận file! 🎉</h2>
        <p className="text-sm text-emerald-700">
          Cảm ơn anh/chị. Chúng tôi sẽ đọc tài liệu, cấu hình bot và liên hệ sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-text-secondary hover:text-brand-violet inline-flex items-center gap-1.5 text-[13px] font-semibold transition"
      >
        <ArrowLeft className="size-4" />
        Quay lại điền tay
      </button>

      <section className="border-border-default/80 rounded-2xl border bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <header className="mb-3.5 flex items-center gap-2.5">
          <span className="from-brand-indigo to-brand-violet flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm">
            <UploadCloud className="size-4" />
          </span>
          <h3 className="text-text-primary font-display text-[15px] font-bold tracking-tight">
            Tải lên tài liệu doanh nghiệp
          </h3>
        </header>

        {/* Liên hệ: chip xác nhận (landing) hoặc ô nhập (link theo SĐT). */}
        {lockedContact ? (
          <div className="mb-3 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm">
            <BadgeCheck className="size-5 shrink-0 text-emerald-500" />
            <span className="text-emerald-800">
              Đang cấu hình cho <b>{defaultFullName}</b> · {phone}
            </span>
          </div>
        ) : (
          <div className="mb-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <FieldShell label="Số điện thoại" required>
              <input
                type="tel"
                inputMode="tel"
                placeholder="0xxx xxx xxx"
                aria-label="Số điện thoại"
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                className={cn(inputCls, 'h-11 font-semibold')}
              />
            </FieldShell>
            <FieldShell label="Họ tên người liên hệ" required>
              <input
                type="text"
                placeholder="A/C tên là…"
                aria-label="Họ và tên"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                className={cn(inputCls, 'h-11')}
              />
            </FieldShell>
          </div>
        )}

        {/* Vùng chọn file */}
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          aria-label="Chọn file tài liệu"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="border-brand-violet/40 bg-brand-violet/5 flex items-center gap-3 rounded-xl border-[1.5px] p-3">
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
            className="border-brand-violet/40 text-brand-violet hover:bg-brand-violet/5 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed py-7 text-sm font-semibold transition"
          >
            <UploadCloud className="size-6" />
            Bấm để chọn file
            <span className="text-text-tertiary text-[11px] font-normal">Mọi định dạng · tối đa 2MB</span>
          </button>
        )}

        {fieldError && <p className="mt-2 text-[12px] font-medium text-rose-500">{fieldError}</p>}
      </section>

      {serverError && <Banner tone="rose">{serverError}</Banner>}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          'font-display flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all',
          submitting
            ? 'bg-surface-subtle text-text-tertiary cursor-not-allowed'
            : 'from-brand-indigo via-brand-violet to-brand-pink shadow-brand-violet/30 bg-gradient-to-r text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]',
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Đang gửi…
          </>
        ) : (
          <>
            <UploadCloud className="size-4" /> Gửi tài liệu
          </>
        )}
      </button>
    </form>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
