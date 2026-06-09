/**
 * taxonomy.ts — Single source of truth cho phân loại Template Instruction.
 *
 * 3 chiều (đã chốt với owner):
 *   - businessModel: mô hình kinh doanh (bán lẻ / dịch vụ)
 *   - goal:          mục tiêu / giai đoạn phễu (nuôi dưỡng / thu lead / chốt đơn)
 *   - industry:      ngành, gắn theo businessModel
 *
 * Dùng chung cho:
 *   - velite schema (enum validation) — xem velite.config.ts
 *   - UI filter trang /templates
 *   - pSEO route /templates/nganh/[industry] (label + description làm intro)
 *
 * Thêm ngành mới = thêm 1 entry vào INDUSTRIES (slug + label + businessModel + description).
 * `description` BẮT BUỘC có context thật (≥1 câu) — dùng làm intro pSEO chống thin content.
 */

// --- Chiều 1: Mô hình kinh doanh ---
export const BUSINESS_MODELS = [
  { slug: 'ban-le', label: 'Bán lẻ' },
  { slug: 'dich-vu', label: 'Dịch vụ' },
] as const;

// --- Chiều 2: Ngành (gắn theo businessModel) ---
export const INDUSTRIES = [
  // Bán lẻ
  {
    slug: 'thoi-trang',
    label: 'Thời trang',
    businessModel: 'ban-le',
    description:
      'Template chatbot cho shop thời trang — tư vấn size, phối đồ, kiểm tra tồn kho theo ảnh và chốt đơn nhanh.',
  },
  {
    slug: 'my-pham',
    label: 'Mỹ phẩm',
    businessModel: 'ban-le',
    description:
      'Template cho shop mỹ phẩm — tư vấn theo loại da, gợi ý combo, xử lý thắc mắc thành phần và đẩy chốt đơn.',
  },
  {
    slug: 'me-va-be',
    label: 'Mẹ & bé',
    businessModel: 'ban-le',
    description:
      'Template cho ngành mẹ & bé — tư vấn theo độ tuổi của bé, giải đáp an toàn sản phẩm và chăm sóc khách trung thành.',
  },
  {
    slug: 'thuc-pham',
    label: 'Thực phẩm & đặc sản',
    businessModel: 'ban-le',
    description:
      'Template cho shop thực phẩm, đặc sản — tư vấn món, đóng gói, vận chuyển và xử lý đơn theo mùa vụ.',
  },
  {
    slug: 'do-gia-dung',
    label: 'Đồ gia dụng',
    businessModel: 'ban-le',
    description:
      'Template cho ngành đồ gia dụng — so sánh sản phẩm, tư vấn theo nhu cầu sử dụng và hỗ trợ bảo hành sau bán.',
  },
  {
    slug: 'dien-tu',
    label: 'Điện tử',
    businessModel: 'ban-le',
    description:
      'Template cho shop điện tử — tư vấn thông số kỹ thuật, so sánh model, kiểm tra tồn và chốt đơn trả góp.',
  },
  // Dịch vụ
  {
    slug: 'spa',
    label: 'Spa / Thẩm mỹ',
    businessModel: 'dich-vu',
    description:
      'Template chatbot cho spa, thẩm mỹ viện — từ chào dịch vụ, tư vấn liệu trình đến chốt lịch hẹn và nhắc lịch.',
  },
  {
    slug: 'nha-hang',
    label: 'Nhà hàng / Quán ăn',
    businessModel: 'dich-vu',
    description:
      'Template cho nhà hàng, quán ăn — nhận đặt bàn, tư vấn menu, xử lý đặt tiệc và chăm sóc khách quay lại.',
  },
  {
    slug: 'bat-dong-san',
    label: 'Bất động sản',
    businessModel: 'dich-vu',
    description:
      'Template cho môi giới bất động sản — sàng lọc nhu cầu, thu thông tin khách tiềm năng và đặt lịch xem dự án.',
  },
  {
    slug: 'giao-duc',
    label: 'Giáo dục / Trung tâm',
    businessModel: 'dich-vu',
    description:
      'Template cho trung tâm giáo dục — tư vấn khoá học, kiểm tra đầu vào, thu lead phụ huynh và nhắc lịch học thử.',
  },
  {
    slug: 'gym',
    label: 'Gym / Fitness',
    businessModel: 'dich-vu',
    description:
      'Template cho phòng gym, fitness — tư vấn gói tập, đặt lịch tập thử, thu lead và nuôi dưỡng hội viên.',
  },
  {
    slug: 'nha-khoa',
    label: 'Nha khoa / Phòng khám',
    businessModel: 'dich-vu',
    description:
      'Template cho nha khoa, phòng khám — sàng lọc triệu chứng, tư vấn dịch vụ, đặt lịch khám và nhắc tái khám.',
  },
  {
    slug: 'du-lich',
    label: 'Du lịch / Khách sạn',
    businessModel: 'dich-vu',
    description:
      'Template cho du lịch, khách sạn — tư vấn tour/phòng, báo giá theo mùa, thu lead và chốt đặt phòng.',
  },
] as const;

// --- Derived types ---
export type BusinessModelSlug = (typeof BUSINESS_MODELS)[number]['slug'];
export type IndustrySlug = (typeof INDUSTRIES)[number]['slug'];

export type Industry = (typeof INDUSTRIES)[number];

// --- Slug arrays cho velite s.enum() (tuple readonly) ---
export const BUSINESS_MODEL_SLUGS = BUSINESS_MODELS.map((m) => m.slug) as [
  BusinessModelSlug,
  ...BusinessModelSlug[],
];
export const INDUSTRY_SLUGS = INDUSTRIES.map((i) => i.slug) as [
  IndustrySlug,
  ...IndustrySlug[],
];

// --- Helpers ---
export function getIndustriesByModel(model: BusinessModelSlug): Industry[] {
  return INDUSTRIES.filter((i) => i.businessModel === model);
}

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

export function getBusinessModelLabel(slug: string): string {
  return BUSINESS_MODELS.find((m) => m.slug === slug)?.label ?? slug;
}

export function getIndustryLabel(slug: string): string {
  return getIndustry(slug)?.label ?? slug;
}

/** Industry thuộc đúng businessModel? Dùng cho cross-field validation trong velite schema. */
export function industryBelongsToModel(
  industry: string,
  model: string,
): boolean {
  return getIndustry(industry)?.businessModel === model;
}
