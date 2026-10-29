import { SetupVideoHub } from '@/components/setup/setup-video-hub';
import {
  SetupFaq,
  SetupFooter,
  SetupHeader,
  SetupHero,
  SetupPain,
  SetupPricing,
  SetupProof,
  SetupSoftCta,
} from '@/components/setup/setup-sections';
import { SetupStickyBar } from '@/components/setup/setup-sticky-bar';

/**
 * LDP Setup Chatbot AI. Thứ tự theo tâm lý khách đến từ Mess:
 * hero (hứa hẹn rõ) → VIDEO NGAY (giá trị trước) → CTA mềm → nỗi đau → bằng chứng
 * → gói Setup + Zalo → FAQ. Không gate, không form: lối chuyển đổi duy nhất là Zalo.
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
        <SetupPricing />
        <SetupFaq />
      </main>
      <SetupFooter />
      <SetupStickyBar />
    </>
  );
}
