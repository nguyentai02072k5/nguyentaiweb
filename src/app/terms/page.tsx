/**
 * /terms — Điều Khoản Dịch Vụ.
 *
 * Source of truth content lives in
 * `plans/260509-1059-tai-ai-automation-landing-page/legal/terms-of-service.md`.
 * Renders via shared <LegalPageShell> + <LegalSection> primitives so the look
 * matches /privacy and the landing page exactly.
 */

import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/legal-page-shell';
import { LegalSection } from '@/components/legal/legal-section';
import { LegalBullets } from '@/components/legal/legal-bullets';
import { LegalTable } from '@/components/legal/legal-table';

export const metadata: Metadata = {
  title: 'Điều Khoản Dịch Vụ',
  description:
    'Phạm vi dịch vụ, hỗ trợ, quyền và trách nhiệm, thanh toán và bàn giao của Tài AI Automation.',
  alternates: { canonical: 'https://nguyenvantai.com/terms' },
  robots: { index: true, follow: true },
};

const ZALO_LINK = 'https://zalo.me/0345324467';
const EMAIL = 'titai2277@gmail.com';

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Pháp lý · Điều khoản"
      title="Điều Khoản Dịch Vụ"
      intro="Cam kết hai chiều giữa Tài AI Automation và khách hàng khi sử dụng dịch vụ tư vấn, triển khai và bàn giao chatbot AI."
      meta={[
        { label: 'Hiệu lực', value: '05/2026' },
        { label: 'Phiên bản', value: 'v1.0' },
      ]}
    >
      <LegalSection number="1" title="Phạm vi dịch vụ">
        <p>Tài AI Automation cung cấp:</p>
        <LegalBullets
          items={[
            'Tư vấn, triển khai, bàn giao chatbot AI và automation cho doanh nghiệp Việt',
            'Hướng dẫn sử dụng, cấu hình, và tinh chỉnh nội dung theo nhu cầu thực tế',
            'Hỗ trợ sau bàn giao theo phạm vi ghi trong báo giá / thỏa thuận riêng',
          ]}
        />
      </LegalSection>

      <LegalSection number="2" title="Hỗ trợ sử dụng">
        <p>Cam kết mặc định của dịch vụ:</p>
        <LegalBullets
          items={[
            <>
              <strong>Hỗ trợ sử dụng trọn đời</strong> cho phần hướng dẫn, giải đáp vận hành,
              và tinh chỉnh trong phạm vi hệ thống đã bàn giao
            </>,
            <>
              <strong>30 ngày đầu</strong> có hỗ trợ ưu tiên sau bàn giao
            </>,
            'Sau giai đoạn ưu tiên, vẫn hỗ trợ sử dụng tiếp tục khi hệ thống và dịch vụ còn hoạt động',
          ]}
        />
        <p>
          <strong>Giới hạn:</strong>
        </p>
        <LegalBullets
          marker="✕"
          markerClassName="text-brand-pink"
          items={[
            'Không bao gồm phát triển tính năng mới miễn phí ngoài phạm vi thỏa thuận',
            'Không bao gồm tích hợp bên thứ ba mới nếu chưa nằm trong scope ban đầu',
            'Không bao gồm sửa lỗi phát sinh từ thay đổi hệ thống bên ngoài do khách hàng tự chỉnh ngoài hướng dẫn',
          ]}
        />
      </LegalSection>

      <LegalSection number="3" title="Quyền và trách nhiệm của khách hàng">
        <p>
          <strong>Khách hàng đồng ý:</strong>
        </p>
        <LegalBullets
          items={[
            'Cung cấp thông tin đúng và hợp pháp khi đặt lịch, triển khai, hoặc yêu cầu hỗ trợ',
            'Không dùng dịch vụ cho mục đích trái pháp luật',
            'Tự bảo mật tài khoản truy cập được bàn giao',
          ]}
        />
        <p>
          <strong>Khách hàng có quyền:</strong>
        </p>
        <LegalBullets
          items={[
            'Nhận bàn giao tài khoản và dữ liệu thuộc phạm vi dịch vụ đã thỏa thuận',
            'Yêu cầu hỗ trợ vận hành theo kênh liên hệ chính thức',
            'Dừng sử dụng dịch vụ bất kỳ lúc nào',
          ]}
        />
      </LegalSection>

      <LegalSection number="4" title="Thanh toán và bàn giao">
        <p>Nếu có phí dịch vụ:</p>
        <LegalBullets
          items={[
            'Điều khoản thanh toán cụ thể sẽ nằm trong báo giá / hợp đồng / tin nhắn xác nhận riêng',
            'Bàn giao diễn ra sau khi hai bên xác nhận scope và trạng thái thanh toán theo thỏa thuận',
          ]}
        />
      </LegalSection>

      <LegalSection number="5" title="Giới hạn trách nhiệm">
        <p>Tài AI Automation không chịu trách nhiệm cho:</p>
        <LegalBullets
          items={[
            'Mất dữ liệu do bên thứ ba, lỗi nhà cung cấp hạ tầng, hoặc hành vi người dùng trái hướng dẫn',
            'Doanh thu kỳ vọng không đạt nếu khách hàng không vận hành theo đúng quy trình đã bàn giao',
            'Gián đoạn dịch vụ do nhà cung cấp ngoài tầm kiểm soát',
          ]}
        />
      </LegalSection>

      <LegalSection number="6" title="Chấm dứt sử dụng">
        <p>Mỗi bên có thể dừng dịch vụ khi cần. Khi dừng:</p>
        <LegalBullets
          items={[
            'Khách hàng giữ phần dữ liệu và tài khoản thuộc phạm vi bàn giao hợp lệ',
            'Các nghĩa vụ thanh toán còn tồn tại vẫn được xử lý theo thỏa thuận riêng',
          ]}
        />
      </LegalSection>

      <LegalSection number="7" title="Liên hệ">
        <LegalTable
          headers={['Kênh', 'Thông tin']}
          rows={[
            [
              <strong key="em">Email</strong>,
              <a key="emv" href={`mailto:${EMAIL}`}>{EMAIL}</a>,
            ],
            [
              <strong key="za">Zalo</strong>,
              <a key="zav" href={ZALO_LINK} target="_blank" rel="noopener noreferrer">
                0345 324 467
              </a>,
            ],
          ]}
        />
      </LegalSection>

      <LegalSection number="8" title="Văn bản đồng hành">
        <p>
          Việc sử dụng dịch vụ đồng nghĩa với việc anh/chị đã đọc và đồng ý với{' '}
          <a href="/privacy">Chính sách Bảo mật & Quyền riêng tư</a>, áp dụng song song với
          Điều khoản này.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
