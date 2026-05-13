/**
 * graph-edge-geometry.ts - Pure geometry helpers for tech-graph beams.
 *
 * Decides where a beam should attach to a node (anchor), and builds a soft
 * cubic-Bezier path with a perpendicular bow so adjacent nodes don't get
 * a rigid straight connector.
 */

import type { TechGraphNode } from '@/content/landing';
import { NODE_DIM } from './graph-node';

const NODE_HALF_W = NODE_DIM.width / 2;
const NODE_HALF_H = NODE_DIM.height / 2;
const EDGE_GAP = 22;

/** Max perpendicular bow. Scaled by distance so short hops curve subtly
 *  while longer routes get more visible arc. */
const HORIZONTAL_CURVATURE_MAX = 22;
const VERTICAL_CURVATURE_MAX = 16;

export type Anchor = {
  x: number;
  y: number;
  tangent: 'h' | 'v';
  sign: number;
};

/** Pick the side of the node the beam should leave from, plus its tangent. */
export function getAnchor(from: TechGraphNode, to: TechGraphNode): Anchor {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const sign = Math.sign(dx);
    return { x: from.x + sign * (NODE_HALF_W + EDGE_GAP), y: from.y, tangent: 'h', sign };
  }
  const sign = Math.sign(dy);
  return { x: from.x, y: from.y + sign * (NODE_HALF_H + EDGE_GAP), tangent: 'v', sign };
}

/** Build a cubic Bezier with a gentle perpendicular bow. Returns the path
 *  string plus the trailing control point so the caller can orient an
 *  arrow head along the path tangent at the end. */
export function buildPath(a: Anchor, b: Anchor) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const tangentOffset = Math.min(140, dist * 0.45);

  const maxBow = a.tangent === 'h' ? HORIZONTAL_CURVATURE_MAX : VERTICAL_CURVATURE_MAX;
  const bow = Math.min(maxBow, dist * 0.18);
  // horizontal beams arc up, vertical beams bow outward
  const perpSign = a.tangent === 'h' ? -1 : 1;

  let c1x: number;
  let c1y: number;
  let c2x: number;
  let c2y: number;

  if (a.tangent === 'h') {
    c1x = a.x + a.sign * tangentOffset;
    c1y = a.y + perpSign * bow;
    c2x = b.x + b.sign * tangentOffset;
    c2y = b.y + perpSign * bow;
  } else {
    c1x = a.x + perpSign * bow;
    c1y = a.y + a.sign * tangentOffset;
    c2x = b.x + perpSign * bow;
    c2y = b.y + b.sign * tangentOffset;
  }

  return {
    d: `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`,
    c2x,
    c2y,
  };
}
