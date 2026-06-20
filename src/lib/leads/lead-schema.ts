/**
 * lead-schema.ts - Validate request submit form infor (server-side, /api/infor/submit).
 *
 * Chỉ khoá cứng phone + full_name. `payload` để LINH HOẠT (record JSON tuỳ ý) vì:
 *   - Câu hỏi đổi theo model + còn mở rộng (repeater, conditional).
 *   - Validate bắt buộc đã làm CLIENT-side theo config (lead-field-config.ts).
 * Server chỉ cần đảm bảo cấu trúc tối thiểu + chống rác.
 */

import { z } from 'zod';

const VN_PHONE_INPUT = /^[\d\s+\-().]+$/;

// 1 giá trị payload: string / number / boolean / mảng / object lồng (repeater).
const jsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValue),
    z.record(z.string(), jsonValue),
  ]),
);

export const leadSubmitSchema = z.object({
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

export type LeadSubmitInput = z.input<typeof leadSubmitSchema>;
export type LeadSubmitOutput = z.infer<typeof leadSubmitSchema>;
