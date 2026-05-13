"use client";

/**
 * graph-node.tsx - Single SVG node in tech-graph flow.
 *
 * Renders a glass console card with a consistent Lucide icon, step label,
 * title, and short sublabel. Dimensions are shared with edge anchoring.
 */

import {
  Bot,
  ChartNoAxesCombined,
  DatabaseZap,
  Inbox,
  ScanSearch,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import type { TechGraphNode } from '@/content/landing';

const NODE_WIDTH = 244;
const NODE_HEIGHT = 98;

const ICONS: Record<string, LucideIcon> = {
  inbox: Inbox,
  vision: ScanSearch,
  chatbot: Bot,
  knowledge: DatabaseZap,
  crm: ShoppingCart,
  report: ChartNoAxesCombined,
};

type GraphNodeProps = {
  node: TechGraphNode;
  index?: number;
};

export function GraphNodeIcon({
  nodeId,
  className,
}: {
  nodeId: string;
  className?: string;
}) {
  const Icon = ICONS[nodeId] ?? Bot;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.8} />;
}

export function GraphNode({ node, index = 0 }: GraphNodeProps) {
  const x = node.x - NODE_WIDTH / 2;
  const y = node.y - NODE_HEIGHT / 2;
  const step = String(index + 1).padStart(2, '0');

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={20}
        fill="url(#nodeBgGradient)"
        stroke="url(#nodeBorderGradient)"
        strokeWidth={1.4}
        filter="url(#nodeGlow)"
      />
      <rect x={1} y={1} width={4} height={NODE_HEIGHT - 2} rx={2} fill={`url(#accent-${node.id})`} />

      <foreignObject x={0} y={0} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div className="flex h-full items-center gap-3 px-5 py-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <GraphNodeIcon nodeId={node.id} className="size-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="mb-1 font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-cyan-200/80">
              STEP {step}
            </div>
            <div className="font-display text-[15px] font-semibold leading-tight text-white">
              {node.label}
            </div>
            <div className="mt-1 font-body text-[11px] leading-snug text-slate-300">
              {node.sublabel}
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

export const NODE_DIM = { width: NODE_WIDTH, height: NODE_HEIGHT };
