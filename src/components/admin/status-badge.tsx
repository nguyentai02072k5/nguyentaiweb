import { cn } from '@/lib/utils';

const STATUS_META: Record<
  string,
  { label: string; tone: string }
> = {
  pending: { label: 'Chờ xác nhận', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  confirmed: { label: 'Đã xác nhận', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  rescheduled: { label: 'Đã dời', tone: 'bg-blue-50 text-blue-700 ring-blue-200' },
  cancelled: { label: 'Đã huỷ', tone: 'bg-rose-50 text-rose-700 ring-rose-200' },
  completed: { label: 'Hoàn tất', tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
  'no-show': { label: 'Không đến', tone: 'bg-zinc-100 text-zinc-700 ring-zinc-300' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    tone: 'bg-zinc-100 text-zinc-700 ring-zinc-300',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
        meta.tone,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden />
      {meta.label}
    </span>
  );
}
