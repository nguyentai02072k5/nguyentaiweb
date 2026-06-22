/**
 * POST /api/form/upload  (multipart/form-data)
 *
 * Chế độ "đã có sẵn tài liệu" của form Mooly (form.nguyenvantai.com): khách đính
 * kèm 1 file mô tả shop + quy trình bán hàng thay vì điền tay. Vẫn map đủ Tên +
 * SĐT/Zalo. Logic dùng chung ở handleLeadDocUpload (source='mooly-form').
 */

import { handleLeadDocUpload } from '@/lib/leads/handle-lead-doc-upload';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function POST(request: Request) {
  return handleLeadDocUpload(request, 'mooly-form');
}
