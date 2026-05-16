export function BookingStatsSkeleton() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-border-default text-[12px] text-text-secondary">
      <span className="font-semibold tabular-nums text-text-primary">â€¦</span>
      <span>slot trá»‘ng</span>
      <span className="text-text-tertiary">/ 7 ngÃ y</span>
    </div>
  );
}

export function BookingWidgetSkeleton({ variant }: { variant: 'desktop' | 'mobile' | 'responsive' }) {
  const desktop = variant === 'desktop' || variant === 'responsive';
  const mobile = variant === 'mobile' || variant === 'responsive';

  return (
    <>
      {desktop && (
        <div className="hidden lg:block rounded-[2rem] border border-border-default bg-white/80 p-6 shadow-[0_20px_50px_rgba(99,102,241,0.12)]">
          <div className="grid grid-cols-[1fr_1.15fr] gap-5">
            <div className="space-y-3">
              <div className="h-9 w-44 rounded-xl bg-surface-subtle" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-surface-subtle" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-10 rounded-xl bg-surface-subtle" />
              <div className="h-28 rounded-xl bg-surface-subtle" />
              <div className="h-12 rounded-xl bg-surface-subtle" />
            </div>
          </div>
        </div>
      )}
      {mobile && (
        <div className="lg:hidden mx-auto max-w-md rounded-[1.5rem] border border-border-default bg-white/85 p-4 shadow-[0_20px_50px_rgba(99,102,241,0.14)]">
          <div className="space-y-3">
            <div className="h-8 w-36 rounded-xl bg-surface-subtle" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 rounded-xl bg-surface-subtle" />
            ))}
            <div className="h-11 rounded-xl bg-surface-subtle" />
          </div>
        </div>
      )}
    </>
  );
}
