# Next.js 16 Content/SEO Site Architecture Report
## Research: MDX Rendering, Dynamic OG, Multi-dimensional Filtering, JSON-LD, Sitemaps

**Date:** 2026-06-09  
**Scope:** Best practices for templates + blog platform on Next.js 16 App Router, React 19, Tailwind v4, Aurora design tokens  
**Stack Context:** Next.js 16.2.6, React 19.2, TS strict, Tailwind v4, shadcn/ui (Radix), Velite (content layer), Be Vietnam Pro + Space Grotesk fonts

---

## Executive Summary

Recommended architecture:
- **Metadata:** `generateMetadata` per-page + static `metadata` in root layout; `metadataBase` set once, `generateStaticParams` for SSG [slug] routes
- **OG Images:** File convention `app/[route]/opengraph-image.tsx` (not route handler) for automatic integration + per-route customization; use Node.js runtime, fetch fonts from `public/`, cache aggressively
- **JSON-LD:** Inject as `<script type="application/ld+json">` in RSC (Server Component), use `JSON.stringify()` for safety, schema.org types: `Article` (blog), `HowTo` (template instruction), `BreadcrumbList` (navigation)
- **Filtering UX:** `searchParams` + RSC for SEO + shareability; consider **nuqs** library for type-safe multi-dim filters (3+ dims); canonical URL points to base route, filtered views have `noindex` or explicit canonicals
- **MDX Styling:** Velite for build-time validation + type-safe schema; `@tailwindcss/typography` `prose` classes OR custom component map; "copy code" button as small client component
- **Sitemap/Robots:** `app/sitemap.ts` + `app/robots.ts` (MetadataRoute), fetch dynamic content at build time, `generateSitemaps` for 50K+ URLs
- **Performance:** SSG all templates + blog posts via `generateStaticParams`, ISR with 1h revalidate, `@vercel/speed-insights` already included

---

## 1. Metadata API Pattern (generateMetadata + metadataBase)

### Recommendation: Static metadataBase + Dynamic generateMetadata per page

**Why:** Eliminates URL composition bugs, reduces boilerplate, supports streaming metadata (Next.js 15.2+).

### Setup

**Root Layout** (`app/layout.tsx`):
```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://nguyenvantai.com'),
  title: {
    default: 'Tài AI Automation - Chatbot AI bán hàng',
    template: '%s | Tài AI Automation',
  },
  description: 'Chatbot AI nhận dạng hình ảnh, tư vấn 24/7, chốt đơn tự động.',
  keywords: ['Chatbot AI', 'AI Automation', 'Marketing automation'],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Tài AI Automation',
    images: [
      {
        url: '/og/og-image-default.png',
        width: 1200,
        height: 630,
        alt: 'Tài AI Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@yourhandle',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
```

**Dynamic Route Detail** (`app/templates/[slug]/page.tsx`):
```tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 1. SSG: Pre-render all known slugs at build time
export async function generateStaticParams() {
  // Fetch from Velite content layer
  const posts = await getAllTemplates() // returns { slug, title, ... }[]
  return posts.map(post => ({ slug: post.slug }))
}

// 2. Dynamic metadata per template
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  
  // Fetch template data (memoized by Next.js)
  const template = await getTemplate(slug)
  if (!template) return { title: 'Not Found' }

  // Inherit parent images, override title
  const parentImages = (await parent).openGraph?.images || []

  return {
    title: template.title,
    description: template.shortDescription || template.excerpt,
    openGraph: {
      title: template.title,
      description: template.shortDescription,
      type: 'article',
      url: `/templates/${slug}`,
      images: [
        {
          url: `/api/og?slug=${slug}&type=template`, // Dynamic OG endpoint
          width: 1200,
          height: 630,
          alt: template.title,
        },
        ...parentImages,
      ],
    },
    alternates: {
      canonical: `/templates/${slug}`, // Explicit canonical
    },
  }
}

export default function TemplatePage({ params, searchParams }: Props) {
  // Page component
}
```

### Key Points
- `metadataBase` set once → all relative URLs auto-composed  
- `generateStaticParams` + `generateMetadata` work together for SSG  
- `alternates.canonical` prevents duplicate content penalties  
- Fetch is auto-memoized across `generateMetadata`, `generateStaticParams`, layouts, pages  

---

## 2. Dynamic OG Image Generation

### Recommendation: File Convention `opengraph-image.tsx` (not route handler)

**Why:** Automatic metadata tag injection, cacheable, cleaner integration, supports `generateImageMetadata` for multi-variants.

### Pattern: Per-Template OG Image

**File:** `app/templates/[slug]/opengraph-image.tsx`

```tsx
import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

export const alt = 'Template preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// Optional: export const runtime = 'nodejs' (default, load local fonts)
// For Edge: export const runtime = 'edge' (lighter, no local file I/O)

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Fetch template data
  const template = await getTemplate(slug)
  if (!template) return new ImageResponse(<div>Template not found</div>, { ...size })

  // Load custom fonts from public/ (Node.js runtime only)
  // TIP: preload in next.config.ts if many OG images; edge runtime doesn't support file I/O
  const beVietnamProBuffer = await readFile(
    join(process.cwd(), 'public/fonts/be-vietnam-pro-600.ttf')
  )
  const spaceGroteskBuffer = await readFile(
    join(process.cwd(), 'public/fonts/space-grotesk-700.ttf')
  )

  // Industry badge colors (from Aurora tokens)
  const industryColorMap: Record<string, string> = {
    ecommerce: '#7c3aed', // brand-violet
    service: '#06b6d4', // cyan
    saas: '#3b82f6', // blue
  }
  const badgeColor = industryColorMap[template.industry] || '#a855f7'

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'BeVietnamPro, SpaceGrotesk, sans-serif',
          color: 'white',
        }}
      >
        {/* Logo / Site mark */}
        <div style={{ marginBottom: '40px', fontSize: '20px', color: '#a855f7' }}>
          TAI AI AUTOMATION
        </div>

        {/* Template title */}
        <h1
          style={{
            fontSize: '60px',
            fontWeight: 700,
            margin: '0 0 30px',
            textAlign: 'center',
            lineHeight: '1.2',
            maxWidth: '1000px',
            fontFamily: 'SpaceGrotesk',
          }}
        >
          {template.title}
        </h1>

        {/* Industry badge */}
        <div
          style={{
            background: badgeColor,
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '40px',
            textTransform: 'capitalize',
          }}
        >
          {template.industry}
        </div>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '24px',
            color: '#e2e8f0',
            textAlign: 'center',
            margin: '0',
            maxWidth: '900px',
            lineHeight: '1.5',
          }}
        >
          {template.shortDescription?.substring(0, 100)}...
        </p>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'BeVietnamPro',
          data: beVietnamProBuffer,
          style: 'normal',
          weight: 600,
        },
        {
          name: 'SpaceGrotesk',
          data: spaceGroteskBuffer,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
```

### File Convention vs. Route Handler Comparison

| Aspect | File Convention `opengraph-image.tsx` | Route Handler `/api/og?slug=...` |
|--------|----------------------------------------|----------------------------------|
| **Metadata tag injection** | Automatic | Manual (add to `generateMetadata`) |
| **Caching** | Statically optimized by default | Manual cache headers required |
| **File access** | `readFile()` works (Node.js runtime) | Node.js runtime only |
| **Multi-variant** | Use `generateImageMetadata` | Use query params |
| **Build time** | Pre-build all if using `generateStaticParams` | Generate on-demand |
| **Recommendation** | ✅ Prefer | Route handler only if dynamic data fetch needed |

### Font Loading Best Practices
1. **Preload fonts** in `next.config.ts`:
```tsx
// Not yet necessary; just ensure font files in public/fonts/
```
2. **Use minimal weights:** Only 1-2 weights per font (OG image bundle limit: 500KB)
3. **Cache aggressively:** Satori renders are deterministic; images cached for 31536000s (1 year)

### Blog OG Pattern (similar structure, different styling)
```tsx
// app/blog/[slug]/opengraph-image.tsx
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  
  // Similar layout but with author info, publication date
  return new ImageResponse(
    <div style={{ /* blog-specific styling */ }}>
      <h1>{post.title}</h1>
      <p>By {post.author.name} • {formatDate(post.publishedAt)}</p>
    </div>,
    { ...size, fonts: [...] }
  )
}
```

---

## 3. JSON-LD Schema Markup

### Recommendation: Inject in RSC (Server Component) as `<script type="application/ld+json">`

**Why:** Safe (React escapes by default, use `dangerouslySetInnerHTML` intentionally), searchable, improves rich snippets for blog/FAQ/HowTo.

### Template Instruction Schema (HowTo)

**File:** `app/templates/[slug]/page.tsx`

```tsx
import { FC } from 'react'
import type { HowToSchema, BreadcrumbListSchema } from '@/lib/schema-types'

async function Template({ params }: Props) {
  const { slug } = await params
  const template = await getTemplate(slug)

  // BreadcrumbList schema
  const breadcrumbSchema: BreadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Templates',
        item: 'https://nguyenvantai.com/templates',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: template.title,
        item: `https://nguyenvantai.com/templates/${slug}`,
      },
    ],
  }

  // HowTo schema (for instruction/setup steps)
  const howToSchema: HowToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: template.title,
    description: template.shortDescription,
    image: `https://nguyenvantai.com/api/og?slug=${slug}&type=template`,
    author: {
      '@type': 'Organization',
      name: 'Tài AI Automation',
      url: 'https://nguyenvantai.com',
    },
    step: template.steps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.title,
      text: step.description,
      ...(step.imageUrl && {
        image: {
          '@type': 'ImageObject',
          url: step.imageUrl,
        },
      }),
    })),
  }

  return (
    <>
      {/* BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        suppressHydrationWarning // React 19 warning suppression
      />

      {/* HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        suppressHydrationWarning
      />

      {/* Page content */}
      <article>
        <h1>{template.title}</h1>
        {/* ... */}
      </article>
    </>
  )
}

export default Template
```

### Blog Post Schema (Article)

**File:** `app/blog/[slug]/page.tsx`

```tsx
async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl || `/api/og?slug=${slug}&type=blog`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tài AI Automation',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nguyenvantai.com/logo.png',
        width: 250,
        height: 60,
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        suppressHydrationWarning
      />
      {/* Content */}
    </>
  )
}
```

### Key Points
- ✅ Always use `JSON.stringify()` for XSS safety
- ✅ RSC only (Server Component context) for database access
- ✅ `suppressHydrationWarning` needed because React doesn't track `<script>` hydration
- ✅ Validate schemas at [schema.org](https://schema.org) or [Google's Structured Data Tester](https://support.google.com/webmasters/answer/9012289)
- ❌ Don't use client-side injection (defeats searchbot parsing in HTML-limited crawlers)

---

## 4. Sitemap & Robots Configuration

### Recommendation: Combine static routes + dynamic content at build time

**Sitemap:** `app/sitemap.ts` → MetadataRoute.Sitemap  
**Robots:** `app/robots.ts` → MetadataRoute.Robots

### Sitemap Implementation

**File:** `app/sitemap.ts`

```tsx
import type { MetadataRoute } from 'next'
import { getAllTemplates, getAllBlogPosts } from '@/lib/content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    { url: 'https://nguyenvantai.com', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: 'https://nguyenvantai.com/templates', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: 'https://nguyenvantai.com/blog', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  ]

  // Dynamic routes from Velite content
  const templates = await getAllTemplates()
  const templateRoutes = templates.map(t => ({
    url: `https://nguyenvantai.com/templates/${t.slug}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(t.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const posts = await getAllBlogPosts()
  const blogRoutes = posts.map(p => ({
    url: `https://nguyenvantai.com/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    ...staticRoutes,
    ...templateRoutes,
    ...blogRoutes,
  ]
}

// For 50K+ URLs, use generateSitemaps:
// export async function generateSitemaps() {
//   const templates = await getAllTemplates()
//   return templates.map((_, idx) => ({ id: idx }))
// }
// 
// Then: export default async function sitemap({ id }: { id: number }) { ... }
// → Generates sitemap_0.xml, sitemap_1.xml, etc.
```

### Robots Configuration

**File:** `app/robots.ts`

```tsx
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/booking',
          '/thank-you',
        ],
      },
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
      },
    ],
    sitemap: 'https://nguyenvantai.com/sitemap.xml',
  }
}
```

### Key Points
- Build-time generation: `getAllTemplates()` + `getAllBlogPosts()` called once at build, memoized
- `lastModified` from frontmatter `updatedAt` or `publishedAt`
- Filter query params: Don't include `/templates?industry=...` in sitemap (canonical points to base)
- For 50K+ URLs: Use `generateSitemaps()` to split into multiple files

---

## 5. Multi-Dimensional Filtering UX

### Recommendation: `searchParams` (RSC) + **nuqs** for 3+ filter dimensions

**Why:**  
- Shareable URLs (user can copy-paste filtered view)
- SEO-friendly (searchParams indexed by Google; use `canonical` to dedupe)
- RSC renders server-side, no hydration mismatch
- **nuqs** provides type safety + automatic URL composition

### Architecture Decision

| Aspect | searchParams (Manual) | nuqs Library |
|--------|----------------------|--------------|
| **Type safety** | Unsafe (string \| string[] \| undefined) | Type-safe with Zod-like parsers |
| **Multi-dim filters** | Possible but verbose | Clean with `useQueryStates` |
| **SEO** | ✅ Works | ✅ Works |
| **Shareability** | ✅ Works | ✅ Works |
| **Adoption risk** | Zero (built-in) | Low (actively maintained, 10K+ GH stars) |
| **For 1-2 filters** | ✅ Prefer manual | Overkill |
| **For 3+ filters** | ⚠️ Gets complex | ✅ Prefer nuqs |

**Recommendation for this project:** Use **nuqs** (3 taxonomy dimensions + search).

### Implementation with nuqs

**Setup Root:** `app/layout.tsx` (wrap with adapter)

```tsx
import { NuqsAdapter } from 'nuqs/app'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
      </body>
    </html>
  )
}
```

**Templates Listing Page:** `app/templates/page.tsx`

```tsx
'use client'

import { useQueryStates, parseAsString, parseAsArrayIndexKey } from 'nuqs'
import { useCallback } from 'react'
import { TemplateGrid } from '@/components/templates/template-grid'
import { FilterPanel } from '@/components/templates/filter-panel'

type FilterState = {
  businessModel?: string
  goal?: string
  industry?: string
  search?: string
}

export default function TemplatesPage() {
  const [filters, setFilters] = useQueryStates({
    businessModel: parseAsString.withDefault(''),
    goal: parseAsString.withDefault(''),
    industry: parseAsString.withDefault(''),
    search: parseAsString.withDefault(''),
  })

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters({ [key]: value || null }) // null clears param
  }, [setFilters])

  // Server-side filtering (send searchParams to RSC parent, not shown here)
  // In reality, parent RSC reads searchParams and filters templates server-side
  
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <div className="lg:col-span-3">
        <TemplateGrid
          businessModel={filters.businessModel}
          goal={filters.goal}
          industry={filters.industry}
          search={filters.search}
        />
      </div>
    </div>
  )
}
```

**Better Pattern: Hybrid RSC + Client (Server-side filtering for performance)**

```tsx
// app/templates/page.tsx (RSC)
import type { SearchParams } from 'nuqs/server'
import { createSearchParamsCache } from 'nuqs/server'

const searchParamsCache = createSearchParamsCache({
  businessModel: parseAsString.withDefault(''),
  goal: parseAsString.withDefault(''),
  industry: parseAsString.withDefault(''),
  search: parseAsString.withDefault(''),
})

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // Resolve searchParams (Next.js 15+)
  const resolvedParams = await searchParams
  const { businessModel, goal, industry, search } = searchParamsCache.all(resolvedParams)

  // Server-side filter: fetch only matching templates
  const templates = await getTemplates({
    businessModel: businessModel || undefined,
    goal: goal || undefined,
    industry: industry || undefined,
    search: search || undefined,
  })

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <FilterPanel
        initialFilters={{ businessModel, goal, industry, search }}
      />
      <TemplateGrid templates={templates} />
    </div>
  )
}
```

**FilterPanel Client Component:**
```tsx
'use client'

import { useQueryStates, parseAsString } from 'nuqs'

export function FilterPanel({ initialFilters }: { initialFilters: Record<string, string> }) {
  const [filters, setFilters] = useQueryStates({
    businessModel: parseAsString.withDefault(''),
    goal: parseAsString.withDefault(''),
    industry: parseAsString.withDefault(''),
    search: parseAsString.withDefault(''),
  }, { shallow: false }) // shallow:false → triggers RSC re-render

  return (
    <div className="space-y-6">
      {/* Business Model filter */}
      <div>
        <h3 className="font-semibold text-text-primary">Loại hình</h3>
        <div className="space-y-2 mt-2">
          {['ban-le', 'dich-vu'].map(model => (
            <label key={model} className="flex items-center gap-2">
              <input
                type="radio"
                name="businessModel"
                value={model}
                checked={filters.businessModel === model}
                onChange={e => setFilters({ businessModel: e.target.value })}
                className="w-4 h-4"
              />
              {model === 'ban-le' ? 'Bán lẻ' : 'Dịch vụ'}
            </label>
          ))}
        </div>
      </div>

      {/* Goal filter */}
      <div>
        <h3 className="font-semibold text-text-primary">Mục tiêu</h3>
        <div className="space-y-2 mt-2">
          {['nuoi-duong', 'thu-lead', 'chot-don'].map(g => (
            <label key={g} className="flex items-center gap-2">
              <input
                type="radio"
                name="goal"
                value={g}
                checked={filters.goal === g}
                onChange={e => setFilters({ goal: e.target.value })}
                className="w-4 h-4"
              />
              {g === 'nuoi-duong' ? 'Nuôi dưỡng' : g === 'thu-lead' ? 'Thu lead' : 'Chốt đơn'}
            </label>
          ))}
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Tìm template..."
          value={filters.search}
          onChange={e => setFilters({ search: e.target.value })}
          className="w-full px-3 py-2 border border-surface-border rounded"
        />
      </div>
    </div>
  )
}
```

### Canonical URLs for Filtered Views

```tsx
// In generateMetadata for /templates page
export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await searchParams
  
  // Only allow filtering if params are non-empty
  // Otherwise, point canonical to base
  const hasFilters = Object.values(params).some(v => v)
  
  return {
    title: hasFilters ? `Templates - Filtered` : 'Templates',
    alternates: {
      canonical: hasFilters ? '' : '/templates', // Point all filtered views to base
    },
    robots: {
      index: !hasFilters, // Only index base /templates, not filtered combinations
      follow: true,
    },
  }
}
```

---

## 6. MDX Content Layer & Styling

### Recommendation: **Velite** for schema validation + `@tailwindcss/typography` for styling

**Why:**
- Velite: Build-time Zod validation, type-safe content in TSX (vs. ContentLayer complexity)
- Prose: Simple, covers 80% of markdown styling needs, customizable via Tailwind modifiers

### Velite Setup

**File:** `velite.config.ts`

```tsx
import { defineConfig, s } from 'velite'

const blogTemplate = s.object({
  slug: s.slug('slug', ['name']),
  title: s.string().max(99),
  description: s.string().max(999),
  author: s.string().default('Tài AI'),
  publishedAt: s.isodate(),
  updatedAt: s.isodate().optional(),
  cover: s.image().optional(),
  body: s.mdx(), // Compiled MDX; renders as React component
})

const templateTemplate = s.object({
  slug: s.slug('slug', ['name']),
  title: s.string().max(99),
  shortDescription: s.string().max(200),
  businessModel: s.enum(['ban-le', 'dich-vu']),
  goal: s.enum(['nuoi-duong', 'thu-lead', 'chot-don']),
  industry: s.string(),
  featured: s.boolean().default(false),
  steps: s.array(
    s.object({
      title: s.string(),
      description: s.string(),
      imageUrl: s.string().url().optional(),
    })
  ),
  body: s.mdx(),
})

export default defineConfig({
  collections: {
    blog: {
      name: 'Blog',
      pattern: 'content/blog/**/*.mdx',
      schema: blogTemplate,
    },
    templates: {
      name: 'Templates',
      pattern: 'content/templates/**/*.mdx',
      schema: templateTemplate,
    },
  },
})
```

**Fetch Content:**
```tsx
import { blog, templates } from '@/.velite'

export async function getPost(slug: string) {
  return blog.find(p => p.slug === slug)
}

export async function getAllBlogPosts() {
  return blog.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}
```

### MDX Styling with Tailwind Typography

**Tailwind Config:** `tailwind.config.ts`

```tsx
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './.velite/index.d.ts',
  ],
  plugins: [require('@tailwindcss/typography')],
  // ... rest of config
} satisfies Config
```

**Content Wrapper:** `app/blog/[slug]/page.tsx`

```tsx
import { Mdx } from '@/components/mdx-render'

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <article className="max-w-3xl mx-auto py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          {post.title}
        </h1>
        <p className="text-text-secondary text-sm">
          By {post.author} • {formatDate(post.publishedAt)}
        </p>
      </header>

      {/* Prose wrapper */}
      <div className="prose prose-invert prose-headings:text-text-primary prose-p:text-text-secondary max-w-none">
        <Mdx code={post.body.code} />
      </div>
    </article>
  )
}
```

**Mdx Component Renderer:** `components/mdx-render.tsx`

```tsx
'use client'

import { useMDXComponent } from 'next-mdx-remote/rsc'
import { CodeBlock } from './code-block'
import { Callout } from './callout'

const mdxComponents = {
  pre: CodeBlock, // Custom code block with copy button
  Callout, // Custom callout component
  // ... other overrides
}

export function Mdx({ code }: { code: string }) {
  const Component = useMDXComponent(code)
  return <Component components={mdxComponents} />
}
```

### "Copy Code" Button Component

**File:** `components/code-block.tsx`

```tsx
'use client'

import { useCallback, useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false)

  // Extract raw text from children (pre > code structure)
  const codeText = typeof children === 'string'
    ? children
    : (children as any)?.props?.children || ''

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [codeText])

  return (
    <div className="relative group">
      <pre className={`bg-surface-elevated p-4 rounded overflow-auto ${className}`}>
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-surface-elevated hover:bg-surface-elevated-hover rounded opacity-0 group-hover:opacity-100 transition"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-brand-green" />
        ) : (
          <Copy className="w-4 h-4 text-text-secondary" />
        )}
      </button>
    </div>
  )
}
```

### Callout Component

```tsx
// components/callout.tsx
'use client'

import { AlertCircle, Lightbulb, CheckCircle } from 'lucide-react'

type CalloutType = 'info' | 'tip' | 'warning' | 'success'

export function Callout({
  type = 'info',
  children,
}: {
  type?: CalloutType
  children: React.ReactNode
}) {
  const iconMap = {
    info: AlertCircle,
    tip: Lightbulb,
    warning: AlertCircle,
    success: CheckCircle,
  }

  const bgMap = {
    info: 'bg-blue-500/10 border-blue-500/20',
    tip: 'bg-yellow-500/10 border-yellow-500/20',
    warning: 'bg-red-500/10 border-red-500/20',
    success: 'bg-green-500/10 border-green-500/20',
  }

  const Icon = iconMap[type]

  return (
    <div className={`border-l-4 p-4 rounded ${bgMap[type]}`}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>{children}</div>
      </div>
    </div>
  )
}
```

**Markdown usage:**
```mdx
<Callout type="tip">
This is a helpful tip about the feature.
</Callout>
```

---

## 7. Performance & Caching Strategy

### Recommendation: SSG (build-time) + ISR (1h revalidate) for content, edge caching for OG

### Build-Time: generateStaticParams

```tsx
// Already shown above; templates + blog posts pre-rendered at build
export async function generateStaticParams() {
  const all = [
    ...(await getAllTemplates()).map(t => ({ slug: t.slug, type: 'template' })),
    ...(await getAllBlogPosts()).map(b => ({ slug: b.slug, type: 'blog' })),
  ]
  return all
}
```

### Incremental Static Regeneration (ISR)

```tsx
// app/templates/[slug]/page.tsx
export const revalidate = 3600 // 1 hour in seconds

// After edit: manual on-demand revalidation
// POST /api/revalidate?token=SECRET&type=template&slug=my-template
// → calls revalidatePath('/templates/my-template')
```

### OG Image Caching

Already cached by Satori (deterministic output). Cache header in route response:
```tsx
// app/templates/[slug]/opengraph-image.tsx
export const revalidate = 31536000 // 1 year (safe for content-addressed images)
```

### Static Listing Pages (minimal revalidation)

```tsx
// app/templates/page.tsx
export const revalidate = 3600 // 1 hour

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // Fetch count, etc.
}
```

### Monitoring & Insights

- `@vercel/speed-insights` already added ✅
- Core Web Vitals: monitor LCP (add `loading="lazy"` to images), CLS (define image dimensions), FID (minimize JS)
- Consider `@vercel/analytics` for prod monitoring

---

## Unresolved Questions / Future Considerations

1. **Velite vs. ContentLayer vs. MDX Remote:** Research didn't deeply compare runtime overhead. Velite is simpler; if performance becomes issue, consider `next-mdx-remote` for remote content.

2. **Font subsetting in ImageResponse:** Be Vietnam Pro has diacritics; could precompute subset for OG images if font size becomes concern. Not urgent.

3. **Multi-language SEO (vi_VN, en_US):** Current setup assumes `vi_VN` only. If expanding to English, add `alternates.languages` in metadata, use `hreflang` links.

4. **Filtered views + `page=X` pagination:** Need decision: include `page` in canonical or not? Google recommends canonical on page 1; current setup ignores pagination in canonical.

5. **A/B testing metadata:** If testing OG images via variants, `generateImageMetadata()` supports it. Low priority for MVP.

6. **Rate limiting OG image generation:** If traffic spikes, Satori (rendering engine) CPU-bound. Vercel caches; if issues, add `runtime: 'edge'` (trade-off: no local font file access).

---

## Implementation Checklist

- [ ] Set `metadataBase` in root layout
- [ ] Implement `generateMetadata` + `generateStaticParams` for `/templates/[slug]` + `/blog/[slug]`
- [ ] Create `app/templates/[slug]/opengraph-image.tsx` (file convention, test locally)
- [ ] Load custom fonts in OG image (Be Vietnam Pro 600, Space Grotesk 700)
- [ ] Add JSON-LD (BreadcrumbList + Article/HowTo) to detail pages
- [ ] Create `app/sitemap.ts` + `app/robots.ts`
- [ ] Implement nuqs + FilterPanel for `/templates` multi-dim filtering
- [ ] Set up Velite with blog + template schemas
- [ ] Style MDX with prose + custom CodeBlock + Callout components
- [ ] Test metadata tags via Next.js preview mode or `next build` + lighthouse
- [ ] Monitor Core Web Vitals via speed-insights

---

## Sources

- [Next.js Functions: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Metadata Files: opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Next.js Functions: ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [Next.js Guides: JSON-LD](https://nextjs.org/docs/app/guides/json-ld)
- [Next.js Metadata Files: sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Metadata Files: robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Velite: MDX Support](https://velite.js.org/guide/using-mdx)
- [Tailwind CSS Typography Plugin](https://github.com/tailwindlabs/tailwindcss-typography)
- [nuqs: Type-safe search params state management](https://nuqs.dev/)
- [Next.js Functions: generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js Getting Started: Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
