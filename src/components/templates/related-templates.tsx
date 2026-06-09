import type { TemplateSummary } from '@/lib/content/queries';
import { TemplateCard } from './template-card';

/**
 * related-templates.tsx — Template liên quan (đã tính sẵn ở queries.getRelatedTemplates).
 * Ẩn section khi không có item. 2 cột (vừa cột đọc max-w-3xl).
 */
export function RelatedTemplates({ items }: { items: TemplateSummary[] }) {
  if (items.length === 0) return null;

  return (
    <section className="not-prose mt-12">
      <h2 className="font-display text-lg font-semibold text-text-primary">
        Template liên quan
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {items.map((template) => (
          <TemplateCard key={template.slug} template={template} />
        ))}
      </div>
    </section>
  );
}
