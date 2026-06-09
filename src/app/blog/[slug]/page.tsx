import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getPostBySlug,
  getPosts,
  getRelatedPosts,
} from '@/lib/content/queries';
import { MDXContent } from '@/lib/content/mdx-runtime';
import { PostDetailHeader } from '@/components/blog/post-detail-header';
import { RelatedPosts } from '@/components/blog/related-posts';
import { SoftCta } from '@/components/content/soft-cta';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { buildBlogPostingJsonLd, buildBreadcrumb } from '@/lib/seo/json-ld';

/**
 * /blog/[slug] — Chi tiết bài viết: render MDX (prose + copy) + meta + related + CTA mềm.
 * SSG (loại draft); slug sai/draft → 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author ?? 'Tài'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);

  const jsonLd = [
    buildBlogPostingJsonLd(post),
    buildBreadcrumb([
      { name: 'Trang chủ', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: post.url },
    ]),
  ];

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <JsonLdScript data={jsonLd} />
      <PostDetailHeader post={post} />

      <article className="prose mt-8 max-w-none">
        <MDXContent code={post.body} />
      </article>

      <SoftCta heading="Muốn áp dụng vào shop của anh/chị?" location="blog_cta" />
      <RelatedPosts items={related} />
    </main>
  );
}
