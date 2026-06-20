/**
 * infor-hero.tsx - Khối hero đầu landing /infor (server component).
 *
 * Tiêu đề + phụ đề định vị: Chatbot AI tự tư vấn - chốt đơn - thu lead 24/7.
 * CTA cuộn xuống form đăng ký (#dang-ky) - dùng anchor thuần, không cần JS.
 */

import { Sparkles, ArrowDown } from 'lucide-react';

export function InforHero() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pt-12 pb-8 text-center sm:pt-16">
      <span className="border-brand-violet/30 bg-brand-violet/5 text-brand-violet inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
        <Sparkles className="size-3.5" />
        Chatbot AI cho doanh nghiệp Việt
      </span>

      <h1 className="text-text-primary font-display mt-5 text-3xl font-extrabold capitalize leading-tight tracking-tight sm:text-5xl">
        Chatbot tự{' '}
        <span className="from-brand-indigo via-brand-violet to-brand-pink bg-gradient-to-r bg-clip-text text-transparent">
          tư vấn, chốt đơn & thu lead
        </span>{' '}
        thay bạn 24/7
      </h1>

      <p className="text-text-secondary mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
        Trả lời khách tự nhiên như người thật, ẩn bình luận lộ giá, nhắn Messenger,
        thương lượng, gắn nhãn và follow-up tự động. Để lại thông tin để nhận bản
        chatbot riêng cho doanh nghiệp của bạn.
      </p>

      <div className="mt-7 flex flex-col items-center gap-3">
        <a
          href="#dang-ky"
          className="from-brand-indigo via-brand-violet to-brand-pink shadow-brand-violet/30 font-display inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-7 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.99]"
        >
          Nhận chatbot cho doanh nghiệp
          <ArrowDown className="size-4" />
        </a>
        <p className="text-text-tertiary text-xs">
          Miễn phí tư vấn · Cấu hình theo đúng ngành của bạn
        </p>
      </div>
    </section>
  );
}
