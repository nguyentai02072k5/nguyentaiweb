/**
 * setup-content.ts — nội dung + hằng số LDP Setup Chatbot AI (setup.nguyenvantai.com).
 * Client-safe: KHÔNG chứa key/bucket R2 (xem setup-video-keys.ts, server-only).
 */

export const SETUP_SITE_URL = 'https://setup.nguyenvantai.com';
export const MOOLY_URL = 'https://mooly.vn';
export const ZALO_PHONE = '0345324467';
export const ZALO_URL = `https://zalo.me/${ZALO_PHONE}`;
export const SETUP_PRICE = '2.000.000đ';

export type SetupStageId = 'lam-quen' | 'day-bot' | 'chay-that';

export interface SetupStage {
  id: SetupStageId;
  title: string;
  hint: string;
}

export const SETUP_STAGES: readonly SetupStage[] = [
  { id: 'lam-quen', title: 'Làm quen', hint: 'Có tài khoản, hiểu Mooly nằm ở đâu' },
  { id: 'day-bot', title: 'Dạy Bot bán hàng', hint: 'Nạp sản phẩm, giá, ship, size' },
  { id: 'chay-that', title: 'Chạy thật', hint: 'Thử như khách, rồi bật cho kênh' },
];

/** Tên icon lucide cho từng video; map sang component nằm ở client (setup-video-hub). */
export type SetupVideoIcon =
  | 'user-plus'
  | 'table'
  | 'messages'
  | 'sparkles'
  | 'map'
  | 'package-plus'
  | 'image'
  | 'help'
  | 'truck'
  | 'ruler'
  | 'send'
  | 'rocket';

export interface SetupVideo {
  /** id công khai, khớp SETUP_VIDEO_KEYS phía server. */
  id: string;
  stage: SetupStageId;
  title: string;
  /** Thời lượng thật của video, giây. */
  seconds: number;
  icon: SetupVideoIcon;
  /** 1 câu "xem xong bạn làm được gì". */
  outcome: string;
  /** Việc cần làm trên Mooly sau khi xem (nút "Mở Mooly"). */
  action: string;
}

export const SETUP_VIDEOS: readonly SetupVideo[] = [
  { id: 'v01', stage: 'lam-quen', title: 'Tạo tài khoản Mooly', seconds: 104, icon: 'user-plus', outcome: 'Có tài khoản Mooly sẵn sàng để dạy Bot.', action: 'Đăng ký tài khoản' },
  { id: 'v02', stage: 'lam-quen', title: 'Dán bảng giá, phí ship', seconds: 124, icon: 'table', outcome: 'Bot biết giá và phí ship, không báo nhầm.', action: 'Dán bảng giá của bạn' },
  { id: 'v03', stage: 'lam-quen', title: 'Đóng vai khách hỏi size', seconds: 96, icon: 'messages', outcome: 'Tự thử Bot như một khách thật trước khi mở bán.', action: 'Thử hỏi size với Bot' },
  { id: 'v04', stage: 'lam-quen', title: 'Dùng Trợ lý AI chỉnh Chatbot', seconds: 114, icon: 'sparkles', outcome: 'Sửa Bot bằng câu nói thường, không cần code.', action: 'Nhờ Trợ lý AI chỉnh Bot' },
  { id: 'v05', stage: 'lam-quen', title: 'Bản đồ dạy Bot: cái gì, ở đâu', seconds: 99, icon: 'map', outcome: 'Biết cần chỉnh gì thì mở đúng màn hình nào.', action: 'Xem các mục dạy Bot' },
  { id: 'v06', stage: 'day-bot', title: 'Thêm sản phẩm, biến thể', seconds: 97, icon: 'package-plus', outcome: 'Nạp sản phẩm kèm đủ màu, size, mẫu.', action: 'Thêm sản phẩm đầu tiên' },
  { id: 'v07', stage: 'day-bot', title: 'Cho Bot gửi đúng ảnh màu', seconds: 92, icon: 'image', outcome: 'Khách hỏi màu nào, Bot gửi đúng ảnh màu đó.', action: 'Gắn ảnh theo màu' },
  { id: 'v08', stage: 'day-bot', title: 'Hỏi đáp, chính sách', seconds: 94, icon: 'help', outcome: 'Bot trả lời đổi trả, bảo hành đúng ý bạn.', action: 'Nhập chính sách shop' },
  { id: 'v09', stage: 'day-bot', title: 'Cài phí ship', seconds: 86, icon: 'truck', outcome: 'Bot tự báo phí ship theo khu vực của khách.', action: 'Cài phí ship' },
  { id: 'v10', stage: 'day-bot', title: 'Cài bảng size tư vấn', seconds: 86, icon: 'ruler', outcome: 'Bot gợi ý size theo chiều cao, cân nặng.', action: 'Cài bảng size' },
  { id: 'v11', stage: 'chay-that', title: 'Nhắn Bot test thử', seconds: 93, icon: 'send', outcome: 'Bắt lỗi Bot trước khi khách thật nhìn thấy.', action: 'Nhắn thử với Bot' },
  { id: 'v12', stage: 'chay-that', title: 'Bật Bot cho kênh', seconds: 96, icon: 'rocket', outcome: 'Bot chạy thật trên Fanpage, Zalo của bạn.', action: 'Bật Bot cho kênh bán hàng' },
];

export const SETUP_TOTAL_SECONDS = SETUP_VIDEOS.reduce((sum, v) => sum + v.seconds, 0);

/** 104 → "1:44". */
export function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Số phút làm tròn lên, dùng cho dòng "còn khoảng N phút". */
export function minutesLeft(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60));
}

export const SETUP_PAINS = [
  'Khách hỏi giá lúc 23 giờ, không ai trả lời. Sáng ra khách đã mua chỗ khác.',
  'Báo giá xong khách im lặng, không ai nhắn lại. Phần lớn tiền quảng cáo trôi theo những khách đó.',
  'Đổi giá phải dặn từng nhân viên, mỗi ca trả lời một kiểu.',
  'Mua phần mềm về rồi bỏ xó, vì không ai chỉ từng bước.',
] as const;

export const SETUP_GAINS = [
  'Bot trả lời dưới 10 giây, cả ngày lẫn đêm.',
  'Tự nhắn lại khách im lặng sau 12 giờ, 3 ngày, 14 ngày. Không tốn thêm tiền Ads.',
  'Cập nhật bảng giá trong 5 phút, chỉnh giọng văn trong 2 phút. Mọi ca trả lời giống nhau.',
  'Có người làm cùng, nên sau 7 ngày bạn tự chủ phần mềm.',
] as const;

export const SETUP_PROOF = {
  hero: { label: 'Doanh thu mỗi tháng', value: '501,5 triệu', note: 'Lãi ròng 119,9 triệu. Sản lượng 9.570 sản phẩm, giao nhanh trong 48 giờ với hàng có phôi sẵn.' },
  rescued: { label: 'Báo giá được cứu', value: '86', note: 'Khách đã im lặng, Bot nhắn lại đúng mốc và chốt thêm đơn.' },
  speed: { label: 'Phản hồi tin nhắn', value: '< 10 giây', note: 'Kể cả sau 22 giờ và ngày nghỉ.' },
  auto: { label: 'Đơn nhỏ tự xử lý', value: '≥ 80%', note: 'Đơn dưới 200 sản phẩm, không cần sale can thiệp.' },
} as const;

export const SETUP_ROADMAP = [
  {
    when: 'Ngày 1 đến 3',
    title: 'Dựng và bật Bot',
    points: [
      'Nạp sản phẩm, ảnh, bảng giá sỉ và lẻ',
      'Viết kịch bản trả lời đúng giọng chốt đơn của shop',
      'Cài luồng nhắn lại khách im lặng (12 giờ, 3 ngày, 14 ngày)',
      'Kết nối Fanpage, Zalo và bấm chạy thật',
    ],
  },
  {
    when: 'Cuối ngày 3',
    title: 'Nghiệm thu, không ưng hoàn tiền',
    points: [
      'Bạn tự thử tốc độ, độ mượt và khả năng xin số điện thoại',
      'Không hài lòng: hoàn 100% trong 24 giờ',
    ],
  },
  {
    when: 'Ngày 4 đến 7',
    title: 'Làm chủ trên chat thật',
    points: [
      'Xem các cuộc chat thật để chỉnh câu trả lời sát thực tế',
      'Tự thêm sản phẩm, đổi bảng giá trong 5 phút',
      'Tự huấn luyện lại giọng văn Bot, đọc báo cáo chuyển đổi',
      'Kết thúc: bạn tự chỉnh mọi luồng, không cần thuê kỹ thuật',
    ],
  },
] as const;

export const SETUP_BENEFITS = [
  '3 ngày làm cùng 1-1: nạp sản phẩm, bảng giá, ảnh và bật Bot chạy trên Fanpage, Zalo của bạn.',
  'Luồng nhắn lại khách im lặng sau báo giá (12 giờ, 3 ngày, 14 ngày) được cài sẵn, chạy mãi.',
  '4 ngày chỉnh Bot trên các cuộc chat thật, đến khi trả lời đúng ý bạn.',
  'Học cách tự thêm sản phẩm, đổi giá, sửa giọng văn. Sau 7 ngày không cần thuê kỹ thuật.',
  'Tài liệu mẫu và giải đáp kỹ thuật qua Zalo sau khi kết thúc.',
  'Hoàn tiền 100% nếu hết ngày 3 bạn không ưng.',
] as const;

export const SETUP_COMPARE = {
  columns: ['Tự làm theo video', 'Thuê agency', `Setup 1-1 cùng mình`],
  rows: [
    { label: 'Bot chạy thật sau', values: ['2 đến 4 tuần thử sai', '5 đến 10 ngày chờ', '3 ngày'] },
    { label: 'Chi phí', values: ['0đ, nhưng tốn thời gian và tiền Ads chạy thử', '5 đến 15 triệu mỗi lần cài', `${SETUP_PRICE} trọn gói, đã gồm VAT`] },
    { label: 'Sửa Bot về sau', values: ['Dễ làm lỗi luồng', 'Phụ thuộc, sửa là mất phí', 'Tự sửa được sau 7 ngày'] },
    { label: 'Nếu không ưng', values: ['Mất công và chi phí cơ hội', 'Thường không hoàn tiền', 'Hoàn 100% sau 3 ngày'] },
  ],
} as const;

export const SETUP_FAQ = [
  {
    q: 'Tôi mù công nghệ, sau 7 ngày có tự chỉnh được thật không?',
    a: 'Được. Giao diện quản trị bằng tiếng Việt: nạp bảng giá khoảng 5 phút, sửa giọng văn Bot khoảng 2 phút bằng câu nói thường. Ở 4 ngày đồng hành, bạn thao tác ngay trên máy của mình đến khi thành thạo.',
  },
  {
    q: 'Hoàn tiền sau 3 ngày hoạt động thế nào?',
    a: 'Hết ngày thứ 3 bạn chạy thử Bot thật. Nếu thấy không phù hợp hoặc không đúng cam kết, bạn chỉ cần nhắn yêu cầu và nhận lại đủ 2.000.000đ trong 24 giờ.',
  },
  {
    q: 'Shop tôi nhiều mã, giá sỉ lẻ phức tạp. Bot báo giá có chuẩn không?',
    a: 'Hệ thống xuất phát từ xưởng túi Loma Bag, nơi có hàng nghìn sản phẩm mỗi tháng. Bot xử lý được đơn lẻ lẫn các nấc giá sỉ theo số lượng, và chuyển cho nhân viên khi gặp yêu cầu đặt làm riêng quá phức tạp.',
  },
  {
    q: 'Hết 7 ngày mà vướng thì sao?',
    a: 'Bạn vẫn xem lại được cả 12 video trên trang này và được giải đáp kỹ thuật qua Zalo.',
  },
  {
    q: 'Tôi tự làm theo video được không, hay bắt buộc mua gói Setup?',
    a: 'Video xem miễn phí, bạn tự làm theo được. Gói Setup dành cho người muốn có người làm cùng 1-1, để Bot lên sóng nhanh và ít sai sót.',
  },
] as const;
