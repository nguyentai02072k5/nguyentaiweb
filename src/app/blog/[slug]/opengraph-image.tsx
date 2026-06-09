import { ImageResponse } from 'next/og';
import { getPostBySlug, getPosts } from '@/lib/content/queries';
import { loadOgFonts } from '@/lib/seo/og-fonts';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from '@/lib/seo/og-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Bài viết — Tài AI Automation';
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OgCard eyebrow="Blog" title={post?.title ?? 'Bài viết'} />,
    { ...OG_SIZE, fonts },
  );
}
