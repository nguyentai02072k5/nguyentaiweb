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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavContent } from '@/content/landing';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';
import { resolveHashHref } from '@/lib/nav/resolve-hash-href';

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Bảo mật' },
  { href: '/terms', label: 'Điều khoản' },
] as const;

type NavMobileDrawerProps = {
  content: NavContent;
};

export function NavMobileDrawer({ content }: NavMobileDrawerProps) {
  const pathname = usePathname();
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
        {/* Overlay backdrop — fades in slightly faster than the panel so the dimmer reads first */}
        <Dialog.Overlay
          className="
            fixed inset-0 z-50
            bg-text-primary/45 backdrop-blur-md
            data-[state=open]:animate-in data-[state=open]:fade-in
            data-[state=closed]:animate-out data-[state=closed]:fade-out
            duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)]
            motion-reduce:duration-0
          "
        />

        {/* Slide-in panel — longer duration + custom ease curve for smoother feel.
            ease-out cubic-bezier(0.22, 1, 0.36, 1) matches landing-wide animation language. */}
        <Dialog.Content
          aria-describedby={undefined}
          className="
            fixed inset-y-0 right-0 z-50
            w-[88vw] max-w-sm
            bg-surface-elevated/95 backdrop-blur-xl
            shadow-[-20px_0_60px_-20px_rgba(99,102,241,0.25)]
            flex flex-col
            pb-[env(safe-area-inset-bottom)]
            data-[state=open]:animate-in data-[state=open]:slide-in-from-right
            data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right
            duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]
            motion-reduce:duration-0
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
                  href={resolveHashHref(link.href, pathname)}
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

          {/* Footer block: legal links (gray, small) sit just above the CTA */}
          <div className="mt-auto">
            <nav
              aria-label="Liên kết pháp lý"
              className="flex items-center justify-center gap-2 px-5 pt-2 pb-1"
            >
              {LEGAL_LINKS.map((item, idx) => (
                <span key={item.href} className="inline-flex items-center gap-2">
                  <Dialog.Close asChild>
                    <Link
                      href={item.href}
                      className="
                        font-display text-[11.5px] text-text-tertiary
                        hover:text-text-secondary
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
                        rounded-sm
                        px-1 py-0.5
                        transition-colors
                      "
                    >
                      {item.label}
                    </Link>
                  </Dialog.Close>
                  {idx < LEGAL_LINKS.length - 1 && (
                    <span aria-hidden className="text-text-tertiary/40 text-[10px]">·</span>
                  )}
                </span>
              ))}
            </nav>

            <div className="p-5 pt-3 border-t border-border-default">
              <Dialog.Close asChild>
                <a
                  href={resolveHashHref(content.desktopCta.href, pathname)}
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
