import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getRelatedTemplates,
  getTemplateBySlug,
  getTemplates,
} from '@/lib/content/queries';
import { MDXContent } from '@/lib/content/mdx-runtime';
import { TemplateDetailHeader } from '@/components/templates/template-detail-header';
import { TemplateAttachments } from '@/components/templates/template-attachments';
import { SoftCta } from '@/components/content/soft-cta';
import { RelatedTemplates } from '@/components/templates/related-templates';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { buildBreadcrumb, buildTemplateJsonLd } from '@/lib/seo/json-ld';
import { getIndustryLabel } from '@/lib/content/taxonomy';

/**
 * /templates/[slug] - Chi tiết template: render MDX (prose + nút copy) + đính kèm
 * + CTA mềm + related. SSG; slug sai → 404. (JSON-LD/OG hoàn thiện ở Phase 4.)
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getTemplates().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) return {};
  const url = `/templates/${template.slug}`;
  return {
    title: template.title,
    description: template.description,
    alternates: { canonical: url },
    openGraph: {
      title: template.title,
      description: template.description,
      type: 'article',
      url,
      publishedTime: template.publishedAt,
      modifiedTime: template.updatedAt ?? template.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: template.title,
      description: template.description,
    },
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  const related = getRelatedTemplates(template, 3);

  const jsonLd = [
    buildTemplateJsonLd(template),
    buildBreadcrumb([
      { name: 'Trang chủ', path: '/' },
      { name: 'Templates', path: '/templates' },
      { name: getIndustryLabel(template.industry), path: `/templates/nganh/${template.industry}` },
      { name: template.title, path: template.url },
    ]),
  ];

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <JsonLdScript data={jsonLd} />
      <TemplateDetailHeader template={template} />

      <article className="prose mt-8 max-w-none">
        <MDXContent code={template.body} />
      </article>

      <TemplateAttachments attachments={template.attachments} />
      <SoftCta heading="Cần hỗ trợ gì cho shop của anh/chị?" location="templates_cta" />
      <RelatedTemplates items={related} />
    </main>
  );
}
