/**
 * landing-lead-schema.ts - Validate form landing marketing Mooly (landing.*).
 *
 * Form CHỈ 4 trường (Họ tên + SĐT/Zalo + Ngành hàng + Lượng tin nhắn/ngày) — KHÔNG
 * có email nên không tái dùng leadCaptureSchema. industry/message_volume là optional
 * (select có thể bỏ trống), lưu vào payload jsonb. Lead gom nhóm 'infor'
 * (source 'infor-mooly-lp' → source_group GENERATED = 'infor').
 */

import { z } from 'zod';

const VN_PHONE_INPUT = /^[\d\s+\-().]+$/;

export const landingLeadSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ và tên')
    .max(100, 'Họ tên tối đa 100 ký tự'),

  phone: z
    .string()
    .min(9, 'Số điện thoại quá ngắn')
    .max(20, 'Số điện thoại quá dài')
    .regex(VN_PHONE_INPUT, 'Chỉ chấp nhận chữ số và ký tự + - ( )'),

  industry: z.string().trim().max(60, 'Ngành hàng tối đa 60 ký tự').optional(),

  message_volume: z.string().trim().max(40, 'Giá trị quá dài').optional(),
});

export type LandingLeadInput = z.input<typeof landingLeadSchema>;
export type LandingLeadOutput = z.infer<typeof landingLeadSchema>;
