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
  { id: 'lam-quen', title: 'Chặng 1 · Làm quen', hint: 'Tạo tài khoản và nắm bản đồ Mooly' },
  { id: 'day-bot', title: 'Chặng 2 · Dạy Bot bán hàng', hint: 'Nạp sản phẩm, giá, ship, size' },
  { id: 'chay-that', title: 'Chặng 3 · Chạy thật', hint: 'Test thử rồi bật Bot cho kênh' },
];

export interface SetupVideo {
  /** id công khai, khớp SETUP_VIDEO_KEYS phía server. */
  id: string;
  stage: SetupStageId;
  title: string;
  /** 1 câu "xem xong bạn làm được gì" — tạo động lực bấm xem. */
  outcome: string;
  /** Việc cần làm trên Mooly sau khi xem (nút "Mở Mooly"). */
  action: string;
}

export const SETUP_VIDEOS: readonly SetupVideo[] = [
  { id: 'v01', stage: 'lam-quen', title: 'Tạo tài khoản Mooly', outcome: 'Có tài khoản Mooly sẵn sàng dùng.', action: 'Đăng ký tài khoản' },
  { id: 'v02', stage: 'lam-quen', title: 'Dán bảng giá, phí ship', outcome: 'Bot biết giá và phí ship của shop.', action: 'Dán bảng giá của bạn' },
  { id: 'v03', stage: 'lam-quen', title: 'Đóng vai khách hỏi size', outcome: 'Tự thử Bot như một khách thật.', action: 'Thử hỏi size với Bot' },
  { id: 'v04', stage: 'lam-quen', title: 'Dùng Trợ lý AI chỉnh sửa Chatbot', outcome: 'Sửa Bot bằng lời nói thường, không cần code.', action: 'Nhờ Trợ lý AI chỉnh Bot' },
  { id: 'v05', stage: 'lam-quen', title: 'Cái gì, ở đâu: bản đồ dạy Bot', outcome: 'Biết cần chỉnh gì, chỉnh ở màn hình nào.', action: 'Xem các mục dạy Bot' },
  { id: 'v06', stage: 'day-bot', title: 'Thêm sản phẩm, biến thể', outcome: 'Nạp sản phẩm kèm màu, size, mẫu.', action: 'Thêm sản phẩm đầu tiên' },
  { id: 'v07', stage: 'day-bot', title: 'Cho Bot gửi đúng ảnh màu', outcome: 'Khách hỏi màu nào, Bot gửi đúng ảnh màu đó.', action: 'Gắn ảnh theo màu' },
  { id: 'v08', stage: 'day-bot', title: 'Hỏi đáp, chính sách', outcome: 'Bot trả lời đổi trả, bảo hành đúng ý bạn.', action: 'Nhập chính sách shop' },
  { id: 'v09', stage: 'day-bot', title: 'Cài phí ship', outcome: 'Bot tự báo phí ship theo khu vực.', action: 'Cài phí ship' },
  { id: 'v10', stage: 'day-bot', title: 'Cài bảng size tư vấn', outcome: 'Bot tư vấn size theo chiều cao, cân nặng.', action: 'Cài bảng size' },
  { id: 'v11', stage: 'chay-that', title: 'Nhắn Bot test thử', outcome: 'Kiểm tra Bot trả lời đúng trước khi mở cho khách.', action: 'Nhắn thử với Bot' },
  { id: 'v12', stage: 'chay-that', title: 'Bật Bot cho kênh', outcome: 'Bot chạy thật trên Fanpage/Zalo của bạn.', action: 'Bật Bot cho kênh bán hàng' },
];

export const SETUP_METRICS = [
  { value: '< 10 giây', label: 'Bot phản hồi và báo giá 24/7' },
  { value: '100% báo giá', label: 'Được bám đuổi sau 12h, 3 ngày, 14 ngày' },
  { value: '3 ngày', label: 'Setup 1-1, Bot chạy thật trên Fanpage/Zalo' },
  { value: '7 ngày', label: 'Tự chỉnh sửa, không phụ thuộc kỹ thuật' },
] as const;

export const SETUP_BENEFITS = [
  '3 ngày cài đặt trực tiếp 1-1: nạp sản phẩm, bảng giá và bật Bot chạy trên Fanpage/Zalo của shop.',
  'Trọn bộ luồng bám đuổi tự động (12 giờ, 3 ngày, 14 ngày) để cứu khách im lặng sau báo giá.',
  '4 ngày đồng hành chỉnh sửa trên các cuộc chat thật của khách.',
  'Hướng dẫn 1-1 để tự thêm sản phẩm, sửa lời thoại, bật/tắt Bot sau 7 ngày.',
  'Tài liệu mẫu và hỗ trợ giải đáp kỹ thuật qua Zalo sau khi kết thúc.',
  'Hoàn tiền 100% sau 3 ngày Setup nếu bạn không ưng ý.',
] as const;

export const SETUP_COMPARE = {
  columns: ['Tự xem video, tự làm', 'Thuê agency (5–15 triệu)', `Gói Setup 1-1 (${SETUP_PRICE})`],
  rows: [
    { label: 'Có Bot chạy thật sau', values: ['2–4 tuần thử sai', '5–10 ngày chờ', '3 ngày làm việc 1-1'] },
    { label: 'Chi phí', values: ['0đ nhưng tốn thời gian, tiền Ads test lỗi', '5.000.000đ – 15.000.000đ', `${SETUP_PRICE} trọn gói, đã gồm VAT`] },
    { label: 'Tự chỉnh sửa về sau', values: ['Dễ làm lỗi luồng', 'Phụ thuộc, sửa là mất phí', 'Tự chủ sau 7 ngày'] },
    { label: 'Rủi ro tài chính', values: ['Mất chi phí cơ hội', 'Thường không hoàn tiền', 'Hoàn tiền 100% sau 3 ngày'] },
  ],
} as const;

export const SETUP_PROOF = [
  { label: 'Doanh thu nền', value: '501,5 triệu/tháng', note: 'Lãi ròng 119,9 triệu/tháng' },
  { label: 'Tốc độ phản hồi', value: '< 10 giây', note: 'Vận hành liên tục 24/7' },
  { label: 'Báo giá được nhắc lại', value: '100%', note: 'Cứu 86 báo giá bị bỏ quên' },
  { label: 'Đơn nhỏ tự động hoá', value: '≥ 80%', note: 'Đơn dưới 200 sản phẩm' },
] as const;

export const SETUP_FAQ = [
  {
    q: 'Tôi mù công nghệ, sau 7 ngày có tự chỉnh sửa được thật không?',
    a: 'Được. Giao diện quản trị bằng tiếng Việt: nạp bảng giá mất khoảng 5 phút, sửa giọng văn Bot khoảng 2 phút bằng ngôn ngữ thường. Trong 4 ngày đồng hành, bạn thao tác trực tiếp trên máy của mình đến khi thành thạo.',
  },
  {
    q: 'Cam kết hoàn tiền sau 3 ngày Setup hoạt động thế nào?',
    a: 'Hết ngày thứ 3 bạn chạy thử Bot thực tế. Nếu thấy không phù hợp hoặc không đúng cam kết, chỉ cần nhắn yêu cầu và nhận lại đủ 2.000.000đ trong vòng 24 giờ.',
  },
  {
    q: 'Ngành hàng của tôi nhiều mã, giá sỉ/lẻ phức tạp, Bot báo giá chuẩn không?',
    a: 'Hệ thống xuất phát từ bài toán xưởng túi Loma Bag có hàng nghìn sản phẩm mỗi tháng: xử lý cả đơn lẻ lẫn các nấc giá sỉ theo số lượng, và chuyển cho nhân viên khi gặp yêu cầu đặt làm riêng quá phức tạp.',
  },
  {
    q: 'Sau 7 ngày có thắc mắc phát sinh thì có được hỗ trợ không?',
    a: 'Có. Bạn vẫn xem lại được bộ video trên trang này và được giải đáp kỹ thuật qua Zalo.',
  },
  {
    q: 'Tôi tự làm theo video được không, hay bắt buộc mua gói Setup?',
    a: 'Video xem miễn phí, bạn tự làm theo được. Gói Setup dành cho ai muốn có người làm cùng 1-1 để Bot lên sóng nhanh, ít sai sót.',
  },
] as const;
