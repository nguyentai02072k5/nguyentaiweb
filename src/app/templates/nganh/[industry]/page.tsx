import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import {
  getIndustriesWithTemplates,
  getTemplatesByIndustry,
} from '@/lib/content/queries';
import { getIndustry } from '@/lib/content/taxonomy';
import { TemplateGrid } from '@/components/templates/template-grid';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { buildBreadcrumb, buildCollectionJsonLd } from '@/lib/seo/json-ld';

/**
 * /templates/nganh/[industry] - pSEO route theo ngành (SSG, index được).
 * Chỉ generate ngành có ≥1 template; dynamicParams=false → ngành rỗng/sai = 404 (chống thin content).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getIndustriesWithTemplates().map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry } = await params;
  const ind = getIndustry(industry);
  if (!ind) return {};
  const title = `Template ${ind.label}`;
  const url = `/templates/nganh/${ind.slug}`;
  return {
    title,
    description: ind.description,
    alternates: { canonical: url },
    openGraph: { title, description: ind.description, type: 'website', url },
    twitter: { card: 'summary_large_image', title, description: ind.description },
  };
}

export default async function IndustryTemplatesPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry } = await params;
  const ind = getIndustry(industry);
  const templates = ind ? getTemplatesByIndustry(industry) : [];
  if (!ind || templates.length === 0) notFound();

  const path = `/templates/nganh/${ind.slug}`;
  const jsonLd = [
    buildCollectionJsonLd(`Template ${ind.label}`, path, templates),
    buildBreadcrumb([
      { name: 'Trang chủ', path: '/' },
      { name: 'Templates', path: '/templates' },
      { name: ind.label, path },
    ]),
  ];

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-6xl px-5 pb-14 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <JsonLdScript data={jsonLd} />
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-sm text-text-tertiary"
      >
        <Link href="/" className="hover:text-brand-violet">
          Trang chủ
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/templates" className="hover:text-brand-violet">
          Templates
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-text-secondary">{ind.label}</span>
      </nav>

      <header className="mt-3 max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Template {ind.label}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
          {ind.description}
        </p>
      </header>

      <div className="mt-5 sm:mt-6">
        <TemplateGrid templates={templates} />
      </div>
    </main>
  );
}
