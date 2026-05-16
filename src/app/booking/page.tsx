/**
 * /booking — Preview-only showcase route.
 *
 * Shows 2 variants per phase 06 step (date / slot / form / thank-you) side-by-side.
 * Mobile: stack vertically. Desktop: A vs B columns.
 * NO API calls — all components use static mock data.
 *
 * After anh chốt combo (vd "A1 + B2 + C1 + D2"), em integrate vào main `/` page
 * với real API. /booking route được giữ làm reference, hoặc xoá đi.
 */

import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { NavLogo } from '@/components/brand/prod-logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { DatePickerHorizontal } from '@/components/booking/variants/date-picker-horizontal';
import { DatePickerGrid } from '@/components/booking/variants/date-picker-grid';
import { SlotPickerGrouped } from '@/components/booking/variants/slot-picker-grouped';
import { SlotPickerFlat } from '@/components/booking/variants/slot-picker-flat';
import { UnifiedSchedulePicker } from '@/components/booking/variants/unified-schedule-picker';
import { UnifiedScheduleMobile } from '@/components/booking/variants/unified-schedule-mobile';
import { DesktopTicket } from '@/components/booking/variants/desktop-ticket';
import { PhoneFrame } from '@/components/booking/foundation/phone-frame';
import { FormSingleColumn } from '@/components/booking/variants/form-single-column';
import { FormSectioned } from '@/components/booking/variants/form-sectioned';
import { ThankYouCard } from '@/components/booking/variants/thank-you-card';
import { ThankYouCelebration } from '@/components/booking/variants/thank-you-celebration';
import { ThankYouTech } from '@/components/booking/variants/thank-you-tech';

export const metadata: Metadata = {
  title: 'Booking variants — preview',
  robots: { index: false, follow: false },
};

// Wrapper: mobile variant rendered inside phone-frame mockup
function MobileFramed() {
  return (
    <PhoneFrame>
      <UnifiedScheduleMobile />
    </PhoneFrame>
  );
}

const SECTIONS = [
  {
    id: 'mobile',
    step: '📱 Mobile preview',
    title: 'Mobile version trong phone frame',
    fullWidth: true,
    variants: [
      {
        id: 'E1m',
        label: 'E1m · Unified mobile (375×740)',
        summary: 'Mobile-first redesign · Horizontal scroll-snap day strip · 3-col slot grid touch-friendly · Sticky bottom CTA thumb-zone · Slot reveal animation 0.3s. Test thật bằng DevTools 375px hoặc scan QR.',
        Component: MobileFramed,
      },
    ],
  },
  {
    id: 'desktop-ticket',
    step: '⭐ Recommend (desktop · NEW)',
    title: 'Desktop ticket — schedule + form trong 1 vé ngang',
    fullWidth: true,
    variants: [
      {
        id: 'F1',
        label: 'F1 · Desktop unified ticket',
        summary: 'Big horizontal ticket · vertical dashed perforation @58% chia trái-phải · 2 notches semicircle top+bottom · Left: 7-day strip + 4-col slot grid + selected summary · Right: form 4-field + needs + consent + CTA · Tech vibe (grid backdrop + 4 corner brackets).',
        Component: DesktopTicket,
      },
    ],
  },
  {
    id: 'unified',
    step: 'Desktop variant cũ',
    title: 'Unified schedule (date + slot trong 1 widget)',
    fullWidth: true,
    variants: [
      {
        id: 'E1',
        label: 'E1 · Unified schedule picker',
        summary: 'Date + slot tích hợp 1 widget · Lock 7 ngày từ thời gian mở form · Heatmap-bar visualize availability · Period color bands · Glass card + grid backdrop tech vibe. Tap day → slot reveal smooth trong cùng card.',
        Component: UnifiedSchedulePicker,
      },
    ],
  },
  {
    id: 'date',
    step: 'Bước 1 (legacy split)',
    title: 'Chọn ngày — variants cũ',
    variants: [
      { id: 'A1', label: 'A1 · Horizontal scroll chips', summary: 'Swipe sang ngang, scroll-snap, chip lớn — cảm giác "schedule strip".', Component: DatePickerHorizontal },
      { id: 'A2', label: 'A2 · Compact week grid',        summary: 'Tất cả ngày visible một lúc trong grid 4-col, không scroll.',     Component: DatePickerGrid },
    ],
  },
  {
    id: 'slot',
    step: 'Bước 2 (legacy split)',
    title: 'Chọn giờ — variants cũ',
    variants: [
      { id: 'B1', label: 'B1 · Period-grouped',  summary: 'Group theo time-of-day với emoji header, 2-col button cards.', Component: SlotPickerGrouped },
      { id: 'B2', label: 'B2 · Flat sorted list', summary: 'List theo thứ tự thời gian, period tag bên phải, compact.',   Component: SlotPickerFlat },
    ],
  },
  {
    id: 'form',
    step: 'Bước 4',
    title: 'Thông tin liên hệ',
    variants: [
      { id: 'C1', label: 'C1 · Single column',    summary: 'One field per row, sequential flow, classic UX.',         Component: FormSingleColumn },
      { id: 'C2', label: 'C2 · Sectioned cards',  summary: '3 card sections (Liên hệ / Nhu cầu / Xác nhận), chunked.', Component: FormSectioned },
    ],
  },
  {
    id: 'thank-you',
    step: 'Sau submit',
    title: 'Thank-you',
    variants: [
      { id: 'D1', label: 'D1 · Inline card',           summary: 'Compact card với checkmark + detail rows, tối giản.',                                              Component: ThankYouCard },
      { id: 'D2', label: 'D2 · Celebration',           summary: 'Aurora gradient + confetti dots + animated checkmark — "wow" warm.',                              Component: ThankYouCelebration },
      { id: 'D3', label: 'D3 · Tech HUD (new)',         summary: 'Dark mesh gradient bg + sonar pulse rings + scanning line + corner brackets — AI automation vibe.', Component: ThankYouTech },
    ],
  },
];

export default function BookingPreviewPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-border-default surface-glass backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <NavLogo />
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/brand"      className="hidden sm:inline font-display text-sm text-text-secondary hover:text-brand-violet transition-colors">Brand</a>
            <a href="/components" className="hidden sm:inline font-display text-sm text-text-secondary hover:text-brand-violet transition-colors">Components</a>
            <a href="/animations" className="hidden sm:inline font-display text-sm text-text-secondary hover:text-brand-violet transition-colors">Animations</a>
            <span className="hidden sm:inline font-display text-sm text-brand-violet font-semibold">Booking</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 pt-10 pb-6">
        <p className="font-display text-label uppercase tracking-wider text-brand-violet mb-3">
          Phase 06 · Booking variants
        </p>
        <h1 className="font-display text-display-2 mb-4">
          Chọn <span className="text-aurora">combo</span> ưng ý
        </h1>
        <p className="font-body text-body-lg text-text-secondary max-w-3xl">
          4 bước trong booking flow, mỗi bước 2 variant. So sánh visual + thử
          tap để chọn. Sau khi anh chốt (vd: <code className="px-2 py-0.5 rounded bg-surface-subtle text-sm">A1 + B2 + C1 + D2</code>),
          em tích hợp combo đó vào main page với real API.
        </p>

        {/* Quick anchor nav */}
        <div className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="font-display text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border border-border-default bg-white hover:border-brand-violet hover:text-brand-violet transition"
            >
              {s.step}: {s.title}
            </a>
          ))}
        </div>
      </header>

      {/* 4 sections — main wrapper max-w-7xl để desktop-ticket showcase
          được rộng. Nav/header/footer giữ max-w-6xl (site standard). */}
      <main className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pb-20 space-y-16">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <div className="mb-5">
              <p className="font-display text-label uppercase tracking-wider text-text-tertiary">
                {section.step}
              </p>
              <h2 className="font-display text-h-1 font-bold mt-1">{section.title}</h2>
            </div>

            <div className={cn(
              'grid grid-cols-1 gap-6',
              section.fullWidth
                ? (section.id === 'desktop-ticket' ? 'max-w-7xl mx-auto' : 'max-w-3xl mx-auto')
                : section.variants.length === 3 ? 'lg:grid-cols-3'
                : 'lg:grid-cols-2',
            )}>
              {section.variants.map((v) => (
                <div key={v.id} className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display font-semibold text-brand-violet">{v.label}</h3>
                  </div>
                  <p className="text-sm text-text-secondary">{v.summary}</p>
                  <v.Component />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer hint */}
      <footer className="border-t border-border-default bg-surface-subtle">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-8 text-center">
          <p className="font-display text-sm text-text-secondary">
            Sau khi chốt, báo em <strong className="text-text-primary">tổ hợp 4 ID</strong> (vd: A1 + B2 + C1 + D2) để integrate.
          </p>
          <p className="text-xs text-text-tertiary mt-2">
            Preview-only · Mock data · KHÔNG insert DB
          </p>
        </div>
      </footer>
    </div>
  );
}
