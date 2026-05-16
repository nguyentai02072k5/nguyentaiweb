import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { NavBar } from "@/components/layout/nav-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";
import "./globals.css";

/* FOUC prevention — reads stored theme & toggles `.dark` on <html> before paint.
 * Runs outside React tree via next/script beforeInteractive — avoids React 19
 * warning about inline <script> tags rendered inside components. */
const themeInitScript = `try{var t=localStorage.getItem("theme");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}`;

// Display font - Space Grotesk: geometric, soft curves, modern character
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body font - Be Vietnam Pro: optimized cho dấu tiếng Việt
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nguyenvantai.com"),
  title: {
    default: "Tài AI Automation - Chatbot AI bán hàng tự động",
    template: "%s | Tài AI Automation",
  },
  description:
    "Chatbot AI nhận dạng hình ảnh, tư vấn 24/7, chốt đơn tự động. Marketing tự động đa kênh. Đặt lịch Meet 1-1 demo 20 phút.",
  keywords: [
    "Chatbot AI Việt Nam",
    "AI bán hàng tự động",
    "Marketing automation",
    "Tài AI Automation",
    "Nhận dạng hình ảnh AI",
  ],
  openGraph: {
    title: "Tài AI Automation - Đặt lịch demo 20 phút",
    description:
      "Chatbot AI thông minh - nhận hình, tư vấn, chốt đơn tự động.",
    locale: "vi_VN",
    type: "website",
    url: "https://nguyenvantai.com",
    siteName: "Tài AI Automation",
    images: [
      {
        url: "/og/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tài AI Automation - Setup một lần, có ngay trợ lý chốt sale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tài AI Automation - Đặt lịch demo 20 phút",
    description:
      "Chatbot AI thông minh - nhận hình, tư vấn, chốt đơn tự động.",
    images: ["/og/og-image.png"],
  },
  alternates: { canonical: "https://nguyenvantai.com" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#a855f7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${spaceGrotesk.variable} ${beVietnamPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="font-body min-h-full flex flex-col bg-surface-base text-text-primary">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <NavBar />
          {children}
          <SiteFooter />
          <ScrollToTopButton />
        </ThemeProvider>
        <MetaPixel />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
