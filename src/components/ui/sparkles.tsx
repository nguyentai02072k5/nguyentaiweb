'use client';

/**
 * sparkles.tsx — tsparticles wrapper for ambient sparkle backdrop.
 *
 * Adapted from https://lunarui.dev/components/react/feature-blocks/sparkles.
 * Engine loaded once per page lifecycle (guarded by a module-level promise) so
 * mounting multiple Sparkles instances doesn't re-init slim each time.
 */

import { useEffect, useId, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

interface SparklesProps {
  className?: string;
  size?: number;
  minSize?: number | null;
  density?: number;
  speed?: number;
  minSpeed?: number | null;
  opacity?: number;
  direction?: string;
  opacitySpeed?: number;
  minOpacity?: number | null;
  color?: string;
  mousemove?: boolean;
  hover?: boolean;
  background?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>;
}

let enginePromise: Promise<void> | null = null;
function ensureEngine() {
  if (!enginePromise) {
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }
  return enginePromise;
}

export function Sparkles({
  className,
  size = 1.2,
  minSize = null,
  density = 800,
  speed = 1.5,
  minSpeed = null,
  opacity = 1,
  direction = '',
  opacitySpeed = 3,
  minOpacity = null,
  color = '#ffffff',
  mousemove = false,
  hover = false,
  background = 'transparent',
}: SparklesProps) {
  const [isReady, setIsReady] = useState(false);
  const id = useId();

  useEffect(() => {
    let cancelled = false;
    ensureEngine().then(() => {
      if (!cancelled) setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady) return null;

  const defaultOptions = {
    background: { color: { value: background } },
    fullScreen: { enable: false, zIndex: 1 },
    fpsLimit: 300,
    interactivity: {
      events: {
        onClick: { enable: true, mode: 'push' },
        onHover: {
          enable: hover,
          mode: 'grab',
          parallax: { enable: mousemove, force: 60, smooth: 10 },
        },
        resize: true,
      },
      modes: {
        push: { quantity: 4 },
        repulse: { distance: 200, duration: 0.4 },
      },
    },
    particles: {
      color: { value: color },
      move: {
        enable: true,
        direction,
        speed: { min: minSpeed ?? speed / 130, max: speed },
        straight: true,
      },
      collisions: {
        absorb: { speed: 2 },
        bounce: {
          horizontal: { value: 1 },
          vertical: { value: 1 },
        },
        enable: false,
        maxSpeed: 50,
        mode: 'bounce',
        overlap: { enable: true, retries: 0 },
      },
      number: { value: density },
      opacity: {
        value: { min: minOpacity ?? opacity / 10, max: opacity },
        animation: { enable: true, sync: false, speed: opacitySpeed },
      },
      size: {
        value: { min: minSize ?? size / 1.5, max: size },
      },
    },
    detectRetina: true,
  };

  // tsparticles' inferred type for options is overly strict; cast to satisfy.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Particles id={id} options={defaultOptions as any} className={className} />;
}
