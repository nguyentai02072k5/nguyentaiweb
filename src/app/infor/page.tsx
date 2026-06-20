/**
 * /infor - Landing page đăng ký tạo Chatbot AI (tự tư vấn, chốt đơn, thu lead).
 *
 * Truy cập thực tế: infor.nguyenvantai.com (proxy.ts rewrite host infor.* `/` → `/infor`).
 *
 * Sườn trang:
 *   1. Hero  - tiêu đề định vị + CTA cuộn xuống form
 *   2. Video - demo chatbot (YouTube embed)
 *   3. Tính năng - liệt kê dạng Tính năng → Lợi ích
 *   4. Đăng ký - form cơ bản → pop-out → form cấu hình chi tiết (InforLandingFlow)
 */

import type { Metadata } from 'next';
import { InforHero } from '@/components/infor/landing/infor-hero';
import { InforVideoDemo } from '@/components/infor/landing/infor-video-demo';
import { InforFeatures } from '@/components/infor/landing/infor-features';
import { InforLandingFlow } from '@/components/infor/landing/infor-landing-flow';
import { InforAuroraBackground } from '@/components/infor/infor-aurora-background';

export const metadata: Metadata = {
  title: 'Chatbot AI tự tư vấn, chốt đơn & thu lead · Nguyễn Văn Tài',
  description:
    'Đăng ký nhận chatbot AI tự tư vấn tự nhiên, chốt đơn, thu lead, ẩn bình luận, thương lượng giá và follow-up tự động — cấu hình riêng cho doanh nghiệp của bạn.',
};

export default function InforLandingPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden pb-12">
      <InforAuroraBackground />

      <InforHero />
      <InforVideoDemo />
      <InforFeatures />
      <InforLandingFlow />
    </main>
  );
}
