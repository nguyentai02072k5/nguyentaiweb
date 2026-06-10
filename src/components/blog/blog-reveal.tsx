'use client';

import { useEffect } from 'react';

/**
 * blog-reveal.tsx - 1 client controller duy nhất cho hiệu ứng bài blog (giữ mọi block là
 * server component → nhẹ). Mô phỏng script bản HTML gốc:
 *   - fade-in/translateY cho `[data-reveal]` khi cuộn tới (IntersectionObserver)
 *   - nhảy số (count-up) cho `[data-count]` (hỗ trợ prefix/suffix, format vi-VN)
 *   - meter fill 0 → đích cho `[data-meter-width]`
 *
 * An toàn:
 *   - prefers-reduced-motion: bỏ qua hoàn toàn → nội dung hiện sẵn (SSR value).
 *   - no-JS: không set `data-reveal-ready` nên CSS không ẩn gì → nội dung hiện sẵn.
 */
export function BlogReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const root = document.getElementById('main') ?? document.body;
    // Gate: chỉ khi JS chạy mới cho phép CSS ẩn [data-reveal] (chống FOUC/no-JS ẩn vĩnh viễn).
    root.setAttribute('data-reveal-ready', '');

    // Reset meter về 0 để animate khi band lộ ra.
    root
      .querySelectorAll<HTMLElement>('[data-meter-width]')
      .forEach((m) => {
        m.style.width = '0%';
      });

    const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN');

    const animateCount = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || '0');
      if (Number.isNaN(target)) return;
      const prefix = el.dataset.countPrefix ?? '';
      const suffix = el.dataset.countSuffix ?? '';
      const duration = 1500;
      let startTs: number | null = null;
      const step = (ts: number) => {
        if (startTs === null) startTs = ts;
        const p = Math.min((ts - startTs) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + fmt(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add('reveal-in');
          el.querySelectorAll<HTMLElement>('[data-count]').forEach(animateCount);
          el.querySelectorAll<HTMLElement>('[data-meter-width]').forEach((m) => {
            const w = m.dataset.meterWidth ?? '0';
            requestAnimationFrame(() => {
              m.style.width = `${w}%`;
            });
          });
          io.unobserve(el);
        }
      },
      { threshold: 0.18 },
    );

    const els = root.querySelectorAll('[data-reveal]');
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
