'use client';

import Script from 'next/script';

// Chatwoot live-chat widget — self-hosted instance app.mooly.vn.
// SDK tải bất đồng bộ, sau đó chatwootSDK.run() khởi tạo bong bóng chat ở góc phải dưới.
const CHATWOOT_BASE_URL = 'https://app.mooly.vn';
const CHATWOOT_WEBSITE_TOKEN = '7kpexv9vRQbvUPJJ68vvs1tB';
const CHATWOOT_LAUNCHER_TITLE = 'Tự Động Hoá Kinh Doanh Online';

// chatwootSettings phải set TRƯỚC khi run(); position "right" đặt bubble góc phải dưới
// (cùng phía nút scroll-to-top — nút đó đã được nâng lên trên bubble để không bị che).
const chatwootInitScript = `
window.chatwootSettings = {"position":"right","type":"standard","launcherTitle":"${CHATWOOT_LAUNCHER_TITLE}"};
(function(d,t){
  var BASE_URL="${CHATWOOT_BASE_URL}";
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=BASE_URL+"/packs/js/sdk.js";
  g.async=true;
  s.parentNode.insertBefore(g,s);
  g.onload=function(){
    window.chatwootSDK.run({
      websiteToken: "${CHATWOOT_WEBSITE_TOKEN}",
      baseUrl: BASE_URL
    });
  };
})(document,"script");
`;

export function ChatwootWidget() {
  return (
    <Script id="chatwoot-sdk" strategy="afterInteractive">
      {chatwootInitScript}
    </Script>
  );
}
