'use client';

/**
 * soft-cta.tsx - CTA mềm cuối trang chi tiết template. Không gate.
 * Một nút gradient "Liên hệ qua Zalo" (aurora gradient động + glow), có track analytics.
 */

import { MessageCircle } from 'lucide-react';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';
import type { CtaLocation } from '@/content/landing';

const ZALO_LINK = 'https://zalo.me/0345324467';

export function SoftCta({
  heading = 'Cần hỗ trợ gì cho shop của anh/chị?',
  description = 'Nhắn mình qua Zalo - mình tư vấn chọn đúng template, tinh chỉnh theo ngành và sản phẩm rồi đưa vào chatbot thật cho anh/chị.',
  location = 'templates_cta',
}: {
  heading?: string;
  description?: string;
  location?: CtaLocation;
}) {
  return (
    <section className="not-prose mt-12 overflow-hidden rounded-2xl border border-border-default bg-surface-subtle/50 p-6 text-center sm:p-8">
      <h2 className="font-display text-xl font-semibold text-text-primary sm:text-2xl">
        {heading}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
        {description}
      </p>
      <div className="mt-6 flex justify-center">
        <a
          href={ZALO_LINK}
          target="_blank"
          rel="noopener noreferrer"
          data-cta-location={location}
          onClick={() => trackCtaClick(location)}
          className="
            inline-flex items-center justify-center gap-2
            rounded-full bg-aurora bg-[length:200%_200%] animate-aurora motion-reduce:animate-none
            px-8 py-3.5 text-base font-display font-semibold text-text-on-brand
            shadow-glow-violet transition-transform hover:scale-[1.03] motion-reduce:hover:scale-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
          "
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Liên hệ qua Zalo
        </a>
      </div>
    </section>
  );
}
