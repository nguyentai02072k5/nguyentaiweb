/**
 * lead-field-config.ts - Khai báo câu hỏi phiếu set-up chatbot (config-driven).
 *
 * NGUỒN DUY NHẤT cho: render form, validate (client), hiển thị CMS, webhook.
 *
 * 2 MÔ HÌNH (business_model) quyết định nhóm câu hỏi hiện ra:
 *   - 'ban-hang' : Tư vấn sản phẩm + Chốt đơn
 *   - 'thu-lead' : Phân loại khách hàng + Thu lead
 * Section có `models` → chỉ hiện khi model đó được chọn. Không `models` = chung.
 *
 * Field type 'repeater' = danh sách lặp (có nút +/−), vd FAQ, sản phẩm, nhãn khách.
 * `placeholders` = nhiều ví dụ mờ trong ô (xoay vòng, không cứng nhắc).
 *
 * Lưu ý: `key` đi vào jsonb payload - ĐẶT TÊN ỔN ĐỊNH, đổi key = mất map dữ liệu cũ.
 */

import {
  Store,
  Target,
  MessageSquare,
  Package,
  ScrollText,
  CreditCard,
  HelpCircle,
  ClipboardList,
  Tags,
  Send,
  type LucideIcon,
} from 'lucide-react';

export type LeadModel = 'ban-hang' | 'thu-lead';

export const LEAD_MODELS: { value: LeadModel; label: string; desc: string; icon: LucideIcon }[] = [
  {
    value: 'ban-hang',
    label: 'Tư vấn sản phẩm + Chốt đơn',
    desc: 'Bot tư vấn, báo giá và chốt đơn trực tiếp với khách.',
    icon: CreditCard,
  },
  {
    value: 'thu-lead',
    label: 'Phân loại khách + Thu lead',
    desc: 'Bot xin thông tin, phân loại và nuôi khách quay lại.',
    icon: Tags,
  },
];

export type LeadFieldType = 'text' | 'textarea' | 'select' | 'repeater';
export type LeadFieldOption = { value: string; label: string };
export type RepeaterSub = {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
  placeholders?: string[];
};

export type LeadField = {
  key: string;
  label: string;
  type: LeadFieldType;
  required?: boolean;
  placeholders?: string[];
  hint?: string;
  options?: LeadFieldOption[];
  // repeater-only
  itemNoun?: string;
  addLabel?: string;
  subFields?: RepeaterSub[];
  seedRows?: number;
};

export type WizardStep = 1 | 2 | 3;

export type LeadSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Bước wizard chứa section (1: Tổng quan & Mục tiêu, 2: Sản phẩm/Thu lead, 3: Chính sách & Kịch bản) */
  step: WizardStep;
  /** undefined = section chung; có giá trị = chỉ hiện với model tương ứng */
  models?: LeadModel[];
  fields: LeadField[];
};

/** Tiêu đề 3 bước của wizard form cấu hình chatbot. */
export const WIZARD_STEPS: { n: WizardStep; title: string }[] = [
  { n: 1, title: 'Tổng quan & Mục tiêu' },
  { n: 2, title: 'Sản phẩm & Dịch vụ' },
  { n: 3, title: 'Chính sách & Kịch bản' },
];

export const LEAD_SECTIONS: LeadSection[] = [
  // ===== CHUNG =====
  {
    id: 'overview',
    title: 'Tổng quan shop',
    icon: Store,
    step: 1,
    fields: [
      {
        key: 'shop_name',
        label: 'Tên shop / thương hiệu',
        type: 'text',
        required: true,
        placeholders: ['VD: Mooly Store', 'VD: Nhà Bông Decor', 'VD: Beauty By An'],
      },
      {
        key: 'industry',
        label: 'Ngành hàng chính',
        type: 'text',
        required: true,
        placeholders: ['Thời trang nữ', 'Mỹ phẩm skincare', 'Đồ gia dụng', 'Phụ kiện công nghệ'],
      },
      {
        key: 'channels',
        label: 'Kênh đang bán',
        type: 'text',
        placeholders: ['Facebook Page + TikTok Shop', 'Instagram + Website', 'Shopee + Zalo OA'],
      },
    ],
  },
  {
    id: 'goal',
    title: 'Mục tiêu chính của shop',
    icon: Target,
    step: 1,
    fields: [
      {
        key: 'business_model',
        label: 'Anh/chị muốn bot làm gì là chính?',
        type: 'select',
        required: true,
        options: LEAD_MODELS.map((m) => ({ value: m.value, label: m.label })),
      },
    ],
  },
  {
    id: 'identity',
    title: 'Phong cách bot',
    icon: MessageSquare,
    step: 1,
    fields: [
      {
        key: 'bot_self',
        label: 'Bot xưng là gì',
        type: 'text',
        required: true,
        placeholders: ['em', 'shop', 'Mèo (tên bot)', 'mình'],
      },
      {
        key: 'bot_call_customer',
        label: 'Gọi khách là gì',
        type: 'text',
        required: true,
        placeholders: ['anh/chị', 'bạn', 'mình', 'quý khách'],
      },
      {
        key: 'bot_tone',
        label: 'Tính cách mong muốn',
        type: 'select',
        options: [
          { value: 'than-thien', label: 'Thân thiện' },
          { value: 'chuyen-nghiep', label: 'Chuyên nghiệp' },
          { value: 'tre-trung', label: 'Trẻ trung' },
          { value: 'sang-trong', label: 'Sang trọng' },
        ],
      },
    ],
  },

  // ===== MÔ HÌNH: TƯ VẤN + CHỐT ĐƠN =====
  {
    id: 'products',
    title: 'Sản phẩm & bảng giá',
    icon: Package,
    step: 2,
    models: ['ban-hang'],
    fields: [
      {
        key: 'products',
        label: 'Danh sách sản phẩm + giá',
        type: 'repeater',
        itemNoun: 'sản phẩm',
        addLabel: 'Thêm sản phẩm',
        seedRows: 2,
        subFields: [
          { key: 'name', label: 'Tên SP', placeholders: ['Áo thun basic', 'Váy hoa nhí', 'Son kem lì #02'] },
          { key: 'price', label: 'Giá', placeholders: ['150.000đ', '250k–350k', '99k'] },
        ],
      },
      {
        key: 'best_seller',
        label: 'Sản phẩm bán chạy nhất',
        type: 'text',
        hint: 'Để bot ưu tiên gợi ý',
        placeholders: ['Váy hoa nhí', 'Combo skincare 5 món', 'Áo phông oversize'],
      },
    ],
  },
  {
    id: 'policy',
    title: 'Chính sách bán hàng',
    icon: ScrollText,
    step: 3,
    models: ['ban-hang'],
    fields: [
      {
        key: 'shipping_cod',
        label: 'Phí ship / COD / freeship',
        type: 'textarea',
        required: true,
        placeholders: [
          'Ship 30k toàn quốc, freeship đơn từ 500k',
          'COD toàn quốc, phí 25k, freeship nội thành',
        ],
      },
      {
        key: 'return_policy',
        label: 'Chính sách đổi trả',
        type: 'textarea',
        required: true,
        placeholders: [
          'Đổi trả trong 7 ngày nếu lỗi NSX, còn tem mác',
          '1 đổi 1 trong 3 ngày, giữ nguyên hộp',
        ],
      },
      {
        key: 'objection_price',
        label: 'Khách chê "đắt quá" → bot trả lời sao',
        type: 'textarea',
        placeholders: [
          'Bên em cam kết chất liệu… kèm bảo hành… ạ',
          'Giá này đã gồm freeship + đổi trả 7 ngày ạ',
        ],
      },
      {
        key: 'working_hours',
        label: 'Giờ làm việc',
        type: 'text',
        placeholders: ['8h–22h hằng ngày', '9h–18h, nghỉ Chủ nhật'],
      },
    ],
  },
  {
    id: 'payment',
    title: 'Thanh toán & lên đơn',
    icon: CreditCard,
    step: 2,
    models: ['ban-hang'],
    fields: [
      {
        key: 'bank_info',
        label: 'Thông tin chuyển khoản',
        type: 'textarea',
        required: true,
        placeholders: [
          'Vietcombank · 0123456789 · NGUYEN VAN A',
          'MBBank · 9988776655 · TRAN THI B',
        ],
      },
      {
        key: 'payment_methods',
        label: 'Hình thức thanh toán nhận',
        type: 'text',
        placeholders: ['COD, chuyển khoản, Momo', 'CK trước hoặc COD'],
      },
      {
        key: 'after_order',
        label: 'Sau khi chốt đơn gửi gì cho khách',
        type: 'text',
        placeholders: ['Mã đơn + lời cảm ơn', 'Ảnh sản phẩm + thời gian giao'],
      },
    ],
  },

  // ===== MÔ HÌNH: PHÂN LOẠI KHÁCH + THU LEAD =====
  {
    id: 'capture',
    title: 'Thông tin cần thu từ khách',
    icon: ClipboardList,
    step: 2,
    models: ['thu-lead'],
    fields: [
      {
        key: 'lead_capture_fields',
        label: 'Thông tin cần xin từ khách',
        type: 'textarea',
        required: true,
        placeholders: [
          'Tên, SĐT/Zalo, nhu cầu chính',
          'SĐT + sản phẩm quan tâm + ngân sách dự kiến',
        ],
      },
      {
        key: 'qualifying_questions',
        label: 'Câu hỏi lọc nhu cầu khách',
        type: 'repeater',
        itemNoun: 'câu hỏi lọc',
        addLabel: 'Thêm câu hỏi lọc',
        seedRows: 2,
        subFields: [
          {
            key: 'q',
            label: 'Câu hỏi',
            placeholders: [
              'Anh/chị đang quan tâm sản phẩm nào ạ?',
              'Ngân sách dự kiến khoảng bao nhiêu ạ?',
              'Mình cần dùng khi nào ạ?',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'labels',
    title: 'Phân loại khách hàng',
    icon: Tags,
    step: 2,
    models: ['thu-lead'],
    fields: [
      {
        key: 'customer_labels',
        label: 'Các nhãn muốn phân loại',
        type: 'repeater',
        itemNoun: 'nhãn',
        addLabel: 'Thêm nhãn',
        seedRows: 2,
        subFields: [
          {
            key: 'label',
            label: 'Tên nhãn',
            placeholders: ['Khách tiềm năng', 'Đã hỏi giá - chưa chốt', 'Khách cũ / VIP', 'Ngại giá'],
          },
          {
            key: 'rule',
            label: 'Khi nào gắn',
            placeholders: [
              'Khi khách hỏi giá nhưng chưa mua',
              'Khi khách để lại SĐT',
              'Khi khách từng mua > 2 lần',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'followup',
    title: 'Follow-up & kéo khách lại',
    icon: Send,
    step: 3,
    models: ['thu-lead'],
    fields: [
      {
        key: 'follow_up_content',
        label: 'Nội dung nhắn lại khách chưa chốt',
        type: 'textarea',
        required: true,
        placeholders: [
          'Ưu đãi giảm 10% nếu chốt trong hôm nay',
          'Nhắc nhẹ + gửi ảnh feedback khách cũ',
        ],
      },
      {
        key: 'follow_up_timing',
        label: 'Follow-up sau bao lâu',
        type: 'select',
        options: [
          { value: 'few-hours', label: 'Sau vài giờ' },
          { value: '1-day', label: 'Sau 1 ngày' },
          { value: '3-days', label: 'Sau 3 ngày' },
        ],
      },
      {
        key: 'return_incentive',
        label: 'Ưu đãi kéo khách quay lại',
        type: 'text',
        placeholders: ['Freeship cho đơn đầu', 'Tặng quà nhỏ khi chốt trong 24h'],
      },
    ],
  },

  // ===== CHUNG CHO CẢ 2 MÔ HÌNH (chỉ hiện sau khi chọn model) =====
  {
    id: 'faq',
    title: 'Câu hỏi thường gặp & kịch bản',
    icon: HelpCircle,
    step: 3,
    models: ['ban-hang', 'thu-lead'],
    fields: [
      {
        key: 'faqs',
        label: 'Câu khách hỏi nhiều + câu trả lời',
        type: 'repeater',
        itemNoun: 'câu hỏi',
        addLabel: 'Thêm câu hỏi',
        seedRows: 3,
        subFields: [
          {
            key: 'q',
            label: 'Khách hỏi',
            placeholders: ['Ship bao lâu ạ?', 'Có bảo hành không?', 'Còn size M không ạ?'],
          },
          {
            key: 'a',
            label: 'Bot trả lời',
            type: 'textarea',
            placeholders: ['Dạ 2–3 ngày toàn quốc ạ', 'Bảo hành 12 tháng ạ', 'Còn đủ size ạ'],
          },
        ],
      },
      {
        key: 'human_handoff',
        label: 'Khi nào bot chuyển cho người thật',
        type: 'textarea',
        placeholders: [
          'Khi khách khiếu nại nặng hoặc đặt sỉ',
          'Khi hết hàng hoặc khách đòi gặp chủ shop',
        ],
      },
    ],
  },
];

/**
 * Field tài liệu upload (chế độ "đã có sẵn file") - KHÔNG nằm trong LEAD_SECTIONS
 * nên không render trong wizard, nhưng vẫn cần có label + format để hiển thị ở
 * CMS và webhook khi khách gửi qua đường upload.
 */
export const LEAD_DOC_FIELDS: LeadField[] = [
  { key: 'business_doc_name', label: 'File mô tả DN & quy trình', type: 'text' },
  { key: 'business_doc_url', label: 'Link file đã upload', type: 'text' },
];

/** Phẳng hoá field (key cuối thắng nếu trùng) - tiện tra cứu. */
export const LEAD_FIELDS: LeadField[] = [
  ...LEAD_SECTIONS.flatMap((s) => s.fields),
  ...LEAD_DOC_FIELDS,
];

export const LEAD_FIELD_LABELS: Record<string, string> = {
  // Trường liên hệ thu ở bước cơ bản (không nằm trong section config)
  email: 'Email',
  ...Object.fromEntries(LEAD_FIELDS.map((f) => [f.key, f.label])),
};

export const LEAD_FIELD_BY_KEY: Record<string, LeadField> = Object.fromEntries(
  LEAD_FIELDS.map((f) => [f.key, f]),
);

const OPTION_LABELS: Record<string, Record<string, string>> = Object.fromEntries(
  LEAD_FIELDS.filter((f) => f.options).map((f) => [
    f.key,
    Object.fromEntries(f.options!.map((o) => [o.value, o.label])),
  ]),
);

/** Sections hiện theo model đang chọn (chưa chọn → chỉ section chung không-models). */
export function sectionsForModel(model: LeadModel | ''): LeadSection[] {
  return LEAD_SECTIONS.filter((s) => !s.models || (model && s.models.includes(model)));
}

/** Sections của 1 bước wizard cho model đang chọn. */
export function sectionsForStep(model: LeadModel | '', step: WizardStep): LeadSection[] {
  return sectionsForModel(model).filter((s) => s.step === step);
}

/** Format giá trị payload thành text người-đọc-được (CMS + webhook). */
export function formatLeadValue(field: LeadField, value: unknown): string {
  if (value == null) return '';

  if (field.type === 'repeater' && Array.isArray(value)) {
    const subs = field.subFields ?? [];
    return value
      .map((row) => {
        const r = (row ?? {}) as Record<string, unknown>;
        const parts = subs
          .map((sf) => String(r[sf.key] ?? '').trim())
          .filter(Boolean);
        return parts.length ? `• ${parts.join(' — ')}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }

  const raw = Array.isArray(value) ? value.join(', ') : String(value);
  return OPTION_LABELS[field.key]?.[raw] ?? raw;
}

/** Kiểm tra payload có giá trị thực cho field không (để CMS ẩn field rỗng). */
export function hasLeadValue(field: LeadField, value: unknown): boolean {
  if (value == null) return false;
  if (field.type === 'repeater') return formatLeadValue(field, value).trim() !== '';
  return String(value).trim() !== '';
}
