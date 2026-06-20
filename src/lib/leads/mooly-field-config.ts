/**
 * mooly-field-config.ts - Khai báo trường form khai thác thông tin Bot Mooly.
 *
 * Form chạy ở form.nguyenvantai.com (proxy rewrite host form.* → /form).
 * Form PHẲNG: contact (xử lý riêng trong form) + các trường nội dung dưới đây.
 * Mỗi trường có tooltip (?) giải thích + placeholder mẫu; FAQ là REPEATER cột
 * Câu hỏi – Câu trả lời (mỗi dòng 1 cặp, dễ điền & tracking).
 *
 * NGUỒN DUY NHẤT cho: render form, validate (client), hiển thị admin CMS, webhook.
 *
 * Lưu ý: `key` đi vào jsonb payload của bảng leads (source='mooly-form').
 *   - ĐẶT TÊN ỔN ĐỊNH, đổi key = mất map dữ liệu cũ.
 *   - Key chọn KHÔNG trùng với key wizard infor → admin CMS render đúng theo nguồn.
 */

import {
  Store,
  Link2,
  PackageSearch,
  Workflow,
  ScrollText,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react';
import type { LeadField } from '@/lib/leads/lead-field-config';

export type MoolyFieldType = 'text' | 'textarea' | 'repeater';

/** Cột con của repeater (FAQ: q + a). */
export type MoolySubField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
  /** Placeholder mẫu - xoay vòng theo từng dòng để gợi nhiều tình huống. */
  placeholders?: string[];
};

export type MoolyField = {
  key: string;
  /** Nhãn ngắn hiển thị trên ô (cũng dùng cho admin CMS + webhook). */
  label: string;
  /** Nội dung tooltip (?) - giải thích vì sao cần & điền thế nào. */
  tooltip: string;
  type: MoolyFieldType;
  required?: boolean;
  /** Icon nhỏ cạnh nhãn để nhận diện nhanh từng mục. */
  icon: LucideIcon;

  // ---- type 'text' | 'textarea' ----
  /** Placeholder mẫu trong ô. */
  placeholder?: string;
  /** Số dòng textarea. */
  rows?: number;
  /** Ghi chú nhấn mạnh dưới ô (vd nhắc thu lead). */
  note?: string;

  // ---- type 'repeater' ----
  itemNoun?: string;
  addLabel?: string;
  seedRows?: number;
  subFields?: MoolySubField[];
};

/** Các trường nội dung khai thác cho bot (theo tài liệu UI/UX). */
export const MOOLY_FIELDS: MoolyField[] = [
  {
    key: 'shop_industry',
    label: 'Tên Shop · Ngành hàng',
    tooltip: 'Điền tên thương hiệu mà khách hàng biết đến và lĩnh vực kinh doanh cụ thể.',
    placeholder: 'VD: Loma Bag - Xưởng gia công túi vải quà tặng B2B',
    type: 'text',
    required: true,
    icon: Store,
  },
  {
    key: 'web_fanpage',
    label: 'Link Website / Fanpage',
    tooltip:
      'Cung cấp đường dẫn chính thức. Hệ thống sẽ quét nội dung tại đây để bot học văn phong và thông tin.',
    placeholder: 'VD: facebook.com/lomabag.vn  /  lomabag.com',
    type: 'text',
    icon: Link2,
  },
  {
    key: 'products_pricing',
    label: 'Sản phẩm nổi bật · Khoảng giá (hoặc Link Catalog)',
    tooltip:
      'Liệt kê các dòng sản phẩm/dịch vụ chính kèm mức giá tương ứng, hoặc dán link Google Drive chứa file Catalog/Báo giá.',
    placeholder:
      'VD: Túi canvas in logo doanh nghiệp (35k - 55k/cái); Túi tote sự kiện (từ 40k). Link Catalog: drive.google.com/...',
    type: 'textarea',
    required: true,
    icon: PackageSearch,
    rows: 4,
  },
  {
    key: 'sales_process',
    label: 'Quy trình bán hàng (Trọng tâm)',
    tooltip:
      'Mô tả từng bước tư vấn từ lúc khách chào hỏi đến khi chốt đơn. Đặc biệt lưu ý điều kiện để bot xin thông tin/SĐT của khách.',
    placeholder:
      'VD: Chào hỏi → Lấy thông tin (Kiểu túi, Kích thước, Số lượng) → Nếu > 50 túi: Báo giá sơ bộ và xin SĐT để Sale gọi chốt → Nếu < 50 túi: Báo xưởng chỉ nhận đơn sỉ từ 50 cái.',
    type: 'textarea',
    required: true,
    icon: Workflow,
    rows: 5,
    note: 'Với sản phẩm/dịch vụ cần thu Leads: ghi rõ ĐIỀU KIỆN để bot xin SĐT/Zalo của khách (vd: đơn > 50 cái, khách hỏi báo giá sỉ…) để Sale gọi chốt.',
  },
  {
    key: 'sales_policy',
    label: 'Chính sách bán hàng',
    tooltip:
      'Các quy định cố định của shop về vận chuyển, đổi trả, bảo hành, thanh toán hoặc thuế.',
    placeholder:
      'VD: Cọc 50% trước khi sản xuất. Freeship nội thành HCM cho đơn từ 5 triệu. Hỗ trợ xuất VAT 8%. Đổi trả 1-1 nếu lỗi đường may.',
    type: 'textarea',
    required: true,
    icon: ScrollText,
    rows: 4,
  },
  {
    key: 'faqs',
    label: 'Câu hỏi thường gặp (FAQs)',
    tooltip:
      'Liệt kê các câu hỏi phổ biến, các tình huống khách hay từ chối và câu trả lời mẫu mà bạn muốn bot học theo. Mỗi dòng là 1 cặp Câu hỏi – Câu trả lời.',
    type: 'repeater',
    required: false,
    icon: MessagesSquare,
    itemNoun: 'cặp Q&A',
    addLabel: 'Thêm câu hỏi',
    seedRows: 3,
    subFields: [
      {
        key: 'q',
        label: 'Khách hỏi',
        type: 'text',
        placeholders: [
          'VD: Thời gian làm hàng bao lâu?',
          'VD: Có xuất hóa đơn VAT không?',
          'VD: Đặt tối thiểu bao nhiêu cái?',
          'VD: Khách chê "đắt quá"',
        ],
      },
      {
        key: 'a',
        label: 'Bot trả lời',
        type: 'textarea',
        placeholders: [
          'VD: Dạ thời gian sản xuất 7-10 ngày tùy số lượng ạ.',
          'VD: Dạ bên em hỗ trợ xuất VAT 8% ạ.',
          'VD: Dạ xưởng nhận đơn sỉ từ 50 cái ạ.',
          'VD: Dạ vải định lượng cao, in sắc nét không bong tróc, đặt nhiều có chiết khấu tốt hơn ạ.',
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Dẫn xuất cho admin CMS + webhook (LeadField-shaped → tái dùng formatLeadValue).
// ---------------------------------------------------------------------------

/** Shape sang LeadField để dùng chung helper format/hasValue với wizard infor. */
export const MOOLY_DISPLAY_FIELDS: LeadField[] = MOOLY_FIELDS.map((f) => ({
  key: f.key,
  label: f.label,
  type: f.type,
  itemNoun: f.itemNoun,
  subFields: f.subFields?.map((s) => ({ key: s.key, label: s.label, type: s.type })),
}));

export const MOOLY_FIELD_BY_KEY: Record<string, LeadField> = Object.fromEntries(
  MOOLY_DISPLAY_FIELDS.map((f) => [f.key, f]),
);

/** Map key → label (fallback resolve nhãn người-đọc-được). */
export const MOOLY_FIELD_LABELS: Record<string, string> = Object.fromEntries(
  MOOLY_FIELDS.map((f) => [f.key, f.label]),
);
