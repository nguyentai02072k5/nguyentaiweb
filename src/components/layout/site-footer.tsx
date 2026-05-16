/**
 * site-footer.tsx — Minimal global footer.
 *
 * Three stacked rows on mobile, balanced two-column on md+:
 *   1. Brand mark + one-line tagline
 *   2. Social icons (Facebook · TikTok · Zalo)
 *   3. Copyright + legal links
 *
 * Aurora hairline at the top mirrors the nav divider so the page feels
 * bookended. Server component — no client-side state needed.
 */

import Link from 'next/link';
import { ProdLogo } from '@/components/brand/prod-logo';
import { LANDING } from '@/content/landing';
import { SocialIcon } from './site-footer-social-icon';

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Bảo mật' },
  { href: '/terms', label: 'Điều khoản' },
] as const;

export function SiteFooter() {
  const { footer } = LANDING;

  return (
    <footer
      role="contentinfo"
      className="
        relative
        bg-[#0f1020]
        text-white
      "
    >
      {/* Aurora hairline — mirrors nav top divider so the page feels bookended */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.5)_18%,rgba(168,85,247,0.7)_50%,rgba(236,72,153,0.5)_82%,transparent_100%)]"
      />

      {/* Subtle aurora wash radiating from top — depth without distraction */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,85,247,0.12),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 pt-6 pb-7 sm:pt-10 lg:pt-14 lg:pb-10">
        {/* Top: brand + social (stacked on mobile, row on md+) */}
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="flex flex-col items-center gap-2 md:items-start md:gap-3">
            <ProdLogo variant="dark" size="lg" showWordmark inverted />
            <p className="max-w-sm text-center md:text-left font-body text-sm text-white/70">
              {footer.tagline}
            </p>
          </div>

          <nav aria-label="Mạng xã hội" className="flex items-center gap-2.5">
            {footer.social.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.ariaLabel}
                className="
                  inline-flex items-center justify-center
                  size-11 rounded-full
                  border border-white/15 bg-white/5 backdrop-blur-sm
                  text-white/75
                  hover:text-white hover:border-brand-violet/60 hover:bg-white/10
                  hover:shadow-[0_8px_24px_-8px_rgba(168,85,247,0.55)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1020]
                  transition-all duration-200
                "
              >
                <SocialIcon name={s.name} className="size-[18px]" />
              </a>
            ))}
          </nav>
        </div>

        {/* Hairline */}
        <div
          aria-hidden="true"
          className="mt-6 sm:mt-10 h-px w-full bg-white/10"
        />

        {/* Bottom: copyright + legal */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center gap-2.5 sm:gap-3 text-[12px] text-white/55 md:flex-row md:justify-between md:gap-4">
          <p className="font-body">{footer.copyright}</p>
          <nav aria-label="Liên kết pháp lý" className="flex items-center gap-3">
            {LEGAL_LINKS.map((l, i) => (
              <span key={l.href} className="inline-flex items-center gap-3">
                <Link
                  href={l.href}
                  className="
                    font-display
                    hover:text-white
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1020]
                    rounded-sm
                    transition-colors
                  "
                >
                  {l.label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span aria-hidden className="text-white/30">·</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
