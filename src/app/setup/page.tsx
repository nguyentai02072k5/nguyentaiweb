import { SetupVideoHub } from '@/components/setup/setup-video-hub';
import {
  SetupFaq,
  SetupFooter,
  SetupHeader,
  SetupHero,
  SetupPain,
  SetupPricing,
  SetupProof,
  SetupRoadmap,
  SetupSoftCta,
} from '@/components/setup/setup-sections';
import { SetupReveal } from '@/components/setup/setup-reveal';
import { SetupStickyBar } from '@/components/setup/setup-sticky-bar';

/**
 * LDP Setup Chatbot AI. Thứ tự theo tâm lý khách đến từ Mess:
 * hero (hứa hẹn rõ + hội thoại mô phỏng) → VIDEO NGAY (giá trị trước) → CTA mềm → nỗi đau
 * → bằng chứng → lộ trình 7 ngày → gói Setup + Zalo → FAQ. Không gate, không form: lối chuyển đổi duy nhất là Zalo.
 */
export default function SetupPage() {
  return (
    <>
      <SetupHeader />
      <main>
        <SetupHero />
        <section className="sp-video" id="video">
          <div className="sp-wrap">
            <SetupVideoHub />
          </div>
        </section>
        <SetupSoftCta />
        <SetupPain />
        <SetupProof />
        <SetupRoadmap />
        <SetupPricing />
        <SetupFaq />
      </main>
      <SetupFooter />
      <SetupStickyBar />
      <SetupReveal />
    </>
  );
}
