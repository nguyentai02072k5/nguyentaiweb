import type { PostSummary } from '@/lib/content/queries';
import { PostCard } from './post-card';

/**
 * related-posts.tsx - Bài liên quan (tính sẵn ở queries.getRelatedPosts). Ẩn khi rỗng.
 */
export function RelatedPosts({ items }: { items: PostSummary[] }) {
  if (items.length === 0) return null;

  return (
    <section className="not-prose mt-12">
      <h2 className="font-display text-lg font-semibold text-text-primary">
        Bài viết liên quan
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {items.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
