/**
 * infor-features.tsx - Khối liệt kê tính năng → lợi ích (server component).
 *
 * Grid thẻ từ LANDING_FEATURES. Mỗi thẻ: icon + tính năng + lợi ích ngắn gọn.
 */

import { LANDING_FEATURES } from '@/lib/leads/landing-features';

export function InforFeatures() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-6 text-center">
        <h2 className="text-text-primary font-display text-2xl font-bold capitalize tracking-tight sm:text-3xl">
          Một con bot, làm thay cả đội sale
        </h2>
        <p className="text-text-secondary mx-auto mt-2 max-w-xl text-sm sm:text-base">
          Phù hợp mọi loại hình doanh nghiệp — bán hàng, dịch vụ, spa, bất động sản…
          mỗi tính năng đi kèm một lợi ích rõ ràng.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LANDING_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="border-border-default/80 hover:border-brand-violet/40 group flex gap-3.5 rounded-2xl border bg-white/85 p-4 shadow-sm backdrop-blur-sm transition-colors"
            >
              <span className="from-brand-indigo to-brand-violet flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-text-primary font-display text-[15px] font-bold capitalize leading-snug">
                  {f.title}
                </h3>
                <p className="text-text-secondary mt-1 text-[13px] leading-snug">{f.benefit}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
