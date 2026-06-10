import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import type { PostSummary } from '@/lib/content/queries';
import { Badge } from '@/components/ui/badge';
import { CoverImage } from '@/components/content/cover-image';
import { formatDateLong } from '@/lib/format/date-vn';

/**
 * post-card.tsx - Thẻ bài blog (cover fallback gradient, tag, ngày + thời gian đọc).
 */
export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={post.url}
      className="
        group flex flex-col overflow-hidden
        rounded-2xl border border-border-default bg-surface-elevated
        shadow-card transition-all duration-200
        hover:-translate-y-1 hover:border-brand-violet/40 hover:shadow-lg
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
        motion-reduce:hover:translate-y-0
      "
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-aurora-soft">
        <CoverImage
          src={post.cover}
          alt={post.title}
          fallback={<Newspaper className="h-10 w-10 text-text-on-brand/70" />}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-text-primary group-hover:text-brand-violet">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
          {post.description}
        </p>
        <p className="mt-auto pt-1 text-xs text-text-tertiary">
          {formatDateLong(new Date(post.publishedAt))} · {post.metadata.readingTime} phút đọc
        </p>
      </div>
    </Link>
  );
}
