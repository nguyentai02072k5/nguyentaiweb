/**
 * capture-schema.ts - Validate form thông tin CƠ BẢN ở landing /infor.
 *
 * Bước 1 của landing: khách để lại Họ tên + SĐT + Email → ghi nhận lead ngay
 * (chống bỏ rơi lead nếu khách không điền tiếp form chi tiết). Bước 2 (form
 * cấu hình chatbot) enrich thêm payload qua /api/infor/submit.
 */

import { z } from 'zod';

const VN_PHONE_INPUT = /^[\d\s+\-().]+$/;

export const leadCaptureSchema = z.object({
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

  email: z
    .string()
    .trim()
    .email('Email không hợp lệ')
    .max(120, 'Email tối đa 120 ký tự'),
});

export type LeadCaptureInput = z.input<typeof leadCaptureSchema>;
export type LeadCaptureOutput = z.infer<typeof leadCaptureSchema>;
