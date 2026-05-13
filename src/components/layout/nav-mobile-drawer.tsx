"use client";

/**
 * nav-mobile-drawer.tsx — Phase 03d Mobile navigation drawer.
 *
 * Slides in from right when hamburger tapped. Built on Radix Dialog (already in deps)
 * for accessible focus trap + ESC handling + ARIA.
 *
 * Layout:
 *   • Close button top-right
 *   • Anchor links stacked (≥48px touch targets)
 *   • Desktop CTA reused as full-width button at bottom
 *
 * Visible: mobile only (<md). Trigger hidden on desktop in nav-bar.tsx.
 */

import { Dialog } from 'radix-ui';
import { Menu, X } from 'lucide-react';
import type { NavContent } from '@/content/landing';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';

type NavMobileDrawerProps = {
  content: NavContent;
};

export function NavMobileDrawer({ content }: NavMobileDrawerProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Mở menu điều hướng"
          className="
            md:hidden
            inline-flex items-center justify-center
            w-11 h-11 rounded-full
            text-text-primary hover:bg-surface-subtle
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet
            transition-colors
          "
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay backdrop */}
        <Dialog.Overlay
          className="
            fixed inset-0 z-50
            bg-text-primary/40 backdrop-blur-sm
            data-[state=open]:animate-in data-[state=open]:fade-in
            data-[state=closed]:animate-out data-[state=closed]:fade-out
            duration-200
          "
        />

        {/* Slide-in panel */}
        <Dialog.Content
          aria-describedby={undefined}
          className="
            fixed inset-y-0 right-0 z-50
            w-[88vw] max-w-sm
            bg-surface-elevated shadow-2xl
            flex flex-col
            data-[state=open]:animate-in data-[state=open]:slide-in-from-right
            data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right
            duration-250 motion-reduce:duration-0
          "
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <Dialog.Title className="font-display text-h-2 text-text-primary">
              Điều hướng
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng menu"
                className="
                  inline-flex items-center justify-center
                  w-10 h-10 rounded-full
                  text-text-secondary hover:bg-surface-subtle hover:text-text-primary
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet
                  transition-colors
                "
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* Anchor links */}
          <nav className="flex flex-col gap-1 px-3 pb-3" aria-label="Liên kết mục">
            {content.links.map((link) => (
              <Dialog.Close key={link.sectionId} asChild>
                <a
                  href={link.href}
                  data-cta-location={link.analyticsId}
                  onClick={() => trackCtaClick(link.analyticsId)}
                  className="
                    flex items-center
                    px-4 py-3 min-h-[48px]
                    rounded-2xl
                    font-display font-semibold text-base text-text-primary
                    hover:bg-surface-subtle hover:text-brand-violet
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet
                    transition-colors
                  "
                >
                  {link.label}
                </a>
              </Dialog.Close>
            ))}
          </nav>

          {/* CTA at bottom */}
          <div className="mt-auto p-5 border-t border-border-default">
            <Dialog.Close asChild>
              <a
                href={content.desktopCta.href}
                data-cta-location={content.desktopCta.analyticsId}
                aria-label={content.desktopCta.ariaLabel}
                onClick={() => trackCtaClick(content.desktopCta.analyticsId)}
                className="
                  flex items-center justify-center
                  w-full px-5 py-4 min-h-[52px]
                  rounded-full
                  bg-aurora bg-[length:200%_200%] animate-aurora motion-reduce:animate-none
                  shadow-glow-violet
                  font-display font-semibold text-text-on-brand
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2
                "
              >
                {content.desktopCta.label}
              </a>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
