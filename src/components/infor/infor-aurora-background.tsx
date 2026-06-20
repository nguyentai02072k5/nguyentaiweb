/**
 * infor-aurora-background.tsx - Nền aurora động (decorative) cho các trang /infor.
 *
 * Thay lớp radial-gradient tĩnh trước đây: các "blob" gradient trôi nhẹ (float-blob-*)
 * + một lớp mesh aurora mờ → cảm giác sinh động nhưng không gây nhiễu nội dung.
 * GPU-cheap (chỉ transform/opacity). Reduced-motion: globals.css tự pause blob drift.
 *
 * Server component thuần (không state). Tự bọc overflow-hidden để blob không tạo
 * thanh cuộn ngang khi tràn mép.
 */

export function InforAuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Lớp mesh aurora rất mờ làm nền tổng */}
      <div className="bg-mesh-aurora absolute inset-0 opacity-20" />

      {/* 3 blob trôi nhẹ theo các hướng khác nhau (opacity thấp, blob tím dịu nhất) */}
      <div className="bg-brand-indigo/12 absolute -left-24 -top-24 size-[420px] rounded-full blur-3xl animate-blob-1" />
      <div className="bg-brand-pink/10 absolute -right-20 top-1/4 size-[360px] rounded-full blur-3xl animate-blob-2" />
      <div className="bg-brand-violet/8 absolute bottom-0 left-1/3 size-[300px] rounded-full blur-3xl animate-blob-3" />
    </div>
  );
}
