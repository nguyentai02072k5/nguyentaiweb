/**
 * mooly-schema.ts - Validate request submit form Mooly (server-side, /api/form/submit).
 *
 * Khoá cứng contact (full_name + phone) để lead LIÊN HỆ ĐƯỢC; `payload` linh hoạt
 * (record JSON) chứa 6 trường nội dung. Validate bắt buộc nội dung làm CLIENT-side
 * theo config (mooly-field-config.ts); server chỉ đảm bảo cấu trúc + chống rác.
 */

import { z } from 'zod';

const VN_PHONE_INPUT = /^[\d\s+\-().]+$/;

const jsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValue), z.record(z.string(), jsonValue)]),
);

export const moolySubmitSchema = z.object({
  phone: z
    .string()
    .min(9, 'Số điện thoại quá ngắn')
    .max(20, 'Số điện thoại quá dài')
    .regex(VN_PHONE_INPUT, 'Chỉ chấp nhận chữ số và ký tự + - ( )'),

  full_name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ và tên')
    .max(100, 'Họ tên tối đa 100 ký tự'),

  payload: z.record(z.string(), jsonValue).default({}),
});

export type MoolySubmitInput = z.input<typeof moolySubmitSchema>;
export type MoolySubmitOutput = z.infer<typeof moolySubmitSchema>;
