/**
 * infor-lead-form.tsx - Wizard cấu hình chatbot (config-driven, 3 bước).
 *
 * - Chia câu hỏi thành 3 bước (sectionsForStep) + Progress Bar (Zeigarnik effect)
 *   để giảm cảm giác choáng & tăng tỉ lệ hoàn thành.
 * - Chọn mô hình (business_model) ở Bước 1 → các section Bước 2/3 đổi theo.
 * - Repeater (FAQ, sản phẩm, nhãn…) qua useFieldArray.
 * - lockedContact: landing đã thu SĐT/Tên/Email → chỉ hiện chip xác nhận + hidden input.
 * - Tracking: GTM dataLayer + Meta pixel (start / model / step / submit / success).
 * - Chỉ lưu dữ liệu thuộc mô hình đang chọn (prune theo visible sections).
 */

'use client';

import { useRef, useState } from 'react';
import {
  useForm,
  useFieldArray,
  useWatch,
  type UseFieldArrayReturn,
  type Path,
} from 'react-hook-form';
import { CheckCircle2, User, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pushToDataLayer } from '@/lib/analytics/gtm';
import { trackMetaCustomEvent, trackMetaStandardEvent } from '@/lib/analytics/meta-pixel';
import { type LeadSubmitInput } from '@/lib/leads/lead-schema';
import {
  sectionsForModel,
  sectionsForStep,
  WIZARD_STEPS,
  type LeadModel,
  type WizardStep,
} from '@/lib/leads/lead-field-config';
import {
  inputCls,
  FieldShell,
  FieldRenderer,
  Card,
  Banner,
} from './infor-field';
import { WizardProgress, WizardNav } from './infor-wizard-nav';

type Props = {
  phone: string;
  defaultFullName?: string | null;
  defaultEmail?: string | null;
  alreadySubmitted?: boolean;
  /** Landing: SĐT/Tên/Email đã thu ở form cơ bản → ẩn ô liên hệ, hiện chip xác nhận. */
  lockedContact?: boolean;
};
type RepeaterArray = UseFieldArrayReturn<LeadSubmitInput, never>;

const SEED = {
  products: [{ name: '', price: '' }, { name: '', price: '' }],
  faqs: [{ q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }],
  qualifying_questions: [{ q: '' }, { q: '' }],
  customer_labels: [{ label: '', rule: '' }, { label: '', rule: '' }],
};

export function InforLeadForm({
  phone,
  defaultFullName,
  defaultEmail,
  alreadySubmitted,
  lockedContact,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const started = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LeadSubmitInput>({
    defaultValues: { phone, full_name: defaultFullName ?? '', payload: { business_model: '', ...SEED } },
  });

  const model = (useWatch({ control, name: 'payload.business_model' }) as LeadModel | '') ?? '';

  // useFieldArray phải gọi vô điều kiện (rule of hooks).
  const arrays: Record<string, RepeaterArray> = {
    products: useFieldArray({ control, name: 'payload.products' as never }),
    faqs: useFieldArray({ control, name: 'payload.faqs' as never }),
    qualifying_questions: useFieldArray({ control, name: 'payload.qualifying_questions' as never }),
    customer_labels: useFieldArray({ control, name: 'payload.customer_labels' as never }),
  };

  const pErr = errors.payload as Record<string, { message?: string } | undefined> | undefined;
  const totalSteps = WIZARD_STEPS.length;
  const isLast = step === totalSteps;
  const stepSections = sectionsForStep(model, step);

  const fireStart = () => {
    if (started.current) return;
    started.current = true;
    pushToDataLayer({ event: 'infor_form_start' });
    trackMetaCustomEvent('InforFormStart');
  };

  const pickModel = (m: LeadModel) => {
    setValue('payload.business_model', m, { shouldValidate: true });
    pushToDataLayer({ event: 'infor_model_select', model: m });
    trackMetaCustomEvent('InforModelSelect', { model: m });
  };

  const scrollTop = () =>
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

  // Tên field cần validate trước khi sang bước kế (chỉ field của bước hiện tại).
  const stepFieldNames = (): Path<LeadSubmitInput>[] => {
    const names: Path<LeadSubmitInput>[] = [];
    if (step === 1 && !lockedContact) names.push('phone', 'full_name');
    for (const s of stepSections) for (const f of s.fields) {
      names.push(`payload.${f.key}` as Path<LeadSubmitInput>);
    }
    return names;
  };

  const goNext = async () => {
    const ok = await trigger(stepFieldNames());
    if (!ok) return;
    const next = (step + 1) as WizardStep;
    setStep(next);
    pushToDataLayer({ event: 'infor_step_next', step: next });
    scrollTop();
  };

  const goBack = () => {
    setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
    scrollTop();
  };

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    pushToDataLayer({ event: 'infor_form_submit_attempt', model });
    trackMetaCustomEvent('InforFormSubmit', { model: model || 'none' });

    const payload = cleanPayload(data.payload, model);
    if (defaultEmail) payload.email = defaultEmail;

    let res: Response;
    try {
      res = await fetch('/api/infor/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, full_name: data.full_name, payload }),
      });
    } catch {
      setServerError('Lỗi kết nối. Kiểm tra internet và thử lại.');
      return;
    }

    if (res.status === 201) {
      setDone(true);
      pushToDataLayer({ event: 'infor_lead_submitted', model });
      trackMetaStandardEvent('Lead', { content_category: model || 'infor' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const json = await res.json().catch(() => null);
    setServerError(json?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
  });

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-6 py-12 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h2 className="font-display text-xl font-bold text-emerald-900">Hoàn tất! 🎉</h2>
        <p className="text-sm text-emerald-700">
          Cảm ơn anh/chị đã &quot;dạy&quot; bot. Chúng tôi sẽ cấu hình và liên hệ sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onFocusCapture={fireStart} noValidate className="space-y-4">
      <div ref={topRef} className="scroll-mt-4" />

      {alreadySubmitted && (
        <Banner tone="amber">Anh/chị đã gửi thông tin trước đó. Gửi lại sẽ tạo bản ghi mới.</Banner>
      )}

      <WizardProgress step={step} />

      {/* Hidden inputs giữ SĐT/Tên khi ẩn ô liên hệ (landing). */}
      {lockedContact && (
        <>
          <input type="hidden" {...register('phone')} />
          <input type="hidden" {...register('full_name')} />
        </>
      )}

      {/* Bước 1: chip xác nhận liên hệ (landing) hoặc ô nhập (link theo SĐT). */}
      {step === 1 && lockedContact && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm">
          <BadgeCheck className="size-5 shrink-0 text-emerald-500" />
          <span className="text-emerald-800">
            Đang cấu hình cho <b>{defaultFullName}</b> · {phone}
          </span>
        </div>
      )}

      {step === 1 && !lockedContact && (
        <Card icon={User} title="Người liên hệ" index={1}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <FieldShell label="Số điện thoại" required error={errors.phone?.message}>
              <input
                type="tel"
                inputMode="tel"
                placeholder="0xxx xxx xxx"
                aria-label="Số điện thoại"
                className={cn(inputCls, 'h-11 font-semibold', errors.phone && 'border-rose-400')}
                {...register('phone', {
                  required: 'Vui lòng nhập SĐT',
                  minLength: { value: 9, message: 'SĐT quá ngắn' },
                  pattern: { value: /^[\d\s+\-().]+$/, message: 'SĐT không hợp lệ' },
                })}
              />
              <p className="text-text-tertiary mt-1 text-[11px]">↳ Đã điền sẵn từ link — sửa nếu chưa đúng</p>
            </FieldShell>
            <FieldShell label="Họ tên người liên hệ" required error={errors.full_name?.message}>
              <input
                type="text"
                placeholder="A/C tên là…"
                aria-label="Họ và tên"
                className={cn(inputCls, 'h-11', errors.full_name && 'border-rose-400')}
                {...register('full_name', {
                  required: 'Vui lòng nhập họ tên',
                  minLength: { value: 2, message: 'Tên quá ngắn' },
                })}
              />
            </FieldShell>
          </div>
        </Card>
      )}

      {/* Section của bước hiện tại (lọc theo model). Offset nếu có card liên hệ ở đầu. */}
      {stepSections.map((section, idx) => (
        <Card
          key={section.id}
          icon={section.icon}
          title={section.title}
          index={idx + 1 + (step === 1 && !lockedContact ? 1 : 0)}
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {section.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                register={register}
                arr={arrays[field.key]}
                model={model}
                onPickModel={pickModel}
                error={pErr?.[field.key]?.message}
              />
            ))}
          </div>
        </Card>
      ))}

      {step > 1 && model === '' && (
        <p className="text-text-tertiary text-center text-[12px]">
          Hãy quay lại Bước 1 và chọn mục tiêu để hiện câu hỏi phù hợp.
        </p>
      )}

      {serverError && <Banner tone="rose">{serverError}</Banner>}

      <WizardNav
        step={step}
        isLast={isLast}
        isSubmitting={isSubmitting}
        onBack={goBack}
        onNext={goNext}
      />
    </form>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Chỉ giữ field thuộc mô hình đang chọn + bỏ giá trị rỗng (gồm row repeater trống). */
function cleanPayload(payload: Record<string, unknown> | undefined, model: LeadModel | ''): Record<string, unknown> {
  const visibleKeys = new Set(sectionsForModel(model).flatMap((s) => s.fields.map((f) => f.key)));
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload ?? {})) {
    if (!visibleKeys.has(key)) continue;

    if (Array.isArray(value)) {
      const rows = value
        .map((row) => {
          const r = (row ?? {}) as Record<string, unknown>;
          const cleaned = Object.fromEntries(
            Object.entries(r).filter(([, v]) => String(v ?? '').trim() !== ''),
          );
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
