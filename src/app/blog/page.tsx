import type { Metadata } from 'next';
import { getPostTags, getPosts } from '@/lib/content/queries';
import { PostListExplorer } from '@/components/blog/post-list-explorer';

/**
 * /blog - Danh sách bài viết (SSG). Lọc theo chủ đề + search client-side.
 */
const TITLE = 'Blog';
const DESCRIPTION =
  'Kiến thức và kinh nghiệm về chatbot AI, tự động hoá bán hàng và chăm sóc khách hàng cho shop Việt.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', url: '/blog' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function BlogPage() {
  const posts = getPosts();
  const tags = getPostTags();

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-6xl px-5 pb-14 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <header className="max-w-2xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-violet">
          Blog
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Kiến thức & Kinh nghiệm
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
          Chia sẻ thực chiến về chatbot AI, tự động hoá bán hàng và chăm sóc khách hàng -
          giúp shop của anh/chị bán tốt hơn mà nhẹ việc hơn.
        </p>
      </header>

      <div className="mt-5 sm:mt-6">
        <PostListExplorer posts={posts} tags={tags} />
      </div>
    </main>
  );
}
