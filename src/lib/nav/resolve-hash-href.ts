/**
 * resolve-hash-href.ts — Make in-page hash links work across routes.
 *
 * Anchor links like "#booking" only scroll within the current page. When the
 * user is on a non-home route (e.g. /thank-you), clicking such a link merely
 * appends the hash without navigating. Prefix with "/" so the browser routes
 * back to home and then scrolls to the section.
 */

export function resolveHashHref(href: string, pathname: string | null): string {
  if (!href.startsWith('#')) return href;
  if (pathname === '/') return href;
  return `/${href}`;
}
