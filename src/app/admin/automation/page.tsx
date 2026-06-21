import Link from 'next/link';
import type { Metadata } from 'next';
import { listFlows } from '@/lib/automation/flow-actions';
import { TRIGGER_SOURCES, type AutomationFlow } from '@/lib/automation/flow-types';
import { NewFlowButton } from '@/components/admin/automation/new-flow-button';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Automation · Admin',
  robots: { index: false, follow: false },
};

const sourceLabel = (v: string | null) =>
  TRIGGER_SOURCES.find((t) => t.value === (v ?? ''))?.label ?? 'Mọi nguồn';

export default async function AutomationListPage() {
  let flows: AutomationFlow[];
  let error = '';
  try {
    flows = await listFlows();
  } catch (e) {
    error = (e as Error).message;
    flows = [];
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-blue-600">← Admin</Link>
          <h1 className="mt-1 text-xl font-semibold">Automation Zalo</h1>
          <p className="text-sm text-gray-500">Thiết kế flow tự động: kết bạn → nhắn tin → hẹn giờ.</p>
        </div>
        <NewFlowButton />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Lỗi: {error} — đã chạy migration 0013 chưa?
        </div>
      )}

      <div className="mt-6 space-y-3">
        {flows.length === 0 && !error && (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            Chưa có flow nào. Bấm “Tạo flow mới” để bắt đầu.
          </p>
        )}
        {flows.map((f) => (
          <Link
            key={f.id}
            href={`/admin/automation/${f.id}`}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300"
          >
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${f.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
              title={f.enabled ? 'Đang bật' : 'Đang tắt'}
            />
            <div className="min-w-0">
              <div className="truncate font-medium">{f.name}</div>
              <div className="text-xs text-gray-500">
                {sourceLabel(f.trigger_source)} · {(f.steps?.length ?? 0)} bước
              </div>
            </div>
            <span className="ml-auto text-sm text-gray-400">Mở →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
