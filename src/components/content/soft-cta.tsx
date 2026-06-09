'use client';

/**
 * soft-cta.tsx — CTA mềm dùng chung (template detail + blog post). Không gate.
 * Đặt lịch tư vấn (booking) + Nhắn Zalo, có track analytics.
 */

import Link from 'next/link';
import { CalendarCheck, MessageCircle } from 'lucide-react';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';
import type { CtaLocation } from '@/content/landing';

const ZALO_LINK = 'https://zalo.me/0345324467';

export function SoftCta({
  heading = 'Cần áp dụng cho shop của anh/chị?',
  description = 'Đặt lịch tư vấn 1-1 miễn phí — mình giúp anh/chị tinh chỉnh đúng ngành, đúng sản phẩm rồi đưa vào chatbot thật.',
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
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/#booking"
          data-cta-location={location}
          onClick={() => trackCtaClick(location)}
          className="
            inline-flex w-full items-center justify-center gap-2 sm:w-auto
            rounded-full bg-aurora bg-[length:200%_200%] animate-aurora motion-reduce:animate-none
            px-6 py-3 font-display font-semibold text-text-on-brand
            shadow-glow-violet transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
          "
        >
          <CalendarCheck className="h-5 w-5" aria-hidden />
          Đặt lịch tư vấn
        </Link>
        <a
          href={ZALO_LINK}
          target="_blank"
          rel="noopener noreferrer"
          data-cta-location={location}
          onClick={() => trackCtaClick(location)}
          className="
            inline-flex w-full items-center justify-center gap-2 sm:w-auto
            rounded-full border border-border-strong px-6 py-3
            font-display font-semibold text-text-primary
            transition-colors hover:border-brand-violet hover:text-brand-violet
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40
          "
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          Nhắn Zalo
        </a>
      </div>
    </section>
  );
}
