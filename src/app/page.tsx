/**
 * page.tsx — Landing page root.
 *
 * Wires Hero (S1) + About (S6) + Services (S3) + TechGraph (S4)
 * + ProcessJourney (S5) + TrustStrip + Faq (S7) + Sticky CTA.
 *
 * All content sourced from LANDING constant — no hardcoded copy.
 */

import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Services } from '@/components/sections/services';
import { TechGraph } from '@/components/sections/tech-graph';
import { ProcessJourney } from '@/components/sections/process-journey';
import { TrustStrip } from '@/components/sections/trust-strip';
import { Faq } from '@/components/sections/faq';
import { StickyCtaBar } from '@/components/ui/sticky-cta-bar';
import { LANDING } from '@/content/landing';

export default function HomePage() {
  return (
    <main id="main">
      <Hero content={LANDING.hero} />
      <About content={LANDING.about} />
      <Services content={LANDING.services} />
      <TechGraph content={LANDING.techGraph} />
      <ProcessJourney content={LANDING.process} />
      <TrustStrip content={LANDING.trustStrip} />
      <Faq content={LANDING.faq} />
      <StickyCtaBar content={LANDING.stickyMobile} />
    </main>
  );
}
