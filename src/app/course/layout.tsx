/**
 * layout.tsx — Course Academy standalone layout (chrome-free).
 *
 * Root layout đã loại NavBar/SiteFooter/Chatwoot theo nhánh isCourse.
 * Ở đây chỉ lo: font riêng (Plus Jakarta Sans — có subset vietnamese), theme scope CSS teal-dark,
 * và metadata riêng cho /course.
 *
 * Dark-only v1 — KHÔNG ThemeProvider violet, KHÔNG toggle.
 */

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './course-theme.css';

const COURSE_URL = 'https://course.nguyenvantai.com';
const TITLE = 'Tài Academy — Học AI, Web & Tự động hoá miễn phí';
const DESCRIPTION =
  'Thư viện khoá học thực chiến miễn phí: xây chatbot AI bán hàng, làm website, host free, dùng ChatGPT & Claude, tự động hoá với n8n, dựng landing chuyển đổi cao. Đăng nhập bằng email là học ngay.';

// Font DUY NHẤT — Plus Jakarta Sans cho cả display (700/800) lẫn body (400–700).
// Lý do: có subset 'vietnamese' đầy đủ → heading/chữ có dấu render đều nét
// (Sora chỉ có 'latin-ext' nên dấu tiếng Việt bị fallback, cao thấp lệch → đã bỏ).
// Một họ chữ duy nhất giúp nhịp chữ thống nhất + giảm tải font.
const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: COURSE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Tài Academy',
    locale: 'vi_VN',
    url: COURSE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return (
    // course-app = scope class cho token teal-dark (KHÔNG đụng :root global)
    // Font var gán ở wrapper này để CSS var(--font-jakarta) resolve đúng
    <div className={`course-app ${jakarta.variable}`}>
      {children}
      {/* RT-10: sonner chưa mount ở đâu — mount tại đây cho toast player (refresh URL lỗi…).
          theme="dark" cố định (course dark-only; ngoài ThemeProvider violet). */}
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
