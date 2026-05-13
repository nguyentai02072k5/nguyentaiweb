"use client";

/**
 * graph-svg.tsx - Desktop SVG container for tech-graph.
 *
 * A fixed 1200x560 workflow canvas gives every node enough margin, keeps
 * labels readable, and avoids the clipped cards seen in the previous SVG.
 */

import React from 'react';
import type { TechGraphContent, TechGraphNode } from '@/content/landing';
import { GraphNode } from './graph-node';
import { GraphEdge } from './graph-edge';

type GraphSvgProps = {
  content: TechGraphContent;
};

const DESKTOP_POSITIONS: Record<string, Pick<TechGraphNode, 'x' | 'y'>> = {
  inbox: { x: 170, y: 175 },
  vision: { x: 520, y: 175 },
  chatbot: { x: 870, y: 175 },
  knowledge: { x: 870, y: 405 },
  crm: { x: 520, y: 405 },
  report: { x: 170, y: 405 },
};

export function GraphSvg({ content }: GraphSvgProps) {
  const nodes = content.nodes.map((node) => ({
    ...node,
    ...(DESKTOP_POSITIONS[node.id] ?? {}),
  }));
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.38)] ring-1 ring-cyan-300/10 lg:block">
      <svg
        role="img"
        aria-label={`So do workflow AI: ${content.caption}`}
        viewBox="0 0 1200 560"
        className="block h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>Workflow Tai AI Automation</title>
        <desc>{content.caption}</desc>

        <defs>
          <linearGradient id="panelBg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="52%" stopColor="#111827" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <radialGradient id="panelAuroraA" cx="18%" cy="20%" r="55%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.30)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </radialGradient>
          <radialGradient id="panelAuroraB" cx="86%" cy="18%" r="52%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.32)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </radialGradient>

          <linearGradient id="edgeGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>

          {/* Per-edge palette: each step gets a unique gradient.
              The beam variant has transparent tails so the moving comet fades in/out.
              The accent variant is a solid 2-stop gradient used by arrow heads. */}
          {[
            { id: 0, start: '#22D3EE', end: '#67E8F9' },   // inbox -> vision (cyan)
            { id: 1, start: '#67E8F9', end: '#A78BFA' },   // vision -> chatbot (cyan -> violet)
            { id: 2, start: '#A78BFA', end: '#818CF8' },   // chatbot -> knowledge (violet -> indigo)
            { id: 3, start: '#A78BFA', end: '#F472B6' },   // knowledge -> crm (violet -> magenta)
            { id: 4, start: '#F472B6', end: '#FBBF24' },   // crm -> report (magenta -> rose-gold)
            { id: 5, start: '#67E8F9', end: '#F472B6' },   // fallback
          ].map((g) => (
            <React.Fragment key={g.id}>
              <linearGradient id={`beam-${g.id}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={g.start} stopOpacity="0" />
                <stop offset="18%" stopColor={g.start} stopOpacity="1" />
                <stop offset="60%" stopColor="#F8FAFC" stopOpacity="1" />
                <stop offset="100%" stopColor={g.end} stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`accent-edge-${g.id}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={g.start} />
                <stop offset="100%" stopColor={g.end} />
              </linearGradient>
            </React.Fragment>
          ))}

          <linearGradient id="nodeBgGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.16)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.07)" />
          </linearGradient>

          <linearGradient id="nodeBorderGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(125, 211, 252, 0.52)" />
            <stop offset="52%" stopColor="rgba(196, 181, 253, 0.32)" />
            <stop offset="100%" stopColor="rgba(244, 114, 182, 0.28)" />
          </linearGradient>

          {nodes.map((node) => (
            <linearGradient key={node.id} id={`accent-${node.id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor={node.id === 'report' ? '#F472B6' : '#A78BFA'} />
            </linearGradient>
          ))}

          <filter id="nodeGlow" x="-30%" y="-35%" width="160%" height="170%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#020617" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#67E8F9" floodOpacity="0.14" />
          </filter>
          <filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#67E8F9" floodOpacity="0.42" />
          </filter>
          <filter id="beamGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor="#67E8F9" floodOpacity="0.72" />
          </filter>

          <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(148, 163, 184, 0.22)" />
          </pattern>
          <pattern id="scanLines" width="1200" height="18" patternUnits="userSpaceOnUse">
            <rect width="1200" height="1" fill="rgba(255,255,255,0.045)" />
          </pattern>
        </defs>

        <rect width="1200" height="560" rx="24" fill="url(#panelBg)" />
        <rect width="1200" height="560" rx="24" fill="url(#panelAuroraA)" />
        <rect width="1200" height="560" rx="24" fill="url(#panelAuroraB)" />
        <rect x="18" y="18" width="1164" height="524" rx="20" fill="url(#dotGrid)" opacity="0.76" />
        <rect x="18" y="18" width="1164" height="524" rx="20" fill="url(#scanLines)" opacity="0.6" />

        <g aria-hidden="true">
          <text
            x="52"
            y="62"
            fontFamily="var(--font-mono)"
            fontSize="12"
            fontWeight="700"
            fill="#67E8F9"
            letterSpacing="0.16em"
          >
            LIVE AI OPERATING LAYER
          </text>
          <text x="52" y="88" fontFamily="var(--font-body)" fontSize="16" fill="#CBD5E1">
            Tin nhan vao, AI doc hinh, tu van, tao don va bao cao ket qua.
          </text>
          <rect
            x="952"
            y="44"
            width="164"
            height="36"
            rx="18"
            fill="rgba(34, 211, 238, 0.10)"
            stroke="rgba(103, 232, 249, 0.35)"
          />
          <circle cx="974" cy="62" r="5" fill="#22C55E" />
          <text x="990" y="67" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700" fill="#E0F2FE">
            ALWAYS ON
          </text>
        </g>

        {content.edges.map((edge, index) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          return (
            <GraphEdge
              key={index}
              from={from}
              to={to}
              delayMs={edge.delayMs}
              index={index}
            />
          );
        })}

        {nodes.map((node, index) => (
          <GraphNode key={node.id} node={node} index={index} />
        ))}
      </svg>
    </div>
  );
}
