/**
 * course-faq.tsx — Section FAQ, dùng <details>/<summary> native.
 * Hằng số tĩnh (YAGNI — không cần Velite cho FAQ marketing cố định).
 */

const FAQS = [
  {
    q: 'Các khoá có thật sự miễn phí không?',
    a: 'Có. Toàn bộ khoá miễn phí 100%. Bạn chỉ cần đăng nhập bằng email để mở khoá và lưu tiến độ học.',
  },
  {
    q: 'Nên bắt đầu với khoá nào?',
    a: 'Học cái bạn cần trước. Người mới thường bắt đầu với "Dùng AI tăng tốc công việc" hoặc "Xây Chatbot AI"; muốn có sản phẩm thì thử khoá làm web.',
  },
  {
    q: 'Mình không biết code có học được không?',
    a: 'Được. Các khoá thiết kế cho người không rành kỹ thuật — mỗi bước đều làm theo trực quan, xem tới đâu làm tới đó.',
  },
  {
    q: 'Đăng nhập bằng cách nào?',
    a: 'Nhập email, hệ thống gửi liên kết magic-link. Bấm vào là vào học, không cần nhớ mật khẩu.',
  },
  {
    q: 'Có thêm khoá mới không?',
    a: 'Có. Khoá mới được thêm đều đặn. Bạn đã đăng nhập sẽ học được ngay khi có khoá mới.',
  },
  {
    q: 'Có lưu tiến độ để xem tiếp không?',
    a: 'Có. Đăng nhập lần sau, hệ thống nhớ bạn đã học tới đâu ở từng khoá để xem tiếp.',
  },
];

export function CourseFaq() {
  return (
    <section className="c-section c-section--divider" id="faq">
      <div className="c-section-head c-reveal">
        <span className="c-eyebrow">Hỏi đáp</span>
        <h2 className="c-h2">Câu hỏi thường gặp</h2>
      </div>

      <div className="c-reveal" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="course-faq-item"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 13,
              transition: 'border-color .18s ease',
            }}
          >
            <summary
              style={{
                listStyle: 'none',
                cursor: 'pointer',
                padding: '16px 18px',
                fontWeight: 600,
                fontSize: 14.5,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <span style={{ flex: 1 }}>{q}</span>
              <span
                aria-hidden="true"
                className="course-faq-plus"
                style={{
                  color: 'var(--primary)',
                  fontSize: 18,
                  flexShrink: 0,
                  transition: 'transform .2s ease',
                }}
              >
                +
              </span>
            </summary>
            <p
              style={{
                padding: '0 18px 16px',
                color: 'var(--muted)',
                fontSize: 'var(--fs-sm)',
                lineHeight: 'var(--lh-body)',
              }}
            >
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
