import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Template } from '#site/content';
import { Badge } from '@/components/ui/badge';
import {
  getBusinessModelLabel,
  getIndustryLabel,
} from '@/lib/content/taxonomy';
import { formatDateLong } from '@/lib/format/date-vn';

/**
 * template-detail-header.tsx - Breadcrumb + badges 3 chiều + tiêu đề + ngày cập nhật.
 * Breadcrumb link ngành về trang pSEO (internal linking tốt cho SEO).
 */
export function TemplateDetailHeader({ template }: { template: Template }) {
  const updated = formatDateLong(
    new Date(template.updatedAt ?? template.publishedAt),
  );

  return (
    <header>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-sm text-text-tertiary"
      >
        <Link href="/" className="hover:text-text-primary">
          Trang chủ
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/templates" className="hover:text-text-primary">
          Templates
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link
          href={`/templates/nganh/${template.industry}`}
          className="hover:text-text-primary"
        >
          {getIndustryLabel(template.industry)}
        </Link>
      </nav>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="secondary">
          {getBusinessModelLabel(template.businessModel)}
        </Badge>
        <Badge variant="secondary">{getIndustryLabel(template.industry)}</Badge>
      </div>

      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
        {template.title}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-text-secondary">
        {template.description}
      </p>
      <p className="mt-3 text-xs text-text-tertiary">Cập nhật {updated}</p>
    </header>
  );
}
