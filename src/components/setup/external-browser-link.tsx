'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';

/** Trình duyệt nhúng của Messenger, Facebook, Instagram, Zalo, Line. */
const IN_APP_UA = /FBAN|FBAV|FB_IAB|Messenger|Instagram|Zalo|Line\//i;

/**
 * Link mở trang ngoài. Trong trình duyệt nhúng của Messenger/Facebook/Zalo thì thoát ra
 * Chrome (Android, qua intent) hoặc Safari (iOS, qua x-safari-https). Ngoài ra là link thường, tab mới.
 */
export function ExternalBrowserLink({ href, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    const ua = navigator.userAgent;
    if (event.defaultPrevented || !IN_APP_UA.test(ua)) return;
    const url = new URL(href);
    if (/Android/i.test(ua)) {
      event.preventDefault();
      const fallback = encodeURIComponent(href);
      window.location.href = `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${url.protocol.replace(':', '')};package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      event.preventDefault();
      window.location.href = `x-safari-${href}`;
    }
  }

  return <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...props} />;
}
