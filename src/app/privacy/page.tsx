/**
 * /privacy — Chính sách Bảo mật & Quyền riêng tư.
 *
 * Source of truth content lives in
 * `plans/260509-1059-tai-ai-automation-landing-page/legal/privacy-policy.md`.
 * Sections rendered via shared <LegalPageShell> + <LegalSection> primitives
 * to keep the visual language identical to landing (Aurora palette, font tokens).
 *
 * Server component — no client hooks, fully static so it benefits from SSG.
 */

import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { LegalSection } from '@/components/legal/legal-section';
import { LegalTable } from '@/components/legal/legal-table';
import { LegalBullets } from '@/components/legal/legal-bullets';

export const metadata: Metadata = {
  title: 'Chính sách Bảo mật & Quyền riêng tư',
  description:
    'Tài AI Automation thu thập dữ liệu gì, dùng làm gì, lưu bao lâu — và anh/chị có quyền gì với dữ liệu của mình. Tuân thủ NĐ 13/2022.',
  alternates: { canonical: 'https://nguyenvantai.com/privacy' },
  robots: { index: true, follow: true },
};

const ZALO_LINK = 'https://zalo.me/0345324467';
const EMAIL = 'titai2277@gmail.com';

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Pháp lý · Dữ liệu cá nhân"
      title="Chính sách Bảo mật & Quyền riêng tư"
      intro="Chúng tôi thu thập dữ liệu gì, dùng làm gì, lưu trong bao lâu — và anh/chị có quyền gì với dữ liệu của mình."
      meta={[
        { label: 'Hiệu lực', value: '05/2026' },
        { label: 'Phiên bản', value: 'v1.0' },
        { label: 'Tuân thủ', value: 'NĐ 13/2022/NĐ-CP · Luật ATTTM 2015' },
      ]}
    >
      <LegalSection number="1" title="Tổng quan">
        <p>
          Chính sách này giải thích <strong>chúng tôi thu thập dữ liệu gì</strong>,{' '}
          <strong>dùng để làm gì</strong>, <strong>lưu trong bao lâu</strong>, và{' '}
          <strong>anh/chị có quyền gì</strong> với dữ liệu của mình.
        </p>
        <p>Nguyên tắc của Tài AI Automation:</p>
        <LegalBullets
          items={[
            'Chỉ thu thập dữ liệu thật sự cần',
            'Không bán, không chia sẻ dữ liệu cho bên thứ ba ngoài mục đích đã nêu',
            'Anh/chị có quyền xem, sửa, xóa dữ liệu bất kỳ lúc nào',
            <>
              Minh bạch — câu nào không rõ, anh/chị nhắn{' '}
              <a href={ZALO_LINK} target="_blank" rel="noopener noreferrer">
                Zalo
              </a>{' '}
              tôi giải thích trực tiếp
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number="2" title="Đơn vị xử lý dữ liệu">
        <LegalTable
          headers={['Mục', 'Thông tin']}
          rows={[
            ['Tên dịch vụ', 'Tài AI Automation'],
            ['Owner / Người phụ trách dữ liệu', <strong key="o">Nguyễn Văn Tài</strong>],
            [
              'Email liên hệ về dữ liệu',
              <a key="e" href={`mailto:${EMAIL}`}>{EMAIL}</a>,
            ],
            [
              'Zalo liên hệ',
              <a key="z" href={ZALO_LINK} target="_blank" rel="noopener noreferrer">
                0345 324 467
              </a>,
            ],
            [
              'Website',
              <a key="w" href="https://nguyenvantai.com">https://nguyenvantai.com</a>,
            ],
            ['Vai trò theo NĐ 13/2022', 'Bên Kiểm soát dữ liệu (Data Controller)'],
          ]}
        />
      </LegalSection>

      <LegalSection number="3" title="Dữ liệu cá nhân chúng tôi thu thập">
        <LegalSection
          number="3.1"
          title="Dữ liệu anh/chị chủ động cung cấp (qua form đặt lịch)"
          variant="sub"
        >
          <LegalTable
            headers={['Trường dữ liệu', 'Bắt buộc', 'Mục đích sử dụng']}
            rows={[
              [
                <strong key="t1">Số điện thoại Zalo</strong>,
                '✅ Bắt buộc',
                'Liên hệ xác nhận lịch Meet · gửi link Google Meet · trao đổi sau Meet nếu anh/chị quan tâm',
              ],
              [
                <strong key="t2">Email</strong>,
                'Tùy chọn',
                'Gửi calendar invite Google Meet · tài liệu demo (nếu có yêu cầu)',
              ],
              [
                <strong key="t3">Họ tên</strong>,
                'Tùy chọn',
                'Xưng hô đúng khi liên hệ',
              ],
              [
                <strong key="t4">Lựa chọn mong đợi (multi-select)</strong>,
                'Tùy chọn',
                'Chuẩn bị demo phù hợp nhu cầu anh/chị',
              ],
              [
                <strong key="t5">Nội dung &ldquo;Khác&rdquo; (textarea)</strong>,
                'Tùy chọn',
                'Hiểu yêu cầu cụ thể của anh/chị',
              ],
              [
                <strong key="t6">Ngày + giờ Meet đã chọn</strong>,
                '✅ Bắt buộc',
                'Đặt slot lịch hẹn',
              ],
            ]}
          />
        </LegalSection>

        <LegalSection number="3.2" title="Dữ liệu thu thập tự động" variant="sub">
          <LegalTable
            headers={['Loại', 'Mục đích']}
            rows={[
              [
                <strong key="a1">Địa chỉ IP</strong>,
                'Bảo mật cơ bản · phát hiện spam booking · tuân thủ pháp luật',
              ],
              [
                <strong key="a2">User-Agent (thiết bị, trình duyệt)</strong>,
                'Tối ưu hiển thị mobile/desktop · debug lỗi',
              ],
              [
                <strong key="a3">Trang anh/chị truy cập + thời gian</strong>,
                'Phân tích hành vi tổng hợp (anonymous), cải thiện UX',
              ],
              [
                <strong key="a4">Cookies thiết yếu</strong>,
                'Giữ trạng thái form khi anh/chị refresh trang',
              ],
            ]}
          />
        </LegalSection>

        <div className="rounded-2xl border border-border-default bg-surface-subtle/60 px-5 py-4">
          <p className="font-display text-sm font-semibold text-text-primary">
            Chúng tôi KHÔNG thu thập:
          </p>
          <div className="mt-3">
            <LegalBullets
              marker="✕"
              markerClassName="text-brand-pink"
              items={[
                'CMND/CCCD, số tài khoản ngân hàng',
                'Vị trí GPS chính xác',
                'Dữ liệu sinh trắc học (vân tay, khuôn mặt)',
                'Thông tin sức khỏe, tôn giáo, chính trị',
              ]}
            />
          </div>
        </div>
      </LegalSection>

      <LegalSection number="4" title="Cookie & Công cụ theo dõi">
        <LegalTable
          headers={['Loại cookie', 'Bắt buộc', 'Mục đích']}
          rows={[
            [
              <strong key="c1">Cookies thiết yếu</strong>,
              '✅ Có',
              'Giữ session form, không thể tắt vì website không chạy được nếu thiếu',
            ],
            [
              <strong key="c2">Cookies phân tích</strong>,
              'Tùy chọn',
              'Đếm lượt truy cập tổng hợp (anonymous) qua Vercel Analytics',
            ],
            [
              <strong key="c3">Cookies quảng cáo</strong>,
              '✕ Không dùng',
              'Chúng tôi KHÔNG chạy retargeting/ads pixel ở phiên bản v1',
            ],
          ]}
        />
        <p>
          Anh/chị có thể tắt cookie phân tích qua cài đặt trình duyệt mà{' '}
          <strong>không ảnh hưởng đến đặt lịch</strong>.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Mục đích & Căn cứ pháp lý xử lý dữ liệu">
        <LegalTable
          headers={['Mục đích', 'Căn cứ pháp lý (NĐ 13/2022)']}
          rows={[
            [
              'Xác nhận và quản lý lịch hẹn Meet 1-1',
              <>
                <strong>Sự đồng ý</strong> (Điều 11, NĐ 13/2022) — anh/chị tick checkbox khi submit form
              </>,
            ],
            [
              'Liên hệ Zalo xác nhận, gửi link Meet',
              <>
                <strong>Sự đồng ý</strong> + <strong>Thực hiện hợp đồng dịch vụ</strong> anh/chị yêu cầu
              </>,
            ],
            [
              'Phân tích UX tổng hợp (anonymous)',
              <>
                <strong>Lợi ích hợp pháp</strong> — không định danh cá nhân
              </>,
            ],
            [
              'Bảo mật, phòng chống spam, gian lận',
              <>
                <strong>Lợi ích hợp pháp</strong> + <strong>Tuân thủ pháp luật</strong>
              </>,
            ],
            [
              'Lưu trữ giao dịch cho mục đích đối soát',
              <>
                <strong>Tuân thủ pháp luật</strong> kế toán, thuế nếu phát sinh hợp đồng
              </>,
            ],
          ]}
        />
        <div className="rounded-2xl border border-border-default bg-surface-subtle/60 px-5 py-4">
          <p className="font-display text-sm font-semibold text-text-primary">
            Chúng tôi KHÔNG dùng dữ liệu của anh/chị để:
          </p>
          <div className="mt-3">
            <LegalBullets
              marker="✕"
              markerClassName="text-brand-pink"
              items={[
                'Bán cho bên thứ ba',
                'Gửi spam quảng cáo không liên quan đến yêu cầu',
                'Profile/scoring anh/chị bằng AI để target ads',
                'Bất kỳ mục đích nào ngoài danh sách trên',
              ]}
            />
          </div>
        </div>
      </LegalSection>

      <LegalSection number="6" title="Thời gian lưu trữ">
        <LegalTable
          headers={['Dữ liệu', 'Thời gian lưu', 'Lý do']}
          rows={[
            [
              'Thông tin booking (SĐT, email, tên, mong đợi, slot)',
              <strong key="r1">24 tháng từ ngày booking</strong>,
              'Đối soát, follow-up dài hạn, lịch sử dịch vụ',
            ],
            [
              'Booking bị hủy / không phát sinh hợp đồng',
              <strong key="r2">6 tháng từ ngày hủy</strong>,
              'Đủ để xử lý khiếu nại nếu có',
            ],
            [
              'Log IP/User-Agent (bảo mật)',
              <strong key="r3">90 ngày</strong>,
              'Bảo mật cơ bản, phát hiện bất thường',
            ],
            [
              'Cookies thiết yếu',
              'Hết session trình duyệt',
              'Tự động xóa',
            ],
            [
              'Cookies phân tích',
              <strong key="r5">12 tháng</strong>,
              'Tiêu chuẩn industry',
            ],
          ]}
        />
        <p>
          Sau thời hạn lưu trữ, dữ liệu sẽ được <strong>xóa vĩnh viễn</strong> hoặc{' '}
          <strong>ẩn danh hóa</strong> không thể khôi phục.
        </p>
        <p>
          <strong>Trường hợp anh/chị yêu cầu xóa sớm:</strong> chúng tôi xóa trong{' '}
          <strong>72 giờ</strong> kể từ lúc nhận yêu cầu (trừ phần dữ liệu bắt buộc giữ theo
          luật kế toán/thuế nếu đã phát sinh giao dịch).
        </p>
      </LegalSection>

      <LegalSection number="7" title="Chia sẻ dữ liệu với bên thứ ba">
        <p>
          Chúng tôi <strong>KHÔNG bán</strong> dữ liệu. Dữ liệu chỉ chia sẻ với các bên dưới
          đây — chỉ ở phạm vi tối thiểu cần thiết:
        </p>
        <LegalTable
          headers={['Bên thứ ba', 'Dữ liệu chia sẻ', 'Lý do', 'Vị trí xử lý']}
          rows={[
            [
              <strong key="b1">Google (Google Meet)</strong>,
              'Email (nếu cung cấp), tên, slot',
              'Tạo calendar invite + link Meet',
              'Server Google (toàn cầu)',
            ],
            [
              <strong key="b2">Vercel</strong>,
              'Logs request, IP',
              'Hosting website',
              'Server Vercel (toàn cầu, có node châu Á)',
            ],
            [
              <strong key="b3">Supabase</strong>,
              'Toàn bộ dữ liệu form booking',
              'Lưu trữ database',
            ],
            [
              <strong key="b4">Cloudflare</strong>,
              'IP, User-Agent',
              'DNS + CDN + bảo mật DDoS',
              'Mạng toàn cầu Cloudflare',
            ],
            [
              <strong key="b5">Cơ quan nhà nước Việt Nam</strong>,
              'Theo yêu cầu hợp pháp',
              'Khi có yêu cầu chính thức bằng văn bản',
              'Việt Nam',
            ],
          ]}
        />
        <p>
          <strong>Các bên trên đều có chính sách bảo mật riêng</strong> tuân thủ GDPR / SOC 2 / ISO 27001.
        </p>
        <p>
          <strong>Chuyển dữ liệu xuyên biên giới:</strong> Một số bên xử lý có máy chủ ngoài
          Việt Nam. Chúng tôi đảm bảo các bên này có biện pháp bảo vệ tương đương theo yêu cầu
          NĐ 13/2022 Điều 25-26.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Quyền của anh/chị (theo NĐ 13/2022)">
        <p>
          Anh/chị có <strong>9 quyền</strong> cơ bản với dữ liệu cá nhân của mình:
        </p>
        <LegalTable
          headers={['Quyền', 'Mô tả', 'Cách thực hiện']}
          rows={[
            ['1. Quyền được biết', 'Biết dữ liệu nào đang được xử lý', 'Đọc chính sách này hoặc liên hệ'],
            ['2. Quyền đồng ý', 'Đồng ý/từ chối xử lý dữ liệu', 'Tick checkbox khi submit form'],
            [
              '3. Quyền truy cập',
              'Yêu cầu xem dữ liệu cá nhân của mình',
              'Nhắn Zalo/email — chúng tôi cung cấp trong 72 giờ',
            ],
            [
              '4. Quyền rút lại đồng ý',
              'Rút lại sự đồng ý bất kỳ lúc nào',
              'Nhắn Zalo/email — xác nhận trong 24 giờ',
            ],
            ['5. Quyền xóa dữ liệu', 'Yêu cầu xóa dữ liệu', 'Nhắn yêu cầu — xóa trong 72 giờ'],
            ['6. Quyền hạn chế xử lý', 'Yêu cầu tạm ngừng xử lý', 'Nhắn yêu cầu — áp dụng ngay'],
            ['7. Quyền phản đối', 'Phản đối hoạt động xử lý cụ thể', 'Nhắn yêu cầu kèm lý do'],
            [
              '8. Quyền khiếu nại',
              'Khiếu nại lên cơ quan có thẩm quyền',
              'Cục An toàn Thông tin (Bộ TT&TT)',
            ],
            [
              '9. Quyền yêu cầu bồi thường',
              'Nếu có thiệt hại do vi phạm BVDLCN',
              'Theo quy định pháp luật',
            ],
          ]}
        />
        <p>
          <strong>Để thực hiện bất kỳ quyền nào:</strong> liên hệ qua kênh ở Mục 11. Chúng tôi
          phản hồi <strong>trong 72 giờ làm việc</strong>, hoàn tất xử lý{' '}
          <strong>trong tối đa 30 ngày</strong>.
        </p>
      </LegalSection>

      <LegalSection number="9" title="Biện pháp bảo mật dữ liệu">
        <p>
          Chúng tôi áp dụng các biện pháp bảo mật phù hợp với rủi ro của dữ liệu thu thập:
        </p>

        <LegalSection number="9.1" title="Bảo mật kỹ thuật" variant="sub">
          <LegalBullets
            items={[
              <>
                <strong>HTTPS/TLS 1.3</strong> cho mọi kết nối website
              </>,
              <>
                <strong>Database mã hóa at-rest</strong> (Supabase enterprise encryption)
              </>,
              <>
                <strong>Row-Level Security (RLS)</strong> — chỉ owner Tài truy cập được dữ liệu booking
              </>,
              <>
                <strong>Rate limiting</strong> chống brute-force/spam submission
              </>,
              <>
                <strong>Backup tự động hàng ngày</strong> trong 7 ngày gần nhất
              </>,
              <>
                <strong>Không lưu thông tin nhạy cảm</strong> (không có mật khẩu, thẻ tín dụng, CMND)
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection number="9.2" title="Bảo mật vận hành" variant="sub">
          <LegalBullets
            items={[
              'Chỉ owner Tài có quyền truy cập Supabase Studio',
              'Đăng nhập 2FA bắt buộc cho mọi tool quản trị',
              'Không chia sẻ tài khoản admin với bất kỳ ai',
              'Không export dữ liệu khách hàng ra file local trừ khi xử lý yêu cầu hỗ trợ',
            ]}
          />
        </LegalSection>

        <LegalSection
          number="9.3"
          title="Khi xảy ra sự cố rò rỉ dữ liệu"
          variant="sub"
        >
          <p>Theo NĐ 13/2022 Điều 23, nếu phát hiện rò rỉ dữ liệu:</p>
          <LegalBullets
            items={[
              <>
                Thông báo cho anh/chị bị ảnh hưởng <strong>trong 72 giờ</strong>
              </>,
              'Báo cáo cơ quan chức năng theo quy định',
              'Áp dụng biện pháp khắc phục ngay lập tức',
              'Minh bạch nguyên nhân, phạm vi, hành động',
            ]}
          />
        </LegalSection>
      </LegalSection>

      <LegalSection number="10" title="Dữ liệu của trẻ em (dưới 16 tuổi)">
        <p>
          Dịch vụ này dành cho <strong>chủ doanh nghiệp</strong> — chúng tôi{' '}
          <strong>không chủ động thu thập dữ liệu trẻ em dưới 16 tuổi</strong>.
        </p>
        <p>
          Nếu phát hiện có dữ liệu trẻ em được nộp do nhầm lẫn, chúng tôi xóa ngay lập tức khi
          được thông báo.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Liên hệ về dữ liệu cá nhân">
        <p>Mọi câu hỏi, yêu cầu, hoặc khiếu nại về dữ liệu cá nhân:</p>
        <LegalTable
          headers={['Kênh', 'Thông tin', 'Thời gian phản hồi']}
          rows={[
            [
              <strong key="ch1">Zalo</strong>,
              <a key="ch1v" href={ZALO_LINK} target="_blank" rel="noopener noreferrer">
                0345 324 467
              </a>,
              'Trong 24 giờ',
            ],
            [
              <strong key="ch2">Email</strong>,
              <a key="ch2v" href={`mailto:${EMAIL}`}>{EMAIL}</a>,
              'Trong 48 giờ',
            ],
            [
              <strong key="ch3">Subject email gợi ý</strong>,
              '"Yêu cầu về dữ liệu cá nhân — [tên anh/chị]"',
              '—',
            ],
          ]}
        />
        <p>
          <strong>Khiếu nại cấp cao hơn:</strong> Cục An toàn Thông tin — Bộ Thông tin &
          Truyền thông —{' '}
          <a href="https://ais.gov.vn" target="_blank" rel="noopener noreferrer">
            https://ais.gov.vn
          </a>
        </p>
      </LegalSection>

      <LegalSection number="12" title="Cập nhật chính sách">
        <p>Chúng tôi có thể cập nhật chính sách này khi:</p>
        <LegalBullets
          items={[
            'Có thay đổi pháp luật về BVDLCN',
            'Bổ sung tính năng/dịch vụ mới có ảnh hưởng đến xử lý dữ liệu',
            'Thay đổi bên thứ ba xử lý dữ liệu',
          ]}
        />
        <p>
          <strong>Khi cập nhật:</strong>
        </p>
        <LegalBullets
          items={[
            'Phiên bản và ngày hiệu lực mới sẽ hiển thị đầu trang',
            'Thay đổi quan trọng → thông báo qua Zalo/email cho anh/chị đã có booking',
            'Anh/chị có quyền rút lại đồng ý nếu không chấp nhận thay đổi',
          ]}
        />
        <p>
          <strong>Lịch sử phiên bản:</strong>
        </p>
        <LegalTable
          headers={['Phiên bản', 'Thời Gian', 'Thay đổi']}
          rows={[['v1.0', '05/2026', 'Phát hành lần đầu, áp dụng cho v1 landing page']]}
        />
      </LegalSection>

      <LegalSection number="13" title="Cam kết cuối cùng">
        <p>
          Dữ liệu của anh/chị không phải là sản phẩm. Đây là{' '}
          <strong>thông tin anh/chị tin tưởng giao cho tôi</strong> để tôi giúp anh/chị tốt
          hơn — và tôi tôn trọng điều đó.
        </p>
        <p>
          Nếu có bất kỳ chỗ nào trong chính sách này anh/chị thấy khó hiểu, không hợp lý,
          hoặc muốn tôi giải thích thêm — nhắn{' '}
          <a href={ZALO_LINK} target="_blank" rel="noopener noreferrer">
            Zalo
          </a>{' '}
          tôi trực tiếp. Tôi sẽ trả lời thẳng, không né câu hỏi.
        </p>
        <p className="font-display font-semibold text-text-primary">
          — Tài, Tài AI Automation
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
