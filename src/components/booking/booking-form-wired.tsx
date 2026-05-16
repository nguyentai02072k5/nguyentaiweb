/**
 * booking-form-wired.tsx — React Hook Form + Zod wired to POST /api/book.
 *
 * Shared by DesktopTicketWired + UnifiedScheduleMobileWired.
 * Caller provides selectedSlot (null = disabled) + onSuccess callback.
 *
 * Submit flow:
 *   - validate selectedSlot != null
 *   - POST /api/book
 *   - 201 → onSuccess({ bookingId, phoneMask, dateLabel, timeRange })
 *   - 409 → inline slot-taken error + onSlotConflict()
 *   - 422 → field-level errors
 *   - 5xx → banner error + retry allowed
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Target,
  ShieldCheck,
  MessageCircle,
  Camera,
  ShoppingCart,
  PhoneCall,
  Pencil,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackMetaCustomEvent } from '@/lib/analytics/meta-pixel';
import { bookingFormSchema, type BookingFormInput } from '@/lib/validators/booking-schema';
import type { BookingCreated, BookingError, ExpectationSlug } from '@/lib/booking/types';
import { EXPECTATION_SLUGS } from '@/lib/booking/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SelectedSlotInfo = {
  iso: string;
  time: string;
  dateLabel: string; // e.g. "T5 14/05"
};

export type FormSuccessData = {
  bookingId: string;
  phoneMask: string;
  dateLabel: string;
  timeRange: string;
};

type Props = {
  selectedSlot: SelectedSlotInfo | null;
  /** Called on 201 success — navigate to /thank-you */
  onSuccess: (data: FormSuccessData) => void;
  /** Called on 409 conflict — parent should refetch + reset selectedSlot */
  onSlotConflict: () => void;
  /** Layout variant affects field sizing */
  layout?: 'desktop' | 'mobile';
  formId?: string;
  showSubmitButton?: boolean;
  onSubmitStateChange?: (state: { consent: boolean; isSubmitting: boolean }) => void;
};

// ---------------------------------------------------------------------------
// Expectation options (mirrors EXPECTATION_SLUGS)
// ---------------------------------------------------------------------------

type ExpOption = {
  slug: ExpectationSlug;
  icon: LucideIcon;
  label: string;
};

const EXP_OPTIONS: ExpOption[] = [
  { slug: 'consult-24-7',      icon: MessageCircle, label: 'Tư vấn tự động 24/7'           },
  { slug: 'image-recognition', icon: Camera,        label: 'Nhận diện hình ảnh khách gửi'  },
  { slug: 'close-order',       icon: ShoppingCart,  label: 'Chốt đơn + làm rõ nhu cầu'     },
  { slug: 'lead-capture',      icon: PhoneCall,     label: 'Xin SĐT/Zalo, chuyển tư vấn'   },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookingFormWired({
  selectedSlot,
  onSuccess,
  onSlotConflict,
  layout = 'mobile',
  formId,
  showSubmitButton = true,
  onSubmitStateChange,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      phone_zalo: '',
      email: '',
      full_name: '',
      expectations: [],
      expectation_other: '',
      consent_zalo: undefined,
      meeting_start_iso: selectedSlot?.iso ?? '',
    },
  });

  const watchedExps = useWatch({ control, name: 'expectations' }) as ExpectationSlug[];
  const watchedConsent = useWatch({ control, name: 'consent_zalo' });

  useEffect(() => {
    setValue('meeting_start_iso', selectedSlot?.iso ?? '', { shouldValidate: false });
  }, [selectedSlot?.iso, setValue]);

  useEffect(() => {
    onSubmitStateChange?.({ consent: !!watchedConsent, isSubmitting });
  }, [isSubmitting, onSubmitStateChange, watchedConsent]);

  const toggleExp = (slug: ExpectationSlug) => {
    const current = watchedExps ?? [];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    setValue('expectations', next as typeof EXPECTATION_SLUGS[number][], { shouldValidate: false });
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedSlot) return;

    setServerError(null);
    setSlotError(null);
    trackMetaCustomEvent('BookingSubmitAttempt', {
      layout,
      has_email: !!data.email,
      expectation_count: data.expectations?.length ?? 0,
    });

    // Ensure meeting_start_iso is set (belt-and-suspenders)
    const payload = { ...data, meeting_start_iso: selectedSlot.iso };

    let res: Response;
    try {
      res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      setServerError('Lỗi kết nối. Kiểm tra internet và thử lại.');
      return;
    }

    const json = (await res.json()) as BookingCreated | BookingError;

    if (res.status === 201 && json.success) {
      const created = json as BookingCreated;
      // Derive timeRange from meeting_start + 20 min
      const start = new Date(created.meeting_start);
      const end = new Date(created.meeting_end);
      const pad = (n: number) => String(n).padStart(2, '0');
      const fmt = (d: Date) => `${pad(d.getUTCHours() + 7 >= 24 ? d.getUTCHours() + 7 - 24 : d.getUTCHours() + 7)}:${pad(d.getUTCMinutes())}`;
      const startT = fmt(start);
      const endT = fmt(end);
      const mins = Math.round((end.getTime() - start.getTime()) / 60000);
      onSuccess({
        bookingId: created.booking_id,
        phoneMask: created.phone_mask,
        dateLabel: selectedSlot.dateLabel,
        timeRange: `${startT} – ${endT} (${mins} phút)`,
      });
      return;
    }

    const errJson = json as BookingError;

    if (res.status === 409) {
      trackMetaCustomEvent('BookingSubmitError', { status: 409, reason: 'slot_conflict' });
      setSlotError('Slot vừa bị đặt mất, vui lòng chọn slot khác.');
      onSlotConflict();
      return;
    }

    if (res.status === 400 || res.status === 422) {
      trackMetaCustomEvent('BookingSubmitError', { status: res.status, reason: 'validation' });
      setServerError(errJson.message ?? 'Dữ liệu không hợp lệ. Kiểm tra lại.');
      return;
    }

    trackMetaCustomEvent('BookingSubmitError', { status: res.status, reason: 'server' });
    setServerError('Lỗi server, thử lại sau.');
  });

  const isDesktop = layout === 'desktop';
  const inputCls = cn(
    'w-full px-3 rounded-lg border-[1.5px] border-border-default bg-white text-sm',
    'focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 outline-none transition',
    isDesktop ? 'h-10' : 'h-10',
  );

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="space-y-2.5">
      {/* Hidden field */}
      <input type="hidden" {...register('meeting_start_iso')} />

      {/* ====== Section 1: Liên hệ ====== */}
      <FormSection step="01" title="Liên Hệ" icon={Phone} layout={layout}>
        <div className="space-y-2.5">
          <FieldWrapper
            label="SĐT Zalo"
            required
            hint="Tôi sẽ Zalo xác nhận lịch"
            error={errors.phone_zalo?.message}
          >
            <input
              type="tel"
              inputMode="tel"
              placeholder="0xxx xxx xxx"
              aria-label="Số điện thoại Zalo"
              className={cn(inputCls, errors.phone_zalo && 'border-rose-400 focus:border-rose-500')}
              {...register('phone_zalo')}
            />
          </FieldWrapper>

          <div className="grid grid-cols-2 gap-2">
            <FieldWrapper label="Họ và tên" required error={errors.full_name?.message}>
              <input
                type="text"
                placeholder="A/C tên là…"
                aria-label="Họ và tên"
                aria-required="true"
                className={cn(inputCls, errors.full_name && 'border-rose-400 focus:border-rose-500')}
                {...register('full_name')}
              />
            </FieldWrapper>
            <FieldWrapper label="Email" error={errors.email?.message}>
              <input
                type="email"
                placeholder="email@…"
                aria-label="Email (tùy chọn)"
                className={cn(inputCls, errors.email && 'border-rose-400')}
                {...register('email')}
              />
            </FieldWrapper>
          </div>
        </div>
      </FormSection>

      {/* ====== Section 2: Nhu cầu ====== */}
      <FormSection step="02" title="Nhu Cầu" icon={Target} subtitle="Chọn 1 hoặc nhiều" layout={layout}>
        <div className="grid grid-cols-1 gap-1.5">
          {EXP_OPTIONS.map((e) => {
            const checked = (watchedExps ?? []).includes(e.slug);
            const ExpIcon = e.icon;
            return (
              <label
                key={e.slug}
                className={cn(
                  'flex items-center gap-2.5 cursor-pointer rounded-lg border-[1.5px] px-2.5 py-2 transition-all',
                  checked
                    ? 'border-brand-violet bg-violet-50/70 shadow-sm shadow-brand-violet/15'
                    : 'border-border-default bg-white hover:border-brand-violet/40',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleExp(e.slug)}
                  className="size-4 accent-brand-violet"
                  aria-label={e.label}
                />
                <ExpIcon
                  className={cn('size-4 shrink-0 transition-colors', checked ? 'text-brand-violet' : 'text-text-secondary')}
                  strokeWidth={2.2}
                />
                <span className={cn('font-semibold leading-tight', isDesktop ? 'text-[12.5px]' : 'text-[13px]')}>
                  {e.label}
                </span>
              </label>
            );
          })}

          {/* "Khác" with textarea reveal */}
          {(() => {
            const otherChecked = (watchedExps ?? []).includes('other' as ExpectationSlug);
            return (
              <div>
                <label
                  className={cn(
                    'flex items-center gap-2.5 cursor-pointer rounded-lg border-[1.5px] px-2.5 py-2 transition-all',
                    otherChecked
                      ? 'border-brand-violet bg-violet-50/70 shadow-sm shadow-brand-violet/15 rounded-b-none'
                      : 'border-border-default bg-white hover:border-brand-violet/40',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={otherChecked}
                    onChange={() => toggleExp('other' as ExpectationSlug)}
                    className="size-4 accent-brand-violet"
                    aria-label="Khác"
                  />
                  <Pencil
                    className={cn('size-4 shrink-0', otherChecked ? 'text-brand-violet' : 'text-text-secondary')}
                    strokeWidth={2.2}
                  />
                  <span className={cn('font-semibold', isDesktop ? 'text-[12.5px]' : 'text-[13px]')}>
                    Khác
                  </span>
                </label>
                <AnimatePresence initial={false}>
                  {otherChecked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <textarea
                        rows={2}
                        maxLength={200}
                        placeholder="Mô tả cụ thể nhu cầu của anh/chị…"
                        className={cn(
                          'w-full px-3 py-2 rounded-b-lg border-[1.5px] border-t-0 border-brand-violet/50 bg-violet-50/40 text-sm resize-none',
                          'focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/15 outline-none transition',
                          errors.expectation_other && 'border-rose-400',
                        )}
                        aria-label="Mô tả nhu cầu khác"
                        {...register('expectation_other')}
                      />
                      {errors.expectation_other && (
                        <p className="text-[10px] text-rose-500 mt-0.5">{errors.expectation_other.message}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}
        </div>
      </FormSection>

      {/* ====== Section 3: Xác nhận ====== */}
      <FormSection step="03" title="Xác Nhận" icon={ShieldCheck} layout={layout}>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-brand-violet"
            aria-required="true"
            {...register('consent_zalo')}
          />
          <span className="text-xs flex-1 leading-snug">
            Tôi đồng ý nhận tin Zalo xác nhận lịch{' '}
            <span className="text-brand-pink">*</span>
          </span>
        </label>
        {errors.consent_zalo && (
          <p className="text-[10px] text-rose-500 mt-1">{errors.consent_zalo.message}</p>
        )}
      </FormSection>

      {/* ====== Inline slot conflict error ====== */}
      <AnimatePresence>
        {slotError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800"
            role="alert"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            {slotError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== Server error banner ====== */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700"
            role="alert"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== CTA button ====== */}
      {showSubmitButton && (
        <CtaButton
          selectedSlot={selectedSlot}
          consent={!!watchedConsent}
          isSubmitting={isSubmitting}
          layout={layout}
        />
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FormSection({
  step,
  title,
  icon: Icon,
  subtitle,
  layout,
  children,
}: {
  step: string;
  title: string;
  icon: LucideIcon;
  subtitle?: string;
  layout: 'desktop' | 'mobile';
  children: React.ReactNode;
}) {
  const isDesktop = layout === 'desktop';
  return (
    <div
      className={cn(
        'rounded-xl border-[1.5px] border-border-default transition-colors hover:border-brand-violet/30',
        isDesktop ? 'bg-white/85 p-3' : 'bg-white p-3',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            'grid place-items-center px-1.5 rounded-md bg-gradient-to-br from-brand-indigo to-brand-violet text-white font-display font-bold tracking-widest tabular-nums shadow-sm',
            isDesktop ? 'min-w-7 h-5 text-[9px]' : 'min-w-6 h-4 text-[8.5px]',
          )}
        >
          {step}
        </span>
        <Icon className="size-4 text-brand-violet" strokeWidth={2.2} />
        <h4
          className={cn(
            'font-display font-bold uppercase tracking-wider text-text-primary leading-none',
            isDesktop ? 'text-[13px]' : 'text-[12.5px]',
          )}
        >
          {title}
        </h4>
        {subtitle && (
          <span className="ml-auto text-[10px] text-text-tertiary font-normal leading-none">
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldWrapper({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-display text-[10.5px] font-bold uppercase tracking-wider text-text-primary mb-1">
        {label}{' '}
        {required && <span className="text-brand-pink normal-case tracking-normal">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-0.5 text-[10px] text-text-tertiary leading-tight">↳ {hint}</p>}
      {error && <p className="mt-0.5 text-[10px] text-rose-500 leading-tight">{error}</p>}
    </div>
  );
}

function CtaButton({
  selectedSlot,
  consent,
  isSubmitting,
  layout,
}: {
  selectedSlot: SelectedSlotInfo | null;
  consent: boolean;
  isSubmitting: boolean;
  layout: 'desktop' | 'mobile';
}) {
  const ready = !!selectedSlot && consent && !isSubmitting;
  const isDesktop = layout === 'desktop';

  let label: React.ReactNode;
  if (isSubmitting) {
    label = (
      <span className="flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        Đang xác nhận…
      </span>
    );
  } else if (!selectedSlot) {
    label = 'Chọn slot để tiếp tục';
  } else if (!consent) {
    label = 'Tick đồng ý để xác nhận';
  } else {
    label = `Xác nhận booking · ${selectedSlot.time} →`;
  }

  return (
    <button
      type="submit"
      disabled={!ready}
      className={cn(
        'w-full rounded-xl font-display font-bold text-sm transition-all mt-1',
        isDesktop ? 'h-12' : 'h-11',
        ready
          ? 'bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-pink text-white shadow-lg shadow-brand-violet/30 hover:scale-[1.01] active:scale-[0.99]'
          : 'bg-surface-subtle text-text-tertiary cursor-not-allowed',
      )}
    >
      {label}
    </button>
  );
}
