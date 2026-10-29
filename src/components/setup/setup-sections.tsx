import QRCode from 'qrcode';
import { ArrowDown, BellRing, Check, MessageCircle, X } from 'lucide-react';
import {
  SETUP_BENEFITS,
  SETUP_COMPARE,
  SETUP_FAQ,
  SETUP_GAINS,
  SETUP_PAINS,
  SETUP_PRICE,
  SETUP_PROOF,
  SETUP_ROADMAP,
  ZALO_PHONE,
  ZALO_URL,
} from '@/lib/setup/setup-content';

/** Thanh trên cùng: nhận diện + điều hướng 3 mục + 1 lối thoát (Zalo). */
export function SetupHeader() {
  return (
    <header className="sp-header">
      <div className="sp-wrap sp-header-in">
        <a href="#top" className="sp-brand">
          <span className="sp-brand-mark" aria-hidden>
            <MessageCircle size={16} />
          </span>
          Setup Chatbot AI
        </a>
        <nav className="sp-nav" aria-label="Điều hướng trang">
          <a href="#video">Video</a>
          <a href="#lo-trinh">Lộ trình 7 ngày</a>
          <a href="#goi-setup">Gói Setup</a>
          <a href="#hoi-dap">Hỏi đáp</a>
        </nav>
        <a className="sp-btn sp-btn-sm sp-btn-primary" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={15} aria-hidden />
          Nhắn Zalo
        </a>
      </div>
    </header>
  );
}

/**
 * Hội thoại mô phỏng: chính là thứ khách của bạn sẽ thấy. Chạy một lần khi tải trang
 * (CSS animation, không JS), reduced-motion thì hiện sẵn toàn bộ. Không có số liệu giả.
 */
function ChatDemo() {
  return (
    <div className="sp-chat" aria-label="Mô phỏng hội thoại giữa khách và Bot">
      <div className="sp-chat-bar">
        <span className="sp-chat-avatar" aria-hidden>
          <MessageCircle size={16} />
        </span>
        <div>
          <p className="sp-chat-name">Chatbot của shop</p>
          <p className="sp-chat-sub">Trực 24/7 · mô phỏng hội thoại</p>
        </div>
      </div>
      <div className="sp-chat-body">
        <p className="sp-chat-time">23:12</p>
        <p className="sp-bubble sp-bubble-in sp-t1">Túi vải in logo 200 cái, giá sao shop?</p>
        <div className="sp-chat-reply">
          <p className="sp-bubble sp-bubble-out sp-typing" aria-hidden>
            <i />
            <i />
            <i />
          </p>
          <p className="sp-bubble sp-bubble-out sp-t3">
            Dạ với 200 túi bên em có 2 nấc giá theo số lượng. Anh chị gửi em logo, em báo giá chính xác ngay ạ.
            <span className="sp-chat-chip">Trả lời dưới 10 giây</span>
          </p>
        </div>
        <p className="sp-chat-sys sp-t4">
          <BellRing size={14} aria-hidden />
          Khách im lặng? Bot tự nhắn lại sau 12 giờ, 3 ngày, 14 ngày.
        </p>
      </div>
    </div>
  );
}

export function SetupHero() {
  return (
    <section className="sp-hero" id="top">
      <div className="sp-wrap sp-hero-grid">
        <div className="sp-hero-copy">
          <p className="sp-badge sp-in">Cho chủ shop bán hàng qua Fanpage và Zalo</p>
          <h1 className="sp-h1 sp-in" style={{ '--i': 1 } as React.CSSProperties}>
            Khách nhắn lúc 11 giờ đêm. Bot báo giá trong <mark>10 giây</mark>.
          </h1>
          <p className="sp-lead sp-in" style={{ '--i': 2 } as React.CSSProperties}>
            Tự dựng Chatbot AI trên Mooly qua 12 video ngắn, miễn phí. Muốn nhanh hơn, mình cài cùng bạn trong 3 ngày.
          </p>
          <div className="sp-hero-cta sp-in" style={{ '--i': 3 } as React.CSSProperties}>
            <a className="sp-btn sp-btn-primary sp-btn-lg" href="#video">
              Xem video đầu tiên
              <ArrowDown size={18} aria-hidden />
            </a>
            <a className="sp-btn sp-btn-ghost sp-btn-lg" href="#goi-setup">
              Nhờ mình cài giúp
            </a>
          </div>
        </div>
        <div className="sp-in" style={{ '--i': 2 } as React.CSSProperties}>
          <ChatDemo />
        </div>
      </div>
    </section>
  );
}

/** CTA mềm sau video: không ép mua, chỉ mở lối cho người bị vướng. */
export function SetupSoftCta() {
  return (
    <section className="sp-soft sp-rv">
      <div className="sp-wrap sp-soft-in">
        <p>
          <strong>Tự làm được thì quá tốt.</strong> Nếu bạn ngại kỹ thuật hoặc muốn Bot lên sóng sớm, mình làm cùng bạn 1-1.
        </p>
        <a className="sp-btn sp-btn-ghost" href="#goi-setup">
          Xem gói Setup
        </a>
      </div>
    </section>
  );
}

export function SetupPain() {
  return (
    <section className="sp-section">
      <div className="sp-wrap">
        <h2 className="sp-h2 sp-rv">Tiền quảng cáo đang rơi mất ngay ở hộp thư</h2>
        <div className="sp-vs">
          <div className="sp-vs-col sp-vs-bad sp-rv">
            <h3>Làm thủ công</h3>
            <ul>
              {SETUP_PAINS.map((p) => (
                <li key={p}>
                  <X size={16} aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="sp-vs-col sp-vs-good sp-rv" style={{ '--d': '120ms' } as React.CSSProperties}>
            <h3>Chatbot AI và người làm cùng</h3>
            <ul>
              {SETUP_GAINS.map((g) => (
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

/** Bằng chứng dạng bento 4 ô (1 ô lớn + 3 ô nhỏ), số liệu lấy từ xưởng túi Loma Bag. */
export function SetupProof() {
  const { hero, rescued, speed, auto } = SETUP_PROOF;
  return (
    <section className="sp-section sp-alt">
      <div className="sp-wrap">
        <h2 className="sp-h2 sp-rv">Số thật từ xưởng túi Loma Bag</h2>
        <p className="sp-sub sp-rv">Quy trình trong video được rút ra từ một xưởng đang bán hàng mỗi ngày.</p>
        <div className="sp-bento">
          <article className="sp-cell sp-cell-hero sp-rv">
            <p className="sp-cell-label">{hero.label}</p>
            <p className="sp-cell-value">{hero.value}</p>
            <p className="sp-cell-note">{hero.note}</p>
          </article>
          <article className="sp-cell sp-rv" style={{ '--d': '80ms' } as React.CSSProperties}>
            <p className="sp-cell-label">{rescued.label}</p>
            <p className="sp-cell-value">{rescued.value}</p>
            <p className="sp-cell-note">{rescued.note}</p>
          </article>
          <article className="sp-cell sp-rv" style={{ '--d': '160ms' } as React.CSSProperties}>
            <p className="sp-cell-label">{speed.label}</p>
            <p className="sp-cell-value">{speed.value}</p>
            <p className="sp-cell-note">{speed.note}</p>
          </article>
          <article className="sp-cell sp-rv" style={{ '--d': '240ms' } as React.CSSProperties}>
            <p className="sp-cell-label">{auto.label}</p>
            <p className="sp-cell-value">{auto.value}</p>
            <p className="sp-cell-note">{auto.note}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

/** Lộ trình 7 ngày: dựng Bot, mốc nghiệm thu hoàn tiền, rồi làm chủ. */
export function SetupRoadmap() {
  return (
    <section className="sp-section" id="lo-trinh">
      <div className="sp-wrap">
        <h2 className="sp-h2 sp-rv">Lộ trình 7 ngày, có mốc hoàn tiền ở giữa</h2>
        <p className="sp-sub sp-rv">Bạn thấy Bot chạy thật rồi mới quyết định đi tiếp.</p>
        <ol className="sp-track">
          {SETUP_ROADMAP.map((step, i) => (
            <li key={step.when} className="sp-track-step sp-rv" style={{ '--d': `${i * 100}ms` } as React.CSSProperties}>
              <p className="sp-track-when">{step.when}</p>
              <h3>{step.title}</h3>
              <ul>
                {step.points.map((p) => (
                  <li key={p}>
                    <Check size={15} aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
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
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });

  return (
    <section className="sp-section sp-alt" id="goi-setup">
      <div className="sp-wrap">
        <h2 className="sp-h2 sp-rv">Muốn Bot chạy thật trong 3 ngày? Mình làm cùng bạn.</h2>
        <p className="sp-sub sp-rv">
          Gói Setup 1-1 trong 7 ngày. Hết ngày thứ 3 chạy thử, không ưng thì hoàn đủ 2.000.000đ trong 24 giờ.
        </p>

        <div className="sp-price-card sp-rv">
          <div className="sp-price-main">
            <p className="sp-kicker">Setup nhanh và chuyển giao làm chủ AI 1-1</p>
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
            <p className="sp-limit">Để kèm sát từng người, mỗi tuần mình chỉ nhận tối đa 5 đến 7 chủ shop mới.</p>
          </div>

          <div className="sp-price-cta">
            <div className="sp-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} role="img" aria-label={`Mã QR Zalo ${ZALO_PHONE}`} />
            <p className="sp-qr-cap">Quét bằng Zalo để giữ lịch</p>
            <a className="sp-btn sp-btn-primary sp-btn-lg sp-btn-block" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} aria-hidden />
              Nhắn Zalo {ZALO_PHONE}
            </a>
            <p className="sp-qr-note">Đang dùng điện thoại? Bấm nút trên, không cần quét.</p>
          </div>
        </div>

        <div className="sp-table-wrap sp-rv" role="region" aria-label="So sánh 3 lựa chọn" tabIndex={0}>
          <table className="sp-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sp-sr">Tiêu chí</span>
                </th>
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
    <section className="sp-section" id="hoi-dap">
      <div className="sp-wrap sp-narrow">
        <h2 className="sp-h2 sp-rv">Câu hỏi thường gặp</h2>
        <div className="sp-faq">
          {SETUP_FAQ.map((f, i) => (
            <details key={f.q} className="sp-rv" style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
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
