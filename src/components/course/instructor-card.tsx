/**
 * instructor-card.tsx — Section giảng viên Nguyễn Văn Tài.
 * Avatar gradient + tên + vai trò + tiểu sử + hàng số liệu uy tín.
 * Hằng số tĩnh (YAGNI — v1, chỉ 1 giảng viên).
 */

const STATS = [
  { value: '100+', label: 'shop & cá nhân đã hỗ trợ' },
  { value: '6', label: 'khoá biên soạn' },
  { value: 'AI · Web · Auto', label: 'lĩnh vực chuyên sâu' },
];

export function InstructorCard() {
  return (
    <section className="c-section c-section--divider">
      <div className="c-reveal">
        <span className="c-eyebrow">Giảng viên</span>

        <div
          className="instr-card c-card"
          style={{
            display: 'flex',
            gap: 22,
            alignItems: 'center',
            marginTop: 24,
            padding: 24,
          }}
        >
          {/* Avatar */}
          <div
            aria-hidden="true"
            style={{
              width: 96,
              height: 96,
              flexShrink: 0,
              borderRadius: 20,
              background: 'var(--grad)',
              color: '#04120e',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 38,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 40px -18px rgba(51,225,203,.7)',
            }}
          >
            T
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 800 }}>
              Nguyễn Văn Tài
            </h3>
            <div style={{ color: 'var(--primary)', fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>
              Chuyên gia AI · Web · Automation
            </div>
            <p
              style={{
                color: 'var(--muted)',
                fontSize: 14,
                lineHeight: 'var(--lh-body)',
                marginTop: 10,
                maxWidth: '60ch',
              }}
            >
              Nhiều năm xây dựng chatbot, website và hệ thống tự động hoá cho hàng trăm
              shop và cá nhân. Triết lý: công cụ phải phục vụ người không rành công nghệ —
              đơn giản, miễn phí, làm được ngay. Toàn bộ khoá ở đây do chính anh biên soạn
              và cập nhật.
            </p>

            {/* Số liệu uy tín */}
            <div className="instr-stats">
              {STATS.map((s) => (
                <div key={s.label} className="instr-stat">
                  <b style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>
                    {s.value}
                  </b>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .instr-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 22px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .instr-stat { display: flex; flex-direction: column; gap: 2px; }
        .instr-stat b { font-size: 18px; line-height: 1; }
        @media (max-width: 640px) {
          .instr-card { flex-direction: column !important; text-align: center; }
          .instr-stats { justify-content: center; }
        }
      `}</style>
    </section>
  );
}
