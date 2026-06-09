'use client';

/**
 * mdx-code-block.tsx — Client wrapper cho <pre> trong nội dung MDX.
 *
 * Bọc code block bằng nút Copy (đọc innerText qua ref → clipboard).
 * Style nền/chữ code do `.prose` (typography tokens) lo; component này chỉ thêm nút copy.
 */

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

type MdxCodeBlockProps = React.HTMLAttributes<HTMLPreElement>;

export function MdxCodeBlock({ className, ...props }: MdxCodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = ref.current?.innerText ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard có thể bị chặn (http, quyền) — im lặng, không phá UI
    }
  }

  return (
    <div className="group relative not-prose my-6">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Đã copy' : 'Copy nội dung'}
        className="
          absolute right-3 top-3 z-10
          inline-flex items-center gap-1.5
          rounded-lg px-2.5 py-1.5
          bg-surface-elevated/10 text-text-on-brand
          text-xs font-display font-medium
          opacity-0 group-hover:opacity-100 focus-visible:opacity-100
          ring-1 ring-white/15 backdrop-blur
          transition-opacity duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet
        "
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden /> Đã copy
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
          </>
        )}
      </button>
      <pre
        ref={ref}
        className={cn(
          'overflow-x-auto rounded-xl bg-surface-inverse p-4 text-sm leading-relaxed text-[#e5e7eb]',
          className,
        )}
        {...props}
      />
    </div>
  );
}
