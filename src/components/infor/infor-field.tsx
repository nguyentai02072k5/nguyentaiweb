/**
 * infor-field.tsx - Render từng loại field cho form infor.
 *   - SingleField : text / textarea / select (placeholder mờ xoay theo key)
 *   - RepeaterField: danh sách lặp có nút +/− (FAQ, sản phẩm, nhãn khách)
 *   - ModelPicker  : 2 thẻ chọn mô hình (Tư vấn+Chốt đơn / Phân loại+Thu lead)
 */

'use client';

import { Plus, Minus, Check, AlertCircle } from 'lucide-react';
import type {
  UseFormRegister,
  UseFieldArrayReturn,
  FieldErrors,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import type { LeadSubmitInput } from '@/lib/leads/lead-schema';
import { LEAD_MODELS, type LeadField, type LeadModel } from '@/lib/leads/lead-field-config';
import { pickPlaceholder, rotatePlaceholder } from '@/lib/leads/placeholder-utils';

type Register = UseFormRegister<LeadSubmitInput>;
type FieldName = Parameters<Register>[0];
type RepeaterArray = UseFieldArrayReturn<LeadSubmitInput, never>;

export const inputCls = cn(
  'w-full rounded-xl border-[1.5px] border-border-default bg-white px-3 text-sm text-text-primary',
  'placeholder:text-text-tertiary/60 transition outline-none',
  'focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10',
);

// ---------------------------------------------------------------------------
// Wrapper nhãn + lỗi
// ---------------------------------------------------------------------------

export function FieldShell({
  label,
  required,
  hint,
  error,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <label className="text-text-primary mb-1.5 block text-[12.5px] font-semibold leading-snug">
        {label}
        {required && <span className="text-brand-pink"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-text-tertiary mt-1 text-[11px]">↳ {hint}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field đơn
// ---------------------------------------------------------------------------

export function SingleField({
  field,
  register,
  hasError,
}: {
  field: LeadField;
  register: Register;
  hasError?: boolean;
}) {
  const name = `payload.${field.key}` as FieldName;
  const ph = pickPlaceholder(field.placeholders, field.key);
  const errCls = hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : '';
  const reg = register(name, field.required ? { required: `Vui lòng điền "${field.label}"` } : undefined);

  if (field.type === 'textarea') {
    return (
      <textarea rows={3} placeholder={ph} aria-label={field.label} className={cn(inputCls, 'resize-y py-2.5', errCls)} {...reg} />
    );
  }

  if (field.type === 'select') {
    return (
      <select aria-label={field.label} className={cn(inputCls, 'h-11', errCls)} {...reg}>
        <option value="">— Chọn —</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input type="text" placeholder={ph} aria-label={field.label} className={cn(inputCls, 'h-11', errCls)} {...reg} />
  );
}

// ---------------------------------------------------------------------------
// Repeater (danh sách lặp +/−)
// ---------------------------------------------------------------------------

export function emptyRow(field: LeadField): Record<string, string> {
  return Object.fromEntries((field.subFields ?? []).map((sf) => [sf.key, '']));
}

export function RepeaterField({
  field,
  arr,
  register,
}: {
  field: LeadField;
  arr: RepeaterArray;
  register: Register;
}) {
  return (
    <div className="space-y-2.5 sm:col-span-2">
      {arr.fields.map((item, i) => (
        <div
          key={item.id}
          className="border-border-default/70 bg-surface-subtle/40 relative rounded-xl border p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-text-tertiary text-[11px] font-bold uppercase tracking-wide">
              {field.itemNoun} {i + 1}
            </span>
            {arr.fields.length > 1 && (
              <button
                type="button"
                onClick={() => arr.remove(i)}
                aria-label={`Xoá ${field.itemNoun} ${i + 1}`}
                className="text-text-tertiary hover:bg-rose-50 hover:text-rose-500 flex size-6 items-center justify-center rounded-md transition"
              >
                <Minus className="size-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(field.subFields ?? []).map((sf) => {
              const name = `payload.${field.key}.${i}.${sf.key}` as FieldName;
              const ph = rotatePlaceholder(sf.placeholders, i);
              return sf.type === 'textarea' ? (
                <textarea
                  key={sf.key}
                  rows={2}
                  placeholder={ph}
                  aria-label={`${field.label} - ${sf.label}`}
                  className={cn(inputCls, 'resize-y py-2')}
                  {...register(name)}
                />
              ) : (
                <input
                  key={sf.key}
                  type="text"
                  placeholder={ph}
                  aria-label={`${field.label} - ${sf.label}`}
                  className={cn(inputCls, 'h-10')}
                  {...register(name)}
                />
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

// ---------------------------------------------------------------------------
// Model picker (2 thẻ lớn)
// ---------------------------------------------------------------------------

export function ModelPicker({
  value,
  onPick,
  error,
}: {
  value: LeadModel | '';
  onPick: (m: LeadModel) => void;
  error?: string;
}) {
  return (
    <div className="sm:col-span-2">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {LEAD_MODELS.map((m) => {
          const active = value === m.value;
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onPick(m.value)}
              aria-pressed={active}
              className={cn(
                'relative flex flex-col gap-1.5 rounded-2xl border-[1.5px] p-3.5 text-left transition-all',
                active
                  ? 'border-brand-violet bg-brand-violet/5 shadow-brand-violet/15 shadow-md'
                  : 'border-border-default bg-white hover:border-brand-violet/40 hover:bg-surface-subtle/30',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg transition-colors',
                    active ? 'bg-gradient-to-br from-brand-indigo to-brand-violet text-white' : 'bg-surface-subtle text-text-secondary',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-text-primary font-display text-sm font-bold leading-tight">
                  {m.label}
                </span>
                {active && (
                  <span className="bg-brand-violet ml-auto flex size-5 items-center justify-center rounded-full text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-[12px] leading-snug">{m.desc}</p>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field dispatcher (chọn renderer theo type field)
// ---------------------------------------------------------------------------

export function FieldRenderer({
  field,
  register,
  arr,
  model,
  onPickModel,
  error,
}: {
  field: LeadField;
  register: Register;
  arr?: RepeaterArray;
  model: LeadModel | '';
  onPickModel: (m: LeadModel) => void;
  error?: string;
}) {
  if (field.key === 'business_model') {
    return (
      <>
        <input
          type="hidden"
          {...register('payload.business_model', { required: 'Vui lòng chọn mục tiêu' })}
        />
        <ModelPicker value={model} onPick={onPickModel} error={error} />
      </>
    );
  }

  if (field.type === 'repeater' && arr) {
    return (
      <FieldShell label={field.label} required={field.required} hint={field.hint} wide>
        <RepeaterField field={field} arr={arr} register={register} />
      </FieldShell>
    );
  }

  const wide = field.type === 'textarea';
  return (
    <FieldShell label={field.label} required={field.required} hint={field.hint} error={error} wide={wide}>
      <SingleField field={field} register={register} hasError={!!error} />
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Card section + Banner thông báo (dùng chung cho form wizard)
// ---------------------------------------------------------------------------

export function Card({
  icon: Icon,
  title,
  index,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border-default/80 rounded-2xl border bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <header className="mb-3.5 flex items-center gap-2.5">
        <span className="from-brand-indigo to-brand-violet font-display flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-bold text-white shadow-sm">
          {String(index).padStart(2, '0')}
        </span>
        <Icon className="text-brand-violet size-4" />
        <h3 className="text-text-primary font-display text-[15px] font-bold tracking-tight">{title}</h3>
      </header>
      {children}
    </section>
  );
}

export function Banner({ tone, children }: { tone: 'amber' | 'rose'; children: React.ReactNode }) {
  const cls =
    tone === 'amber'
      ? 'border-amber-300 bg-amber-50 text-amber-800'
      : 'border-rose-300 bg-rose-50 text-rose-700';
  return (
    <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs', cls)}>
      <AlertCircle className="size-4 shrink-0" />
      {children}
    </div>
  );
}

// Re-export để form container dùng kiểu lỗi payload nếu cần.
export type PayloadErrors = FieldErrors<LeadSubmitInput>['payload'];
