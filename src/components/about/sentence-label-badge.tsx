/**
 * sentence-label-badge.tsx - Coloured label badge for About story paragraphs.
 *
 * 4 variants matching StoryLabel type:
 *   background → indigo  #6366F1
 *   insight    → violet  #A855F7
 *   difference → pink    #EC4899
 *   mission    → cyan    #06B6D4
 *
 * Each badge is a small pill with white text on solid brand colour.
 * Used as inline prefix before each story paragraph.
 */

import type { StoryLabel } from '@/content/landing';

type SentenceLabelBadgeProps = {
  label: StoryLabel;
  display: string;
};

const VARIANT_CLASSES: Record<StoryLabel, string> = {
  background: 'bg-brand-indigo text-white',
  insight:    'bg-brand-violet text-white',
  difference: 'bg-brand-pink text-white',
  mission:    'bg-brand-cyan text-white',
};

export function SentenceLabelBadge({ label, display }: SentenceLabelBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full
        px-2.5 py-0.5
        font-display text-xs font-semibold
        leading-none
        mr-2
        shrink-0
        ${VARIANT_CLASSES[label]}
      `}
    >
      {display}
    </span>
  );
}
