/**
 * mooly-field.tsx - Render 1 trường form Mooly: nhãn + tooltip (?) + ô nhập.
 *
 * Hỗ trợ 3 loại:
 *   - text / textarea : ô đơn (có note nhấn mạnh tuỳ chọn).
 *   - repeater        : danh sách dòng có cột con (FAQ = Câu hỏi + Câu trả lời),
 *                       nút +/− thêm-xoá dòng, placeholder xoay theo dòng.
 *
 * Tooltip (?) hoạt động trên CẢ mobile & desktop:
 *   - Desktop: hover hiện, rời chuột ẩn.  - Mobile: chạm nút (?) toggle.
 *   - Esc / chạm ra ngoài → ẩn. aria-expanded để screen-reader hiểu trạng thái.
 */

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle, X, Plus, Minus, Info } from 'lucide-react';
import type { UseFormRegister, FieldError, UseFieldArrayReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { MoolyField } from '@/lib/leads/mooly-field-config';
import type { MoolySubmitInput } from '@/lib/leads/mooly-schema';

type Register = UseFormRegister<MoolySubmitInput>;
type FieldName = Parameters<Register>[0];
type RepeaterArray = UseFieldArrayReturn<MoolySubmitInput, never>;

const inputCls = cn(
  'w-full rounded-xl border-[1.5px] border-border-default bg-white px-3.5 text-[15px] text-text-primary',
  'placeholder:text-text-tertiary/70 transition outline-none',
  'focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/12',
);

export function MoolyFieldRow({
  field,
  register,
  error,
  filled,
  arr,
}: {
  field: MoolyField;
  register: Register;
  error?: FieldError;
  /** Đã có giá trị → hiện icon xanh nhẹ (phản hồi tích cực). */
  filled?: boolean;
  /** Bắt buộc khi field.type === 'repeater'. */
  arr?: RepeaterArray;
}) {
  const Icon = field.icon;
  const name = `payload.${field.key}` as FieldName;
  const reg = register(name, field.required ? { required: `Vui lòng điền "${field.label}"` } : undefined);
  const errCls = error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/12' : '';

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className={cn('size-4 shrink-0 transition-colors', filled ? 'text-emerald-500' : 'text-brand-violet')} />
        <label htmlFor={field.key} className="text-text-primary text-[13.5px] font-semibold capitalize leading-snug">
          {field.label}
          {field.required && <span className="text-brand-pink"> *</span>}
        </label>
        <Tooltip text={field.tooltip} label={field.label} />
      </div>

      {field.type === 'repeater' && arr ? (
        <RepeaterRows field={field} arr={arr} register={register} />
      ) : field.type === 'textarea' ? (
        <textarea
          id={field.key}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          aria-label={field.label}
          aria-invalid={!!error}
          className={cn(inputCls, 'resize-y py-2.5 leading-relaxed', errCls)}
          {...reg}
        />
      ) : (
        <input
          id={field.key}
          type="text"
          placeholder={field.placeholder}
          aria-label={field.label}
          aria-invalid={!!error}
          className={cn(inputCls, 'h-12', errCls)}
          {...reg}
        />
      )}

      {field.note && (
        <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-brand-violet/8 px-2.5 py-1.5 text-[12px] leading-relaxed text-brand-indigo-deep">
          <Info className="mt-px size-3.5 shrink-0" />
          <span>{field.note}</span>
        </p>
      )}

      {error && <p className="mt-1 text-[12px] font-medium text-rose-500">{error.message}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Repeater (FAQ): mỗi dòng = các cột con (Câu hỏi + Câu trả lời) + nút +/−.
// ---------------------------------------------------------------------------

function RepeaterRows({
  field,
  arr,
  register,
}: {
  field: MoolyField;
  arr: RepeaterArray;
  register: Register;
}) {
  const subs = field.subFields ?? [];

  return (
    <div className="space-y-2.5">
      {arr.fields.map((item, i) => (
        <div key={item.id} className="rounded-xl border border-border-default bg-surface-subtle/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-violet shadow-sm">
              {field.itemNoun} {i + 1}
            </span>
            {arr.fields.length > 1 && (
              <button
                type="button"
                onClick={() => arr.remove(i)}
                aria-label={`Xoá ${field.itemNoun} ${i + 1}`}
                className="text-text-tertiary hover:bg-rose-50 hover:text-rose-500 flex size-6 items-center justify-center rounded-md transition"
              >
                <Minus className="size-4" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {subs.map((sf) => {
              const subName = `payload.${field.key}.${i}.${sf.key}` as FieldName;
              const ph = sf.placeholders?.[i % sf.placeholders.length] ?? '';
              const subLabel = `${field.label} - ${sf.label}`;
              return (
                <div key={sf.key}>
                  <span className="mb-1 block text-[11.5px] font-semibold capitalize text-text-secondary">{sf.label}</span>
                  {sf.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      placeholder={ph}
                      aria-label={subLabel}
                      className={cn(inputCls, 'resize-y py-2 text-[14px] leading-relaxed')}
                      {...register(subName)}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={ph}
                      aria-label={subLabel}
                      className={cn(inputCls, 'h-11 text-[14px]')}
                      {...register(subName)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => arr.append(emptyRow(field) as never)}
        className="border-brand-violet/40 text-brand-violet hover:bg-brand-violet/5 flex w-full items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed py-2.5 text-sm font-semibold transition"
      >
        <Plus className="size-4" />
        {field.addLabel}
      </button>
    </div>
  );
}

/** 1 dòng repeater rỗng (mọi cột con = ''). */
export function emptyRow(field: MoolyField): Record<string, string> {
  return Object.fromEntries((field.subFields ?? []).map((sf) => [sf.key, '']));
}

// ---------------------------------------------------------------------------
// Tooltip (?)
// ---------------------------------------------------------------------------

/** Nút (?) + popover giải thích. Hover (desktop) + click toggle (mobile). */
function Tooltip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const popId = useId();

  // Chạm ra ngoài / nhấn Esc → đóng.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={`Giải thích: ${label}`}
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-text-tertiary hover:text-brand-violet flex size-5 items-center justify-center rounded-full transition-colors"
      >
        <HelpCircle className="size-[15px]" />
      </button>

      {open && (
        <span
          id={popId}
          role="tooltip"
          className={cn(
            'absolute left-1/2 top-7 z-20 w-[min(78vw,18rem)] -translate-x-1/2 rounded-xl',
            'border border-border-default bg-surface-inverse px-3 py-2.5 text-[12.5px] leading-relaxed text-white',
            'shadow-lg',
          )}
        >
          <button
            type="button"
            aria-label="Đóng giải thích"
            onClick={() => setOpen(false)}
            className="absolute right-1.5 top-1.5 text-white/50 hover:text-white sm:hidden"
          >
            <X className="size-3.5" />
          </button>
          {text}
        </span>
      )}
    </span>
  );
}
