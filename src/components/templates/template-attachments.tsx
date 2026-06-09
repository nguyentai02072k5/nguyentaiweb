import { Download } from 'lucide-react';
import type { Template } from '#site/content';

/**
 * template-attachments.tsx — Phần file/ảnh đính kèm (nếu template có).
 * Ẩn hoàn toàn khi không có attachments.
 */
export function TemplateAttachments({
  attachments,
}: {
  attachments: Template['attachments'];
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <section className="not-prose mt-8 rounded-2xl border border-border-default bg-surface-subtle/50 p-5">
      <h2 className="font-display text-base font-semibold text-text-primary">
        Tài liệu đính kèm
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {attachments.map((file) => (
          <li key={file.href}>
            <a
              href={file.href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2 rounded-lg px-3 py-2
                text-sm font-medium text-text-secondary
                transition-colors hover:bg-surface-elevated hover:text-brand-violet
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40
              "
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              {file.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
