/**
 * /form/[phone] - Form Mooly mở qua link riêng theo SĐT.
 *
 * Truy cập thực tế: form.nguyenvantai.com/0901234567 (proxy.ts rewrite → /form/...).
 *
 * Server-side khi khách MỞ link:
 *   1. Normalize SĐT từ URL. Sai định dạng → render form thường (không prefill).
 *   2. recordLeadOpen('mooly-form') - auto: tạo/đụng lead status 'opened' ở nhóm
 *      nguồn 'mooly' (lên DB + CMS ngay), kể cả khi chưa có tên (điền sau).
 *   3. Render MoolyForm prefill sẵn SĐT + Tên (nếu hệ thống đã có) → khách chỉ
 *      điền thêm phần còn lại.
 */

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Sparkles, Clock3, Lock } from 'lucide-react';
import { normalizeVnPhone } from '@/lib/format/phone-vn';
import { recordLeadOpen } from '@/lib/leads/record-lead-open';
import { MoolyForm } from '@/components/form/mooly-form';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Khai báo thông tin shop · Bot Mooly — Nguyễn Văn Tài',
  robots: { index: false, follow: false },
};

export default async function MoolyFormPhonePage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone: rawPhone } = await params;
  const phone = normalizeVnPhone(decodeURIComponent(rawPhone));

  // SĐT hợp lệ → ghi nhận mở link (best-effort) + prefill. Sai → form thường.
  const openResult = phone ? await recordLeadOpen(phone, await headers(), 'mooly-form') : null;

  return (
    <main className="relative min-h-dvh w-full overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-mesh-aurora opacity-25" />
      <div
        aria-hidden
        className="animate-blob-1 pointer-events-none absolute -left-24 top-10 -z-10 size-72 rounded-full bg-brand-violet/8 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob-2 pointer-events-none absolute -right-20 top-40 -z-10 size-72 rounded-full bg-brand-pink/6 blur-3xl"
      />

      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-white/70 px-3 py-1 text-[12px] font-semibold text-brand-violet shadow-sm backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            Trợ lý bán hàng AI · Mooly
          </span>

          <h1 className="font-display mt-5 text-3xl font-bold capitalize leading-tight tracking-tight text-text-primary sm:text-[2.6rem]">
            Kể cho <span className="text-aurora">Mooly</span> nghe về shop của bạn
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-text-secondary">
            Càng hiểu shop, Mooly càng tư vấn &amp; chốt đơn giống bạn. Mỗi mục đều có dấu{' '}
            <span className="font-semibold text-brand-violet">(?)</span> giải thích, không lo điền sai.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-text-tertiary">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-brand-cyan" /> Chỉ mất 3–5 phút
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5 text-emerald-500" /> Bảo mật tuyệt đối
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-brand-pink" /> Có hướng dẫn từng mục
            </span>
          </div>
        </header>

        <MoolyForm
          phone={phone || undefined}
          defaultFullName={openResult?.fullName}
          alreadySubmitted={openResult?.alreadySubmitted}
        />
      </div>
    </main>
  );
}
