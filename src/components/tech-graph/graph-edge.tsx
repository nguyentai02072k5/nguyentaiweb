"use client";

/**
 * graph-edge.tsx - Premium animated beam between workflow nodes.
 *
 * Inspired by magicui AnimatedBeam: per-edge gradient palette, soft cubic
 * curvature with perpendicular control offsets, dotted base path, a single
 * bright traveling comet, and a glowing arrow head colored to match.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { TechGraphNode } from '@/content/landing';
import { buildPath, getAnchor } from './graph-edge-geometry';

type GraphEdgeProps = {
  from: TechGraphNode;
  to: TechGraphNode;
  delayMs: number;
  /** Sequence index used to pick the palette gradient (beam-0..beam-N). */
  index: number;
};

const BEAM_LENGTH = 0.18;
const BEAM_GAP = 0.82;

export function GraphEdge({ from, to, delayMs, index }: GraphEdgeProps) {
  const shouldReduceMotion = useReducedMotion();
  const beamId = `beam-${index}`;
  const accentId = `accent-edge-${index}`;

  const a = getAnchor(from, to);
  const b = getAnchor(to, from);
  const { d: pathD, c2x, c2y } = buildPath(a, b);

  const arrowDx = b.x - c2x;
  const arrowDy = b.y - c2y;
  const arrowLen = Math.hypot(arrowDx, arrowDy) || 1;
  const sequenceDelay = delayMs / 1000;

  return (
    <g>
      {/* Soft halo behind the beam — adds depth without overpowering. */}
      <path
        d={pathD}
        stroke={`url(#${accentId})`}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
        opacity={0.12}
      />

      {/* Dotted base rail in the accent color — gives the route a clear identity. */}
      <path
        d={pathD}
        stroke={`url(#${accentId})`}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
        strokeDasharray="0.1 6"
        opacity={shouldReduceMotion ? 0.85 : 0.55}
        filter="url(#edgeGlow)"
      />

      {shouldReduceMotion ? null : (
        <TravelingComet pathD={pathD} delay={sequenceDelay} beamId={beamId} />
      )}

      <ArrowHead
        x={b.x}
        y={b.y}
        ux={arrowDx / arrowLen}
        uy={arrowDy / arrowLen}
        accentId={accentId}
      />
    </g>
  );
}

/**
 * The bright moving "comet" along the path. A single, well-tuned animation
 * reads cleaner than the previous stacked dual beam.
 */
function TravelingComet({
  pathD,
  delay,
  beamId,
}: {
  pathD: string;
  delay: number;
  beamId: string;
}) {
  return (
    <motion.path
      d={pathD}
      pathLength={1}
      stroke={`url(#${beamId})`}
      strokeWidth={2.6}
      strokeLinecap="round"
      fill="none"
      filter="url(#beamGlow)"
      strokeDasharray={`${BEAM_LENGTH} ${BEAM_GAP}`}
      initial={{ strokeDashoffset: 1.12, opacity: 0 }}
      animate={{
        strokeDashoffset: [1.12, -0.08],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.1,
        times: [0, 0.18, 0.82, 1],
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 0.6,
        delay,
      }}
    />
  );
}

/** Glowing chevron arrow head, filled with the edge accent gradient. */
function ArrowHead({
  x,
  y,
  ux,
  uy,
  accentId,
}: {
  x: number;
  y: number;
  ux: number;
  uy: number;
  accentId: string;
}) {
  const size = 11;
  const px = -uy;
  const py = ux;
  const baseX = x - ux * size * 0.95;
  const baseY = y - uy * size * 0.95;
  const leftX = baseX + px * size * 0.5;
  const leftY = baseY + py * size * 0.5;
  const rightX = baseX - px * size * 0.5;
  const rightY = baseY - py * size * 0.5;
  // shallow notch behind the tip keeps the chevron silhouette
  const notchX = baseX + ux * size * 0.18;
  const notchY = baseY + uy * size * 0.18;

  return (
    <polygon
      points={`${x},${y} ${leftX},${leftY} ${notchX},${notchY} ${rightX},${rightY}`}
      fill={`url(#${accentId})`}
      filter="url(#beamGlow)"
    />
  );
}
