"use client";

/**
 * nav-bar.tsx — Phase 03d Global Navigation bar.
 *
 * Sticky top, glass-on-scroll, responsive:
 *   • Desktop (md+): NavLogo · anchor links · Đặt lịch CTA
 *   • Mobile (<md):  NavLogo · hamburger drawer trigger
 *
 * Behavior:
 *   • Over Hero (scrollY ≤ 80): transparent backdrop (Aurora visible through)
 *   • Past Hero (scrollY > 80): glass surface (bg + border)
 *   • Active section: highlighted link pill (IntersectionObserver based)
 *
 * Skip-to-content link: prepended for keyboard users (visible on focus only).
 *
 * Wired at `layout.tsx` root → renders above all pages.
 */

import { NavLogo } from '@/components/brand/prod-logo';
import { NavMobileDrawer } from './nav-mobile-drawer';
import { LANDING } from '@/content/landing';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';
import { useScrollPast } from '@/hooks/use-scroll-past';
import { useActiveSection } from '@/hooks/use-active-section';

const SECTION_IDS = ['services', 'process', 'faq', 'booking'] as const;

export function NavBar() {
  const scrolled = useScrollPast(80);
  const active = useActiveSection(SECTION_IDS);
  const { links, desktopCta } = LANDING.nav;

  return (
    <>
      {/* Skip-to-content link — visible only on keyboard focus */}
      <a
        href="#main"
        className="
          sr-only focus:not-sr-only
          focus:fixed focus:top-3 focus:left-3 focus:z-[60]
          focus:px-4 focus:py-2 focus:rounded-full
          focus:bg-brand-violet focus:text-text-on-brand
          focus:font-display focus:text-sm focus:font-semibold
          focus:shadow-glow-violet
        "
      >
        Bỏ qua đến nội dung
      </a>

      <header
        className={`
          sticky top-0 inset-x-0 z-40
          transition-all duration-200 ease-out motion-reduce:transition-none
          ${
            scrolled
              ? 'bg-surface-elevated/90 backdrop-blur-lg shadow-[0_4px_24px_-12px_rgba(99,102,241,0.18)]'
              : 'bg-surface-elevated/55 backdrop-blur-md'
          }
        `}
      >
        <nav
          aria-label="Điều hướng chính"
          className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between gap-4"
        >
          {/* Left: Logo — NavLogo already contains <Link href="/"> internally.
              Clicking same-route Link scrolls to top, equivalent to "#hero" behavior. */}
          <NavLogo />

          {/* Center-right: Desktop anchor links */}
          <ul className="hidden md:flex items-center gap-1 lg:gap-2">
            {links.map((link) => {
              const isActive = active === link.sectionId;
              return (
                <li key={link.sectionId}>
                  <a
                    href={link.href}
                    data-cta-location={link.analyticsId}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => trackCtaClick(link.analyticsId)}
                    className={`
                      relative inline-flex items-center
                      px-4 py-2 lg:px-5 lg:py-2.5 rounded-full
                      font-display text-sm lg:text-[15px] font-semibold tracking-wide
                      transition-colors duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet
                      ${
                        isActive
                          ? 'text-brand-violet bg-brand-violet/10'
                          : 'text-text-secondary hover:text-brand-violet hover:bg-surface-subtle'
                      }
                    `}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right: Desktop CTA + Mobile drawer trigger */}
          <div className="flex items-center gap-2">
            {/* Desktop CTA */}
            <a
              href={desktopCta.href}
              aria-label={desktopCta.ariaLabel}
              data-cta-location={desktopCta.analyticsId}
              onClick={() => trackCtaClick(desktopCta.analyticsId)}
              className="
                hidden md:inline-flex items-center justify-center
                px-5 py-2.5
                rounded-full
                bg-aurora bg-[length:200%_200%] animate-aurora motion-reduce:animate-none
                font-display font-semibold text-text-on-brand text-sm
                shadow-glow-violet hover:shadow-glow-pink hover:scale-[1.03] motion-reduce:hover:scale-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
                transition-all duration-150
              "
            >
              {desktopCta.label}
            </a>

            {/* Mobile hamburger → drawer */}
            <NavMobileDrawer content={LANDING.nav} />
          </div>
        </nav>

        {/* Aurora gradient hairline divider — always-on, tách biệt nav với content */}
        <div
          aria-hidden="true"
          className="
            h-px w-full
            bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.35)_18%,rgba(168,85,247,0.5)_50%,rgba(236,72,153,0.35)_82%,transparent_100%)]
          "
        />
      </header>
    </>
  );
}
