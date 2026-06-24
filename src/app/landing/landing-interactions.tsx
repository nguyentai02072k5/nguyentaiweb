'use client';

import { useEffect } from 'react';
import { trackClarityEvent, setClarityTag } from '@/lib/analytics/clarity';

/**
 * Toàn bộ JS của mooly-landing.html (8 khối) port sang 1 client component, attach
 * theo ID/class y bản gốc (markup inject qua dangerouslySetInnerHTML ở page.tsx).
 *
 * Mỗi khối có cleanup (RAF/observer/listener) + guard StrictMode double-invoke
 * (marquee clone). Giữ NGUYÊN 3 guard prefers-reduced-motion (chat/hero/cost).
 * Khối form thay inline-script gốc bằng fetch /api/landing/lead + GA4 generate_lead.
 */

type HeroSpark = { x: number; y: number; r: number; s: number; o: number; tw: number; g: boolean };
type CostSpark = { x: number; y: number; r: number; tw: number; sp: number; o: number; dy: number; g: boolean };

const REDUCE = '(prefers-reduced-motion: reduce)';

export function LandingInteractions() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // ---- 1. Marquee testimonial: clone track để loop liền mạch (guard StrictMode) ----
    (() => {
      const t = document.getElementById('mqTrack');
      if (!t || t.dataset.cloned) return;
      t.dataset.cloned = '1';
      const clone = t.cloneNode(true) as HTMLElement;
      const added: ChildNode[] = [];
      while (clone.firstChild) {
        const n = clone.firstChild as HTMLElement;
        if (n.setAttribute) n.setAttribute('aria-hidden', 'true');
        t.appendChild(n);
        added.push(n);
      }
      const mqm = t.parentNode as HTMLElement;
      const pause = () => t.classList.add('is-paused');
      const resume = () => t.classList.remove('is-paused');
      mqm.addEventListener('touchstart', pause, { passive: true });
      mqm.addEventListener('touchend', resume, { passive: true });
      mqm.addEventListener('touchcancel', resume, { passive: true });
      cleanups.push(() => {
        mqm.removeEventListener('touchstart', pause);
        mqm.removeEventListener('touchend', resume);
        mqm.removeEventListener('touchcancel', resume);
        added.forEach((n) => n.parentNode?.removeChild(n));
        delete t.dataset.cloned;
      });
    })();

    // ---- 2. Nav: thêm .scrolled khi cuộn qua hero ----
    (() => {
      const nav = document.getElementById('nav');
      const heroEl = document.querySelector('#mooly-lp .hero') as HTMLElement | null;
      if (!nav) return;
      const navState = () => {
        const th = heroEl ? heroEl.offsetHeight - 72 : 60;
        nav.classList.toggle('scrolled', window.scrollY > th);
      };
      window.addEventListener('scroll', navState, { passive: true });
      navState();
      cleanups.push(() => window.removeEventListener('scroll', navState));
    })();

    // ---- 3. Mobile menu open/close ----
    (() => {
      const mnav = document.getElementById('mnav');
      const burger = document.getElementById('burger');
      const mnavX = document.getElementById('mnavX');
      if (!mnav || !burger || !mnavX) return;
      const open = () => mnav.classList.add('open');
      const close = () => mnav.classList.remove('open');
      burger.addEventListener('click', open);
      mnavX.addEventListener('click', close);
      const links = Array.from(mnav.querySelectorAll('a'));
      links.forEach((a) => a.addEventListener('click', close));
      cleanups.push(() => {
        burger.removeEventListener('click', open);
        mnavX.removeEventListener('click', close);
        links.forEach((a) => a.removeEventListener('click', close));
      });
    })();

    // ---- 4. Reveal-on-scroll (IntersectionObserver) ----
    (() => {
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add('in');
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
      document.querySelectorAll('#mooly-lp .rv').forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    })();

    // ---- 5. Chat hero auto-scroll (1 chiều, dừng khi user tác động) ----
    (() => {
      const el = document.getElementById('chatScroll');
      if (!el) return;
      let auto = true;
      let hold = 70;
      let raf = 0;
      const stop = () => {
        auto = false;
      };
      const evs = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
      evs.forEach((ev) => el.addEventListener(ev, stop, { passive: true }));
      const step = () => {
        if (!auto) return;
        const max = el.scrollHeight - el.clientHeight;
        if (hold > 0) hold--;
        else if (el.scrollTop < max - 0.5) el.scrollTop += 0.85;
        else {
          auto = false;
          return;
        }
        raf = requestAnimationFrame(step);
      };
      if (!matchMedia(REDUCE).matches) raf = requestAnimationFrame(step); // reduced-motion: giữ ở đầu, không auto-scroll
      cleanups.push(() => {
        auto = false;
        cancelAnimationFrame(raf);
        evs.forEach((ev) => el.removeEventListener(ev, stop));
      });
    })();

    // ---- 6. Hero particles canvas ----
    (() => {
      const c = document.getElementById('sparks') as HTMLCanvasElement | null;
      if (!c || matchMedia(REDUCE).matches) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const DPR = Math.min(devicePixelRatio || 1, 2);
      let w = 0;
      let h = 0;
      let parts: HeroSpark[] = [];
      let raf = 0;
      let vis = true; // dừng RAF khi hero offscreen (tiết kiệm pin mobile)
      const mk = (): HeroSpark => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.9 + 0.5,
        s: Math.random() * 0.55 + 0.15,
        o: Math.random() * 0.6 + 0.3,
        tw: Math.random() * 6.28,
        g: Math.random() < 0.18,
      });
      const size = () => {
        w = c.clientWidth;
        h = c.clientHeight;
        c.width = w * DPR;
        c.height = h * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const n = Math.min(240, Math.round((w * h) / 6500));
        parts = Array.from({ length: n }, mk);
      };
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.y += p.s;
          p.tw += 0.025;
          if (p.y > h) {
            p.y = -2;
            p.x = Math.random() * w;
          }
          const o = p.o * (0.55 + 0.45 * Math.sin(p.tw));
          if (p.g) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(120,170,255,.9)';
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 6.3);
          ctx.fillStyle = 'rgba(198,220,255,' + o + ')';
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        if (vis) raf = requestAnimationFrame(draw);
      };
      size();
      raf = requestAnimationFrame(draw);
      let t: ReturnType<typeof setTimeout> | undefined;
      const onResize = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          cancelAnimationFrame(raf);
          size();
          if (vis) raf = requestAnimationFrame(draw);
        }, 180);
      };
      window.addEventListener('resize', onResize, { passive: true });
      // IO-gate: chỉ chạy RAF khi hero trong viewport (giống cost-sparks)
      const heroEl = document.querySelector('#mooly-lp .hero');
      const ioh = new IntersectionObserver((es) =>
        es.forEach((e) => {
          vis = e.isIntersecting;
          cancelAnimationFrame(raf);
          if (vis) raf = requestAnimationFrame(draw);
        }),
      );
      if (heroEl) ioh.observe(heroEl);
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
        window.removeEventListener('resize', onResize);
        ioh.disconnect();
      });
    })();

    // ---- 7. FAQ accordion (chỉ mở 1 mục) ----
    (() => {
      const faqs = Array.from(document.querySelectorAll('#mooly-lp .faq'));
      const handlers: Array<[HTMLElement, () => void]> = [];
      faqs.forEach((f) => {
        const q = f.querySelector('.fq') as HTMLElement | null;
        const a = f.querySelector('.fa') as HTMLElement | null;
        if (!q || !a) return;
        const onClick = () => {
          const op = f.classList.contains('open');
          faqs.forEach((x) => {
            x.classList.remove('open');
            const xa = x.querySelector('.fa') as HTMLElement | null;
            if (xa) xa.style.maxHeight = '';
          });
          if (!op) {
            f.classList.add('open');
            a.style.maxHeight = a.scrollHeight + 'px';
          }
        };
        q.addEventListener('click', onClick);
        handlers.push([q, onClick]);
      });
      cleanups.push(() => handlers.forEach(([el, fn]) => el.removeEventListener('click', fn)));
    })();

    // ---- 8. Cost card particles canvas (chỉ chạy khi card trong viewport) ----
    (() => {
      const card = document.querySelector('#mooly-lp .cost-card') as HTMLElement | null;
      const c = document.getElementById('costSparks') as HTMLCanvasElement | null;
      if (!card || !c || matchMedia(REDUCE).matches) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const DPR = Math.min(devicePixelRatio || 1, 2);
      let w = 0;
      let h = 0;
      let parts: CostSpark[] = [];
      let raf = 0;
      let vis = false;
      const mk = (): CostSpark => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.4 + 0.55,
        tw: Math.random() * 6.28,
        sp: Math.random() * 0.018 + 0.007,
        o: Math.random() * 0.5 + 0.4,
        dy: Math.random() * 0.05 + 0.015,
        g: Math.random() < 0.28,
      });
      const size = () => {
        const b = card.getBoundingClientRect();
        w = b.width;
        h = b.height;
        c.width = w * DPR;
        c.height = h * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const n = Math.min(100, Math.round((w * h) / 3900));
        parts = Array.from({ length: n }, mk);
      };
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.tw += p.sp;
          p.y -= p.dy / h;
          if (p.y < 0) {
            p.y = 1;
            p.x = Math.random();
          }
          const o = p.o * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.tw)));
          if (p.g) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(255,255,255,.85)';
          } else ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, p.r, 0, 6.3);
          ctx.fillStyle = 'rgba(255,255,255,' + o + ')';
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        if (vis) raf = requestAnimationFrame(draw);
      };
      size();
      let t: ReturnType<typeof setTimeout> | undefined;
      const onResize = () => {
        clearTimeout(t);
        t = setTimeout(size, 200);
      };
      window.addEventListener('resize', onResize, { passive: true });
      const ioc = new IntersectionObserver((es) =>
        es.forEach((e) => {
          vis = e.isIntersecting;
          cancelAnimationFrame(raf);
          if (vis) raf = requestAnimationFrame(draw);
        }),
      );
      ioc.observe(card);
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
        window.removeEventListener('resize', onResize);
        ioc.disconnect();
      });
    })();

    // ---- 8b. CTA click → Clarity event (mọi nút trỏ #dang-ky = ý định đăng ký) ----
    (() => {
      const ctas = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('#mooly-lp a[href="#dang-ky"]'),
      );
      const handlers: Array<[HTMLAnchorElement, () => void]> = [];
      ctas.forEach((a) => {
        const onClick = () => {
          // Nhãn nút (text gọn) -> phân biệt CTA nào kéo nhiều click trong dashboard.
          const label = (a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
          trackClarityEvent('cta_register_click');
          if (label) setClarityTag('cta_label', label);
        };
        a.addEventListener('click', onClick);
        handlers.push([a, onClick]);
      });
      cleanups.push(() => handlers.forEach(([el, fn]) => el.removeEventListener('click', fn)));
    })();

    // ---- 9. Form lead → /api/landing/lead + GA4 generate_lead ----
    (() => {
      const form = document.getElementById('leadForm') as HTMLFormElement | null;
      if (!form) return;
      const reqFields = Array.from(form.querySelectorAll('[required]')) as HTMLInputElement[];
      const inputHandlers: Array<[HTMLInputElement, () => void]> = [];
      reqFields.forEach((i) => {
        const h = () => {
          if (i.value.trim()) i.classList.remove('invalid');
        };
        i.addEventListener('input', h);
        inputHandlers.push([i, h]);
      });
      const val = (id: string) =>
        (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value.trim() ?? '';
      const onSubmit = async (e: Event) => {
        e.preventDefault();
        let ok = true;
        reqFields.forEach((i) => {
          const bad = !i.value.trim();
          i.classList.toggle('invalid', bad);
          if (bad) ok = false;
        });
        if (!ok) {
          (form.querySelector('.invalid') as HTMLElement | null)?.focus();
          return;
        }
        const payload = {
          full_name: val('name'),
          phone: val('phone'),
          industry: val('industry') || undefined,
          message_volume: val('scale') || undefined,
        };
        const btn = form.querySelector('button[type=submit]') as HTMLButtonElement | null;
        const prevLabel = btn?.textContent ?? '';
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Đang gửi…';
          btn.setAttribute('aria-busy', 'true');
        }
        try {
          // timeout client-side: request treo (cold start/proxy) không kẹt nút disable vĩnh viễn
          const res = await fetch('/api/landing/lead', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000),
          });
          if (!res.ok) throw new Error('submit failed');
          form.style.display = 'none';
          document.getElementById('fok')?.classList.add('show');
          // GA4 (GTM dataLayer) + Meta Pixel — non-PII
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'generate_lead',
            form_location: 'landing',
            industry: payload.industry,
            message_volume: payload.message_volume,
          });
          window.fbq?.('track', 'Lead', { content_category: payload.industry });
          // Clarity: đánh dấu session đã chuyển đổi -> lọc riêng nhóm chốt lead trong recordings.
          trackClarityEvent('lead_submitted');
          if (payload.industry) setClarityTag('industry', payload.industry);
          if (payload.message_volume) setClarityTag('message_volume', payload.message_volume);
        } catch (err) {
          console.error('[landing lead] submit error', err);
          if (btn) {
            btn.disabled = false;
            btn.textContent = prevLabel;
            btn.removeAttribute('aria-busy');
          }
          alert('Gửi thông tin chưa được, bạn thử lại giúp mình nhé.');
        }
      };
      form.addEventListener('submit', onSubmit);
      cleanups.push(() => {
        form.removeEventListener('submit', onSubmit);
        inputHandlers.forEach(([i, h]) => i.removeEventListener('input', h));
      });
    })();

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
