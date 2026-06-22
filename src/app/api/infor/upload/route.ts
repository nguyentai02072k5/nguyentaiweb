/**
 * POST /api/infor/upload  (multipart/form-data)
 *
 * Chế độ "đã có sẵn tài liệu" của phiếu set-up chatbot: khách đính kèm 1 file
 * (mô tả doanh nghiệp + quy trình bán hàng) thay vì điền tay wizard. Vẫn map đủ
 * SĐT + Tên. Logic dùng chung ở handleLeadDocUpload (xem lib/leads).
 */

import { handleLeadDocUpload } from '@/lib/leads/handle-lead-doc-upload';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function POST(request: Request) {
  return handleLeadDocUpload(request, 'infor-upload');
}
