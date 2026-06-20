/**
 * infor-video-demo.tsx - Khối video demo chatbot (server component).
 *
 * Nhúng YouTube responsive (tỉ lệ 16:9) qua aspect-ratio, lazy-load.
 */

export function InforVideoDemo() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-4 text-center">
        <h2 className="text-text-primary font-display text-xl font-bold capitalize tracking-tight sm:text-2xl">
          Xem chatbot hoạt động thực tế
        </h2>
        <p className="text-text-secondary mt-1 text-sm">
          Demo nhanh cách bot tư vấn và chốt đơn với khách.
        </p>
      </header>

      <div className="border-border-default/80 relative aspect-video w-full overflow-hidden rounded-2xl border bg-black shadow-lg">
        <iframe
          className="absolute inset-0 size-full"
          src="https://www.youtube.com/embed/9FsvnGIgDNQ?si=Fgh5YBPvrBvadYdO"
          title="Demo chatbot AI tư vấn & chốt đơn"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  );
}
