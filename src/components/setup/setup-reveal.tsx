'use client';

import { useEffect } from 'react';

/**
 * Scroll-reveal an toàn: nội dung luôn hiện sẵn (SSR + no-JS). Sau khi mount, chỉ những
 * phần tử `.sp-rv` đang nằm DƯỚI màn hình mới bị ẩn tạm, rồi hiện khi cuộn tới.
 * reduced-motion hoặc thiếu IntersectionObserver → không làm gì (fail-open).
 */
export function SetupReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>('.sp-rv')).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight * 0.95,
    );
    targets.forEach((el) => el.classList.add('sp-rv-hide'));

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove('sp-rv-hide');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    targets.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
    };
  }, []);

  return null;
}
