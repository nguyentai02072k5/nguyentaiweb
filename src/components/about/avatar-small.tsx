/**
 * avatar-small.tsx - Owner portrait avatar for About section.
 *
 * Responsive sizing rationale:
 *   • Mobile (<lg): 176px - Hero photo is desktop-only (`hidden lg:flex`),
 *     so the About avatar is the ONLY chance mobile readers see Tài's face.
 *     Larger size compensates for the missing Hero portrait.
 *   • Desktop (lg+): 120px - Hero already shows the full portrait, so the
 *     About avatar plays a supporting accent role (D6 synthesis: 96-120px).
 *
 * Source: same `/brand/owner-tai.png` portrait - cropped to face via
 * `object-cover object-top` (no separate cutout asset needed).
 *
 * Frame: rounded-full + Aurora gradient ring (F1 sketch-style accent).
 * Caption rendered below as figcaption (italic, muted).
 */

import Image from 'next/image';

type AvatarSmallProps = {
  caption?: string;
};

export function AvatarSmall({ caption }: AvatarSmallProps) {
  return (
    <figure className="flex flex-col items-center gap-3">
      {/* Gradient ring wrapper - F1 sketch frame stand-in.
          Responsive size: 176px mobile / 120px desktop. */}
      <div
        className="
          relative size-44 lg:size-[120px]
          rounded-full
          p-[2.5px]
          bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink
          shadow-glow-violet
          flex-shrink-0
        "
      >
        {/* Inner white buffer (so the ring shows a clean band) */}
        <div className="absolute inset-[2.5px] rounded-full bg-surface-base" />

        {/* Circular photo clip */}
        <div className="relative size-full rounded-full overflow-hidden">
          <Image
            src="/brand/owner-tai.png"
            alt="Nguyễn Văn Tài - Tài AI Automation"
            fill
            quality={90}
            sizes="(min-width: 1024px) 120px, 176px"
            className="object-cover object-top"
            priority={false}
          />
        </div>
      </div>

      {caption && (
        <figcaption className="font-body text-body-sm text-text-tertiary italic text-center max-w-[240px]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
