/**
 * setup-video-keys.ts — map id công khai → object key trong bucket R2 `tutorial`.
 *
 * SERVER-ONLY: key + tên bucket không bao giờ xuống trình duyệt. Client chỉ biết `id`
 * (v01…v12); route /api/setup/video-url tra bảng này nên không ai ký được key tuỳ ý.
 * Key giữ nguyên văn tên file trên R2 (có dấu cách/tiếng Việt, "9." có 2 dấu cách).
 */

import 'server-only';

export const SETUP_VIDEO_BUCKET = 'tutorial';

export const SETUP_VIDEO_KEYS: Readonly<Record<string, string>> = {
  v01: "Video Tut/1. Tạo TK mooly.mp4",
  v02: "Video Tut/2. Dán bảng giá, phí ship.mp4",
  v03: "Video Tut/3. Đóng vai khách hỏi size.mp4",
  v04: "Video Tut/4. Sử dụng Trợ Lí AI chỉnh sửa Chatbot.mp4",
  v05: "Video Tut/5. Cái gì, ở đâu, bản đồ dạy Bot.mp4",
  v06: "Video Tut/6. Thêm SP, Biến thể.mp4",
  v07: "Video Tut/7. Cho Bot gửi đúng ảnh màu.mp4",
  v08: "Video Tut/8. Hỏi đáp, chính sách.mp4",
  v09: "Video Tut/9.  Cài Phí Ship.mp4",
  v10: "Video Tut/10. Cài Bảng Size Tư Vấn.mp4",
  v11: "Video Tut/11. Nhắn Bot Test Thử.mp4",
  v12: "Video Tut/12. Bật Bot Cho Kênh.mp4",
};
