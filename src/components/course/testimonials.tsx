/**
 * testimonials.tsx — Section "Học viên chia sẻ".
 * 3 cột desktop so le (card giữa nhô lên) / 1 cột mobile.
 * Hằng số tĩnh (YAGNI — v1 không cần CMS cho testimonials).
 */

const TESTIMONIALS = [
  {
    initial: 'H',
    name: 'Hồng Anh',
    role: 'Chủ shop mỹ phẩm',
    quote:
      '"Đang mù công nghệ mà theo khoá chatbot vẫn dựng được con bot trả lời khách. Cảm ơn anh Tài!"',
  },
  {
    initial: 'T',
    name: 'Minh Tuấn',
    role: 'Kinh doanh online',
    quote:
      '"Làm theo khoá dựng web, mình tự có trang bán hàng chỉ trong một buổi tối, host free luôn không tốn đồng nào."',
  },
  {
    initial: 'L',
    name: 'Lan Chi',
    role: 'Freelancer marketing',
    quote:
      '"Mấy mẹo dùng AI giúp mình viết content nhanh gấp 3. Miễn phí mà chất hơn nhiều khoá từng mua."',
  },
];

export function Testimonials() {
  return (
    <section className="c-section c-section--divider" id="share">
      <div className="c-section-head c-reveal">
        <span className="c-eyebrow">Học viên chia sẻ</span>
        <h2 className="c-h2">Người thật, kết quả thật</h2>
      </div>

      <div className="testi-grid c-reveal">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="c-card testi-card" style={{ padding: 20 }}>
            <div style={{ color: 'var(--lime)', fontSize: 13, letterSpacing: 2 }}>★★★★★</div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 'var(--lh-body)',
                color: 'var(--ink-soft)',
                marginTop: 12,
              }}
            >
              {t.quote}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--surface-3)',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {t.initial}
              </span>
              <div>
                <b style={{ fontSize: 13.5, display: 'block' }}>{t.name}</b>
                <small style={{ fontSize: 11.5, color: 'var(--muted)', display: 'block' }}>
                  {t.role}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .testi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          align-items: start;
        }
        /* So le: card giữa nhô lên tạo nhịp thị giác */
        .testi-grid .testi-card:nth-child(2) { transform: translateY(-14px); }
        @media (max-width: 820px) {
          .testi-grid { grid-template-columns: 1fr; }
          .testi-grid .testi-card:nth-child(2) { transform: none; }
        }
      `}</style>
    </section>
  );
}
