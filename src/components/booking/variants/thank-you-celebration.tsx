/**
 * Variant B: Celebration thank-you (full-screen vibe).
 * Aurora gradient bg, larger animated checkmark, mini confetti dots.
 * Pros: warm + memorable moment, completion reward.
 * Cons: nặng visual, có thể chói khi user vừa nhập form.
 */

'use client';

import Link from 'next/link';
import { MOCK_THANK_YOU } from '@/components/booking/_mock-data';

export function ThankYouCelebration() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-violet/30 bg-gradient-to-br from-indigo-50 via-violet-50 to-pink-50 p-6 shadow-lg text-center">
      {/* Confetti dots */}
      <div className="pointer-events-none absolute inset-0">
        {[
          { top: '8%',  left: '12%', color: 'bg-brand-indigo' },
          { top: '18%', left: '85%', color: 'bg-brand-violet' },
          { top: '36%', left: '6%',  color: 'bg-brand-pink' },
          { top: '52%', left: '92%', color: 'bg-brand-cyan' },
          { top: '70%', left: '14%', color: 'bg-brand-violet-soft' },
          { top: '82%', left: '80%', color: 'bg-brand-indigo' },
        ].map((dot, i) => (
          <span
            key={i}
            className={`absolute w-2 h-2 rounded-full ${dot.color} animate-pulse opacity-70`}
            style={{ top: dot.top, left: dot.left, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      <div className="relative">
        <div className="mx-auto mb-5 grid place-items-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink shadow-2xl shadow-brand-violet/40 animate-[bounce_1.5s_ease-in-out_1]">
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 stroke-white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 className="font-display text-2xl font-bold mb-1">
          🎉 Đặt Lịch Thành Công!
        </h3>
        <p className="text-base text-text-secondary mb-6">
          Cảm ơn anh/chị. Tôi sẽ liên hệ Zalo xác nhận trong 24 giờ.
        </p>

        <div className="space-y-3 mb-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 p-5 text-left shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-text-tertiary font-display">Lịch hẹn</p>
              <p className="font-display font-semibold text-text-primary">{MOCK_THANK_YOU.dateLabel}</p>
              <p className="text-sm text-text-secondary">{MOCK_THANK_YOU.timeRange}</p>
            </div>
          </div>
          <div className="h-px bg-border-default" />
          <div className="flex items-center gap-3">
            <span className="text-2xl">💻</span>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-text-tertiary font-display">Nền tảng</p>
              <p className="font-display font-semibold text-text-primary">Google Meet</p>
              <p className="text-sm text-text-secondary">Link sẽ gửi qua Zalo {MOCK_THANK_YOU.phoneMask}</p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-violet text-white font-display text-sm font-semibold shadow-lg shadow-brand-violet/30 hover:scale-[1.02] active:scale-[0.98] transition"
        >
          Về trang chủ →
        </Link>
      </div>
    </div>
  );
}
