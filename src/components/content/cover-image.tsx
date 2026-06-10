'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * cover-image.tsx - Ảnh cover (16:9) dùng chung cho template-card + post-card.
 * Hiển thị skeleton shimmer (tông aurora) trong lúc ảnh remote tải, rồi fade ảnh vào
 * khi load xong. Không có cover → render icon fallback trên nền aurora.
 *
 * Là client component vì cần state loading; card cha vẫn là server component.
 */
const COVER_SIZES = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';

export function CoverImage({
  src,
  alt,
  fallback,
}: {
  src?: string;
  alt: string;
  /** Icon hiển thị khi template/post chưa có ảnh cover. */
  fallback: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div aria-hidden className="absolute inset-0 flex items-center justify-center">
        {fallback}
      </div>
    );
  }

  return (
    <>
      {/* Skeleton: nền aurora + vệt sáng quét, ẩn dần khi ảnh load xong */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 overflow-hidden bg-aurora-soft transition-opacity duration-500',
          loaded ? 'opacity-0' : 'opacity-100',
        )}
      >
        <div className="absolute inset-0 -translate-x-full animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/35 to-transparent motion-reduce:animate-none" />
      </div>

      <Image
        src={src}
        alt={alt}
        fill
        sizes={COVER_SIZES}
        onLoad={() => setLoaded(true)}
        className={cn(
          'object-cover transition-all duration-500 ease-out',
          'group-hover:scale-105 motion-reduce:group-hover:scale-100',
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
        )}
      />
    </>
  );
}
