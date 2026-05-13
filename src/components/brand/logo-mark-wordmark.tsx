import { cn } from "@/lib/utils";

/**
 * Variant B - Mark + Wordmark.
 * Aurora-filled rounded-square mark với letter "T" + pink corner dot accent,
 * placed beside uppercase tracked wordmark.
 *
 * Best for: nav (mark provides visual anchor), social avatar (mark alone),
 * email header. Mark có thể đứng độc lập làm icon.
 */
export function LogoMarkWordmark({
  className,
  showWordmark = true,
  size = "md",
  inverted = false,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}) {
  const markSizes = {
    sm: "size-7 text-base",
    md: "size-9 text-lg",
    lg: "size-12 text-2xl",
  } as const;

  const dotSizes = {
    sm: "size-1.5",
    md: "size-2",
    lg: "size-2.5",
  } as const;

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {/* Mark - aurora rounded square với "T" + pink dot */}
      <Mark size={markSizes[size]} dotSize={dotSizes[size]} />

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={cn(
            "font-display tracking-tight whitespace-nowrap",
            inverted ? "text-white" : "text-text-primary"
          )}
        >
          <span className="font-bold">Tài AI</span>{" "}
          <span
            className={cn(
              "font-semibold uppercase tracking-[0.14em] text-[0.7em]",
              inverted ? "text-white/85" : "text-text-secondary"
            )}
          >
            Automation
          </span>
        </span>
      )}
    </span>
  );
}

/** Mark only - usable standalone as icon/avatar */
export function LogoMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const markSizes = {
    sm: "size-7 text-base",
    md: "size-9 text-lg",
    lg: "size-12 text-2xl",
  } as const;
  const dotSizes = {
    sm: "size-1.5",
    md: "size-2",
    lg: "size-2.5",
  } as const;
  return (
    <span className={className}>
      <Mark size={markSizes[size]} dotSize={dotSizes[size]} />
    </span>
  );
}

function Mark({ size, dotSize }: { size: string; dotSize: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl bg-aurora animate-aurora bg-[length:200%_200%] font-display font-extrabold text-white shadow-md",
        size
      )}
    >
      T
      <span
        className={cn(
          "absolute -top-0.5 -right-0.5 rounded-full bg-brand-pink shadow-glow-pink",
          dotSize
        )}
      />
    </span>
  );
}
