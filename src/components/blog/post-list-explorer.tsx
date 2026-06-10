'use client';

/**
 * post-list-explorer.tsx - Lọc bài blog theo chủ đề (tag) + search không dấu.
 * Tông minimal khớp filter của Templates (track xám, ô chọn nổi nền trắng).
 */

import { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import type { PostSummary } from '@/lib/content/queries';
import { normalizeVN } from '@/lib/text/normalize-vn';
import { Input } from '@/components/ui/input';
import { PostCard } from './post-card';

function TagButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        whitespace-nowrap rounded-full px-3.5 py-1.5
        font-display text-sm transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40
        ${
          active
            ? 'bg-surface-elevated font-semibold text-text-primary shadow-sm'
            : 'font-medium text-text-tertiary hover:text-text-secondary'
        }
      `}
    >
      {children}
    </button>
  );
}

export function PostListExplorer({
  posts,
  tags,
}: {
  posts: PostSummary[];
  tags: string[];
}) {
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim() ? normalizeVN(query.trim()) : '';
    return posts.filter((p) => {
      if (tag && !p.tags.some((t) => t === tag)) return false;
      if (q) {
        const hay = normalizeVN(`${p.title} ${p.description} ${p.tags.join(' ')}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, tag, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface-elevated/60 p-3 sm:p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div
          role="group"
          aria-label="Lọc theo chủ đề"
          className="flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-border-default bg-surface-subtle/70 p-0.5"
        >
          <TagButton active={tag === null} onClick={() => setTag(null)}>
            Tất cả
          </TagButton>
          {tags.map((t) => (
            <TagButton key={t} active={tag === t} onClick={() => setTag(t)}>
              {t}
            </TagButton>
          ))}
        </div>

        <div className="relative w-full lg:flex-1 lg:min-w-[160px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài viết..."
            aria-label="Tìm bài viết"
            className="h-9 rounded-full border-border-default bg-surface-subtle/70 pl-9 focus-visible:ring-brand-violet/40"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface-subtle/60 px-6 py-16 text-center">
          <SearchX className="mb-3 h-6 w-6 text-text-tertiary" aria-hidden />
          <p className="text-sm text-text-secondary">
            Không có bài viết nào khớp. Thử chủ đề hoặc từ khoá khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
