/**
 * layout.tsx — LDP Setup Chatbot AI (subdomain setup.*), standalone, chrome-free.
 * Root layout bỏ NavBar/Footer/Chatwoot theo nhánh isSetup; theme sáng (token thương hiệu
 * indigo/violet/cyan, font Space Grotesk + Be Vietnam Pro từ root layout) scope `.setup-app`.
 * Độc lập hoàn toàn với /course (đang gác lại).
 */

import type { Metadata } from 'next';
import { SETUP_SITE_URL } from '@/lib/setup/setup-content';
import './setup-theme.css';
import './setup-vivid.css';

const TITLE = 'Setup Chatbot AI cho shop: tự làm theo video hoặc cài cùng 1-1';
const DESCRIPTION =
  '12 video làm theo từng bước để có Chatbot AI tự báo giá và bám đuổi khách 24/7 trên Mooly. Cần người làm cùng? Gói Setup 1-1 trong 7 ngày, hoàn tiền 100% sau 3 ngày nếu không ưng.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SETUP_SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Tài · Setup Chatbot AI',
    locale: 'vi_VN',
    url: SETUP_SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <div className="setup-app">{children}</div>;
}
