/**
 * /infor/[phone] - Landing thu thập thông tin khách qua link riêng theo SĐT.
 *
 * Truy cập thực tế: infor.nguyenvantai.com/0901234567 (proxy.ts rewrite → /infor/...).
 *
 * Server-side khi khách MỞ link:
 *   1. Normalize SĐT từ URL. Sai định dạng → trang báo link không hợp lệ.
 *   2. recordLeadOpen() - auto-fired: tạo/đụng lead status 'opened' trong CMS.
 *   3. Render form với SĐT đã khoá sẵn (khách chỉ điền ô khác).
 */

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AlertCircle } from 'lucide-react';
import { normalizeVnPhone } from '@/lib/format/phone-vn';
import { recordLeadOpen } from '@/lib/leads/record-lead-open';
import { InforLeadForm } from '@/components/infor/infor-lead-form';
import { InforPhoneEntry } from '@/components/infor/infor-phone-entry';
import { InforAuroraBackground } from '@/components/infor/infor-aurora-background';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Cập nhật thông tin · Nguyễn Văn Tài',
  robots: { index: false, follow: false },
};

export default async function InforPhonePage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone: rawPhone } = await params;
  const phone = normalizeVnPhone(decodeURIComponent(rawPhone));

  if (!phone) {
    return <InvalidLink />;
  }

  // Auto-fired: ghi nhận khách đã mở link (best-effort, không chặn render).
  const openResult = await recordLeadOpen(phone, await headers());

  return (
    <main className="relative min-h-dvh w-full overflow-hidden px-4 py-8 sm:py-12">
      <InforAuroraBackground />
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-6 text-center">
          <h1 className="text-text-primary font-display text-2xl font-bold capitalize tracking-tight sm:text-3xl">
            Phiếu thu thập set-up chatbot
          </h1>
          <p className="text-text-secondary mt-1.5 text-sm">
            Anh/chị điền thông tin để chúng tôi cấu hình chatbot cho shop.
          </p>
        </header>

        <InforLeadForm
          phone={phone}
          defaultFullName={openResult?.fullName}
          alreadySubmitted={openResult?.alreadySubmitted}
        />

        <p className="text-text-tertiary mt-6 text-center text-[11px]">
          Thông tin của anh/chị được bảo mật và chỉ dùng để liên hệ hỗ trợ.
        </p>
      </div>
    </main>
  );
}

function InvalidLink() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8">
      <header className="mb-6 flex flex-col items-center gap-2 text-center">
        <AlertCircle className="size-10 text-rose-400" />
        <h1 className="text-text-primary font-display text-xl font-bold capitalize">Link không hợp lệ</h1>
        <p className="text-text-secondary text-sm">
          Số điện thoại trên đường dẫn không đúng. Anh/chị nhập lại số để tiếp tục.
        </p>
      </header>

      <div className="rounded-2xl border border-border-default bg-white/85 p-5 shadow-sm backdrop-blur">
        <InforPhoneEntry />
      </div>
    </main>
  );
}
