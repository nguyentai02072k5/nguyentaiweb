/**
 * PhoneFrame — iPhone-styled mockup container for mobile previews.
 * Constrains content to 375px × 740px viewport with notch + home indicator.
 */

import type { ReactNode } from 'react';

export type PhoneFrameProps = {
  children: ReactNode;
  label?: string;
};

export function PhoneFrame({ children, label = 'iPhone preview · 375×740' }: PhoneFrameProps) {
  return (
    <div className="flex w-full flex-col items-center gap-3 overflow-hidden">
      <div className="relative aspect-[375/740] w-full max-w-[375px] rounded-[3.5rem] bg-slate-900 p-3 shadow-2xl shadow-slate-900/40">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-28 h-7 rounded-b-2xl bg-slate-900" />

        {/* Side buttons */}
        <span className="absolute -left-1 top-32 w-1 h-12 rounded-l bg-slate-700" />
        <span className="absolute -left-1 top-52 w-1 h-20 rounded-l bg-slate-700" />
        <span className="absolute -right-1 top-40 w-1 h-16 rounded-r bg-slate-700" />

        {/* Screen */}
        <div className="relative w-full h-full rounded-[2.75rem] overflow-hidden bg-white">
          {/* Status bar */}
          <div className="absolute top-0 inset-x-0 z-10 h-8 px-7 flex items-center justify-between text-[11px] font-display font-semibold text-slate-900">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span>•••</span>
              <span>📶</span>
              <span>🔋</span>
            </span>
          </div>

          {/* Content area — scrolls internally so embeddable widgets w/o
              their own scroll still render inside the fixed phone-frame */}
          <div className="absolute inset-0 pt-8 overflow-y-auto">
            {children}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 w-32 h-1 rounded-full bg-slate-900/40" />
        </div>
      </div>
      <p className="font-mono text-xs text-text-tertiary">{label}</p>
    </div>
  );
}
