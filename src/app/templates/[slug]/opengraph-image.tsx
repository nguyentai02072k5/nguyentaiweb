import { ImageResponse } from 'next/og';
import { getTemplateBySlug, getTemplates } from '@/lib/content/queries';
import { getBusinessModelLabel, getIndustryLabel } from '@/lib/content/taxonomy';
import { loadOgFonts } from '@/lib/seo/og-fonts';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from '@/lib/seo/og-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Template Instruction — Tài AI Automation';
export const dynamicParams = false;

export function generateStaticParams() {
  return getTemplates().map((t) => ({ slug: t.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  const fonts = await loadOgFonts();
  const eyebrow = template
    ? `${getIndustryLabel(template.industry)} · ${getBusinessModelLabel(template.businessModel)}`
    : 'Template';
  return new ImageResponse(
    <OgCard eyebrow={eyebrow} title={template?.title ?? 'Template Instruction'} />,
    { ...OG_SIZE, fonts },
  );
}
