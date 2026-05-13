"use client";

/**
 * hero-sparkles.tsx - B4 Floating sparkles around hero owner photo.
 *
 * 8 sparkle ✦ chars distributed around photo perimeter at varied sizes
 * (32-48px) and alternating violet/pink colors for visual rhythm.
 *
 * Right side is intentionally lighter on sparkles because floating badges
 * (Nhận diện hình ảnh / 20 phút demo / Bàn giao 100%) already occupy that
 * negative space - sparkles would clutter. Left + top + bottom-left carry
 * the bulk of the halo effect.
 *
 * Animated with `animate-sparkle` keyframe (twinkle scale + opacity),
 * each on a stagger delay so they don't pulse in sync.
 *
 * Disabled entirely on reduced-motion (no DOM render).
 */

type Sparkle = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: string;
  delay: string;
  /** 'violet' (default) or 'pink' - alternates for visual rhythm */
  color?: 'violet' | 'pink';
};

const SPARKLES: readonly Sparkle[] = [
  // Top-left corner - anchor large
  { top: '-3%',    left: '-6%',    size: '44px', delay: '0s',   color: 'violet' },
  // Top-center edge
  { top: '-5%',    left: '34%',    size: '32px', delay: '0.4s', color: 'pink'   },
  // Top-right (above-right of photo, beyond badge zone)
  { top: '-6%',    right: '-3%',   size: '36px', delay: '0.8s', color: 'violet' },
  // Left-upper-mid - fills left negative space
  { top: '24%',    left: '-8%',    size: '38px', delay: '1.2s', color: 'pink'   },
  // Left-lower-mid - paired with upper for balance
  { top: '60%',    left: '-9%',    size: '40px', delay: '1.6s', color: 'violet' },
  // Bottom-left corner - anchor large
  { bottom: '4%',  left: '-5%',    size: '44px', delay: '2.0s', color: 'pink'   },
  // Bottom-center edge
  { bottom: '-5%', left: '42%',    size: '32px', delay: '2.4s', color: 'violet' },
  // Bottom-right corner - smaller (badge nearby)
  { bottom: '8%',  right: '-7%',   size: '34px', delay: '2.8s', color: 'pink'   },
];

const COLOR_TOKEN = {
  violet: { className: 'text-brand-violet', glow: 'rgba(168, 85, 247, 0.75)' },
  pink:   { className: 'text-brand-pink',   glow: 'rgba(236, 72, 153, 0.7)'  },
} as const;

export function HeroSparkles() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none motion-reduce:hidden"
    >
      {SPARKLES.map((s, i) => {
        const tone = COLOR_TOKEN[s.color ?? 'violet'];
        return (
          <span
            key={i}
            className={`absolute animate-sparkle leading-none select-none ${tone.className}`}
            style={{
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              fontSize: s.size,
              animationDelay: s.delay,
              filter: `drop-shadow(0 0 14px ${tone.glow})`,
            }}
          >
            ✦
          </span>
        );
      })}
    </div>
  );
}
