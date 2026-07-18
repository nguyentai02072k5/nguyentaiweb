/**
 * /course/dieu-khoan — Điều khoản sử dụng Tài Academy.
 * Nội dung nháp thực tế cho nền tảng học miễn phí; chủ dự án nên rà pháp lý trước khi phát hành chính thức.
 */

import type { Metadata } from 'next';
import { LegalPage } from '@/components/course/legal-page';

const TITLE = 'Điều khoản sử dụng';
const DESCRIPTION =
  'Điều khoản sử dụng thư viện khoá học Tài Academy (course.nguyenvantai.com).';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://course.nguyenvantai.com/dieu-khoan' },
};

export default function DieuKhoanPage() {
  return (
    <LegalPage title="Điều khoản sử dụng" updated="17/07/2026">
      <p>
        Chào mừng bạn đến với Tài Academy (<strong>course.nguyenvantai.com</strong>). Khi
        truy cập và sử dụng thư viện khoá học, bạn đồng ý với các điều khoản dưới đây. Vui
        lòng đọc kỹ trước khi bắt đầu.
      </p>

      <h2>1. Chấp nhận điều khoản</h2>
      <p>
        Việc bạn đăng nhập và sử dụng nội dung đồng nghĩa với việc bạn đã đọc, hiểu và đồng
        ý tuân theo Điều khoản này cùng Chính sách bảo mật đi kèm. Nếu không đồng ý, vui lòng
        ngừng sử dụng.
      </p>

      <h2>2. Tài khoản của bạn</h2>
      <p>
        Bạn đăng nhập bằng email qua liên kết (magic-link), không cần mật khẩu. Bạn chịu
        trách nhiệm giữ an toàn cho email của mình và cho mọi hoạt động diễn ra dưới tài
        khoản đó. Vui lòng thông báo cho chúng tôi nếu phát hiện truy cập trái phép.
      </p>

      <h2>3. Nội dung & bản quyền</h2>
      <p>
        Toàn bộ video, tài liệu và nội dung trong thư viện thuộc quyền sở hữu của Tài Academy
        (Nguyễn Văn Tài), trừ khi có ghi chú khác. Nội dung được cung cấp <strong>miễn phí
        cho mục đích học tập cá nhân</strong>.
      </p>

      <h2>4. Quyền sử dụng nội dung</h2>
      <ul>
        <li>Bạn được xem, học và áp dụng kiến thức vào công việc của mình.</li>
        <li>
          Bạn <strong>không được</strong> tải xuống, sao chép, phát tán lại, bán hoặc dùng
          nội dung cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.
        </li>
        <li>Không chia sẻ tài khoản/đường dẫn để người khác truy cập trái phép.</li>
      </ul>

      <h2>5. Hành vi bị cấm</h2>
      <ul>
        <li>Sao chép, ghi màn hình, hotlink hoặc phát tán video ra bên ngoài.</li>
        <li>Can thiệp, dò quét hoặc gây hại đến hệ thống, máy chủ, bảo mật.</li>
        <li>Mạo danh, quấy rối hoặc vi phạm pháp luật hiện hành.</li>
      </ul>

      <h2>6. Miễn trừ trách nhiệm</h2>
      <p>
        Nội dung mang tính chia sẻ kinh nghiệm và giáo dục. Chúng tôi cố gắng cập nhật chính
        xác nhưng không cam kết một kết quả kinh doanh cụ thể nào. Bạn tự chịu trách nhiệm khi
        áp dụng kiến thức vào tình huống thực tế của mình.
      </p>

      <h2>7. Thay đổi điều khoản</h2>
      <p>
        Chúng tôi có thể cập nhật Điều khoản theo thời gian. Phiên bản mới có hiệu lực ngay
        khi đăng tải trên trang này. Việc bạn tiếp tục sử dụng đồng nghĩa với chấp nhận thay
        đổi.
      </p>

      <h2>8. Liên hệ</h2>
      <p>
        Mọi thắc mắc về Điều khoản, vui lòng liên hệ qua các kênh chính thức của Tài Academy
        ở cuối trang.
      </p>
    </LegalPage>
  );
}
