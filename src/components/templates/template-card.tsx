import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import type { TemplateSummary } from '@/lib/content/queries';
import { Badge } from '@/components/ui/badge';
import { getBusinessModelLabel, getIndustryLabel } from '@/lib/content/taxonomy';

/**
 * template-card.tsx — Thẻ template trên trang kho + pSEO.
 * Cover dùng ảnh nếu có, không thì fallback gradient Aurora (không vỡ layout).
 * `featured` chỉ dùng cho sort/related (không render ribbon).
 */
export function TemplateCard({ template }: { template: TemplateSummary }) {
  return (
    <Link
      href={template.url}
      className="
        group flex flex-col overflow-hidden
        rounded-2xl border border-border-default bg-surface-elevated
        shadow-card transition-all duration-200
        hover:-translate-y-1 hover:shadow-lg hover:border-brand-violet/40
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
        motion-reduce:hover:translate-y-0
      "
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] overflow-hidden bg-aurora-soft">
        {template.cover ? (
          <Image
            src={template.cover}
            alt={template.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sparkles className="h-10 w-10 text-text-on-brand/70" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{getIndustryLabel(template.industry)}</Badge>
          <Badge variant="outline">
            {getBusinessModelLabel(template.businessModel)}
          </Badge>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-text-primary group-hover:text-brand-violet">
          {template.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
          {template.description}
        </p>
      </div>
    </Link>
  );
}
