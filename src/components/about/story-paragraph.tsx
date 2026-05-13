/**
 * story-paragraph.tsx - Segment array renderer for About story paragraphs.
 *
 * NO markdown parser - pure type-safe segment rendering (KISS, D1 synthesis).
 * Segment types:
 *   text      → plain <span>
 *   strong    → <strong> bold
 *   highlight → <StoryHighlight> pink gradient underline (F1)
 *
 * Paragraph is rendered in italic to signal first-person voice (not marketing copy).
 * Sentence-label badge is rendered inline as prefix before paragraph text.
 */

import type { AboutStoryParagraph, StorySegment } from '@/content/landing';
import { SentenceLabelBadge } from './sentence-label-badge';
import { StoryHighlight } from './story-highlight';

type StoryParagraphProps = {
  paragraph: AboutStoryParagraph;
};

function renderSegments(segments: StorySegment[]): React.ReactNode[] {
  return segments.map((seg, i) => {
    switch (seg.type) {
      case 'text':
        return <span key={i}>{seg.value}</span>;
      case 'strong':
        return <strong key={i} className="font-semibold not-italic">{seg.value}</strong>;
      case 'highlight':
        return <StoryHighlight key={i}>{seg.value}</StoryHighlight>;
      default:
        // Exhaustive - TypeScript will catch unhandled types at compile time
        return null;
    }
  });
}

export function StoryParagraph({ paragraph }: StoryParagraphProps) {
  return (
    <div className="relative z-10">
      {/* Label badge as block prefix */}
      <div className="flex items-start gap-0 mb-2">
        <SentenceLabelBadge
          label={paragraph.label}
          display={paragraph.labelDisplay}
        />
      </div>

      {/* Italic paragraph - first-person voice signal */}
      <p className="font-body text-base text-text-secondary italic leading-relaxed">
        {renderSegments(paragraph.segments)}
      </p>
    </div>
  );
}
