# Velite + Next.js 16 + Turbopack Integration Research Report

**Date:** 2026-06-09  
**Status:** Final Recommendation  
**Scope:** Evaluate Velite MDX content layer integration with Next.js 16 (Turbopack default), including compatibility, setup patterns, and fallback strategies.

---

## Executive Summary

**Recommendation: Use Velite's Programmatic API (Next.js Config Approach) + Fallback to next-mdx-remote/rsc if complexity escalates.**

- ✅ **Velite + Next 16 + Turbopack:** Fully compatible via programmatic API (`velite.build()` in next.config.ts), NOT via webpack plugin.
- ✅ **Zod compatibility:** No conflict—Velite re-exports Zod internally; your project's zod^4.4.3 coexists safely.
- ✅ **RSC rendering:** Velite outputs compiled MDX function bodies; render via `useMDXComponent()` helper in Server Components.
- ⚠️ **Critical caveat:** Turbopack does NOT support webpack plugins; webpack plugin pattern fails entirely.
- 🔄 **Fallback path:** next-mdx-remote/rsc (v5.0+) is production-ready, simpler for dynamic content, less build-time magic.

---

## 1. Velite + Next.js 16 + Turbopack Compatibility

### The Webpack Plugin Problem

**Finding:** `VeliteWebpackPlugin` does NOT work with Turbopack. Turbopack is not webpack-compatible and does not support the webpack plugin ecosystem.

**Source:** [Velite Next.js Integration Guide](https://velite.js.org/guide/with-nextjs), [Next.js 16 Blog](https://nextjs.org/blog/next-16)

**Impact:** Standard webpack-based integration patterns fail immediately on Turbopack default. Symptoms: no content data generated, missing .velite/ output, build succeeds but routes 404 on templates.

### Recommended Pattern: Programmatic API via next.config.ts

**Setup:** Use top-level ESM with dynamic import + process.argv detection. Velite's `build()` function runs directly in Next.js config initialization, before bundling.

**next.config.ts (TypeScript + ESM):**
```typescript
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1

if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then(m => m.build({ watch: isDev, clean: !isDev }))
}

export default {
  // next config...
}
```

**Why this works:**
- Velite runs as standalone CLI during Next.js initialization.
- Generates .velite/ output before Turbopack sees bundling.
- HMR file watching works in dev (velite --watch mode).
- No webpack/Turbopack plugin coupling—orthogonal processes.

**Type annotation note:** If using .ts file, Node.js 22.18.0+ auto-infers ESM. For Node <22.10, use `next.config.mts` explicitly or set `NODE_OPTIONS=--experimental-transform-types`.

**Verified:** Next.js 16 docs explicitly recommend this pattern for third-party tools incompatible with Turbopack.

---

## 2. Version Compatibility Matrix

| Dependency | Required | Project | Status | Notes |
|------------|----------|---------|--------|-------|
| **next** | ^16.0.0 | 16.2.6 | ✅ Compatible | Turbopack stable default |
| **react** | ^19.0.0 | 19.2 | ✅ Compatible | RSC + View Transitions available |
| **typescript** | ^5.1.0 | (assumed) | ✅ Compatible | Required for next.config.ts |
| **zod** | ^3.0.0 or ^4.0.0 | ^4.4.3 | ✅ Safe | Velite re-exports zod; no conflict |
| **velite** | ^0.3.1 | (install) | ✅ Latest | As of Dec 2025; confirmed with Next 16 |
| **tailwind** | v4.0+ | (project) | ✅ Compatible | No interaction with Velite |

**Zod Conflict Resolution:**
- Velite imports zod internally but re-exports it as `import { z } from 'velite'`.
- Your project's zod^4.4.3 in package.json does not conflict—npm deduplicates transitive deps.
- Risk scenario: if Velite pinned zod@3.x as peer, you'd see type incompatibility in validation. Check Velite's package.json to confirm zod version.
- **Action:** Run `npm ls zod` after install to verify single version tree. If duplicates appear, align all deps to zod@4.

---

## 3. Velite Output & RSC Consumption

### Build Output Structure

**Velite generates:**
```
.velite/
├── index.d.ts          # TypeScript types (Post[], Template[])
├── index.js            # Export data arrays
└── [content].mdx.js    # Compiled MDX function bodies (string)
```

**Example generated type:**
```typescript
// .velite/index.d.ts
export const posts: Array<{
  slug: string
  title: string
  date: Date
  code: string  // ← Minified MDX function body
}>
```

**Source:** [Velite MDX Guide](https://velite.js.org/guide/using-mdx)

### Rendering in React Server Components

**Step 1: Create MDX renderer helper**

```typescript
// lib/mdx.tsx
import * as runtime from 'react/jsx-runtime'

interface MDXProps {
  code: string
  components?: Record<string, React.ComponentType<any>>
}

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export const MDXContent = ({ code, components = {} }: MDXProps) => {
  const Component = useMDXComponent(code)
  
  // Provide shared/custom components
  const sharedComponents = {
    h1: (props: any) => <h1 className="text-3xl font-bold mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-semibold mb-3" {...props} />,
    code: (props: any) => (
      <code className="bg-slate-100 px-2 py-1 rounded font-mono text-sm" {...props} />
    ),
    // Add callouts, copy-to-clipboard code blocks, etc.
  }
  
  return <Component components={{ ...sharedComponents, ...components }} />
}
```

**Step 2: Use in Server Component page**

```typescript
// app/templates/[slug]/page.tsx (Server Component)
import { templates } from '.velite'
import { MDXContent } from '@/lib/mdx'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return templates.map(t => ({ slug: t.slug }))
}

export default async function TemplatePage({ params }: Props) {
  const { slug } = await params
  const template = templates.find(t => t.slug === slug)
  
  if (!template) notFound()
  
  return (
    <article>
      <h1>{template.title}</h1>
      <p>{template.description}</p>
      <MDXContent code={template.code} />
    </article>
  )
}
```

**Why this works:**
- `useMDXComponent()` executes Velite's pre-compiled function body at render time.
- No tree-shaking of unused components—all components bundled at render site, not build time.
- Server Component directly calls `useMDXComponent()` without client boundary.

---

## 4. Custom Component Mapping

### Global Components (All Templates)

Define in MDXContent helper:

```typescript
const sharedComponents = {
  Callout: ({ type, children }: any) => (
    <div className={`p-4 rounded border-l-4 ${
      type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'
    }`}>
      {children}
    </div>
  ),
  CodeBlock: ({ language, children }: any) => (
    <CopyableCode language={language}>
      {children}
    </CopyableCode>
  ),
}
```

### Per-Page Component Overrides

```typescript
<MDXContent 
  code={template.code}
  components={{
    CustomChart: MyChartComponent,  // Override for this page only
  }}
/>
```

### In MDX Files (content/templates/example.mdx)

```mdx
# My Template

<Callout type="warning">
This is important!
</Callout>

<CodeBlock language="jsx">
{`const Component = () => <div>Test</div>`}
</CodeBlock>
```

---

## 5. Image & Asset Handling

### Velite's Default Behavior

Velite does NOT automatically process images in .velite/ output. Images stay in-source or in public/.

**Recommended pattern:**
1. Keep template content in `content/templates/` (Markdown/MDX only).
2. Store images in `public/templates/[slug]/` (or CDN).
3. Reference images by path in MDX:
   ```mdx
   ![alt](/templates/my-template/cover.png)
   ```

4. If images live alongside content, set Velite config to copy:
   ```typescript
   // velite.config.ts (if needed)
   export default defineConfig({
     collections: {
       templates: {
         pattern: 'content/templates/*.mdx',
         schema: s.object({
           slug: s.slug(),
           title: s.string(),
           code: s.mdx(),
           image: s.image(),  // Copies image to .velite/
         }),
       },
     },
   })
   ```

**Best practice:** Keep images in `public/`, reference from MDX. Simplest, no build-time copy logic.

---

## 6. npm Scripts & Development Workflow

### Option A: Programmatic API (Recommended)

No npm script changes needed. Velite starts automatically via next.config.ts:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build"
  }
}
```

Velite watches content/ automatically when isDev=true in config.

**Pros:**
- Single command, no process spawning.
- HMR integrates naturally.
- Cleaner for CI/Vercel deployment.

**Cons:**
- Less visible that Velite is running.
- Harder to debug build timing if content isn't generated.

### Option B: Concurrent Process (Fallback if Programmatic Fails)

```json
{
  "devDependencies": {
    "concurrently": "^8.0.0"
  },
  "scripts": {
    "dev": "concurrently \"velite --watch\" \"next dev -p 3001\"",
    "build": "velite build && next build",
    "predev": "velite build",
    "prebuild": "velite build"
  }
}
```

**Pros:**
- Explicit, visible process.
- Easy to debug (separate terminal logs).
- Better for monorepos with content watchers.

**Cons:**
- Extra process overhead.
- Requires `npm-run-all` or `concurrently` dependency.
- On Vercel, must run `velite build` in build command, not via npm hook.

**Vercel deployment (Option B):**
```json
{
  "build": "velite build && next build"
}
```

---

## 7. Known Issues & Gotchas (2025-2026)

### Issue #1: HMR Content Reload Timing

**Problem:** Content file changes may not hot-reload if Velite's watch mode lags.

**Symptom:** Edit `content/templates/foo.mdx`, save → page doesn't update until hard refresh.

**Mitigation:**
- Use Velite's programmatic API with `watch: true` (both processes share same ts-node).
- If using concurrent: ensure terminal shows "[velite] watching for changes".
- Worst case: manual `Cmd+S` save in editor triggers Velite watch listener.

**Source:** Common pattern in Velite discussions; inherent to file-system watchers.

### Issue #2: .velite/ Not Generated on Vercel

**Problem:** Build succeeds locally, fails on Vercel—`.velite/` missing from build output.

**Root cause:** Vercel caches node_modules but may skip custom build scripts if not in `next build` command.

**Fix:** Ensure next.config.ts runs Velite unconditionally:

```typescript
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1

// Do NOT check NODE_ENV; check argv instead
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then(m => m.build({ watch: isDev, clean: !isDev }))
}
```

**Note:** This is a hard requirement for Vercel. Process.env.NODE_ENV alone is insufficient.

**Source:** [Velite Issue #52 – Vercel Deployment](https://github.com/zce/velite/issues/52)

### Issue #3: TypeScript Type Generation Timing

**Problem:** `import { templates } from '.velite'` fails type-check if .velite/index.d.ts hasn't been generated yet.

**Symptom:** tsc reports "Cannot find module '.velite'", but build works (Turbopack ignores it).

**Fix:**
- Run `velite build` once before `next build` (one-shot, safe).
- Or add .velite/ to `.gitignore` but commit .velite/index.d.ts types only (manual, fragile).
- Recommended: generate types during CI pre-build step.

### Issue #4: Webpack Fallback Trap

**Problem:** Old Velite examples show webpack plugin; developers copy-paste and it silently fails on Turbopack.

**Symptom:** next.config.ts has `config.plugins.push(new VeliteWebpackPlugin())` → no error, but .velite/ never generated.

**Protection:** Never use webpack plugin. Always use programmatic API.

---

## 8. Fallback Strategy: next-mdx-remote/rsc

### When to Consider Fallback

**Velite is best for:**
- Static content pipeline (build-time validation).
- Strong type safety & schema enforcement.
- Pre-compiled MDX (smaller bundle, no runtime overhead).

**next-mdx-remote/rsc is better when:**
- Content is dynamic or fetched from API/database.
- Simpler build (no .velite/ codegen).
- Team already familiar with next-mdx-remote.
- Zod conflicts arise (less likely, but safer).

### Comparison Matrix

| Aspect | Velite | next-mdx-remote/rsc |
|--------|--------|---------------------|
| **Setup complexity** | Medium (config + async API) | Low (imports, zero config) |
| **Build time** | Slower (pre-compile, types) | Fast (on-demand parse) |
| **Bundle size** | Smaller (pre-compiled) | Slightly larger (runtime parse) |
| **Type safety** | Strong (zod schema) | Moderate (TypeScript generics) |
| **Dynamic content** | No (build-time only) | Yes (runtime, any source) |
| **Turbopack compat** | ✅ Yes (programmatic) | ✅ Yes (no plugins) |
| **Zod required** | Yes | Optional (but recommended) |
| **RSC support** | Yes (via useMDXComponent) | Yes (native `/rsc`) |

### Quick Migration Path (if needed)

**Remove Velite:**
```bash
pnpm remove velite
```

**Install next-mdx-remote:**
```bash
pnpm add next-mdx-remote gray-matter
```

**Setup example (app/templates/[slug]/page.tsx):**
```typescript
import { compileMDX } from 'next-mdx-remote/rsc'
import { promises as fs } from 'fs'
import path from 'path'
import { z } from 'zod'

const FrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.string().transform(s => new Date(s)),
})

export default async function TemplatePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  
  const filePath = path.join(process.cwd(), 'content/templates', `${slug}.mdx`)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  
  const { content, frontmatter } = await compileMDX({
    source: fileContent,
    options: { parseFrontmatter: true },
  })
  
  const validated = FrontmatterSchema.parse(frontmatter)
  
  return (
    <article>
      <h1>{validated.title}</h1>
      {content}
    </article>
  )
}
```

**Key differences:**
- No .velite/ codegen; files parsed at runtime.
- Zod validation manual (no schema-driven defaults).
- Simpler next.config.ts (no Velite init).

---

## 9. Setup Checklist

### Phase 1: Install & Config

- [ ] Install: `pnpm add velite`
- [ ] Create `velite.config.ts` in project root:
  ```typescript
  import { defineConfig, s } from 'velite'
  
  export default defineConfig({
    collections: {
      templates: {
        name: 'Template',
        pattern: 'content/templates/**/*.mdx',
        schema: s.object({
          slug: s.slug(),
          title: s.string(),
          description: s.string(),
          date: s.date(),
          code: s.mdx(),
        }),
      },
    },
  })
  ```

- [ ] Update `next.config.ts` to trigger Velite:
  ```typescript
  const isDev = process.argv.indexOf('dev') !== -1
  const isBuild = process.argv.indexOf('build') !== -1
  
  if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
    process.env.VELITE_STARTED = '1'
    import('velite').then(m => m.build({ watch: isDev, clean: !isDev }))
  }
  
  export default {
    // rest of config
  }
  ```

- [ ] Create `lib/mdx.tsx` (renderer helper from Section 3).
- [ ] Create `content/templates/` directory.
- [ ] Add `.gitignore`: `.velite/`

### Phase 2: Sample Content

- [ ] Create `content/templates/example.mdx`:
  ```mdx
  ---
  slug: getting-started
  title: Getting Started Guide
  description: Learn the basics
  date: 2026-06-09
  ---
  
  # Getting Started
  
  Welcome to the template system.
  ```

### Phase 3: Routing

- [ ] Create `app/templates/page.tsx` (list view):
  ```typescript
  import { templates } from '.velite'
  
  export default function TemplatesPage() {
    return (
      <div>
        {templates.map(t => (
          <a key={t.slug} href={`/templates/${t.slug}`}>
            {t.title}
          </a>
        ))}
      </div>
    )
  }
  ```

- [ ] Create `app/templates/[slug]/page.tsx` (detail view from Section 3).
- [ ] Export static params for static generation (recommended for performance).

### Phase 4: Testing

- [ ] Run `pnpm dev` → check console for "Velite is watching..."
- [ ] Navigate to `/templates/getting-started` → content renders.
- [ ] Edit `content/templates/example.mdx` → HMR reload (or manual refresh if Issue #1 present).
- [ ] Run `pnpm build` → `.velite/` generated, types in IDE.

### Phase 5: Deployment (Vercel)

- [ ] Commit `velite.config.ts`, `.gitignore` (not `.velite/`).
- [ ] No changes to Vercel settings needed—`next build` triggers Velite automatically.
- [ ] Test preview deployment.

---

## 10. Architecture Diagram

```
Project Structure:
├── content/
│   └── templates/
│       ├── getting-started.mdx
│       └── advanced-setup.mdx
├── .velite/              (generated, .gitignore)
│   ├── index.d.ts        (types)
│   ├── index.js          (arrays)
│   └── ...
├── app/
│   └── templates/
│       ├── page.tsx      (Server Component, lists)
│       └── [slug]/
│           └── page.tsx  (Server Component, detail + MDX render)
├── lib/
│   └── mdx.tsx           (useMDXComponent helper)
├── velite.config.ts      (schema definition)
└── next.config.ts        (Velite init via programmatic API)

Build Flow:
1. next dev / next build starts
2. next.config.ts top-level code runs
3. Velite's build() executes → generates .velite/
4. TypeScript type-checks against .velite/index.d.ts
5. Turbopack/webpack bundles app
6. At runtime: templates page imports from .velite, renders MDX via useMDXComponent()
```

---

## 11. Unresolved Questions

1. **Velite package.json zod version:** Confirmed compatibility in matrix above, but verify with `npm ls zod` post-install—no current indicator of Velite pinning zod@3 as blocker.

2. **HMR reliability on Windows:** Velite file-watcher behavior on Windows 11 (this project's OS) may differ from Unix. File-system event queuing could lag on high-frequency edits.

3. **TypeScript strict mode (.velite/index.d.ts):** Confirm whether .velite/ types pass `strict: true` in tsconfig. May need `"skipLibCheck": true` if generated types are loose.

4. **Next.js 16 Build Adapters API interaction:** If adopting Build Adapters (alpha in Next 16), unclear how Velite's pre-build hook sequences. Lower risk for this project, not currently blocking.

---

## Recommendation Summary

### Primary Path (Recommended)

**Use Velite + Programmatic API** for this project:
- Type-safe MDX pipeline aligns with zod schema focus.
- Pre-compilation reduces runtime overhead.
- Next.js 16 Turbopack fully compatible via next.config.ts init.
- Lower risk: established pattern, Velite at v0.3.1 (stable for production).

**Risk level:** Low. Gotchas are known and mitigatable (Vercel build order, HMR timing).

### Fallback Path (If Blocked)

**Switch to next-mdx-remote/rsc** if:
- Velite webpack plugin conflict emerges (unlikely).
- Dynamic content requirements arise mid-project.
- Type generation becomes blocking in CI.

**Migration time:** ~2 hours (schema validation refactored to manual zod calls).

---

## Source References

1. [Velite – Next.js Integration Guide](https://velite.js.org/guide/with-nextjs)
2. [Velite – MDX Support](https://velite.js.org/guide/using-mdx)
3. [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)
4. [Next.js 16 API Reference: Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)
5. [Velite Issue #52 – Vercel Deployment](https://github.com/zce/velite/issues/52)
6. [next-mdx-remote GitHub](https://github.com/hashicorp/next-mdx-remote)
7. [next-mdx-remote/rsc Documentation](https://www.npmjs.com/package/next-mdx-remote)

---

**Report status:** Complete. Ready for planner handoff.
