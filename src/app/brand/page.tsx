import type { Metadata } from "next";
import Image from "next/image";
import { NavLogo } from "@/components/brand/prod-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * /brand - M1.4 verification page.
 * Owner photo (hero/avatar/square variants) + favicon previews.
 * Replaced khi build hero section thật ở Phase 03+.
 */

export const metadata: Metadata = {
  title: "Brand assets",
};

const PORTRAIT_VARIANTS = [
  {
    label: "Hero portrait (4:5)",
    sub: "Sẽ dùng ở hero section desktop",
    cls: "w-64 aspect-[4/5] rounded-2xl overflow-hidden",
  },
  {
    label: "Square (1:1)",
    sub: "Cho social cards · OG image",
    cls: "size-56 rounded-2xl overflow-hidden",
  },
  {
    label: "Circular avatar",
    sub: "Mobile hero · About section",
    cls: "size-44 rounded-full overflow-hidden",
  },
  {
    label: "B5 liquid blob mask (animated)",
    sub: "Theo animation pick - organic frame",
    cls: "size-44 overflow-hidden animate-blob-morph",
  },
];

const FAVICON_PREVIEWS = [
  { size: 16, label: "Browser tab (16×16)" },
  { size: 32, label: "Bookmark bar (32×32)" },
  { size: 48, label: "Windows app (48×48)" },
  { size: 64, label: ".ico embedded (64×64)" },
  { size: 180, label: "Apple touch icon (180×180)" },
  { size: 256, label: "PWA icon medium (256×256)" },
];

export default function BrandShowcase() {
  return (
    <div className="min-h-screen">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-border surface-glass">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <NavLogo />
          <div className="flex items-center gap-2">
            <a
              href="/components"
              className="font-display text-sm text-text-secondary hover:text-brand-violet transition-colors"
            >
              Components
            </a>
            <a
              href="/animations"
              className="font-display text-sm text-text-secondary hover:text-brand-violet transition-colors"
            >
              Animations
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="mx-auto max-w-6xl px-6 pt-12 pb-8">
        <p className="font-display text-label uppercase text-brand-violet mb-3">
          M1.4 · Brand assets
        </p>
        <h1 className="font-display text-display-2 mb-4">
          Owner photo + <span className="text-aurora">favicon</span>
        </h1>
        <p className="font-body text-body-lg text-text-secondary max-w-2xl">
          Anh check ảnh load đúng, tỉ lệ ổn, dấu hiệu tab favicon hiển thị
          (xem góc trái tab browser).
        </p>
      </header>

      {/* Owner photo variants */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-border">
        <h2 className="font-display text-h-1 mb-1">1 · Owner photo (1485×1856)</h2>
        <p className="font-body text-body-sm text-text-secondary mb-8">
          Source: <code className="font-mono">public/brand/owner-tai.png</code>
          {" - "}render qua <code className="font-mono">next/image</code> với
          priority + fill responsive.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PORTRAIT_VARIANTS.map((v) => (
            <div key={v.label} className="space-y-3">
              <div
                className={`${v.cls} relative bg-surface-elevated shadow-card border border-border-aurora-tint`}
              >
                <Image
                  src="/brand/owner-tai.png"
                  alt="Tài - AI Automation founder"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <p className="font-display font-semibold text-body-sm">
                  {v.label}
                </p>
                <p className="font-body text-body-sm text-text-tertiary">
                  {v.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hero composite preview */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-border">
        <h2 className="font-display text-h-1 mb-1">2 · Hero preview với photo</h2>
        <p className="font-body text-body-sm text-text-secondary mb-8">
          Owner photo + B3 aurora glow halo + B4 sparkles (animation picks
          locked) - preview composition Phase 03+ sẽ build chính thức.
        </p>

        <div className="relative rounded-3xl overflow-hidden bg-mesh-aurora p-12 md:p-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="font-display text-label uppercase text-brand-violet mb-4 inline-flex items-center gap-2 rounded-full surface-glass px-4 py-2 border border-border">
                <span className="size-2 rounded-full bg-brand-pink animate-pulse" />
                Tài AI Automation
              </p>
              <h3 className="font-display text-display-2 mb-4">
                Để AI <span className="text-aurora">chốt khách</span>
                <br />
                thay anh/chị
              </h3>
              <p className="font-body text-body-lg text-text-secondary">
                Demo composition - ảnh thật + glow halo + sparkles aurora.
              </p>
            </div>

            {/* Photo + B3 glow + B4 sparkles */}
            <div className="relative flex justify-center">
              {/* B3 - aurora frame glow */}
              <div
                aria-hidden
                className="absolute size-72 rounded-full bg-aurora opacity-40 blur-3xl animate-glow-pulse"
              />
              {/* B4 - sparkles */}
              {[
                { top: "8%", left: "12%", delay: "0s", size: "16px" },
                { top: "22%", right: "10%", delay: "0.7s", size: "12px" },
                { top: "44%", left: "4%", delay: "1.3s", size: "14px" },
                { bottom: "20%", right: "8%", delay: "1.9s", size: "14px" },
                { bottom: "8%", left: "20%", delay: "2.4s", size: "12px" },
              ].map((s, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute text-brand-violet animate-sparkle leading-none z-10"
                  style={{
                    top: s.top,
                    left: s.left,
                    right: s.right,
                    bottom: s.bottom,
                    fontSize: s.size,
                    animationDelay: s.delay,
                    filter: "drop-shadow(0 0 6px rgba(168,85,247,0.7))",
                  }}
                >
                  ✦
                </span>
              ))}
              <div className="relative w-56 aspect-[4/5] rounded-2xl overflow-hidden shadow-glow-violet">
                <Image
                  src="/brand/owner-tai.png"
                  alt="Tài - AI Automation founder"
                  fill
                  sizes="(max-width: 768px) 70vw, 30vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Favicon previews */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-border">
        <h2 className="font-display text-h-1 mb-1">3 · Favicon (1620×1620 → multi-size)</h2>
        <p className="font-body text-body-sm text-text-secondary mb-8">
          <code className="font-mono">app/favicon.ico</code> embed 4 sizes
          (16/32/48/64), <code className="font-mono">icon.png</code> 512×512,
          <code className="font-mono">apple-icon.png</code> 180×180. Next.js
          16 auto-detect & inject{" "}
          <code className="font-mono">&lt;link&gt;</code>.
        </p>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {FAVICON_PREVIEWS.map((f) => (
            <div key={f.size} className="text-center space-y-2">
              <div
                className="bg-surface-elevated border border-border rounded-xl p-4 flex items-center justify-center mx-auto"
                style={{ width: 88, height: 88 }}
              >
                <Image
                  src="/brand/favicon-source.png"
                  alt={`Favicon ${f.size}px`}
                  width={f.size}
                  height={f.size}
                  unoptimized
                  className="rounded"
                />
              </div>
              <p className="font-mono text-body-sm font-semibold">{f.size}px</p>
              <p className="font-body text-body-sm text-text-tertiary">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Verification checklist */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-border">
        <h2 className="font-display text-h-1 mb-4">4 · Verification</h2>
        <div className="rounded-xl bg-surface-subtle border border-border p-6 space-y-3 font-body text-body-sm">
          <p>
            ✓ <strong>Tab favicon:</strong> nhìn lên góc trái tab browser - phải thấy logo Tài AI Automation
          </p>
          <p>
            ✓ <strong>Owner photo</strong> render rõ nét, không vỡ, không stretch - 4 variants tỉ lệ khác nhau
          </p>
          <p>
            ✓ <strong>Hero composition:</strong> photo + glow halo violet pulse + sparkles ✦ nhấp nháy
          </p>
          <p>
            ✓ <strong>Toggle dark mode</strong> - ảnh + favicon vẫn nhìn rõ trong dark
          </p>
          <p>
            ✓ <strong>Mobile responsive</strong> (DevTools 375px) - grid stack đẹp, photo không tràn
          </p>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 mt-12 border-t border-border text-center text-body-sm font-body text-text-tertiary">
        Brand assets locked · M1.4 done
      </footer>
    </div>
  );
}
