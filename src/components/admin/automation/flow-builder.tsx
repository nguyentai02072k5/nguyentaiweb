'use client';

// Builder dạng step-list kéo-thả: thêm/xóa/sắp xếp bước, cấu hình, lưu, chạy thử.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type AutomationFlow,
  type FlowStep,
  type StepType,
  STEP_META,
  TRIGGER_SOURCES,
} from '@/lib/automation/flow-types';
import { makeSampleSteps } from '@/lib/automation/sample-template';
import { saveFlow, deleteFlow, testTriggerFlow } from '@/lib/automation/flow-actions';
import { MessageFormatEditor } from './message-format-editor';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'step-' + Math.random().toString(36).slice(2);

function newStep(type: StepType): FlowStep {
  if (type === 'delay_webhook') return { id: uid(), type, config: { url: '', label: '' } };
  if (type === 'check_form')
    return { id: uid(), type, config: { source: '', messageFilled: '', messageNotFilled: '' } };
  return { id: uid(), type, config: { message: '' } };
}

export function FlowBuilder({ initialFlow }: { initialFlow: AutomationFlow }) {
  const router = useRouter();
  const [name, setName] = useState(initialFlow.name);
  const [enabled, setEnabled] = useState(initialFlow.enabled);
  const [source, setSource] = useState(initialFlow.trigger_source ?? '');
  const [steps, setSteps] = useState<FlowStep[]>(initialFlow.steps ?? []);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [testPhone, setTestPhone] = useState('');
  const [testName, setTestName] = useState('');
  const [testLink, setTestLink] = useState('');
  const [testing, setTesting] = useState(false);

  function patchStep(id: string, patch: Partial<FlowStep['config']>) {
    setSteps((s) => s.map((st) => (st.id === id ? { ...st, config: { ...st.config, ...patch } } : st)));
  }
  function removeStep(id: string) {
    setSteps((s) => s.filter((st) => st.id !== id));
  }
  function reorder(from: number, to: number) {
    if (from === to) return;
    setSteps((s) => {
      const next = [...s];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function onSave() {
    setSaving(true);
    setStatus('');
    const r = await saveFlow({ id: initialFlow.id, name, enabled, trigger_source: source || null, steps });
    setSaving(false);
    setStatus(r.ok ? '✅ Đã lưu.' : '❌ ' + r.error);
  }

  async function onDelete() {
    if (!confirm('Xóa flow này?')) return;
    const r = await deleteFlow(initialFlow.id);
    if (r.ok) router.push('/admin/automation');
    else setStatus('❌ ' + r.error);
  }

  async function onTest() {
    if (!testPhone) {
      setStatus('Nhập số điện thoại để chạy thử.');
      return;
    }
    setTesting(true);
    setStatus('Đang lưu + chạy thử…');
    await saveFlow({ id: initialFlow.id, name, enabled, trigger_source: source || null, steps });
    const r = await testTriggerFlow({ flowId: initialFlow.id, phone: testPhone, name: testName, linkMeet: testLink });
    setTesting(false);
    setStatus(r.ok ? '✅ Đã trigger flow (xem Zalo người nhận).' : '❌ ' + r.error);
  }

  return (
    <div className="space-y-5">
      {/* Cấu hình flow */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-gray-500">Tên flow</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Nguồn kích hoạt</span>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              {TRIGGER_SOURCES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Bật flow (tự chạy khi có trigger)
          </label>
          <button onClick={onSave} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Đang lưu…' : 'Lưu'}
          </button>
          <button onClick={() => setSteps(makeSampleSteps())} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            Nạp mẫu
          </button>
          <button onClick={onDelete} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600">
            Xóa flow
          </button>
          {status && <span className="text-sm text-gray-600">{status}</span>}
        </div>
      </div>

      {/* Danh sách bước */}
      <div className="space-y-3">
        {steps.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Chưa có bước nào. Bấm “Nạp mẫu” hoặc thêm bước bên dưới.
          </p>
        )}
        {steps.map((step, i) => {
          const meta = STEP_META[step.type];
          return (
            <div
              key={step.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null) reorder(dragIdx, i);
                setDragIdx(null);
              }}
              className={`rounded-xl border bg-white p-4 ${dragIdx === i ? 'border-blue-400 opacity-60' : 'border-gray-200'}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragEnd={() => setDragIdx(null)}
                  className="cursor-grab select-none text-gray-400"
                  title="Kéo để sắp xếp"
                >
                  ⠿
                </span>
                <span className="text-lg">{meta.icon}</span>
                <span className="font-medium">{i + 1}. {meta.label}</span>
                <span className="ml-auto text-xs text-gray-400">{meta.hint}</span>
                <button onClick={() => removeStep(step.id)} className="ml-2 text-sm text-red-500">✕</button>
              </div>

              {step.type === 'delay_webhook' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs text-gray-500">Webhook URL (n8n)</span>
                    <input value={step.config.url ?? ''} onChange={(e) => patchStep(step.id, { url: e.target.value })} placeholder="https://webhook.mooly.vn/..." className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500">Nhãn (mô tả)</span>
                    <input value={step.config.label ?? ''} onChange={(e) => patchStep(step.id, { label: e.target.value })} placeholder="Chờ tới gần giờ hẹn" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </label>
                  <p className="text-xs text-gray-400 sm:col-span-2">
                    Worker POST {`{runId, resumeToken, resumeUrl, phone, context}`} tới URL này; n8n giữ thời gian rồi gọi lại resumeUrl để chạy tiếp (SĐT tự khôi phục từ run state).
                  </p>
                </div>
              ) : step.type === 'check_form' ? (
                <div className="space-y-3">
                  <label className="block sm:max-w-xs">
                    <span className="text-xs text-gray-500">Nguồn lead cần check</span>
                    <select value={step.config.source ?? ''} onChange={(e) => patchStep(step.id, { source: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                      {TRIGGER_SOURCES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                  <div>
                    <div className="mb-1 text-xs font-medium text-green-700">✅ Tin gửi khi ĐÃ điền form</div>
                    <MessageFormatEditor value={step.config.messageFilled ?? ''} onChange={(v) => patchStep(step.id, { messageFilled: v })} />
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-medium text-amber-700">⏳ Tin gửi khi CHƯA điền form</div>
                    <MessageFormatEditor value={step.config.messageNotFilled ?? ''} onChange={(v) => patchStep(step.id, { messageNotFilled: v })} />
                  </div>
                  <p className="text-xs text-gray-400">
                    Check bảng <code>leads</code> theo SĐT (form_filled = đã submit). Dùng biến <code>{'{{trang_thai}}'}</code> nếu cần.
                  </p>
                </div>
              ) : (
                <MessageFormatEditor value={step.config.message ?? ''} onChange={(v) => patchStep(step.id, { message: v })} />
              )}
            </div>
          );
        })}
      </div>

      {/* Thêm bước */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STEP_META) as StepType[]).map((t) => (
          <button key={t} onClick={() => setSteps((s) => [...s, newStep(t)])} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
            + {STEP_META[t].icon} {STEP_META[t].label}
          </button>
        ))}
      </div>

      {/* Chạy thử */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="mb-2 text-sm font-medium text-amber-800">Chạy thử (gửi thật tới Zalo)</div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="SĐT người nhận" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="Tên (cho {{ten}})" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input value={testLink} onChange={(e) => setTestLink(e.target.value)} placeholder="Link Meet (cho {{link_meet}})" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <button onClick={onTest} disabled={testing} className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {testing ? 'Đang chạy…' : 'Lưu & chạy thử'}
        </button>
      </div>
    </div>
  );
}
