import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { ArrowRight, Check, Flame, Globe, MessageCircle, ShieldCheck, Tag } from 'lucide-react';
import { SetupReveal } from '@/components/setup/setup-reveal';
import { SetupStickyBar } from '@/components/setup/setup-sticky-bar';
import { SetupVideoHub } from '@/components/setup/setup-video-hub';
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
import './v2.css';

/** Bản thử giao diện v2 (tông nóng, rõ lựa chọn, dẫn người xem tới gói Setup). Chưa cho Google lập chỉ mục. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
};

/** Tách `**từ khoá**` thành <strong>: cùng quy ước với trang chính. */
const SOCIAL_SVG = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true } as const;

/** Bốn kênh cuối trang: website, Facebook, YouTube, TikTok. */
const SOCIALS = [
  { label: 'Website nguyenvantai.com', href: 'https://nguyenvantai.com', icon: <Globe size={22} aria-hidden /> },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61589059652030',
    icon: (
      <svg {...SOCIAL_SVG}>
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.8v3h2.7V21h3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@tai-ai-automation',
    icon: (
      <svg {...SOCIAL_SVG}>
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@vtai027',
    icon: (
      <svg {...SOCIAL_SVG}>
        <path d="M16.6 3h-3v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.7 5.7 0 1 0 4.8 5.6V9.1a7 7 0 0 0 4 1.3V7.4A4.1 4.1 0 0 1 16.6 3z" />
      </svg>
    ),
  },
];

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
    </>
  );
}

/** Tô nổi các cụm khách cần nhớ trong câu trả lời FAQ (nội dung dùng chung nên không chèn ** vào file nội dung). */
const FAQ_KEYWORDS = /(2\.000\.000đ|24 giờ|12 video|7 ngày|3 ngày|5 phút|2 phút|miễn phí|hoàn tiền|Loma Bag|qua Zalo)/g;
function Hl({ text }: { text: string }) {
  return (
    <>
      {text.split(FAQ_KEYWORDS).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
    </>
  );
}

function Tick({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <Check className="sv2-ok" size={18} aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export default function SetupV2Page() {
  return (
    <div className="sv2">
      <p className="sv2-urgent">
        <Flame size={16} aria-hidden />
        <span>
          Mỗi tuần chỉ nhận <strong>5 đến 7 chủ shop</strong>
          <br />
          Không ưng sau 3 ngày, <strong>hoàn 100%</strong>
        </span>
      </p>

      <header className="sv2-header">
        <div className="sv2-wrap sv2-header-in">
          <a className="sv2-brand" href="#">
            Setup Chatbot AI
          </a>
          <nav className="sv2-nav" aria-label="Điều hướng">
            <a href="#chon-cach">Chọn cách làm</a>
            <a href="#video">Video hướng dẫn</a>
            <a href="#goi-setup">Gói cài giúp 1-1</a>
            <a href="#hoi-dap">Hỏi đáp</a>
          </nav>
          <a className="sv2-btn sv2-btn-primary sv2-btn-sm" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
            Nhắn Zalo
          </a>
        </div>
      </header>

      <main>
        {/* 1. Hero: lời hứa + hội thoại thật */}
        <section className="sv2-hero">
          <div className="sv2-wrap sv2-hero-grid">
            <div>
              <p className="sv2-eyebrow">Dành cho chủ shop bán hàng qua Fanpage và Zalo</p>
              <h1>
                <span className="sv2-l">Khách nhắn lúc 11 giờ đêm,</span>
                <span className="sv2-l">
                  Bot báo giá <em>trong 10 giây</em>
                </span>
              </h1>
              <p className="sv2-lead">
                Mình chỉ bạn tự cài Chatbot AI bằng <strong>12 video ngắn, miễn phí</strong>. Cần người làm cùng? Mình{' '}
                <strong>cài giúp bạn 1-1 trong 3 ngày</strong>.
              </p>
              <div className="sv2-actions">
                <a className="sv2-btn sv2-btn-primary sv2-shine" href="#chon-cach">
                  Chọn cách làm phù hợp <ArrowRight size={18} aria-hidden />
                </a>
                <a className="sv2-btn sv2-btn-ghost" href="#video">
                  Xem video miễn phí
                </a>
              </div>
            </div>

            <div className="sv2-chat" aria-label="Ví dụ hội thoại: Bot trả lời rồi tự nhắn lại khách im lặng">
              <p className="sv2-chat-tag sv2-a" style={{ "--d": "0.2s" } as CSSProperties}>
                Ví dụ một khách hỏi lúc 23:07
              </p>
              <p className="sv2-bubble sv2-bubble-in sv2-a" style={{ "--d": "0.6s" } as CSSProperties}>
                Túi vải in logo 200 cái, giá sao shop?
              </p>
              <div className="sv2-reply">
                <p className="sv2-bubble sv2-bubble-out sv2-typing" aria-hidden>
                  <i />
                  <i />
                  <i />
                </p>
                <p className="sv2-bubble sv2-bubble-out sv2-a" style={{ "--d": "3s" } as CSSProperties}>
                  Dạ với số lượng 200 túi, mức giá tham khảo dao động từ <strong>25k - 70k/túi</strong> ạ.
                  <br />
                  <br />
                  Giá chi tiết sẽ phụ thuộc vào <strong>mẫu túi</strong> và <strong>hình/logo</strong> cần in lên túi nữa sếp nhé.
                  <span className="sv2-meta">Trả lời sau 8 giây</span>
                </p>
              </div>
              <p className="sv2-label sv2-a" style={{ "--d": "3.8s" } as CSSProperties}>
                <Tag size={12} aria-hidden /> Loma đã thêm nhãn <b>“Có nhu cầu”</b>
              </p>
              <p className="sv2-gap sv2-a" style={{ "--d": "4.6s" } as CSSProperties}>
                20 phút sau, khách chưa trả lời
              </p>
              <p className="sv2-bubble sv2-bubble-out sv2-a" style={{ "--d": "5.2s" } as CSSProperties}>
                Dạ chị đang <strong>quan tâm dòng túi nào</strong> ạ? Cho em xin <strong>SĐT</strong> để bên em báo giá tốt nhất cho mình nhé.
              </p>
              <p className="sv2-bubble sv2-bubble-in sv2-a" style={{ "--d": "6.4s" } as CSSProperties}>
                03xx xxx xx9
              </p>
              <p className="sv2-label sv2-a" style={{ "--d": "7.2s" } as CSSProperties}>
                <Tag size={12} aria-hidden /> Loma đã thêm nhãn <b>“Đã cho SĐT”</b>
              </p>
              <p className="sv2-chat-foot sv2-a" style={{ "--d": "8s" } as CSSProperties}>
                <Check size={14} aria-hidden /> Bot tự nhắn lại tối đa 7 ngày, tự gắn nhãn, không tốn thêm tiền Ads
              </p>
            </div>
          </div>
        </section>

        {/* 2. Hai cách làm */}
        <section className="sv2-section" id="chon-cach">
          <div className="sv2-wrap">
            <p className="sv2-kicker sp-rv">Bước 1</p>
            <h2 className="sp-rv">Chọn cách làm phù hợp với bạn</h2>
            <p className="sv2-sub sp-rv" style={{ '--d': '100ms' } as CSSProperties}>
              Cả hai cách đều ra <strong>cùng một Chatbot</strong>. Khác nhau ở chỗ bạn muốn <strong>tự làm</strong> hay{' '}
              <strong>có người làm cùng</strong>.
            </p>
            <div className="sv2-ways">
              <article className="sv2-way sp-rv">
                <p className="sv2-way-tag">Tự làm</p>
                <h3>Làm theo video</h3>
                <p className="sv2-way-price">Miễn phí</p>
                <ul className="sv2-list">
                  <Tick><strong>12 video</strong>, tổng khoảng 20 phút</Tick>
                  <Tick>Làm tới đâu, <strong>lưu tiến độ</strong> tới đó</Tick>
                  <Tick>Hợp nếu bạn <strong>quen thao tác</strong> trên máy tính</Tick>
                </ul>
                <a className="sv2-btn sv2-btn-outline sv2-btn-block" href="#video">
                  Xem video miễn phí
                </a>
              </article>
              <article className="sv2-way sv2-way-hot sp-rv" style={{ '--d': '120ms' } as CSSProperties}>
                <p className="sv2-way-tag">Nhanh và chắc nhất</p>
                <h3>Mình cài giúp 1-1</h3>
                <p className="sv2-way-price">
                  {SETUP_PRICE} <span>trọn gói</span>
                </p>
                <ul className="sv2-list">
                  <Tick>Bot <strong>chạy thật sau 3 ngày</strong></Tick>
                  <Tick>Làm cùng bạn <strong>ngay trên máy của bạn</strong></Tick>
                  <Tick>Không ưng, <strong>hoàn 100%</strong> trong 24 giờ</Tick>
                </ul>
                <a className="sv2-btn sv2-btn-primary sv2-btn-block" href="#goi-setup">
                  Đăng ký cài giúp 1-1
                </a>
                <p className="sv2-way-note">Mỗi tuần chỉ nhận 5 đến 7 chủ shop</p>
              </article>
            </div>
          </div>
        </section>

        {/* 3. Số thật */}
        <section className="sv2-stats" aria-label="Số thật từ xưởng Loma Bag">
          <div className="sv2-wrap">
            <p className="sv2-stats-title">Số thật từ xưởng Loma Bag, nơi quy trình này chạy mỗi ngày</p>
            <dl className="sv2-stats-grid">
              {[SETUP_PROOF.hero, SETUP_PROOF.rescued, SETUP_PROOF.speed, SETUP_PROOF.auto].map((x, i) => (
                <div key={x.label} className="sp-rv" style={{ '--d': `${i * 80}ms` } as CSSProperties}>
                  <dd>{x.value}</dd>
                  <dt>{x.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 4. Trước / sau theo từng cặp */}
        <section className="sv2-section">
          <div className="sv2-wrap">
            <h2 className="sp-rv">Bot làm thay những việc bạn hay bỏ sót</h2>
            <div className="sv2-pairs">
              {SETUP_PAINS.map((pain, i) => (
                <div key={pain} className="sv2-pair sp-rv">
                  <div className="sv2-pair-bad">
                    <p className="sv2-pair-tag">Trước</p>
                    <p>
                      <Rich text={pain} />
                    </p>
                  </div>
                  <div className="sv2-pair-good">
                    <p className="sv2-pair-tag">Sau khi có Bot</p>
                    <p>
                      <Rich text={SETUP_GAINS[i]} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Video (miễn phí) */}
        <section className="sv2-section sv2-section-alt" id="video">
          <div className="sv2-wrap">
            <SetupVideoHub />
          </div>
        </section>

        {/* 6. Quy trình 7 ngày */}
        <section className="sv2-section">
          <div className="sv2-wrap">
            <p className="sv2-kicker sp-rv">Nếu chọn cài giúp 1-1</p>
            <h2 className="sp-rv">7 ngày diễn ra thế này</h2>
            <ol className="sv2-steps">
              {SETUP_ROADMAP.map((step, i) => (
                <li key={step.title} className="sv2-card sp-rv" style={{ '--d': `${i * 80}ms` } as CSSProperties}>
                  <span className="sv2-step-num">{i + 1}</span>
                  <p className="sv2-step-when">{step.when}</p>
                  <h3>{step.title}</h3>
                  <ul className="sv2-list">
                    {step.points.map((p) => (
                      <Tick key={p}>
                        <Rich text={p} />
                      </Tick>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 7. Gói và giá */}
        <section className="sv2-section sv2-section-alt" id="goi-setup">
          <div className="sv2-wrap">
            <p className="sv2-kicker sp-rv">Bước 2</p>
            <h2 className="sp-rv">Đăng ký cài giúp 1-1</h2>
            <p className="sv2-sub sp-rv" style={{ '--d': '100ms' } as CSSProperties}>
              Một mức giá <strong>trọn gói</strong>. Không ưng sau 3 ngày, <strong>hoàn lại đủ tiền</strong>.
            </p>

            <div className="sv2-price sp-rv">
              <div>
                <p className="sv2-price-num">
                  {SETUP_PRICE} <span>trọn gói · đã gồm VAT · 7 ngày</span>
                </p>
                <ul className="sv2-list">
                  {SETUP_BENEFITS.map((b) => (
                    <Tick key={b}>
                      <Rich text={b} />
                    </Tick>
                  ))}
                </ul>
              </div>
              <div className="sv2-price-side">
                <p className="sv2-guarantee">
                  <ShieldCheck size={22} aria-hidden />
                  <span>
                    <strong>Cam kết hoàn tiền 100%</strong> trong 24 giờ nếu hết ngày thứ 3 bạn chưa hài lòng.
                  </span>
                </p>
                <a
                  className="sv2-btn sv2-btn-primary sv2-btn-block"
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} aria-hidden />
                  Đăng ký qua Zalo
                </a>
                <p className="sv2-note">
                  Zalo {ZALO_PHONE}. Mỗi tuần mình chỉ nhận <strong>5 đến 7 chủ shop</strong> để kèm sát từng người.
                </p>
              </div>
            </div>

            <div className="sv2-table-wrap" role="region" aria-label="So sánh hai cách làm">
              <table className="sv2-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sv2-sr">Tiêu chí</span>
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

        {/* 8. FAQ */}
        <section className="sv2-section" id="hoi-dap">
          <div className="sv2-wrap sv2-narrow">
            <h2 className="sp-rv">Câu hỏi thường gặp</h2>
            <div className="sv2-faq">
              {SETUP_FAQ.map((f) => (
                <details key={f.q} className="sp-rv">
                  <summary>{f.q}</summary>
                  <p>
                    <Hl text={f.a} />
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Kêu gọi cuối */}
        <section className="sv2-final">
          <div className="sv2-wrap">
            <h2 className="sp-rv">Còn băn khoăn? Nhắn mình một câu.</h2>
            <p>
              Mình trả lời <strong>trực tiếp qua Zalo</strong>, <strong>không áp lực mua</strong>.
            </p>
            <div className="sv2-actions sv2-actions-center">
              <a className="sv2-btn sv2-btn-light" href={ZALO_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} aria-hidden />
                Nhắn Zalo {ZALO_PHONE}
              </a>
              <a className="sv2-btn sv2-btn-outline-light" href="#goi-setup">
                Xem lại gói cài giúp
              </a>
            </div>
            <nav className="sv2-social" aria-label="Kênh của mình">
              {SOCIALS.map(({ label, href, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  {icon}
                </a>
              ))}
            </nav>
          </div>
        </section>
      </main>


      <SetupReveal />
      <SetupStickyBar />
    </div>
  );
}
