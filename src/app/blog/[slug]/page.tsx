import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getPostBySlug,
  getPosts,
  getRelatedPosts,
} from '@/lib/content/queries';
import { MDXContent } from '@/lib/content/mdx-runtime';
import { PostDetailHeader } from '@/components/blog/post-detail-header';
import { BlogReveal } from '@/components/blog/blog-reveal';
import { PostFaq } from '@/components/blog/post-faq';
import { RelatedPosts } from '@/components/blog/related-posts';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import {
  buildBlogPostingJsonLd,
  buildBreadcrumb,
  buildFaqPageJsonLd,
} from '@/lib/seo/json-ld';

/**
 * /blog/[slug] - Chi tiết bài viết: render MDX (prose + copy) + meta + related + CTA mềm.
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
    ...(post.faqs?.length ? [buildFaqPageJsonLd(post.faqs)] : []),
  ];

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <JsonLdScript data={jsonLd} />
      {/* Anti-FOUC: bật gate ẩn [data-reveal] TRƯỚC khi paint (no-JS / reduced-motion → bỏ qua, hiện sẵn). */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(!matchMedia('(prefers-reduced-motion:reduce)').matches)document.documentElement.setAttribute('data-reveal-ready','')}catch(e){}",
        }}
      />
      <PostDetailHeader post={post} />

      <article className="prose mt-8 max-w-none">
        <MDXContent code={post.body} />
      </article>
      <BlogReveal />

      <PostFaq faqs={post.faqs} />

      <RelatedPosts items={related} />
    </main>
  );
}
