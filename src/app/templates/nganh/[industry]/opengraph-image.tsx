import { ImageResponse } from 'next/og';
import { getIndustriesWithTemplates } from '@/lib/content/queries';
import { getIndustry } from '@/lib/content/taxonomy';
import { loadOgFonts } from '@/lib/seo/og-fonts';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from '@/lib/seo/og-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Template theo ngành - Tài AI Automation';
export const dynamicParams = false;

export function generateStaticParams() {
  return getIndustriesWithTemplates().map((i) => ({ industry: i.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry } = await params;
  const ind = getIndustry(industry);
  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OgCard
      eyebrow="Template theo ngành"
      title={ind ? `Template ${ind.label}` : 'Template'}
    />,
    { ...OG_SIZE, fonts },
  );
}
