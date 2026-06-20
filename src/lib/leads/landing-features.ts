/**
 * landing-features.ts - Nội dung khối "Tính năng → Lợi ích" của landing /infor.
 *
 * Tách content ra config để dễ sửa câu chữ mà không đụng layout. Mỗi mục theo
 * cặp Tính năng (title) - Lợi ích (benefit) ngắn gọn, dễ hiểu.
 */

import {
  MessageSquareHeart,
  ShoppingCart,
  UserPlus,
  EyeOff,
  TicketPercent,
  Handshake,
  Tags,
  Repeat2,
  type LucideIcon,
} from 'lucide-react';

export type LandingFeature = {
  icon: LucideIcon;
  title: string;
  benefit: string;
};

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: MessageSquareHeart,
    title: 'Tư vấn tự nhiên như người thật',
    benefit: 'Trả lời mượt, đúng ngữ cảnh, khách khó nhận ra đang chat với bot.',
  },
  {
    icon: ShoppingCart,
    title: 'Chốt đơn & lên đơn tự động',
    benefit: 'Dẫn khách từ hỏi giá đến đặt hàng, không bỏ sót khách nào.',
  },
  {
    icon: UserPlus,
    title: 'Thu lead tập trung',
    benefit: 'Tự xin tên, SĐT, nhu cầu và gom data khách về một mối.',
  },
  {
    icon: EyeOff,
    title: 'Auto rep + ẩn bình luận + inbox',
    benefit: 'Tự trả lời bình luận, ẩn comment lộ giá rồi nhắn Messenger riêng.',
  },
  {
    icon: TicketPercent,
    title: 'Tự tạo mã khuyến mãi',
    benefit: 'Bot phát mã giảm giá đúng thời điểm để kích khách chốt nhanh.',
  },
  {
    icon: Handshake,
    title: 'Thương lượng giá có chiến thuật',
    benefit: 'Mặc cả tự nhiên, giữ biên lợi nhuận mà khách vẫn vui vẻ.',
  },
  {
    icon: Tags,
    title: 'Tự động gắn nhãn bằng AI',
    benefit: 'AI đọc hội thoại, phân loại khách: tiềm năng, ngại giá, VIP…',
  },
  {
    icon: Repeat2,
    title: 'Follow-up theo từng nhãn',
    benefit: 'Mỗi nhãn một kịch bản bám đuổi, chăm sóc đúng người đúng lúc.',
  },
];
