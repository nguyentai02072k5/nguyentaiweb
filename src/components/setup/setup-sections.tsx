import QRCode from 'qrcode';
import { ArrowDown, Check, MessageCircle, X } from 'lucide-react';
import {
  SETUP_BENEFITS,
  SETUP_COMPARE,
  SETUP_FAQ,
  SETUP_METRICS,
  SETUP_PRICE,
  SETUP_PROOF,
  ZALO_PHONE,
  ZALO_URL,
} from '@/lib/setup/setup-content';

/** Thanh trên cùng: nhận diện + 1 lối thoát duy nhất (Zalo). */
export function SetupHeader() {
  return (
    <header className="sp-header">
      <div className="sp-wrap sp-header-in">
        <a href="#top" className="sp-brand">
          Tài · Setup Chatbot AI
        </a>
        <a className="sp-btn sp-btn-sm sp-btn-ghost" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={15} aria-hidden />
          Nhắn Zalo
        </a>
      </div>
    </header>
  );
}

export function SetupHero() {
  return (
    <section className="sp-hero" id="top">
      <div className="sp-wrap">
        <p className="sp-badge">Dành cho chủ shop, chủ xưởng và người bán online bận rộn</p>
        <h1 className="sp-h1">
          Chatbot AI tự báo giá và bám đuổi khách <span className="sp-grad">24/7</span>. Tự làm theo video, hoặc để mình cài cùng bạn.
        </h1>
        <p className="sp-lead">
          12 video làm theo từng bước, xem miễn phí. Cần có người làm cùng 1-1? Gói Setup {SETUP_PRICE} (đã gồm VAT), hoàn tiền 100% nếu sau 3 ngày bạn không ưng.
        </p>
        <div className="sp-hero-cta">
          <a className="sp-btn sp-btn-primary sp-btn-lg" href="#video">
            Xem video hướng dẫn
            <ArrowDown size={18} aria-hidden />
          </a>
          <a className="sp-btn sp-btn-ghost sp-btn-lg" href="#goi-setup">
            Để mình cài cùng bạn
          </a>
        </div>
        <dl className="sp-metrics">
          {SETUP_METRICS.map((m) => (
            <div key={m.value} className="sp-metric">
              <dt>{m.value}</dt>
              <dd>{m.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** CTA mềm sau video: không ép mua, chỉ mở lối cho người bị vướng. */
export function SetupSoftCta() {
  return (
    <section className="sp-soft">
      <div className="sp-wrap sp-soft-in">
        <p>
          <strong>Tự làm được thì quá tốt.</strong> Nếu bạn ngại kỹ thuật hoặc muốn Bot lên sóng nhanh, mình làm cùng bạn 1-1.
        </p>
        <a className="sp-btn sp-btn-ghost" href="#goi-setup">
          Xem gói Setup
        </a>
      </div>
    </section>
  );
}

export function SetupPain() {
  const pains = [
    'Khách nhắn lúc 23h không ai trực, sáng hôm sau đã mua của đối thủ.',
    'Khách hỏi giá xong im lặng bị bỏ trôi, phí 60–70% ngân sách quảng cáo.',
    'Đổi giá hay thêm mẫu phải dặn từng nhân viên, mỗi ca trả lời một kiểu.',
    'Mua phần mềm về nhưng không có người chỉ việc, rồi bỏ xó.',
  ];
  const gains = [
    'Bot phản hồi dưới 10 giây, ngày hay đêm.',
    'Tự nhắn lại khách im lặng ở mốc 12 giờ, 3 ngày, 14 ngày, không tốn thêm tiền Ads.',
    '5 phút nạp bảng giá chuẩn, 2 phút chỉnh giọng văn, tư vấn đồng nhất mọi ca.',
    'Có người làm cùng 1-1 để bạn tự chủ phần mềm sau 7 ngày.',
  ];
  return (
    <section className="sp-section">
      <div className="sp-wrap">
        <h2 className="sp-h2">Vì sao chủ shop cần hệ thống này</h2>
        <div className="sp-vs">
          <div className="sp-vs-col sp-vs-bad">
            <h3>Làm thủ công, đang rò rỉ lợi nhuận</h3>
            <ul>
              {pains.map((p) => (
                <li key={p}>
                  <X size={16} aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="sp-vs-col sp-vs-good">
            <h3>Chatbot AI và đồng hành 1-1</h3>
            <ul>
              {gains.map((g) => (
                <li key={g}>
                  <Check size={16} aria-hidden />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SetupProof() {
  return (
    <section className="sp-section sp-alt">
      <div className="sp-wrap">
        <h2 className="sp-h2">Kiểm chứng bằng số thật tại xưởng túi Loma Bag</h2>
        <p className="sp-sub">
          Quy trình trong video được rút ra từ mô hình đang vận hành thực tế, không phải lý thuyết.
        </p>
        <div className="sp-proof">
          {SETUP_PROOF.map((p) => (
            <div key={p.label} className="sp-proof-card">
              <p className="sp-proof-label">{p.label}</p>
              <p className="sp-proof-value">{p.value}</p>
              <p className="sp-proof-note">{p.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Gói Setup: QR sinh server-side từ link Zalo (không cần ảnh tĩnh, luôn khớp số). */
export async function SetupPricing() {
  const qrSvg = await QRCode.toString(ZALO_URL, {
    type: 'svg',
    margin: 1,
    width: 220,
    color: { dark: '#071310', light: '#ecfff9' },
  });

  return (
    <section className="sp-section" id="goi-setup">
      <div className="sp-wrap">
        <h2 className="sp-h2">Không muốn tự mò? Mình cài cùng bạn 1-1</h2>
        <p className="sp-sub">
          3 ngày cài đặt, 4 ngày đồng hành. Hết ngày thứ 3 chạy thử không ưng, hoàn 100% trong 24 giờ.
        </p>

        <div className="sp-price-card">
          <div className="sp-price-main">
            <p className="sp-eyebrow">Gói Setup nhanh và chuyển giao làm chủ AI 1-1</p>
            <p className="sp-price">
              {SETUP_PRICE} <span>trọn gói · đã gồm VAT · 7 ngày</span>
            </p>
            <ul className="sp-benefits">
              {SETUP_BENEFITS.map((b) => (
                <li key={b}>
                  <Check size={16} aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
            <p className="sp-limit">Để kèm sát từng người, mỗi tuần mình chỉ nhận tối đa 5–7 chủ shop mới.</p>
          </div>

          <div className="sp-price-cta">
            <div className="sp-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} role="img" aria-label={`Mã QR Zalo ${ZALO_PHONE}`} />
            <p className="sp-qr-cap">Quét bằng Zalo để đăng ký giữ lịch</p>
            <a className="sp-btn sp-btn-primary sp-btn-lg sp-btn-block" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} aria-hidden />
              Nhắn Zalo {ZALO_PHONE}
            </a>
            <p className="sp-qr-note">Đang dùng điện thoại? Bấm nút trên, không cần quét.</p>
          </div>
        </div>

        <div className="sp-table-wrap" role="region" aria-label="So sánh 3 lựa chọn" tabIndex={0}>
          <table className="sp-table">
            <thead>
              <tr>
                <th scope="col"><span className="sp-sr">Tiêu chí</span></th>
                {SETUP_COMPARE.columns.map((c, i) => (
                  <th key={c} scope="col" className={i === 2 ? 'is-win' : undefined}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SETUP_COMPARE.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  {r.values.map((v, i) => (
                    <td key={v} className={i === 2 ? 'is-win' : undefined}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function SetupFaq() {
  return (
    <section className="sp-section sp-alt">
      <div className="sp-wrap sp-narrow">
        <h2 className="sp-h2">Câu hỏi thường gặp</h2>
        <div className="sp-faq">
          {SETUP_FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SetupFooter() {
  return (
    <footer className="sp-footer">
      <div className="sp-wrap">
        <p>© Nguyễn Văn Tài · Hỗ trợ qua Zalo {ZALO_PHONE}</p>
      </div>
    </footer>
  );
}
