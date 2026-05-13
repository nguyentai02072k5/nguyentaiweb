import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Production logo PNG (R2-hosted).
 * - Bản dương (light variant) - dùng cho nền sáng (light theme)
 * - Bản âm (dark variant)   - dùng cho nền tối (dark theme, hero, footer dark)
 */
export const PROD_LOGO_LIGHT =
  "https://pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev/LDP-schedule/lg-prod-duong.png";
export const PROD_LOGO_DARK =
  "https://pub-2ac878ae9a3f4aadbf3e5b8feb7b39a0.r2.dev/LDP-schedule/lg-prod-am.png";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
const heightClass: Record<Size, string> = {
  xs: "h-6",
  sm: "h-8",
  md: "h-12",
  lg: "h-20",
  xl: "h-28",
};

type Variant = "light" | "dark";

/**
 * ProdLogo - full production logo (image + optional wordmark).
 * Dùng cho showcase (/logo), hero banners, footer center, sized contexts.
 * For nav header dùng NavLogo bên dưới (theme-aware compact).
 */
export function ProdLogo({
  variant,
  size = "md",
  showWordmark = true,
  inverted = false,
  className,
}: {
  variant: Variant;
  size?: Size;
  showWordmark?: boolean;
  inverted?: boolean;
  className?: string;
}) {
  const src = variant === "light" ? PROD_LOGO_LIGHT : PROD_LOGO_DARK;
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Tài AI Automation"
        className={cn(heightClass[size], "w-auto select-none rounded-2xl")}
      />
      {showWordmark && (
        <span className="inline-flex items-baseline gap-2 font-display tracking-tight whitespace-nowrap">
          <span
            className={cn(
              "font-bold text-[1.1em]",
              inverted ? "text-white" : "text-text-primary"
            )}
          >
            Tài
          </span>
          <span className="font-bold text-aurora text-[1.1em]">AI</span>
          <span
            className={cn(
              "font-semibold uppercase tracking-[0.18em] text-[0.7em]",
              inverted ? "text-white/80" : "text-text-secondary"
            )}
          >
            Automation
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * NavLogo - compact theme-aware logo cho sticky nav header.
 * Auto-swap PNG dương/âm theo theme class (Tailwind `dark:` variants).
 * Wrap trong <a href="/"> nên KHÔNG được nested trong link khác.
 */
export function NavLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Tài AI Automation - Trang chủ"
      className={cn(
        "inline-flex items-center gap-2.5 lg:gap-3 hover:opacity-80 transition-opacity",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PROD_LOGO_LIGHT}
        alt=""
        aria-hidden
        className="h-9 lg:h-12 w-auto select-none rounded-lg block dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PROD_LOGO_DARK}
        alt=""
        aria-hidden
        className="h-9 lg:h-12 w-auto select-none rounded-lg hidden dark:block"
      />
      <span className="inline-flex items-baseline gap-1.5 lg:gap-2 font-display tracking-tight whitespace-nowrap">
        <span className="font-bold text-sm lg:text-lg">Tài</span>
        <span className="font-bold text-aurora text-sm lg:text-lg">AI</span>
        <span className="font-semibold uppercase tracking-[0.18em] text-[0.62rem] lg:text-[0.72rem] text-text-secondary hidden sm:inline">
          Automation
        </span>
      </span>
    </Link>
  );
}
