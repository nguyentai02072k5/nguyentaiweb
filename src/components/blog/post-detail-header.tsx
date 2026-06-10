import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { PostSummary } from '@/lib/content/queries';
import { Badge } from '@/components/ui/badge';
import { formatDateLong } from '@/lib/format/date-vn';

/**
 * post-detail-header.tsx - Breadcrumb + tags + tiêu đề + tác giả/ngày/thời gian đọc.
 */
export function PostDetailHeader({ post }: { post: PostSummary }) {
  return (
    <header>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-sm text-text-tertiary"
      >
        <Link href="/" className="hover:text-text-primary">
          Trang chủ
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/blog" className="hover:text-text-primary">
          Blog
        </Link>
      </nav>

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
        {post.title}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-text-secondary">
        {post.description}
      </p>
      <p className="mt-3 text-xs text-text-tertiary">
        {post.author ?? 'Tài'} · {formatDateLong(new Date(post.publishedAt))} ·{' '}
        {post.metadata.readingTime} phút đọc
      </p>
    </header>
  );
}
