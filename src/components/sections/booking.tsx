"use client";

/**
 * BookingSection (S-Booking) landing page module.
 *
 * Mounts exactly one booking widget per viewport to avoid the old hidden
 * desktop+mobile double render cost.
 */

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useDesktopViewport } from "@/hooks/use-desktop-viewport";

const EASE_OUT: [number, number, number, number] = [0.2, 0, 0, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const headingVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const widgetVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const DesktopBookingWidget = dynamic(
  () =>
    import("@/components/booking/variants/desktop-ticket-wired").then(
      (mod) => mod.DesktopTicketWired,
    ),
  { ssr: false },
);

const MobileBookingWidget = dynamic(
  () =>
    import("@/components/booking/variants/unified-schedule-mobile-wired").then(
      (mod) => mod.UnifiedScheduleMobileWired,
    ),
  { ssr: false },
);

export function BookingSection() {
  const isDesktop = useDesktopViewport();
  const shouldReduceMotion = useReducedMotion();
  const initialState = shouldReduceMotion ? "visible" : "hidden";

  return (
    <section
      id="booking"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-br from-indigo-50/80 via-violet-100/40 to-cyan-50/50 py-10 sm:py-12 lg:py-14"
      aria-labelledby="booking-heading"
    >
      <motion.div
        variants={containerVariants}
        initial={initialState}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8"
      >
        <motion.div variants={headingVariants} className="mb-7 text-center lg:mb-9">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border-default bg-white px-3 py-1">
            <span className="inline-flex size-2 rounded-full bg-emerald-500" />
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-brand-violet">
              Đang Mở Slot · Booking Live
            </span>
          </p>

          <h2
            id="booking-heading"
            className="mb-2.5 font-display text-h-1 leading-[1.1]"
          >
            Đặt Lịch <span className="text-aurora">Tư Vấn Miễn Phí</span>
          </h2>

          <p className="mx-auto mb-3 max-w-2xl font-body text-body-sm text-text-secondary">
            20 phút Google Meet 1-1 với Tài. Mình review case của anh/chị, đề xuất
            automation flow phù hợp, không bán hàng.
          </p>

          <div className="inline-flex items-center gap-4 rounded-full border border-border-default bg-white px-3 py-1.5 text-[12px] text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold tabular-nums text-text-primary">--</span>
              <span>slot trống</span>
              <span className="text-text-tertiary">/ 7 ngày</span>
            </span>
          </div>
        </motion.div>

        <motion.div variants={widgetVariants} className="relative">
          {isDesktop === null ? null : isDesktop ? (
            <DesktopBookingWidget />
          ) : (
            <div className="mx-auto max-w-md shadow-[0_20px_50px_rgba(99,102,241,0.18)]">
              <MobileBookingWidget />
            </div>
          )}
        </motion.div>

        <p className="mt-4 text-center text-[12px] text-text-tertiary lg:mt-5">
          Thông tin bảo mật · Không spam · Hủy lịch bất kỳ lúc nào
        </p>
      </motion.div>
    </section>
  );
}

