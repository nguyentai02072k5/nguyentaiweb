import { ImageResponse } from 'next/og';
import { loadOgFonts } from '@/lib/seo/og-fonts';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from '@/lib/seo/og-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Blog - Tài AI Automation';

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OgCard eyebrow="Blog" title="Kiến thức & Kinh nghiệm" />,
    { ...OG_SIZE, fonts },
  );
}
