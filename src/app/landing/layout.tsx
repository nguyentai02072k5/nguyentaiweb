import type { Metadata } from 'next';

/**
 * Layout landing marketing Mooly (subdomain landing.*). Standalone: root layout
 * đã bỏ NavBar/Footer/Chatwoot theo host, ở đây chỉ thêm metadata + Google Fonts.
 *
 * Font: CSS landing dùng TÊN LITERAL 'Be Vietnam Pro'/'Space Grotesk' (≠ tên hash
 * của next/font). Giữ <link> Google Fonts gốc để literal resolve + đủ weight 300.
 */

const OG_LOGO =
  'https://pub-c01be4db0ffa48e7bd267dfd32067311.r2.dev/LOGO%20MOOLY%20blank.png';
const TITLE = 'Mooly — Trợ lý bán hàng AI đa kênh cho shop & doanh nghiệp';
const DESCRIPTION =
  'Mooly tự động trả lời, tư vấn và chốt đơn 24/7 trên Facebook, Instagram, TikTok, Zalo, Website. Nhận diện ảnh sản phẩm, gắn nhãn khách bằng AI, follow-up tự động. Một nền tảng thay cả đội trực page.';
const LANDING_URL = 'https://landing.nguyenvantai.com';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  icons: { icon: OG_LOGO },
  alternates: { canonical: LANDING_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Mooly',
    locale: 'vi_VN',
    url: LANDING_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_LOGO, width: 512, height: 512, alt: 'Mooly' }],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_LOGO],
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Google Fonts gốc — CSS landing dùng tên literal nên cần link này (Next hoist vào <head>). */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* Cố ý dùng <link> (không next/font): CSS landing tham chiếu tên font literal +
          cần weight 300. Chỉ áp cho landing nên cảnh báo single-page là chấp nhận được. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
