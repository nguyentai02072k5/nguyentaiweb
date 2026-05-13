/**
 * usp-close-block.tsx - "Đặc biệt, không phụ thuộc Tài" USP highlight block.
 *
 * Renders the USP close copy with a left accent border + subtle aurora tint bg.
 * Text is plain (no segment parsing needed - static copy with inline strong tags).
 * Pink accent is decoration only - body text stays #1a1a2e (no contrast issue).
 */

type UspCloseBlockProps = {
  /** First line - arrow + main claim */
  firstLine: string;
  /** Second line - support detail with "trọn đời" emphasis */
  secondLine: string;
};

export function UspCloseBlock({ firstLine, secondLine }: UspCloseBlockProps) {
  return (
    <div
      className="
        relative
        border-l-[3px] border-brand-pink
        pl-4 py-3
        rounded-r-lg
        bg-gradient-to-r from-brand-pink/[0.06] to-transparent
        my-6
      "
    >
      <p className="font-body text-body-lg text-text-primary leading-relaxed">
        <strong className="font-semibold">{firstLine}</strong>
      </p>
      <p className="font-body text-base text-text-secondary mt-1 leading-relaxed">
        {secondLine}
      </p>
    </div>
  );
}
