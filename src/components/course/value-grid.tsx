/**
 * value-grid.tsx — "Dành thời gian ở đây, bạn sẽ mang về được gì?"
 *
 * THIẾT KẾ CŨ (mosaic đã duyệt): 1 ô lớn (2x2) có số outline khổng lồ + 1 ô rộng
 * + 2 ô nhỏ. Thanh accent trên đỉnh sáng khi hover. Chỉ thay COPY (giữ layout/animation).
 * Mobile: 2 cột → 1 cột, thu gọn.
 */

const PIECES = [
  {
    cls: 'pz-1',
    no: '01',
    accent: 'var(--primary)',
    title: 'Làm tới đâu, thấy kết quả tới đó',
    desc: 'Thay vì ngồi nghe lý thuyết suông, bạn sẽ vừa xem vừa thực hành. Xong một nội dung là bạn đã có ngay một công cụ nhỏ — như một luồng tin nhắn tự động — để chạy thử ngay trên công việc kinh doanh của mình.',
    big: true,
  },
  {
    cls: 'pz-2',
    no: '02',
    accent: 'var(--mint)',
    title: 'Lấy đúng thứ bạn đang cần',
    desc: 'Mỗi người có một nhịp độ và vấn đề riêng. Đang vướng ở khâu làm web? Bạn mở đúng phần đó ra xem. Cần setup tự động? Có ngay hướng dẫn. Tự do chắt lọc kiến thức phù hợp với giai đoạn của bạn.',
  },
  {
    cls: 'pz-3',
    no: '03',
    accent: 'var(--lime)',
    title: 'Không rào cản, mộc mạc & minh bạch',
    desc: 'Mục tiêu của mình là xây dựng một cộng đồng cùng phát triển. Mọi hướng dẫn cốt lõi đều mở cửa tự do. Chỉ cần đăng nhập nhanh qua email, không yêu cầu thẻ, không ép nâng cấp phức tạp.',
  },
  {
    cls: 'pz-4',
    no: '04',
    accent: 'var(--primary)',
    title: 'Cập nhật liên tục theo nhịp công nghệ',
    desc: 'AI thay đổi từng ngày. Khi có công cụ mới hay một quy trình nào đó hiệu quả hơn, mình sẽ trải nghiệm trước và đóng gói lại vào đây để bạn không bao giờ bị tụt hậu.',
  },
];

export function ValueGrid() {
  return (
    <section className="c-section c-section--divider" id="value">
      <div className="c-section-head c-reveal">
        <span className="c-eyebrow">Vì sao học ở đây</span>
        <h2 className="c-h2">Dành thời gian ở đây, bạn sẽ mang về được những gì?</h2>
        <p className="c-section-desc">
          Không lan man lý thuyết, chúng ta tập trung vào những thứ có thể áp dụng ngay
          để công việc nhẹ nhàng hơn.
        </p>
      </div>

      <div className="puzzle c-reveal">
        {PIECES.map((p) => (
          <article
            key={p.no}
            className={`c-card pz ${p.cls}`}
            style={{ ['--tile-accent' as string]: p.accent }}
          >
            <span className="pz-no" aria-hidden="true">
              {p.no}
            </span>
            <div className="pz-body">
              <h3 className={p.big ? 'pz-title pz-title--big' : 'pz-title'}>{p.title}</h3>
              <p className="pz-desc">{p.desc}</p>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .puzzle {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, minmax(150px, auto));
          gap: 12px;
        }
        /* Mosaic: 1 ô lớn (2x2) + 1 ô rộng (2x1) + 2 ô nhỏ (1x1) */
        .pz-1 { grid-column: 1 / 3; grid-row: 1 / 3; }
        .pz-2 { grid-column: 3 / 5; grid-row: 1 / 2; }
        .pz-3 { grid-column: 3 / 4; grid-row: 2 / 3; }
        .pz-4 { grid-column: 4 / 5; grid-row: 2 / 3; }

        .pz {
          position: relative;
          overflow: hidden;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 8px;
          background:
            radial-gradient(120% 90% at 100% 0%,
              color-mix(in srgb, var(--tile-accent) 12%, transparent), transparent 58%),
            var(--surface);
        }
        /* Thanh accent trên đỉnh — sáng khi hover (dẫn mắt) */
        .pz::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--tile-accent);
          opacity: .5;
          transition: opacity .18s ease;
        }
        .pz:hover::before { opacity: 1; }

        .pz-body { position: relative; z-index: 1; }

        .pz-no {
          position: absolute;
          top: 14px; right: 16px;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 12px;
          letter-spacing: .1em;
          color: var(--tile-accent);
          opacity: .7;
        }
        /* Ô lớn: số outline khổng lồ làm điểm nhấn */
        .pz-1 .pz-no {
          font-size: clamp(56px, 8vw, 92px);
          top: 2px; right: 18px;
          color: transparent;
          -webkit-text-stroke: 1.4px color-mix(in srgb, var(--tile-accent) 45%, transparent);
          opacity: .55;
        }

        .pz-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: var(--fs-card-title);
          line-height: 1.28;
          letter-spacing: -0.01em;
          color: var(--ink);
        }
        .pz-title--big {
          font-size: clamp(18px, 2.1vw, 24px);
          font-weight: 800;
          line-height: 1.18;
          max-width: 20ch;
        }
        .pz-desc {
          font-size: var(--fs-sm);
          color: var(--muted);
          line-height: 1.55;
          margin-top: 8px;
        }
        .pz-1 .pz-desc { font-size: var(--fs-body); max-width: 42ch; }

        /* ---- Mobile: 2 cột → 1 cột, thu gọn ---- */
        @media (max-width: 860px) {
          .puzzle { grid-template-columns: 1fr 1fr; grid-template-rows: none; }
          .pz-1 { grid-column: 1 / 3; grid-row: auto; }
          .pz-2 { grid-column: 1 / 3; grid-row: auto; }
          .pz-3 { grid-column: 1 / 2; grid-row: auto; }
          .pz-4 { grid-column: 2 / 3; grid-row: auto; }
        }
        @media (max-width: 520px) {
          .puzzle { grid-template-columns: 1fr; gap: 10px; }
          .pz-1, .pz-2, .pz-3, .pz-4 { grid-column: 1 / -1; }
          .pz { padding: 16px; }
          .pz-1 .pz-no { font-size: 64px; }
        }
      `}</style>
    </section>
  );
}
