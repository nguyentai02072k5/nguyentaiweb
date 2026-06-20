/**
 * /infor/thanks - Trang cảm ơn sau khi khách gửi thông tin ở landing /infor.
 *
 * Truy cập thực tế: infor.nguyenvantai.com/thanks (proxy.ts rewrite host infor.* → /infor/*).
 * Form cơ bản capture xong sẽ điều hướng cứng tới đây (xem infor-landing-flow.tsx).
 * noindex: đây là trang sau-chuyển-đổi, không cần lên search.
 */

import type { Metadata } from 'next';
import { InforThanksCard } from '@/components/infor/thanks/infor-thanks-card';

export const metadata: Metadata = {
  title: 'Cảm ơn bạn đã để lại thông tin · Nguyễn Văn Tài',
  robots: { index: false, follow: false },
};

export default function InforThanksPage() {
  return <InforThanksCard />;
}
