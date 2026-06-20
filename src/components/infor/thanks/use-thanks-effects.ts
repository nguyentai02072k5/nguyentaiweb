/**
 * use-thanks-effects.ts - Hiệu ứng trang cảm ơn (port JS từ thanks.html).
 *   - confetti: rơi 1 lần khi mount (append vào pageRoot, không đụng <body>).
 *   - particles: canvas dot-field trôi nhẹ (requestAnimationFrame).
 *   - countdown: 15 phút, persist qua sessionStorage.
 *   - ripple: gợn sóng khi bấm nút Zalo.
 * Tự dọn (cancel raf / remove listener) khi unmount.
 */

'use client';

import { useEffect, type RefObject } from 'react';

type Args = {
  rootRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  timerRef: RefObject<HTMLSpanElement | null>;
  btnRef: RefObject<HTMLAnchorElement | null>;
  confettiClass: string;
  rippleClass: string;
};

const CONFETTI_COLORS = ['#F5A623', '#0068FF', '#00C851', '#F5C842', '#FF6B6B', '#4F46E5', '#fff'];

export function useThanksEffects({ rootRef, canvasRef, timerRef, btnRef, confettiClass, rippleClass }: Args) {
  // ----- Confetti (one-shot) -----
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isMobile = window.innerWidth < 480;
    const pieces: HTMLDivElement[] = [];
    for (let i = 0; i < (isMobile ? 35 : 70); i++) {
      const el = document.createElement('div');
      el.className = confettiClass;
      const sz = Math.random() * 7 + 5;
      el.style.cssText = [
        `left:${Math.random() * 100}vw`,
        `width:${sz}px`,
        `height:${sz * 1.4}px`,
        `background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]}`,
        `animation-duration:${Math.random() * 2.5 + 2}s`,
        `animation-delay:${Math.random() * 1.2}s`,
        `opacity:${Math.random() * 0.55 + 0.4}`,
        `transform:rotate(${Math.random() * 360}deg)`,
      ].join(';');
      el.addEventListener('animationend', () => el.remove());
      root.appendChild(el);
      pieces.push(el);
    }
    return () => pieces.forEach((p) => p.remove());
  }, [rootRef, confettiClass]);

  // ----- Particles (canvas loop) -----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const N = window.innerWidth < 480 ? 40 : 100;
    let W = 0;
    let H = 0;
    let raf = 0;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.35 + 0.08,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      p: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.p += 0.02;
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a * (0.7 + 0.3 * Math.sin(p.p))})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);

  // ----- Countdown (persist sessionStorage) -----
  useEffect(() => {
    const el = timerRef.current;
    if (!el) return;
    const KEY = 'thanks_cd_end';
    let end = Number(sessionStorage.getItem(KEY)) || 0;
    if (end < Date.now()) {
      end = Date.now() + 15 * 60 * 1000;
      sessionStorage.setItem(KEY, String(end));
    }
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = Math.max(0, Math.floor((end - Date.now()) / 1000));
      el.textContent = `${String(Math.floor(d / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`;
      if (d > 0) timer = setTimeout(tick, 1000);
    };
    tick();
    return () => clearTimeout(timer);
  }, [timerRef]);

  // ----- Ripple on Zalo button -----
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const onClick = (e: MouseEvent) => {
      const r = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const sz = Math.max(rect.width, rect.height) * 2;
      r.className = rippleClass;
      r.style.cssText = [
        `width:${sz}px`,
        `height:${sz}px`,
        `left:${e.clientX - rect.left - sz / 2}px`,
        `top:${e.clientY - rect.top - sz / 2}px`,
      ].join(';');
      btn.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    };
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  }, [btnRef, rippleClass]);
}
