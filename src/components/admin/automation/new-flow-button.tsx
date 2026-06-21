'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFlow } from '@/lib/automation/flow-actions';

export function NewFlowButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    const name = prompt('Tên flow mới:', 'Flow chào khách Zalo');
    if (name === null) return;
    setBusy(true);
    const r = await createFlow(name);
    setBusy(false);
    if (r.ok && r.id) router.push(`/admin/automation/${r.id}`);
    else alert('Lỗi: ' + r.error);
  }

  return (
    <button
      onClick={onCreate}
      disabled={busy}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {busy ? 'Đang tạo…' : '+ Tạo flow mới'}
    </button>
  );
}
