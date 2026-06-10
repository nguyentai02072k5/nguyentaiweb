import type { TemplateSummary } from '@/lib/content/queries';
import { TemplateCard } from './template-card';
import { TemplateEmptyState } from './template-empty-state';

/**
 * template-grid.tsx - Lưới thẻ template dùng chung (trang kho + pSEO ngành).
 */
export function TemplateGrid({
  templates,
  onReset,
}: {
  templates: TemplateSummary[];
  /** Hiện nút reset trong empty state (chỉ dùng ở trang kho có filter). */
  onReset?: () => void;
}) {
  if (templates.length === 0) {
    return <TemplateEmptyState onReset={onReset} />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard key={template.slug} template={template} />
      ))}
    </div>
  );
}
