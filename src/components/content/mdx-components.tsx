/**
 * mdx-components.tsx - Map phần tử MDX → component theo design tokens.
 *
 * Phần lớn style do `.prose` (@tailwindcss/typography + token override ở globals.css) lo.
 * Ở đây chỉ override những chỗ cần hành vi đặc biệt:
 *   - pre  → MdxCodeBlock (nút copy)
 *   - a    → next/link cho link nội bộ, _blank an toàn cho link ngoài
 *
 * Ngoài ra đăng ký các block "rich" của blog (Callout, DataStat, Fork, Steps...) để bài MDX
 * dùng trực tiếp theo TÊN (không cần import - velite render qua props.components).
 */

import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';
import { MdxCodeBlock } from './mdx-code-block';
import {
  Callout,
  AdminNote,
  PullQuote,
  KeyTakeaways,
  CTACard,
} from './blog-mdx-callouts';
import { StatGrid, DataStat, Fork, Steps, Checklist } from './blog-mdx-data';
import { CardGrid, Tiers } from './blog-mdx-cards';

function MdxLink({ href = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  // Hash-only (#...) → plain anchor jump trong trang. Route nội bộ (/...) → next/link.
  if (href.startsWith('#')) {
    return <a href={href} {...props} />;
  }
  if (href.startsWith('/')) {
    return <Link href={href} {...props} />;
  }
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
}

export const mdxComponents = {
  pre: MdxCodeBlock,
  a: MdxLink,
  // Block rich cho blog (dùng theo tên trong .mdx)
  Callout,
  AdminNote,
  PullQuote,
  KeyTakeaways,
  CTACard,
  StatGrid,
  DataStat,
  Fork,
  Steps,
  Checklist,
  CardGrid,
  Tiers,
};
