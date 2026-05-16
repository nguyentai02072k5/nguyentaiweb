/**
 * site-footer-social-icon.tsx — Brand-accurate SVG glyphs for footer socials.
 *
 * Lucide ships Facebook but not TikTok or Zalo, so we inline minimal SVG paths
 * for visual consistency. All glyphs render at `currentColor` and accept a
 * className for sizing.
 */

import type { FooterSocial } from '@/content/landing';

type SocialIconProps = {
  name: FooterSocial['name'];
  className?: string;
};

export function SocialIcon({ name, className }: SocialIconProps) {
  switch (name) {
    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
        >
          <path d="M13.5 21.95V13.5h2.85l.43-3.3h-3.28V8.07c0-.95.27-1.6 1.63-1.6h1.74V3.52c-.3-.04-1.34-.13-2.55-.13-2.52 0-4.25 1.54-4.25 4.36V10.2H7.2v3.3h2.87v8.45h3.43Z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
        >
          <path d="M16.6 5.82a4.27 4.27 0 0 1-2.6-3.32h-3.06v12.5a2.6 2.6 0 1 1-2.6-2.6c.28 0 .55.04.8.13v-3.1a5.66 5.66 0 0 0-.8-.06 5.66 5.66 0 1 0 5.66 5.66V9.3a7.3 7.3 0 0 0 4.27 1.37V7.62a4.28 4.28 0 0 1-1.67-1.8Z" />
        </svg>
      );
    case 'zalo':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={className}
        >
          <path d="M12 3C6.48 3 2 6.7 2 11.25c0 2.55 1.42 4.83 3.65 6.34l-.6 2.4a.5.5 0 0 0 .76.54l2.86-1.74c1.05.27 2.16.42 3.33.42 5.52 0 10-3.7 10-8.25S17.52 3 12 3Zm-4.3 9.55H5.5a.5.5 0 0 1 0-1h1.55l-1.6-2.2a.5.5 0 0 1 .4-.8h1.85a.5.5 0 0 1 0 1H6.2l1.6 2.2a.5.5 0 0 1-.4.8Zm2.55-.5a.5.5 0 0 1-.5.5h-.05a.5.5 0 0 1-.5-.5V9.3a.5.5 0 0 1 1 0v2.75Zm4.5.5h-2.3a.5.5 0 0 1-.5-.5V9.3a.5.5 0 0 1 1 0v2.25h1.8a.5.5 0 0 1 0 1Zm4 0a.5.5 0 0 1-.5-.5v-.18a1.7 1.7 0 0 1-1.1.4 1.65 1.65 0 0 1-1.65-1.66c0-.92.74-1.66 1.65-1.66.42 0 .8.15 1.1.4v-.05a.5.5 0 0 1 1 0v2.75a.5.5 0 0 1-.5.5Zm-1.6-2.6a.66.66 0 1 0 0 1.32.66.66 0 0 0 0-1.32Z" />
        </svg>
      );
  }
}
