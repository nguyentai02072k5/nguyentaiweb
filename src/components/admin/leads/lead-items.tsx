'use client';

/**
 * lead-items.tsx - Render 1 lead ở 2 chế độ: thẻ (LeadCard) & dòng (LeadListRow).
 *
 * Cả hai dùng chung: StatusBadge, fmtDate và AnswerList.
 * Xử lý nội dung dài:
 *  - whitespace-pre-wrap + break-words → không tràn khung, xuống dòng tự nhiên.
 *  - Khi THU: chỉ hiện vài field đầu, value bị line-clamp 2 dòng.
 *  - Khi MỞ: hiện đủ field, value đầy đủ.
 */

import { ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeadView, LeadAnswer } from '@/lib/admin/lead-view-model';

type LeadItemProps = {
  lead: LeadView;
  expanded: boolean;
  onToggle: () => void;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  deleting: boolean;
};

const STATUS_STYLE: Record<string, string> = {
  opened: 'bg-violet-50 text-violet-700 border-violet-200',
  submitted: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  contacted: 'bg-pink-50 text-pink-700 border-pink-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  spam: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-gray-50 text-gray-500 border-gray-200',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-block shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium',
      STATUS_STYLE[status] ?? STATUS_STYLE.archived,
    )}>
      {status}
    </span>
  );
}

export function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

/** Danh sách câu trả lời (luôn hiện đầy đủ - chỉ render khi card/row đã bung). */
function AnswerList({ answers }: { answers: LeadAnswer[] }) {
  return (
    <dl className="mt-3 space-y-2">
      {answers.map((a) => (
        <div key={a.key}>
          <dt className="text-text-tertiary text-[11px] font-semibold uppercase tracking-wide">
            {a.label}
          </dt>
          <dd className="text-text-primary break-words whitespace-pre-wrap text-sm">
            {/^https?:\/\//.test(a.value) ? (
              <a
                href={a.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-violet hover:text-brand-indigo font-medium underline underline-offset-2"
              >
                Mở file ↗
              </a>
            ) : (
              a.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Nội dung khi đã bung: câu trả lời + mốc mở/gửi. Dùng chung cho thẻ & dòng. */
function LeadDetail({ lead }: { lead: LeadView }) {
  return (
    <>
      {lead.answers.length > 0 ? (
        <AnswerList answers={lead.answers} />
      ) : (
        <p className="text-text-tertiary mt-3 text-sm italic">Mới mở link, chưa gửi phiếu.</p>
      )}
      <div className="text-text-tertiary mt-3 flex gap-4 border-t border-border-default/60 pt-2 text-[11px]">
        <span>Mở: {fmtDate(lead.openedAt)}</span>
        <span>Gửi: {fmtDate(lead.submittedAt)}</span>
      </div>
    </>
  );
}

function DeleteButton({ onDelete, deleting }: { onDelete: () => void; deleting: boolean }) {
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={deleting}
      aria-label="Xoá lead"
      title="Xoá lead"
      className="text-text-tertiary hover:bg-red-50 hover:text-red-600 flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-40"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Chế độ THẺ
// ---------------------------------------------------------------------------

export function LeadCard({ lead, expanded, onToggle, selected, onSelect, onDelete, deleting }: LeadItemProps) {
  return (
    <article className={cn(
      'flex flex-col rounded-2xl border bg-white/85 p-4 shadow-sm transition-colors',
      selected ? 'border-brand-violet ring-1 ring-brand-violet/40' : 'border-border-default',
    )}>
      {/* Thu gọn: chỉ tên, SĐT, trạng thái + (hàng dưới) ngày & nút bung */}
      <header className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          aria-label={`Chọn lead ${lead.phoneDisplay} để xuất`}
          className="accent-brand-violet mt-1 h-4 w-4 shrink-0 cursor-pointer"
        />
        <div className="min-w-0 flex-1">
          <p className="text-text-primary font-display text-lg font-bold tabular-nums">
            {lead.phoneDisplay}
          </p>
          <p className="text-text-secondary truncate text-sm">
            {lead.fullName ?? '— chưa có tên —'}
          </p>
        </div>
        <StatusBadge status={lead.status} />
        <DeleteButton onDelete={onDelete} deleting={deleting} />
      </header>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="mt-3 flex items-center justify-between gap-2 border-t border-border-default/60 pt-3 text-left"
      >
        <span className="text-brand-violet hover:text-brand-indigo inline-flex items-center gap-1 text-xs font-medium">
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} aria-hidden />
          {expanded ? 'Thu gọn' : 'Xem chi tiết'}
        </span>
        <span className="text-text-tertiary text-xs tabular-nums">Ngày: {fmtDate(lead.createdAt)}</span>
      </button>

      {expanded && <LeadDetail lead={lead} />}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Chế độ DANH SÁCH (gọn)
// ---------------------------------------------------------------------------

export function LeadListRow({ lead, expanded, onToggle, selected, onSelect, onDelete, deleting }: LeadItemProps) {
  return (
    <div className={cn(
      'rounded-xl border bg-white/85 shadow-sm transition-colors',
      selected ? 'border-brand-violet ring-1 ring-brand-violet/40' : 'border-border-default',
    )}>
      <div className="flex w-full items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          aria-label={`Chọn lead ${lead.phoneDisplay} để xuất`}
          className="accent-brand-violet h-4 w-4 shrink-0 cursor-pointer"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={cn('text-text-tertiary h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
          <span className="text-text-primary w-36 shrink-0 font-medium tabular-nums">
            {lead.phoneDisplay}
          </span>
          <span className="text-text-secondary min-w-0 flex-1 truncate text-sm">
            {lead.fullName ?? '— chưa có tên —'}
          </span>
          <span className="text-text-tertiary hidden shrink-0 text-xs tabular-nums sm:inline">
            {fmtDate(lead.createdAt)}
          </span>
        </button>
        <StatusBadge status={lead.status} />
        <DeleteButton onDelete={onDelete} deleting={deleting} />
      </div>

      {expanded && (
        <div className="border-t border-border-default/60 px-4 pb-4">
          <LeadDetail lead={lead} />
        </div>
      )}
    </div>
  );
}
