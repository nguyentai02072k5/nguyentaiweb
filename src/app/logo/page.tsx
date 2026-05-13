import type { Metadata } from "next";
import { NavLogo, ProdLogo } from "@/components/brand/prod-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * /logo - Production preview.
 * 2 bản logo PNG (dương / âm) trên R2, kèm wordmark "Tài AI Automation"
 * để check tương phản, scale, real-world contexts trước khi wire vào nav/footer.
 */

export const metadata: Metadata = {
  title: "Logo design",
};

export default function LogoShowcase() {
  return (
    <div className="min-h-screen">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-border surface-glass">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <NavLogo />
          <div className="flex items-center gap-2">
            <a
              href="/brand"
              className="font-display text-sm text-text-secondary hover:text-brand-violet transition-colors"
            >
              Brand
            </a>
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
          Production · Logo preview
        </p>
        <h1 className="font-display text-display-2 mb-4">
          <span className="text-aurora">Tài AI Automation</span>
        </h1>
        <p className="font-body text-body-lg text-text-secondary max-w-2xl">
          2 bản logo production (dương / âm) wire trực tiếp từ R2, kết hợp với
          wordmark &ldquo;Tài AI Automation&rdquo;. Check tương phản, real-world contexts,
          và sizes trước khi wire vào nav/footer/OG meta.
        </p>
      </header>

      {/* Pure logo - 2 variants side by side */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-border">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-brand-violet/10 text-brand-violet">
            01
          </span>
          <h2 className="font-display text-h-1">2 bản &mdash; dương &amp; âm</h2>
        </div>
        <p className="font-body text-body-sm text-text-secondary mb-8">
          Bản dương đặt trên nền sáng. Bản âm đặt trên nền tối. Logo + wordmark
          &ldquo;Tài AI Automation&rdquo; lock-up.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <ContextCard label="Bản dương" sub="lg-prod-duong.png · light bg">
            <div className="flex items-center justify-center bg-white p-12 rounded-2xl border border-border min-h-[200px]">
              <ProdLogo variant="light" size="lg" />
            </div>
          </ContextCard>

          <ContextCard label="Bản âm" sub="lg-prod-am.png · dark bg">
            <div className="flex items-center justify-center bg-surface-inverse p-12 rounded-2xl min-h-[200px]">
              <ProdLogo variant="dark" size="lg" inverted />
            </div>
          </ContextCard>
        </div>
      </section>

      {/* Real-world contexts */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-border">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-brand-violet/10 text-brand-violet">
            02
          </span>
          <h2 className="font-display text-h-1">Real-world contexts</h2>
        </div>
        <p className="font-body text-body-sm text-text-secondary mb-8">
          Logo trong layout thực tế: nav header, dark inverse, aurora hero, footer.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Nav mock light */}
          <ContextCard label="Nav header (light)" sub="real-world · sticky top">
            <div className="flex items-center justify-between bg-surface-elevated px-6 py-4 rounded-2xl border border-border">
              <ProdLogo variant="light" size="sm" />
              <button
                type="button"
                className="rounded-full bg-aurora animate-aurora bg-[length:200%_200%] px-4 py-2 text-xs font-display font-semibold text-white shadow-glow-violet"
              >
                Đặt lịch Meet
              </button>
            </div>
          </ContextCard>

          {/* Nav mock dark */}
          <ContextCard label="Nav header (dark)" sub="real-world · inverted">
            <div className="flex items-center justify-between bg-surface-inverse px-6 py-4 rounded-2xl">
              <ProdLogo variant="dark" size="sm" inverted />
              <button
                type="button"
                className="rounded-full bg-white px-4 py-2 text-xs font-display font-semibold text-text-primary"
              >
                Đặt lịch Meet
              </button>
            </div>
          </ContextCard>

          {/* Hero banner - calm dark surface, professional */}
          <ContextCard label="Hero banner" sub="dark surface · CTA section">
            <div className="relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-12 rounded-2xl min-h-[200px]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(139,92,246,0.18),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(14,165,233,0.12),transparent_55%)]"
              />
              <div className="relative">
                <ProdLogo variant="dark" size="lg" inverted />
              </div>
            </div>
          </ContextCard>

          {/* Footer mock */}
          <ContextCard label="Footer center" sub="bg-surface-subtle · standalone">
            <div className="flex flex-col items-center justify-center gap-4 bg-surface-subtle p-12 rounded-2xl border border-border min-h-[200px]">
              <ProdLogo variant="light" size="md" />
              <p className="font-body text-body-sm text-text-tertiary">
                © 2026 Tài AI Automation
              </p>
            </div>
          </ContextCard>
        </div>
      </section>

      {/* Sizes - mark only, for avatar/app icon */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-t border-border">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-brand-pink/10 text-brand-pink">
            03
          </span>
          <h2 className="font-display text-h-1">Sizes &mdash; standalone mark</h2>
        </div>
        <p className="font-body text-body-sm text-text-secondary mb-8">
          Logo đứng độc lập (không kèm wordmark) ở nhiều size &mdash; social avatar 1:1,
          app icon mobile, app shortcut, OG fallback.
        </p>

        <div className="flex items-end gap-12 flex-wrap bg-white p-8 rounded-2xl border border-border">
          {(["sm", "md", "lg", "xl"] as const).map((size) => (
            <div key={size} className="text-center space-y-3">
              <ProdLogo variant="light" size={size} showWordmark={false} />
              <p className="font-mono text-body-sm text-text-tertiary">
                size={size}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-12 flex-wrap bg-surface-inverse p-8 rounded-2xl mt-4">
          {(["sm", "md", "lg", "xl"] as const).map((size) => (
            <div key={size} className="text-center space-y-3">
              <ProdLogo variant="dark" size={size} showWordmark={false} />
              <p className="font-mono text-body-sm text-white/60">
                size={size}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 mt-8 border-t border-border text-center text-body-sm font-body text-text-tertiary">
        Production PNG · R2 hosted · Aurora palette · Space Grotesk
      </footer>
    </div>
  );
}

function ContextCard({
  label,
  sub,
  children,
}: {
  label: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2">
        <p className="font-display font-semibold text-body-sm">{label}</p>
        <p className="font-mono text-body-sm text-text-tertiary">{sub}</p>
      </div>
      {children}
    </div>
  );
}
