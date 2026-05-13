/**
 * gradient-text.tsx - Aurora gradient text wrapper.
 *
 * Applies 3-stop indigo→violet→pink gradient via background-clip: text.
 * Only safe for large text (>=24pt / display sizes) - AA contrast rule.
 *
 * Owner decision 2026-05-12: gradient shift animation REMOVED from Hero header.
 * Static gradient only - fewer distractions, focus on C1 word-stagger + F1 underline.
 * For other contexts that may want shift, pass `animate={true}` explicitly.
 */

import type { ReactNode, ElementType } from 'react';

type GradientTextProps = {
  children: ReactNode;
  /** HTML element to render - default span */
  as?: ElementType;
  /** Opt-in animated gradient shift. DEFAULT FALSE (per Hero decision). */
  animate?: boolean;
  className?: string;
};

export function GradientText({
  children,
  as: Tag = 'span',
  animate = false,
  className = '',
}: GradientTextProps) {
  return (
    <Tag
      className={`
        text-aurora
        ${animate ? 'animate-gradient-text motion-reduce:animate-none' : ''}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}
