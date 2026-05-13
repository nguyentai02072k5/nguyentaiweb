"use client";

/**
 * /animations - Animation Showcase Page.
 * Anh xem các choice của 6 categories:
 *   A) Backdrop  B) Image  C) Text  D) Card  E) Button  F) Decoration
 * Mỗi category có 2-3 variants để compare side-by-side và pick.
 */

import {
  type Variants,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import { NavLogo } from "@/components/brand/prod-logo";

const SECTIONS = [
  { id: "backdrop", label: "A · Backdrop" },
  { id: "image", label: "B · Image" },
  { id: "text", label: "C · Text" },
  { id: "card", label: "D · Card" },
  { id: "button", label: "E · Button" },
  { id: "decoration", label: "F · Decoration" },
  { id: "sketch-in-context", label: "F1 in Context" },
];

export default function AnimationsShowcase() {
  return (
    <div className="min-h-screen">
      {/* ━━━━━ Sticky nav linking sections ━━━━━ */}
      <nav className="sticky top-0 z-50 border-b border-border-default surface-glass">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <NavLogo />
          <div className="hidden md:flex gap-1 text-xs font-display">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3 py-1.5 rounded-full hover:bg-surface-subtle transition-colors text-text-secondary hover:text-brand-violet"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ━━━━━ Header ━━━━━ */}
      <header className="mx-auto max-w-6xl px-6 pt-12 pb-8">
        <p className="font-display text-label uppercase text-brand-violet mb-3">
          Animation showcase
        </p>
        <h1 className="font-display text-display-2 mb-4">
          Chọn animation cho{" "}
          <span className="text-aurora">landing page</span>
        </h1>
        <p className="font-body text-body-lg text-text-secondary max-w-2xl">
          Mỗi category gồm 2-3 variants. Anh hover/scroll để xem hiệu ứng, ghi
          lại các option ưng ý em sẽ apply vào sections thật ở Phase 03+.
        </p>
      </header>

      {/* ━━━━━ A · BACKDROP ━━━━━ */}
      <Section id="backdrop" title="A · Backdrop animations" sub="Background của hero - A4-A6 tinh tế hơn, không phân tâm">
        <div className="grid md:grid-cols-3 gap-4">
          <BackdropAuroraDrift />
          <BackdropMeshBlobs />
          <BackdropParticles />
          <BackdropDotGridBreathing />
          <BackdropSilkShimmer />
          <BackdropAuroraStreaks />
        </div>
      </Section>

      {/* ━━━━━ B · IMAGE ━━━━━ */}
      <Section
        id="image"
        title="B · Image / Photo animations"
        sub="B3-B5 creative + gọn gàng hơn (placeholder 👤 - sẽ swap ảnh thật ở M1.4)"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <ImageGlowOrbit />
          <Image3DTilt />
          <ImageAuroraGlow />
          <ImageFloatingSparkles />
          <ImageLiquidBlob />
        </div>
      </Section>

      {/* ━━━━━ C · TEXT ━━━━━ */}
      <Section id="text" title="C · Text animations" sub="Cho headline + tagline">
        <div className="space-y-6">
          <TextSplitStagger />
          <TextGradientShift />
          <TextBlurReveal />
          <TextGlowPulse />
        </div>
      </Section>

      {/* ━━━━━ D · CARD ━━━━━ */}
      <Section
        id="card"
        title="D · Card animations"
        sub="3 baseline (D1-D3) + 5 mới (D4-D8). Hover/scroll để trigger"
      >
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <CardLiftGlow />
          <Card3DTilt />
          <CardBorderTrace />
          <CardSpotlight />
          <CardAuroraSweep />
          <CardGlassShine />
        </div>

        <div className="mb-8">
          <CardStaggerReveal />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <CardContentStagger />
          <div className="md:col-span-2 rounded-2xl border-2 border-dashed border-border-default p-6 flex items-center justify-center">
            <p className="font-body text-sm text-text-tertiary text-center">
              D8 đứng riêng vì hiệu ứng nội dung phức tạp -
              <br />
              hover thấy icon scale + content slide + arrow appear
            </p>
          </div>
        </div>
      </Section>

      {/* ━━━━━ E · BUTTON ━━━━━ */}
      <Section id="button" title="E · Button animations" sub="CTA buttons">
        <div className="space-y-6">
          <ButtonShineSweep />
          <ButtonGradientShift />
          <ButtonMagnetic />
        </div>
      </Section>

      {/* ━━━━━ F · DECORATION ━━━━━ */}
      <Section id="decoration" title="F · Decoration animations" sub="Sketch lines, orbit dots, particles">
        <div className="grid md:grid-cols-2 gap-6">
          <DecorSketchDraw />
          <DecorOrbitDots />
        </div>
      </Section>

      {/* ━━━━━ F1 IN CONTEXT - Sketch usage examples ━━━━━ */}
      <Section
        id="sketch-in-context"
        title="F1 · Sketch line - apply trong layout thật"
        sub="4 cách vận dụng F1 sketch: underline keyword, arrow → CTA, section divider, hand-drawn frame quanh ảnh"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <SketchInContextHeadline />
          <SketchInContextArrow />
          <SketchInContextDivider />
          <SketchInContextFrame />
        </div>
      </Section>

      {/* ━━━━━ Footer ━━━━━ */}
      <footer className="mx-auto max-w-6xl px-6 py-12 mt-12 border-t border-border-default text-center text-body-sm font-body text-text-tertiary">
        Anh ghi lại các option ưng ý (vd: A1 + B2 + C3 + D2 + E1 + F1) → em apply
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SECTION WRAPPER
   ════════════════════════════════════════════════════════════════ */

function Section({
  id,
  title,
  sub,
  children,
}: {
  id: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto max-w-6xl px-6 py-16 border-t border-border-default scroll-mt-20"
    >
      <h2 className="font-display text-h-1 mb-1">{title}</h2>
      <p className="font-body text-body-sm text-text-secondary mb-8">{sub}</p>
      {children}
    </section>
  );
}

function VariantLabel({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-violet/10 text-brand-violet">
        {id}
      </span>
      <span className="font-display text-sm font-semibold">{name}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   A · BACKDROP DEMOS
   ════════════════════════════════════════════════════════════════ */

function BackdropAuroraDrift() {
  return (
    <div>
      <VariantLabel id="A1" name="Aurora drift (current)" />
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-default">
        <div className="absolute inset-0 bg-mesh-aurora" />
        <div className="absolute inset-0 bg-aurora-soft opacity-25 animate-aurora bg-[length:200%_200%]" />
        <div className="relative h-full flex items-center justify-center">
          <p className="font-display font-semibold text-text-on-glass surface-glass px-4 py-2 rounded-full">
            Smooth & classy
          </p>
        </div>
      </div>
    </div>
  );
}

function BackdropMeshBlobs() {
  return (
    <div>
      <VariantLabel id="A2" name="Mesh blobs floating" />
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-default bg-surface-base">
        <div
          aria-hidden
          className="absolute size-64 -left-20 -top-20 rounded-full bg-brand-violet/40 blur-3xl animate-blob-1"
        />
        <div
          aria-hidden
          className="absolute size-64 -right-20 -top-10 rounded-full bg-brand-pink/40 blur-3xl animate-blob-2"
        />
        <div
          aria-hidden
          className="absolute size-64 left-1/2 -translate-x-1/2 -bottom-20 rounded-full bg-brand-indigo/40 blur-3xl animate-blob-3"
        />
        <div className="relative h-full flex items-center justify-center">
          <p className="font-display font-semibold surface-glass px-4 py-2 rounded-full">
            Organic & alive
          </p>
        </div>
      </div>
    </div>
  );
}

const BACKDROP_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(11 + i * 17) % 100}%`,
  delay: `${((i * 7) % 60) / 10}s`,
  size: `${2 + ((i * 13) % 30) / 10}px`,
  color:
    i % 3 === 0
      ? "var(--color-brand-violet)"
      : i % 3 === 1
        ? "var(--color-brand-pink)"
        : "var(--color-brand-cyan)",
}));

function BackdropParticles() {
  return (
    <div>
      <VariantLabel id="A3" name="Particles drift" />
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-default bg-gradient-to-br from-surface-base to-surface-subtle">
        {BACKDROP_PARTICLES.map((p) => (
          <span
            key={p.id}
            aria-hidden
            className="absolute bottom-0 rounded-full animate-particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}
        <div className="relative h-full flex items-center justify-center">
          <p className="font-display font-semibold surface-glass px-4 py-2 rounded-full">
            Cosmic & premium
          </p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   B · IMAGE DEMOS
   ════════════════════════════════════════════════════════════════ */

/** Placeholder portrait - gradient circle with face emoji */
function PlaceholderPortrait() {
  return (
    <div className="size-48 rounded-full bg-aurora flex items-center justify-center text-6xl shadow-glow-violet">
      👤
    </div>
  );
}

function ImageGlowOrbit() {
  return (
    <div>
      <VariantLabel id="B1" name="Glow orbit ring (rotating gradient halo)" />
      <div className="relative aspect-square rounded-2xl border border-border-default p-8 flex items-center justify-center bg-surface-elevated overflow-hidden">
        {/* Rotating ring */}
        <div
          aria-hidden
          className="absolute size-64 rounded-full animate-orbit"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, #a855f7 25%, #ec4899 50%, #6366f1 75%, transparent 100%)",
            mask: "radial-gradient(circle, transparent 65%, black 67%, black 80%, transparent 82%)",
            WebkitMask:
              "radial-gradient(circle, transparent 65%, black 67%, black 80%, transparent 82%)",
          }}
        />
        <div className="animate-float-y">
          <PlaceholderPortrait />
        </div>
      </div>
    </div>
  );
}

function Image3DTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    stiffness: 120,
    damping: 20,
  });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div>
      <VariantLabel id="B2" name="3D tilt on mouse hover" />
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative aspect-square rounded-2xl border border-border-default flex items-center justify-center bg-surface-elevated"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          <PlaceholderPortrait />
        </motion.div>
        <p className="absolute bottom-4 inset-x-0 text-center font-mono text-xs text-text-tertiary">
          Hover & di chuyển chuột
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   C · TEXT DEMOS
   ════════════════════════════════════════════════════════════════ */

const HEADLINE_WORDS = ["Để", "AI", "chốt", "khách", "thay", "anh/chị"];

function TextSplitStagger() {
  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.2, 0, 0, 1] },
    },
  };

  return (
    <DemoBlock id="C1" name="Split words stagger fade-up + blur">
      <motion.h3
        className="font-display text-h-1"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.5 }}
        variants={containerVariants}
      >
        {HEADLINE_WORDS.map((w, i) => (
          <motion.span key={i} className="inline-block mr-3" variants={wordVariants}>
            {i === 2 || i === 3 ? <span className="text-aurora">{w}</span> : w}
          </motion.span>
        ))}
      </motion.h3>
      <p className="font-mono text-xs text-text-tertiary mt-2">
        Scroll lên/xuống để re-trigger
      </p>
    </DemoBlock>
  );
}

function TextGradientShift() {
  return (
    <DemoBlock id="C2" name="Gradient shift continuous (text-aurora animated)">
      <h3 className="font-display text-h-1">
        Để{" "}
        <span className="text-aurora animate-gradient-text">
          AI chốt khách
        </span>{" "}
        thay anh/chị
      </h3>
      <p className="font-mono text-xs text-text-tertiary mt-2">
        Gradient cycles indigo → violet → pink mỗi 4s
      </p>
    </DemoBlock>
  );
}

function TextBlurReveal() {
  return (
    <DemoBlock id="C3" name="Blur reveal on viewport">
      <motion.h3
        className="font-display text-h-1"
        initial={{ opacity: 0, filter: "blur(20px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.2, 0, 0, 1] }}
      >
        Để AI <span className="text-aurora">chốt khách</span> thay anh/chị -
        24/7
      </motion.h3>
      <p className="font-mono text-xs text-text-tertiary mt-2">
        Blur 20px → 0 trên 1s
      </p>
    </DemoBlock>
  );
}

function TextGlowPulse() {
  return (
    <DemoBlock id="C4" name="Glow pulse text shadow">
      <h3
        className="font-display text-h-1"
        style={{
          animation: "glow-pulse-text 2.5s ease-in-out infinite",
          textShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
        }}
      >
        Để AI <span className="text-aurora">chốt khách</span>
      </h3>
      <style>{`
        @keyframes glow-pulse-text {
          0%, 100% { text-shadow: 0 0 16px rgba(168, 85, 247, 0.3); }
          50% { text-shadow: 0 0 32px rgba(168, 85, 247, 0.7), 0 0 8px rgba(236, 72, 153, 0.4); }
        }
      `}</style>
      <p className="font-mono text-xs text-text-tertiary mt-2">
        Always-on glow pulse (subtle)
      </p>
    </DemoBlock>
  );
}

function DemoBlock({
  id,
  name,
  children,
}: {
  id: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-8">
      <VariantLabel id={id} name={name} />
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   D · CARD DEMOS
   ════════════════════════════════════════════════════════════════ */

const CARD_BODY = (
  <>
    <div className="size-12 rounded-xl bg-gradient-to-br from-brand-violet to-brand-pink flex items-center justify-center text-xl mb-4">
      💬
    </div>
    <h4 className="font-display text-h-2 mb-2">Chatbot AI</h4>
    <p className="font-body text-body-sm text-text-secondary">
      Tự tư vấn 24/7, nhận diện hình ảnh, chốt đơn tự động.
    </p>
  </>
);

function CardLiftGlow() {
  return (
    <div>
      <VariantLabel id="D1" name="Lift + glow (baseline)" />
      <div className="rounded-2xl bg-surface-elevated border border-border-default p-6 hover:-translate-y-1 hover:shadow-glow-violet transition-all duration-base cursor-pointer">
        {CARD_BODY}
      </div>
    </div>
  );
}

function Card3DTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 25,
  });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div style={{ perspective: "1000px" }}>
      <VariantLabel id="D2" name="3D tilt on mouse" />
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="rounded-2xl bg-surface-elevated border border-border-default p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        {CARD_BODY}
      </motion.div>
    </div>
  );
}

function CardBorderTrace() {
  return (
    <div>
      <VariantLabel id="D3" name="Animated border glow trace" />
      <div className="border-trace relative rounded-2xl bg-surface-elevated p-6 cursor-pointer">
        {CARD_BODY}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   E · BUTTON DEMOS
   ════════════════════════════════════════════════════════════════ */

function ButtonShineSweep() {
  return (
    <DemoBlock id="E1" name="Shine sweep on hover">
      <button
        type="button"
        className="group relative overflow-hidden rounded-full bg-aurora px-8 py-4 font-display font-semibold text-text-on-brand shadow-glow-violet hover:scale-105 transition-transform duration-base"
      >
        <span className="relative z-10">Đặt lịch Meet 1-1 →</span>
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:left-full transition-all duration-700 ease-out"
        />
      </button>
      <p className="font-mono text-xs text-text-tertiary mt-2">
        Hover thấy ánh sáng quét từ trái sang phải
      </p>
    </DemoBlock>
  );
}

function ButtonGradientShift() {
  return (
    <DemoBlock id="E2" name="Gradient shift continuous (always animated)">
      <button
        type="button"
        className="rounded-full bg-aurora animate-aurora bg-[length:200%_200%] px-8 py-4 font-display font-semibold text-text-on-brand shadow-glow-violet hover:scale-105 transition-transform duration-base"
      >
        Đặt lịch Meet 1-1 →
      </button>
      <p className="font-mono text-xs text-text-tertiary mt-2">
        Gradient drift slow + glow always-on (đã dùng ở /preview)
      </p>
    </DemoBlock>
  );
}

function ButtonMagnetic() {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.4);
    y.set((e.clientY - cy) * 0.4);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <DemoBlock id="E3" name="Magnetic cursor follow">
      <motion.button
        ref={ref}
        type="button"
        style={{ x: sx, y: sy }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="rounded-full bg-aurora px-8 py-4 font-display font-semibold text-text-on-brand shadow-glow-violet"
      >
        Đặt lịch Meet 1-1 →
      </motion.button>
      <p className="font-mono text-xs text-text-tertiary mt-2">
        Di chuyển chuột gần button - button &ldquo;hút&rdquo; theo
      </p>
    </DemoBlock>
  );
}

/* ════════════════════════════════════════════════════════════════
   F · DECORATION DEMOS
   ════════════════════════════════════════════════════════════════ */

function DecorSketchDraw() {
  return (
    <div>
      <VariantLabel id="F1" name="Sketch line draw on viewport" />
      <div className="rounded-2xl border border-border-default bg-surface-elevated p-8 h-64 flex items-center justify-center">
        <SketchSvg />
      </div>
    </div>
  );
}

function SketchSvg() {
  return (
    <svg width="320" height="120" viewBox="0 0 320 120" fill="none">
      <motion.path
        d="M 10 60 C 70 10, 130 110, 200 50 S 280 80, 310 40"
        stroke="url(#sketchGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 2, ease: [0.2, 0, 0, 1] }}
      />
      <defs>
        <linearGradient id="sketchGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DecorOrbitDots() {
  return (
    <div>
      <VariantLabel id="F2" name="Orbit dots around badge" />
      <div className="rounded-2xl border border-border-default bg-surface-elevated p-8 h-64 flex items-center justify-center">
        <div className="relative">
          <div className="size-24 rounded-full bg-aurora flex items-center justify-center text-2xl font-display font-bold text-text-on-brand shadow-glow-violet">
            AI
          </div>
          <div className="absolute inset-0 animate-orbit">
            <div
              className="absolute size-3 rounded-full bg-brand-pink shadow-glow-pink"
              style={{ top: "-8px", left: "50%", transform: "translateX(-50%)" }}
            />
          </div>
          <div
            className="absolute inset-0 animate-orbit"
            style={{ animationDuration: "12s", animationDirection: "reverse" }}
          >
            <div
              className="absolute size-2 rounded-full bg-brand-cyan shadow-glow-cyan"
              style={{ bottom: "-4px", left: "50%", transform: "translateX(-50%)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   A · NEW BACKDROP DEMOS (A4-A6 - subtle creative)
   ════════════════════════════════════════════════════════════════ */

function BackdropDotGridBreathing() {
  return (
    <div>
      <VariantLabel id="A4" name="Dot grid breathing - tinh tế tech" />
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-default bg-surface-base">
        <div
          aria-hidden
          className="absolute inset-0 animate-dot-breath"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.45) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/8 via-transparent to-brand-pink/8" />
        <div className="relative h-full flex items-center justify-center">
          <p className="font-display font-semibold surface-glass px-4 py-2 rounded-full">
            Tech & calm
          </p>
        </div>
      </div>
    </div>
  );
}

function BackdropSilkShimmer() {
  return (
    <div>
      <VariantLabel id="A5" name="Silk shimmer - quét sáng hiếm" />
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-default bg-mesh-aurora">
        <div
          aria-hidden
          className="absolute inset-y-0 -left-1/4 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent animate-silk-shimmer"
        />
        <div className="relative h-full flex items-center justify-center">
          <p className="font-display font-semibold surface-glass px-4 py-2 rounded-full">
            Premium silk
          </p>
        </div>
      </div>
    </div>
  );
}

function BackdropAuroraStreaks() {
  return (
    <div>
      <VariantLabel id="A6" name="Aurora streaks - north-light dọc" />
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-default bg-surface-base">
        <div
          aria-hidden
          className="absolute inset-y-0 left-[15%] w-32 origin-bottom blur-3xl animate-aurora-streak-1"
          style={{
            background:
              "linear-gradient(to top, transparent 0%, rgba(168, 85, 247, 0.55) 40%, rgba(236, 72, 153, 0.35) 80%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-[45%] w-40 origin-bottom blur-3xl animate-aurora-streak-2"
          style={{
            background:
              "linear-gradient(to top, transparent 0%, rgba(99, 102, 241, 0.55) 50%, rgba(168, 85, 247, 0.35) 80%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-[12%] w-28 origin-bottom blur-3xl animate-aurora-streak-3"
          style={{
            background:
              "linear-gradient(to top, transparent 0%, rgba(6, 182, 212, 0.5) 50%, rgba(168, 85, 247, 0.3) 80%, transparent 100%)",
          }}
        />
        <div className="relative h-full flex items-center justify-center">
          <p className="font-display font-semibold surface-glass px-4 py-2 rounded-full">
            Northern lights
          </p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   B · NEW IMAGE DEMOS (B3-B5 - creative compact)
   ════════════════════════════════════════════════════════════════ */

function ImageAuroraGlow() {
  return (
    <div>
      <VariantLabel id="B3" name="Aurora frame glow (breathing halo)" />
      <div className="relative aspect-square rounded-2xl border border-border-default flex items-center justify-center bg-surface-elevated overflow-hidden">
        <div
          aria-hidden
          className="absolute size-72 rounded-full bg-aurora opacity-40 blur-3xl animate-glow-pulse"
        />
        <PlaceholderPortrait />
      </div>
    </div>
  );
}

const SPARKLE_POSITIONS = [
  { top: "8%", left: "12%", delay: "0s", size: "18px" },
  { top: "18%", right: "14%", delay: "0.6s", size: "14px" },
  { top: "42%", left: "6%", delay: "1.2s", size: "12px" },
  { bottom: "22%", right: "10%", delay: "1.8s", size: "16px" },
  { bottom: "10%", left: "22%", delay: "2.4s", size: "14px" },
  { top: "52%", right: "6%", delay: "3.0s", size: "12px" },
];

function ImageFloatingSparkles() {
  return (
    <div>
      <VariantLabel id="B4" name="Floating sparkles around photo" />
      <div className="relative aspect-square rounded-2xl border border-border-default flex items-center justify-center bg-surface-elevated overflow-hidden">
        {SPARKLE_POSITIONS.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute text-brand-violet animate-sparkle leading-none"
            style={{
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              fontSize: s.size,
              animationDelay: s.delay,
              filter: "drop-shadow(0 0 6px rgba(168,85,247,0.6))",
            }}
          >
            ✦
          </span>
        ))}
        <PlaceholderPortrait />
      </div>
    </div>
  );
}

function ImageLiquidBlob() {
  return (
    <div>
      <VariantLabel id="B5" name="Liquid blob mask - organic frame" />
      <div className="relative aspect-square rounded-2xl border border-border-default flex items-center justify-center bg-surface-elevated overflow-hidden">
        <div
          aria-hidden
          className="absolute size-64 bg-aurora opacity-30 blur-2xl animate-blob-morph"
          style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
        />
        <div className="size-48 bg-aurora flex items-center justify-center text-6xl shadow-glow-violet animate-blob-morph">
          👤
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   D · NEW CARD DEMOS (D4-D8)
   ════════════════════════════════════════════════════════════════ */

function CardSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div>
      <VariantLabel id="D4" name="Spotlight follows cursor" />
      <div
        ref={ref}
        onMouseMove={handleMove}
        className="relative rounded-2xl bg-surface-elevated border border-border-default p-6 cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
        style={{
          backgroundImage: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, rgba(168, 85, 247, 0.18), transparent 40%)`,
        }}
      >
        {CARD_BODY}
      </div>
    </div>
  );
}

function CardAuroraSweep() {
  return (
    <div>
      <VariantLabel id="D5" name="Aurora gradient sweeps in on hover" />
      <div className="group relative overflow-hidden rounded-2xl bg-surface-elevated border border-border-default p-6 cursor-pointer hover:shadow-glow-violet transition-shadow duration-base">
        <div
          aria-hidden
          className="absolute inset-0 bg-aurora-soft opacity-0 group-hover:opacity-90 -translate-x-full group-hover:translate-x-0 transition-all duration-700 ease-out"
        />
        <div className="relative">{CARD_BODY}</div>
      </div>
    </div>
  );
}

function CardGlassShine() {
  return (
    <div>
      <VariantLabel id="D6" name="Glass + shine sweep + lift" />
      <div className="group relative overflow-hidden rounded-2xl surface-glass border border-border-default p-6 cursor-pointer hover:-translate-y-1 hover:shadow-glow-pink transition-all duration-base">
        <span
          aria-hidden
          className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-full transition-all duration-700 ease-out"
        />
        <div className="relative">{CARD_BODY}</div>
      </div>
    </div>
  );
}

function CardStaggerReveal() {
  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.2, 0, 0, 1] },
    },
  };

  return (
    <div>
      <VariantLabel
        id="D7"
        name="Stagger reveal on viewport (group of 3 cards)"
      />
      <p className="font-mono text-xs text-text-tertiary mb-3">
        Scroll lên/xuống - 3 cards reveal lần lượt 150ms apart
      </p>
      <motion.div
        className="grid md:grid-cols-3 gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            className="rounded-2xl bg-surface-elevated border border-border-default p-6"
          >
            {CARD_BODY}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function CardContentStagger() {
  return (
    <div>
      <VariantLabel id="D8" name="Content reveals stagger on hover" />
      <div className="group rounded-2xl bg-surface-elevated border border-border-default p-6 cursor-pointer hover:-translate-y-1 hover:shadow-glow-pink transition-all duration-base overflow-hidden">
        <div className="size-12 rounded-xl bg-gradient-to-br from-brand-pink to-brand-violet flex items-center justify-center text-xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-base">
          💬
        </div>
        <h4 className="font-display text-h-2 mb-2 group-hover:translate-x-1 transition-transform duration-base">
          Chatbot AI
        </h4>
        <p className="font-body text-body-sm text-text-secondary translate-y-1 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          Tự tư vấn 24/7, nhận diện hình ảnh, chốt đơn tự động.
        </p>
        <div className="mt-3 text-brand-violet font-display font-semibold text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-100">
          Tìm hiểu thêm →
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   F1 IN CONTEXT - Sketch line applied in real layout
   ════════════════════════════════════════════════════════════════ */

function SketchInContextHeadline() {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-8">
      <p className="font-mono text-xs text-text-tertiary mb-6">
        ① Sketch underline accent dưới keyword
      </p>
      <h3 className="font-display text-h-1">
        Để AI{" "}
        <span className="relative inline-block">
          <span className="text-aurora">chốt khách</span>
          <SketchUnderlineSvg />
        </span>{" "}
        thay anh/chị
      </h3>
      <p className="font-mono text-xs text-text-tertiary mt-4">
        Underline draw 1.2s khi vào viewport - scroll re-trigger
      </p>
    </div>
  );
}

function SketchUnderlineSvg() {
  return (
    <svg
      aria-hidden
      className="absolute left-0 -bottom-2 w-full"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 5 6 C 50 0, 100 12, 195 4"
        stroke="url(#underlineGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
      />
      <defs>
        <linearGradient id="underlineGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SketchInContextArrow() {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-8">
      <p className="font-mono text-xs text-text-tertiary mb-6">
        ② Hand-drawn arrow + handwritten note → CTA
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-display italic text-text-secondary text-lg">
          Click ngay để demo →
        </span>
        <SketchArrowSvg />
        <button
          type="button"
          className="rounded-full bg-aurora animate-aurora bg-[length:200%_200%] px-6 py-3 font-display font-semibold text-text-on-brand shadow-glow-violet"
        >
          Đặt lịch Meet
        </button>
      </div>
    </div>
  );
}

function SketchArrowSvg() {
  return (
    <svg aria-hidden width="80" height="40" viewBox="0 0 80 40" fill="none">
      <motion.path
        d="M 5 20 C 25 5, 45 35, 68 20"
        stroke="url(#arrowGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.2, 0, 0, 1] }}
      />
      <motion.path
        d="M 60 14 L 70 20 L 62 26"
        stroke="url(#arrowGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1], delay: 1 }}
      />
      <defs>
        <linearGradient id="arrowGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SketchInContextDivider() {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-8 space-y-5">
      <p className="font-mono text-xs text-text-tertiary">
        ③ Section divider - chuyển section organic
      </p>
      <div>
        <h4 className="font-display text-h-2 mb-1">Vấn đề</h4>
        <p className="font-body text-body-sm text-text-secondary">
          Khách nhắn lúc 1h sáng không ai trả lời. Mất khách.
        </p>
      </div>
      <SketchDividerSvg />
      <div>
        <h4 className="font-display text-h-2 mb-1">Giải pháp</h4>
        <p className="font-body text-body-sm text-text-secondary">
          Chatbot AI xử lý 90% tin nhắn lặp lại. 24/7. Không bỏ sót.
        </p>
      </div>
    </div>
  );
}

function SketchDividerSvg() {
  return (
    <svg
      aria-hidden
      width="100%"
      height="32"
      viewBox="0 0 600 32"
      preserveAspectRatio="none"
      className="block"
    >
      <motion.path
        d="M 20 16 C 100 4, 200 28, 300 16 S 500 4, 580 20"
        stroke="url(#dividerGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="8 4"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1.8, ease: [0.2, 0, 0, 1] }}
      />
      <defs>
        <linearGradient id="dividerGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="20%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="80%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SketchInContextFrame() {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-8">
      <p className="font-mono text-xs text-text-tertiary mb-6">
        ④ Hand-drawn frame quanh ảnh - artisan touch
      </p>
      <div className="flex justify-center">
        <div className="relative inline-block">
          <SketchFrameSvg />
          <div className="m-4 size-44 rounded-full bg-aurora flex items-center justify-center text-5xl shadow-glow-violet">
            👤
          </div>
        </div>
      </div>
    </div>
  );
}

function SketchFrameSvg() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 200 200"
      fill="none"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 8 12 C 60 6, 130 14, 192 8 C 196 60, 192 130, 196 192 C 130 196, 60 192, 8 196 C 4 130, 8 60, 4 8 Z"
        stroke="url(#frameGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 2.5, ease: [0.2, 0, 0, 1] }}
      />
      <defs>
        <linearGradient id="frameGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
