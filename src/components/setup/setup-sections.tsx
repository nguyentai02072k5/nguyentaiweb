import QRCode from 'qrcode';
import { ArrowDown, BellRing, Check, MessageCircle, Sparkles, X } from 'lucide-react';
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

/**
 * Tách `**từ khoá**` trong chuỗi nội dung thành <strong> có highlight. Một nguồn duy nhất
 * cho việc nhấn mạnh: người viết chỉ cần bọc cụm cần nhớ bằng ** trong setup-content.
 */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="sp-hl">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

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
        <a className="sp-btn sp-btn-sm sp-btn-hot" href="#goi-setup">
          <Sparkles size={15} aria-hidden />
          Đăng ký cài giúp
        </a>
      </div>
    </header>
  );
}

/**
 * Hàng nút dẫn xuống khối đăng ký (#goi-setup). Đặt cuối các section chính để khách
 * ở bất kỳ điểm nào cũng có đúng một lối đi xuống, không phải cuộn tìm.
 */
function SectionCta({ text }: { text: string }) {
  return (
    <div className="sp-cta-row sp-rv">
      <p>{text}</p>
      <a className="sp-btn sp-btn-hot sp-btn-lg" href="#goi-setup">
        Đăng ký cài giúp 1-1
        <ArrowDown size={18} className="sp-down" aria-hidden />
      </a>
    </div>
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
          <p className="sp-badge sp-in">
            <span className="sp-dot" aria-hidden />
            Cho chủ shop bán hàng qua Fanpage và Zalo
          </p>
          <h1 className="sp-h1 sp-in" style={{ '--i': 1 } as React.CSSProperties}>
            Khách nhắn lúc 11 giờ đêm. Bot báo giá trong <mark>10 giây</mark>.
          </h1>
          <p className="sp-lead sp-in" style={{ '--i': 2 } as React.CSSProperties}>
            Tự dựng Chatbot AI trên Mooly qua <strong className="sp-hl">12 video ngắn, miễn phí</strong>. Muốn nhanh hơn? Mình{' '}
            <strong className="sp-hl">cài cùng bạn trong 3 ngày</strong>.
          </p>
          <div className="sp-hero-cta sp-in" style={{ '--i': 3 } as React.CSSProperties}>
            <a className="sp-btn sp-btn-hot sp-btn-lg" href="#goi-setup">
              Đăng ký cài giúp 1-1
              <ArrowDown size={18} className="sp-down" aria-hidden />
            </a>
            <a className="sp-btn sp-btn-ghost sp-btn-lg" href="#video">
              Hoặc tự làm theo video
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

/**
 * Dải "3 điều cần nhớ": chủ shop lướt 3 giây là nắm được lời hứa chính của trang.
 * Số liệu khớp SETUP_COMPARE / SETUP_PROOF, không thêm con số mới.
 */
const KEY_FACTS = [
  { tone: 'pink', value: '< 10 giây', label: 'Bot trả lời khách, cả đêm lẫn ngày' },
  { tone: 'cyan', value: '3 ngày', label: 'Bot chạy thật trên Fanpage, Zalo' },
  { tone: 'sun', value: 'Hoàn 100%', label: 'nếu hết ngày 3 bạn chưa ưng' },
] as const;

export function SetupKeyFacts() {
  return (
    <section className="sp-facts sp-rv" aria-label="Ba điều cần nhớ">
      <ul className="sp-wrap sp-facts-in">
        {KEY_FACTS.map((f) => (
          <li key={f.value} className={`sp-fact sp-fact--${f.tone}`}>
            <strong>{f.value}</strong>
            <span>{f.label}</span>
          </li>
        ))}
      </ul>
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
        <a className="sp-btn sp-btn-hot" href="#goi-setup">
          Xem gói Setup
          <ArrowDown size={16} className="sp-down" aria-hidden />
        </a>
      </div>
    </section>
  );
}

export function SetupPain() {
  return (
    <section className="sp-section sp-band sp-band--night">
      <div className="sp-wrap">
        <h2 className="sp-h2 sp-rv">Tiền quảng cáo đang rơi mất ngay ở hộp thư</h2>
        <div className="sp-vs">
          <div className="sp-vs-col sp-vs-bad sp-rv">
            <h3>Làm thủ công</h3>
            <ul>
              {SETUP_PAINS.map((p) => (
                <li key={p}>
                  <X size={16} aria-hidden />
                  <span><Rich text={p} /></span>
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
                  <span><Rich text={g} /></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <SectionCta text="Muốn Bot nhận khách thay bạn ngay tuần này?" />
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
        <SectionCta text="Muốn Bot chạy cho shop của bạn? Mình cài cùng bạn 1-1." />
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
                    <span><Rich text={p} /></span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <SectionCta text="Thấy hợp? Giữ lịch trước, mỗi tuần mình chỉ nhận 5 đến 7 chủ shop." />
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
    <section className="sp-section sp-band sp-band--hot" id="goi-setup">
      <div className="sp-wrap">
        <h2 className="sp-h2 sp-rv">Muốn Bot chạy thật trong 3 ngày? Mình làm cùng bạn.</h2>
        <p className="sp-sub sp-rv">
          Gói Setup 1-1 trong <strong className="sp-hl-on">7 ngày</strong>. Hết ngày thứ 3 chạy thử, không ưng thì{' '}
          <strong className="sp-hl-on">hoàn đủ 2.000.000đ trong 24 giờ</strong>.
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
                  <span><Rich text={b} /></span>
                </li>
              ))}
            </ul>
            <p className="sp-limit">Để kèm sát từng người, mỗi tuần mình chỉ nhận tối đa 5 đến 7 chủ shop mới.</p>
          </div>

          <div className="sp-price-cta">
            <div className="sp-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} role="img" aria-label={`Mã QR Zalo ${ZALO_PHONE}`} />
            <p className="sp-qr-cap">Quét bằng Zalo để giữ lịch</p>
            <a className="sp-btn sp-btn-hot sp-btn-lg sp-btn-block" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} aria-hidden />
              Đăng ký qua Zalo
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
                  <th key={c} scope="col" className={i === 1 ? 'is-win' : undefined}>
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
                    <td key={v} className={i === 1 ? 'is-win' : undefined}>
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

/** Chốt cuối trang: ai còn lăn tăn thì nhắn thẳng, hoặc quay lại xem gói. */
export function SetupClosing() {
  return (
    <section className="sp-closing sp-band sp-band--night">
      <div className="sp-wrap sp-closing-in sp-rv">
        <h2 className="sp-h2">Còn lăn tăn? Nhắn mình một câu.</h2>
        <p>Mình trả lời trực tiếp qua Zalo {ZALO_PHONE}.</p>
        <div className="sp-closing-cta">
          <a className="sp-btn sp-btn-hot sp-btn-lg" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} aria-hidden />
            Nhắn Zalo ngay
          </a>
          <a className="sp-btn sp-btn-onnight sp-btn-lg" href="#goi-setup">
            Xem lại gói Setup
          </a>
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
