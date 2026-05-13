/**
 * landing.ts - Single source of truth for all landing page copy.
 *
 * Design decisions:
 * - Segment array model (not markdown parser) - type-safe, no extra deps (KISS)
 * - CtaLocation enum drives analytics + aria-label without duplication (DRY)
 * - All Vietnamese copy lives here; components are pure renderers
 * - Phase 04/05 can extend with new section types without touching this structure
 */

// ---------------------------------------------------------------------------
// Story segment types
// ---------------------------------------------------------------------------

export type StorySegmentType = 'text' | 'strong' | 'highlight';

export type StorySegment = {
  type: StorySegmentType;
  value: string;
};

export type StoryLabel = 'background' | 'insight' | 'difference' | 'mission';

export type AboutStoryParagraph = {
  label: StoryLabel;
  /** Display string shown in sentence-label badge (Vietnamese) */
  labelDisplay: string;
  segments: StorySegment[];
};

// ---------------------------------------------------------------------------
// CTA model
// ---------------------------------------------------------------------------

export type CtaLocation =
  | 'hero_primary'
  | 'hero_secondary'
  | 'sticky_mobile'
  | 'about_inline'
  | 'module_1'
  | 'module_2'
  | 'module_3'
  | 'thank_you_calendar'
  | 'nav_services'
  | 'nav_process'
  | 'nav_faq'
  | 'nav_cta';

export type Cta = {
  label: string;
  /** Anchor `#booking` or deep link */
  href: string;
  /** Full a11y description - screen readers read this instead of label */
  ariaLabel: string;
  /** Maps to data-cta-location attribute + analytics event */
  analyticsId: CtaLocation;
};

// ---------------------------------------------------------------------------
// Section content models
// ---------------------------------------------------------------------------

export type TrustBadge = {
  icon: string; // emoji or lucide icon name
  label: string;
};

export type HeroContent = {
  eyebrow: string;
  /** Two parts - rendered with <br className="sm:hidden" /> between them (D12) */
  headlineParts: [string, string];
  /** Rendered as plain text - no HTML parsing */
  body: string;
  /** USP close block - rendered as plain text */
  uspClose: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  trustBullets: [string, string, string];
  /** Desktop only - displayed as floating badges around photo */
  floatingBadgesDesktop: [TrustBadge, TrustBadge, TrustBadge];
  /** Mobile only - displayed as inline pills row (D5) */
  mobilePills: [TrustBadge, TrustBadge, TrustBadge];
};

export type AboutContent = {
  title: string;
  story: AboutStoryParagraph[];
  bullets: [string, string, string, string];
  photoCaption: string;
  inlineCta: Cta;
};

export type StickyCtaContent = {
  cta: Cta;
  /** Show sticky bar when scrolled past this anchor */
  showAfterAnchor: string;
  /** Hide sticky bar when this section is in viewport */
  hideAtAnchor: string;
};

export type NavLink = {
  label: string;
  href: string;
  /** Section ID for IntersectionObserver active-link tracking */
  sectionId: string;
  analyticsId: CtaLocation;
};

export type NavContent = {
  links: NavLink[];
  /** Desktop-only CTA (mobile uses bottom Sticky CTA) */
  desktopCta: Cta;
};

// ---------------------------------------------------------------------------
// Services (S3) — 3 module cards
// ---------------------------------------------------------------------------

export type ServiceFeature = {
  icon: string;          // emoji
  label: string;
  /** Highlight differentiator (e.g. image recognition) — special styling */
  highlight?: boolean;
};

export type ServiceAccent = 'indigo' | 'violet' | 'gradient';

export type ServiceModule = {
  id: 'module_1' | 'module_2' | 'module_3';
  index: number;         // 1, 2, 3 (display number)
  title: string;
  tagline: string;
  accent: ServiceAccent;
  features: ServiceFeature[];
  cta: Cta;
};

export type ServicesContent = {
  title: string;
  subtitle: string;
  modules: [ServiceModule, ServiceModule, ServiceModule];
};

// ---------------------------------------------------------------------------
// Tech Graph (S4) — animated SVG node-edge diagram
// ---------------------------------------------------------------------------

export type TechGraphNode = {
  id: string;
  label: string;
  sublabel: string;
  icon: string;          // emoji
  /** Desktop SVG x coordinate (viewBox 1200×420) */
  x: number;
  /** Desktop SVG y coordinate */
  y: number;
};

export type TechGraphEdge = {
  from: string;          // node id
  to: string;            // node id
  /** Pulse animation start delay (ms) — stagger edges so dots don't sync */
  delayMs: number;
};

export type TechGraphContent = {
  title: string;
  caption: string;
  nodes: TechGraphNode[];
  edges: TechGraphEdge[];
};

// ---------------------------------------------------------------------------
// Process Journey (S5) — 6-step timeline
// ---------------------------------------------------------------------------

export type ProcessStep = {
  id: string;
  number: number;
  title: string;
  description: string;
  output: string;
};

export type ProcessContent = {
  title: string;
  subtitle: string;
  steps: ProcessStep[];
};

// ---------------------------------------------------------------------------
// Trust Strip — 4 mini trust signals between Process and FAQ
// ---------------------------------------------------------------------------

export type TrustSignal = {
  /** Emoji icon */
  icon: string;
  text: string;
};

export type TrustStripContent = {
  signals: TrustSignal[];
};

// ---------------------------------------------------------------------------
// FAQ (S7) — shadcn Accordion 6 Q&A
// ---------------------------------------------------------------------------

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqContent = {
  title: string;
  subtitle: string;
  items: FaqItem[];
  finalCta: {
    label: string;
    href: string;
    analyticsId: string;
  };
};

// ---------------------------------------------------------------------------
// Root content object
// ---------------------------------------------------------------------------

export type LandingContent = {
  nav: NavContent;
  hero: HeroContent;
  about: AboutContent;
  services: ServicesContent;
  techGraph: TechGraphContent;
  process: ProcessContent;
  trustStrip: TrustStripContent;
  faq: FaqContent;
  stickyMobile: StickyCtaContent;
};

// ---------------------------------------------------------------------------
// Data - all Vietnamese copy locked from content-copy.md audit
// ---------------------------------------------------------------------------

export const LANDING: LandingContent = {
  nav: {
    links: [
      { label: 'Dịch vụ',   href: '#services', sectionId: 'services', analyticsId: 'nav_services' },
      { label: 'Quy trình', href: '#process',  sectionId: 'process',  analyticsId: 'nav_process'  },
      { label: 'FAQ',       href: '#faq',      sectionId: 'faq',      analyticsId: 'nav_faq'      },
    ],
    desktopCta: {
      label: 'Đặt lịch Meet →',
      href: '#booking',
      ariaLabel: 'Đặt lịch Meet 1-1 xem demo 20 phút',
      analyticsId: 'nav_cta',
    },
  },

  hero: {
    eyebrow: 'TÀI AI AUTOMATION',
    headlineParts: [
      'Setup một lần.',
      'Có ngay trợ lý chốt sale không nghỉ ngơi.',
    ],
    body: 'Không trôi tin nhắn, không bỏ lỡ khách hàng ngoài giờ hành chính. AI tiếp nhận hình ảnh, hiểu rõ ý định và tư vấn đúng trọng tâm. Một giải pháp thực tế để anh/chị tối ưu chi phí vận hành mà vẫn duy trì doanh thu đều đặn.',
    uspClose:
      '→ Đặc biệt, không phụ thuộc Tài. Bàn giao toàn bộ - Tài hướng dẫn, hỗ trợ anh/chị trong quá trình sử dụng trọn đời.',
    primaryCta: {
      label: 'Đặt lịch Meet 1-1 - xem demo 20 phút',
      href: '#booking',
      ariaLabel: 'Đặt lịch Meet 1-1 xem demo 20 phút',
      analyticsId: 'hero_primary',
    },
    secondaryCta: {
      label: 'Xem cách hoạt động ↓',
      href: '#tech-graph',
      ariaLabel: 'Xem cách AI hoạt động trong workflow',
      analyticsId: 'hero_secondary',
    },
    trustBullets: [
      'Không cam kết - coi demo trước, quyết định sau',
      'Bàn giao tài khoản chatbot + nền tảng 100%, hỗ trợ sử dụng trọn đời',
      'Tinh chỉnh dễ dàng - tự sửa nội dung, sản phẩm',
    ],
    floatingBadgesDesktop: [
      { icon: '📸', label: 'Nhận diện hình ảnh' },
      { icon: '⏱', label: '20 phút demo' },
      { icon: '🔓', label: 'Bàn giao 100%' },
    ],
    mobilePills: [
      { icon: '📸', label: 'Nhận diện hình ảnh' },
      { icon: '⏱', label: '20 phút demo' },
      { icon: '🔓', label: 'Bàn giao 100%' },
    ],
  },

  about: {
    title: 'Tôi là Tài - và đây là lý do tôi làm dịch vụ này',
    story: [
      {
        label: 'background',
        labelDisplay: 'Background',
        segments: [
          { type: 'text', value: 'Từ ' },
          { type: 'strong', value: '2024' },
          { type: 'text', value: ', đi làm AI thực chiến cho cả B2B (' },
          { type: 'strong', value: 'xưởng Loma' },
          { type: 'text', value: ') lẫn B2C (' },
          { type: 'strong', value: 'mỹ phẩm, spa' },
          {
            type: 'text',
            value:
              '), tôi nhận ra: Anh/chị chủ không cần một hệ thống AI quá hàn lâm hay phức tạp. Cái mọi người thực sự cần là một công cụ ',
          },
          { type: 'strong', value: 'tinh gọn, chi phí hợp lý' },
          { type: 'text', value: ', và quan trọng nhất - ' },
          {
            type: 'highlight',
            value: 'tự tay làm chủ được mà không cần biết nhiều về code hay kỹ thuật',
          },
          { type: 'text', value: '.' },
        ],
      },
      {
        label: 'insight',
        labelDisplay: 'Insight',
        segments: [
          { type: 'text', value: 'Thói quen mua hàng của khách Việt là ' },
          { type: 'strong', value: 'lười gõ' },
          {
            type: 'text',
            value:
              '. Họ lướt, chụp màn hình rồi quăng cái ảnh vô inbox: "Mẫu này còn không shop?" hay "Giá". Mà khó ở chỗ, chatbot cũ chỉ biết đọc từ khóa nên thấy hình là ',
          },
          { type: 'strong', value: '"tịt"' },
          {
            type: 'text',
            value:
              '. Bot đứng hình, nhân sự phải nhảy vào check thủ công. Khách đang "nóng" muốn mua mà bắt phải chờ là ',
          },
          { type: 'strong', value: 'rớt khách liền' },
          { type: 'text', value: '.' },
        ],
      },
      {
        label: 'difference',
        labelDisplay: 'Khác biệt',
        segments: [
          {
            type: 'text',
            value:
              'Nhìn ra được điểm nghẽn đó, thay vì nhồi nhét tính năng rườm rà, tôi dồn lực giải quyết một lõi duy nhất: ',
          },
          { type: 'highlight', value: 'AI phải "đọc hiểu" được hình ảnh' },
          { type: 'text', value: ' và ' },
          {
            type: 'strong',
            value: 'tư vấn thực tế, không chỉ dựa vào từ khoá',
          },
          { type: 'text', value: '. Khách ném ảnh qua, hệ thống ' },
          { type: 'strong', value: 'tự động đối chiếu kho hàng' },
          {
            type: 'text',
            value:
              ' rồi tư vấn đúng trọng tâm ngay lập tức. Giải quyết trực tiếp nhu cầu, thắc mắc của người mua, không vòng vo.',
          },
        ],
      },
      {
        label: 'mission',
        labelDisplay: 'Mission',
        segments: [
          {
            type: 'text',
            value:
              'Mục tiêu của tôi không phải là bán "con bot công nghệ" để trưng bày. ',
          },
          {
            type: 'strong',
            value: 'Cốt lõi của kinh doanh là doanh thu và lợi nhuận.',
          },
          { type: 'text', value: ' Thứ tôi mang đến là một ' },
          { type: 'strong', value: '"trợ lý AI" trực 24/7' },
          {
            type: 'text',
            value:
              ', xử lý gọn gàng khâu tư vấn lặp lại. Tóm lại: ',
          },
          { type: 'highlight', value: 'Đêm không rớt đơn, ngày không quá tải' },
          {
            type: 'text',
            value:
              '. Anh/chị rảnh tay tập trung lo nguồn hàng, làm chiến lược, thay vì cứ ôm khư khư cái điện thoại.',
          },
        ],
      },
    ],
    bullets: [
      'Thực chiến từ 2024 - Loma (B2B xưởng) · mỹ phẩm · spa (B2C)',
      'AI "đọc hiểu" hình ảnh + tư vấn thực tế - không phải bot từ khoá',
      'Tự tay làm chủ - không cần code, không cần kỹ thuật',
      'Đêm không rớt đơn, ngày không quá tải - payoff thực tế',
    ],
    photoCaption: '- Tài, người trực tiếp demo và làm việc với anh/chị',
    inlineCta: {
      label: 'Đặt lịch nói chuyện trực tiếp →',
      href: '#booking',
      ariaLabel: 'Đặt lịch nói chuyện trực tiếp với Tài',
      analyticsId: 'about_inline',
    },
  },

  services: {
    title: 'Hệ thống đầy đủ — không phải mỗi chatbot',
    subtitle:
      '3 module hoạt động cùng nhau. Triển khai từng phần hoặc trọn gói.',
    modules: [
      {
        id: 'module_1',
        index: 1,
        title: 'Chatbot AI Tư vấn & Chốt đơn',
        tagline: 'Trái tim của hệ thống — hiểu khách, chốt khách',
        accent: 'indigo',
        features: [
          { icon: '🧠', label: 'Hiểu ngữ cảnh — không trả như robot lập trình sẵn' },
          { icon: '📸', label: 'Nhận diện hình ảnh — khách gửi ảnh sản phẩm, bot biết là gì, gợi ý đúng', highlight: true },
          { icon: '💬', label: 'Tư vấn theo ngành — thời trang, mỹ phẩm, F&B, công nghệ' },
          { icon: '🛒', label: 'Chốt đơn end-to-end — thu thập thông tin → tạo đơn → xác nhận' },
          { icon: '⚙️', label: 'Tinh chỉnh không cần code — chủ shop tự cập nhật qua giao diện' },
        ],
        cta: {
          label: 'Đặt lịch demo Module 1 →',
          href: '#booking',
          ariaLabel: 'Đặt lịch demo Module 1 Chatbot AI Tư vấn và Chốt đơn',
          analyticsId: 'module_1',
        },
      },
      {
        id: 'module_2',
        index: 2,
        title: 'Marketing Automation Đa kênh',
        tagline: 'Đăng bài · chạy ads · báo cáo — tự động',
        accent: 'violet',
        features: [
          { icon: '📅', label: 'Lịch đăng tự động — Facebook, Instagram, Zalo OA, TikTok cùng lúc' },
          { icon: '🎯', label: 'Quản lý quảng cáo — theo dõi, đề xuất tối ưu ngân sách' },
          { icon: '📊', label: 'Báo cáo gọn — lượt xem, tương tác, chuyển đổi, không lan man' },
          { icon: '🔄', label: 'Re-target khách quan tâm — nuôi lại người đã inbox/comment' },
        ],
        cta: {
          label: 'Đặt lịch demo Module 2 →',
          href: '#booking',
          ariaLabel: 'Đặt lịch demo Module 2 Marketing Automation Đa kênh',
          analyticsId: 'module_2',
        },
      },
      {
        id: 'module_3',
        index: 3,
        title: 'Bàn giao + Hỗ trợ',
        tagline: 'Anh/chị làm chủ — không bị khóa vào platform',
        accent: 'gradient',
        features: [
          { icon: '🔑', label: 'Tài khoản đầy đủ — anh/chị giữ, không phụ thuộc tôi' },
          { icon: '📚', label: 'Video hướng dẫn — vận hành từng bước' },
          { icon: '🛠', label: '30 ngày tinh chỉnh miễn phí sau bàn giao' },
          { icon: '♾', label: 'Hỗ trợ sử dụng lâu dài — không "bán xong rồi biến"' },
        ],
        cta: {
          label: 'Đặt lịch demo Module 3 →',
          href: '#booking',
          ariaLabel: 'Đặt lịch demo Module 3 Bàn giao và Hỗ trợ',
          analyticsId: 'module_3',
        },
      },
    ],
  },

  techGraph: {
    title: 'Cách AI hoạt động trong workflow của anh/chị',
    caption:
      'Inbox → AI Nhận diện hình ảnh → Chatbot → Sản phẩm/CRM → Báo cáo',
    /* SVG viewBox 1200×420 — desktop coordinates.
       Row 1 (y=100): Inbox → Vision → Chatbot → Knowledge
       Row 2 (y=270): Báo cáo ← Marketing ← CRM (flows back left)
       Mobile renderer stacks vertically ignoring x/y. */
    nodes: [
      { id: 'inbox',     label: 'Inbox đa kênh',    sublabel: 'FB · IG · Zalo · TikTok',         icon: '📥', x: 80,   y: 100 },
      { id: 'vision',    label: 'AI Nhận diện hình ảnh', sublabel: 'Khách gửi ảnh → nhận diện sản phẩm', icon: '📸', x: 360,  y: 100 },
      { id: 'chatbot',   label: 'Chatbot tư vấn',   sublabel: 'Trả lời, gợi ý theo tone shop',    icon: '💬', x: 640,  y: 100 },
      { id: 'knowledge', label: 'Knowledge base',   sublabel: 'Sản phẩm, FAQ, chính sách',        icon: '📚', x: 920,  y: 100 },
      { id: 'crm',       label: 'Đơn hàng / CRM',   sublabel: 'Tạo đơn, lưu khách, trạng thái',   icon: '🛒', x: 920,  y: 270 },
      { id: 'report',    label: 'Báo cáo',          sublabel: 'Doanh thu · chuyển đổi · top SP', icon: '📊', x: 80,   y: 270 },
    ],
    edges: [
      { from: 'inbox',     to: 'vision',    delayMs: 0   },
      { from: 'vision',    to: 'chatbot',   delayMs: 150 },
      { from: 'chatbot',   to: 'knowledge', delayMs: 300 },
      { from: 'knowledge', to: 'crm',       delayMs: 450 },
      { from: 'crm',       to: 'report',    delayMs: 600 },
    ],
  },

  process: {
    title: 'Quy trình hợp tác - minh bạch từng bước',
    subtitle: 'Anh/chị biết trước mỗi bước làm gì, kết quả ra sao.',
    steps: [
      {
        id: 'step_01',
        number: 1,
        title: 'Đặt lịch Meet 1-1',
        description: 'Hiểu nhau, xem demo Chatbot AI trực tiếp. 20 phút Google Meet.',
        output: 'Anh/chị biết hệ thống làm được gì',
      },
      {
        id: 'step_02',
        number: 2,
        title: 'Làm rõ kỳ vọng',
        description: 'Anh/chị muốn Chatbot làm được gì, và thực tế ra sao, ranh giới ở đâu.',
        output: 'Scope chung - không vẽ ảo',
      },
      {
        id: 'step_03',
        number: 3,
        title: 'Khảo sát doanh nghiệp',
        description: 'Sản phẩm, quy trình bán, FAQ, tone giọng, ngân sách.',
        output: 'Tài liệu nội bộ + hiểu sâu',
      },
      {
        id: 'step_04',
        number: 4,
        title: 'Đề xuất + Báo giá',
        description: 'Phương án cụ thể, breakdown chi phí, thương lượng cụ thể.',
        output: 'Anh/chị có giá rõ ràng, không "tùy"',
      },
      {
        id: 'step_05',
        number: 5,
        title: 'Demo thật + Triển khai',
        description: 'Chạy thử với data thật của shop, training bot theo ngành.',
        output: 'Bot hoạt động trên data anh/chị',
      },
      {
        id: 'step_06',
        number: 6,
        title: 'Bàn giao 100%',
        description: 'Tài khoản chatbot, nền tảng, video hướng dẫn, 30 ngày hỗ trợ.',
        output: 'Anh/chị làm chủ hoàn toàn',
      },
    ],
  },

  trustStrip: {
    signals: [
      { icon: '🔒', text: 'Không cam kết tối thiểu — bàn giao 100% tài khoản' },
      { icon: '⏱️', text: '20 phút demo, không cần chuẩn bị' },
      { icon: '🛠️', text: '30 ngày hỗ trợ tinh chỉnh miễn phí' },
      { icon: '♾️', text: 'Demo trước khi quyết — không ép cọc' },
    ],
  },

  faq: {
    title: 'Câu hỏi thường gặp',
    subtitle: 'Anh/chị có thắc mắc gì mà không thấy ở đây? Cứ đặt Meet — tôi giải đáp trực tiếp.',
    items: [
      {
        id: 'q1',
        question: 'Chatbot AI có thay thế hoàn toàn nhân viên không?',
        answer:
          'Không. Mục tiêu là AI xử lý 90% case lặp lại. Nhân viên giữ phần phức tạp + quyết định. Anh/chị tiết kiệm thời gian nhân viên, không bị khách bỏ đi vì không trả lời kịp.',
      },
      {
        id: 'q2',
        question: 'Tôi không rành kỹ thuật, có dùng được không?',
        answer:
          'Được. UI tinh chỉnh thiết kế cho người không kỹ thuật — anh/chị tự cập nhật sản phẩm, FAQ qua giao diện kéo-thả. Có video hướng dẫn từng bước. 30 ngày đầu tôi hỗ trợ trực tiếp nếu vướng.',
      },
      {
        id: 'q3',
        question: 'Giá bao nhiêu?',
        answer:
          'Tùy quy mô + module anh/chị cần. Đặt lịch Meet 1-1 để có báo giá chính xác sau khi hiểu nhu cầu. Tôi không niêm yết kiểu "one size fits all" — vì shop 100 SKU và shop 5000 SKU khác nhau.',
      },
      {
        id: 'q4',
        question: 'Cam kết tối thiểu bao lâu?',
        answer:
          'Không cam kết tối thiểu. Anh/chị nhận tài khoản → tự vận hành. Tôi không khóa anh/chị vào platform của tôi. Muốn dừng dùng — anh/chị vẫn giữ data, sản phẩm, FAQ đã build.',
      },
      {
        id: 'q5',
        question: 'Có sửa được sau khi triển khai không?',
        answer:
          'Có. 30 ngày hỗ trợ tinh chỉnh miễn phí — anh/chị nhắn là tôi sửa. Sau 30 ngày: anh/chị tự sửa qua UI hoặc chọn gói maintenance nếu muốn yên tâm.',
      },
      {
        id: 'q6',
        question: 'Chatbot có nhận được hình mọi loại sản phẩm không?',
        answer:
          'AI nhận diện hình ảnh được train theo ngành cụ thể của anh/chị (thời trang, mỹ phẩm, F&B...). Không phải "all-purpose AI" — hiểu sản phẩm anh/chị bán mới gợi ý chính xác. Demo sẽ chạy thử trên 5-10 ảnh sản phẩm thật của shop để anh/chị thấy độ chính xác.',
      },
    ],
    finalCta: {
      label: 'Vẫn còn thắc mắc? Đặt lịch Meet 1-1 →',
      href: '#booking',
      analyticsId: 'faq_final_cta',
    },
  },

  stickyMobile: {
    cta: {
      label: 'Demo miễn phí - 20 phút →',
      href: '#booking',
      ariaLabel: 'Đặt lịch demo miễn phí 20 phút',
      analyticsId: 'sticky_mobile',
    },
    showAfterAnchor: '#hero',
    hideAtAnchor: '#booking',
  },
};
