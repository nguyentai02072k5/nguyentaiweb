/**
 * mdx-runtime.tsx — Render MDX đã compile bởi Velite trong Server Component.
 *
 * Velite `s.mdx()` xuất ra function-body string dùng `arguments[0]` làm jsx runtime.
 * `getMDXComponent` exec nó (KHÔNG phải React hook — đặt tên không có "use" để tránh lint).
 */

import * as runtime from 'react/jsx-runtime';
import type { ComponentType } from 'react';
import { mdxComponents } from '@/components/content/mdx-components';

// MDX override map gom nhiều element khác kiểu props → dùng kiểu lỏng idiomatic của MDX.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MDXComponentMap = Record<string, ComponentType<any>>;
type MDXComponent = ComponentType<{ components?: MDXComponentMap }>;

function getMDXComponent(code: string): MDXComponent {
  const fn = new Function(code);
  return fn({ ...runtime }).default as MDXComponent;
}

export function MDXContent({
  code,
  components,
}: {
  code: string;
  components?: MDXComponentMap;
}) {
  // MDX compile thành 1 component theo từng document (ổn định theo `code` prop) —
  // pattern render động hợp lệ của MDX, rule static-components không áp dụng ở đây.
  const Component = getMDXComponent(code);
  // eslint-disable-next-line react-hooks/static-components
  return <Component components={{ ...mdxComponents, ...components }} />;
}
