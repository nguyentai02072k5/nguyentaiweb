/**
 * booking-schema.ts — Single source of truth for booking form validation.
 *
 * Used by:
 *   - UI form (`zodResolver(bookingFormSchema)` in React Hook Form)
 *   - API route (`bookingFormSchema.parse(body)` in /api/book)
 *
 * Mirrors DB constraints (phone regex, expectations enum, consent gate)
 * so invalid input is rejected before reaching the RPC layer.
 */

import { z } from 'zod';
import { EXPECTATION_SLUGS } from '@/lib/booking/types';

// VN phone — accept paste/typed variants. Final canonical normalization
// happens server-side via `normalizeVnPhone()` before RPC call.
const VN_PHONE_INPUT = /^[\d\s+\-().]+$/;

const blankToUndefined = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const bookingFormSchema = z
  .object({
    phone_zalo: z
      .string()
      .min(9, 'Số điện thoại quá ngắn')
      .max(20, 'Số điện thoại quá dài')
      .regex(VN_PHONE_INPUT, 'Chỉ chấp nhận chữ số và ký tự + - ( )'),
    email: z
      .union([z.string().email('Email không hợp lệ'), z.literal('')])
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
    full_name: z
      .string()
      .trim()
      .min(2, 'Vui lòng nhập họ và tên')
      .max(100, 'Họ tên tối đa 100 ký tự'),
    expectations: z.array(z.enum(EXPECTATION_SLUGS)).default([]),
    expectation_other: z
      .string()
      .max(200, 'Tối đa 200 ký tự')
      .optional()
      .transform(blankToUndefined),
    consent_zalo: z.literal(true, {
      message: 'Cần đồng ý nhận tin Zalo xác nhận lịch',
    }),
    meeting_start_iso: z
      .string()
      .datetime({ message: 'Thời gian không hợp lệ' }),
  })
  .refine(
    (data) =>
      !data.expectations.includes('other') ||
      (data.expectation_other && data.expectation_other.length > 0),
    {
      message: 'Vui lòng điền nội dung cụ thể khi chọn "Khác"',
      path: ['expectation_other'],
    },
  )
  .refine(
    (data) =>
      data.expectations.includes('other') ||
      !data.expectation_other,
    {
      message: 'Chỉ điền nội dung khi tích "Khác"',
      path: ['expectation_other'],
    },
  );

export type BookingFormInput = z.input<typeof bookingFormSchema>;
export type BookingFormOutput = z.infer<typeof bookingFormSchema>;
