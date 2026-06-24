'use client';

import Script from 'next/script';
import { CLARITY_PROJECT_ID } from '@/lib/analytics/clarity';

// Snippet cài đặt chuẩn của Microsoft Clarity - load clarity.ms/tag/<id> bất đồng bộ.
// Clarity tự theo dõi scroll depth, heatmap, session recording -> không cần code thêm.
const clarityInitScript = `
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
`;

// SPA (App Router) không reload trang nên Clarity tự bám phiên - không cần bắn lại
// theo pathname như Pixel/GTM. Chỉ cần nạp script 1 lần sau khi tương tác.
export function MicrosoftClarity() {
  if (!CLARITY_PROJECT_ID) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {clarityInitScript}
    </Script>
  );
}
