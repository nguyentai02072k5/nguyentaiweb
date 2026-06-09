'use client';

/**
 * templates-explorer.tsx — Trạng thái filter client cho trang kho /templates.
 * Lọc client-side instant (KISS cho ~hàng tá item). pSEO routes lo phần index.
 */

import { useMemo, useState } from 'react';
import { filterTemplates } from '@/lib/content/template-filters';
import type { TemplateSummary } from '@/lib/content/queries';
import type {
  BusinessModelSlug,
  IndustrySlug,
} from '@/lib/content/taxonomy';
import { TemplateFilterBar } from './template-filter-bar';
import { TemplateGrid } from './template-grid';

export function TemplatesExplorer({
  templates,
}: {
  templates: TemplateSummary[];
}) {
  const [model, setModel] = useState<BusinessModelSlug | null>(null);
  const [industry, setIndustry] = useState<IndustrySlug | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => filterTemplates(templates, { model, industry, query }),
    [templates, model, industry, query],
  );

  function handleModel(next: BusinessModelSlug | null) {
    setModel(next);
    setIndustry(null); // ngành phụ thuộc mô hình → reset khi đổi mô hình
  }

  function reset() {
    setModel(null);
    setIndustry(null);
    setQuery('');
  }

  return (
    <div className="flex flex-col gap-6">
      <TemplateFilterBar
        model={model}
        industry={industry}
        query={query}
        onModel={handleModel}
        onIndustry={setIndustry}
        onQuery={setQuery}
        onReset={reset}
        resultCount={filtered.length}
      />
      <TemplateGrid templates={filtered} onReset={reset} />
    </div>
  );
}
