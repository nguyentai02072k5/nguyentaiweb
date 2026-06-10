/**
 * template-filters.ts - Logic lọc template thuần (pure), KHÔNG import data.
 *
 * Tách khỏi queries.ts (vốn import `templates` từ #site/content) để client
 * component dùng được mà không kéo toàn bộ JSON template vào bundle lần nữa
 * (data đã truyền qua props từ server).
 */

import type { TemplateSummary } from './queries';
import type { BusinessModelSlug, IndustrySlug } from './taxonomy';
import { normalizeVN } from '@/lib/text/normalize-vn';

export type TemplateFilters = {
  model?: BusinessModelSlug | null;
  industry?: IndustrySlug | null;
  query?: string;
};

export function filterTemplates(
  list: TemplateSummary[],
  { model, industry, query }: TemplateFilters,
): TemplateSummary[] {
  const q = query?.trim() ? normalizeVN(query.trim()) : '';
  return list.filter((t) => {
    if (model && t.businessModel !== model) return false;
    if (industry && t.industry !== industry) return false;
    if (q) {
      const haystack = normalizeVN(`${t.title} ${t.description} ${t.tags.join(' ')}`);
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
