/**
 * /course/bao-mat — Chính sách bảo mật Tài Academy.
 * Nội dung nháp thực tế; chủ dự án nên rà pháp lý (đặc biệt phần dữ liệu) trước khi phát hành.
 */

import type { Metadata } from 'next';
import { LegalPage } from '@/components/course/legal-page';

const TITLE = 'Chính sách bảo mật';
const DESCRIPTION =
  'Cách Tài Academy thu thập, sử dụng và bảo vệ dữ liệu của học viên.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://course.nguyenvantai.com/bao-mat' },
};

export default function BaoMatPage() {
  return (
    <LegalPage title="Chính sách bảo mật" updated="17/07/2026">
      <p>
        Tài Academy tôn trọng quyền riêng tư của bạn. Chính sách này giải thích chúng tôi thu
        thập, sử dụng và bảo vệ dữ liệu của bạn như thế nào khi dùng thư viện khoá học.
      </p>

      <h2>1. Thông tin chúng tôi thu thập</h2>
      <ul>
        <li>
          <strong>Email</strong> — dùng để đăng nhập (magic-link) và liên hệ khi cần.
        </li>
        <li>
          <strong>Tiến độ học</strong> — bài đã xem, khoá đang học, để lưu và hiển thị lại
          cho bạn.
        </li>
        <li>
          <strong>Dữ liệu kỹ thuật</strong> — thông tin ẩn danh về lượt truy cập/thiết bị
          phục vụ đo lường và cải thiện trải nghiệm.
        </li>
      </ul>

      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Cho phép bạn đăng nhập và mở khoá nội dung.</li>
        <li>Lưu tiến độ để bạn học tiếp ở lần sau.</li>
        <li>Cải thiện nội dung, chất lượng và bảo mật của nền tảng.</li>
      </ul>

      <h2>3. Chia sẻ dữ liệu</h2>
      <p>
        Chúng tôi <strong>không bán</strong> dữ liệu của bạn. Dữ liệu chỉ được xử lý bởi các
        nhà cung cấp hạ tầng cần thiết (ví dụ dịch vụ lưu trữ, xác thực, phân tích) theo hợp
        đồng bảo mật, phục vụ đúng mục đích vận hành nền tảng.
      </p>

      <h2>4. Cookie & phân tích</h2>
      <p>
        Trang có thể dùng cookie và công cụ phân tích để hiểu cách nội dung được sử dụng.
        Thông tin này ở dạng tổng hợp/ẩn danh và không nhằm nhận diện cá nhân bạn.
      </p>

      <h2>5. Lưu trữ & bảo mật</h2>
      <p>
        Dữ liệu tài khoản và tiến độ được lưu trên hạ tầng có kiểm soát truy cập. Chúng tôi áp
        dụng các biện pháp hợp lý để bảo vệ dữ liệu, song không hệ thống nào an toàn tuyệt
        đối.
      </p>

      <h2>6. Quyền của bạn</h2>
      <p>
        Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xoá dữ liệu cá nhân và tài khoản của mình.
        Liên hệ qua kênh chính thức ở cuối trang để được hỗ trợ.
      </p>

      <h2>7. Liên hệ</h2>
      <p>
        Nếu có câu hỏi về quyền riêng tư hoặc chính sách này, vui lòng liên hệ Tài Academy qua
        các kênh ở cuối trang.
      </p>
    </LegalPage>
  );
}
