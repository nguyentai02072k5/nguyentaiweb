/**
 * /form - Trang khai thác thông tin Bot Mooly.
 *
 * Truy cập thực tế: form.nguyenvantai.com (proxy.ts rewrite host form.* `/` → `/form`).
 *
 * Bố cục KISS, tập trung chuyển đổi:
 *   1. Header thương hiệu nhỏ (Mooly) + badge tin cậy
 *   2. Headline cảm xúc + sub-copy định vị giá trị
 *   3. Form (contact + 6 trường nội dung) - MoolyForm
 * Nền Aurora mesh nhẹ, glass card → cảm giác cao cấp, chuyên nghiệp.
 */

import type { Metadata } from 'next';
import { Sparkles, Clock3, Lock } from 'lucide-react';
import { MoolyForm } from '@/components/form/mooly-form';

export const metadata: Metadata = {
  title: 'Khai báo thông tin shop · Bot Mooly — Nguyễn Văn Tài',
  description:
    'Điền thông tin shop để Mooly học văn phong, sản phẩm, quy trình bán hàng và tự tư vấn - chốt đơn thay bạn. Form ngắn gọn, có hướng dẫn từng bước.',
  robots: { index: false, follow: false },
};

export default function MoolyFormPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden">
      {/* Nền Aurora mesh + 2 blob mờ trôi nhẹ - giữ rất dịu, không chói */}
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
        {/* Header thương hiệu */}
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-white/70 px-3 py-1 text-[12px] font-semibold text-brand-violet shadow-sm backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            Trợ lý bán hàng AI · Mooly
          </span>

          <h1 className="font-display mt-5 text-3xl font-bold capitalize leading-tight tracking-tight text-text-primary sm:text-[2.6rem]">
            Kể cho <span className="text-aurora">Mooly</span> nghe về shop của bạn
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-text-secondary">
            Càng hiểu shop, Mooly càng tư vấn &amp; chốt đơn giống bạn. Điền form bên dưới — mỗi mục đều có
            dấu <span className="font-semibold text-brand-violet">(?)</span> giải thích, không lo điền sai.
          </p>

          {/* Tín hiệu tin cậy */}
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

        <MoolyForm />
      </div>
    </main>
  );
}
