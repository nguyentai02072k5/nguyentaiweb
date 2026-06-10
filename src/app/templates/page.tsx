import type { Metadata } from 'next';
import { getTemplates } from '@/lib/content/queries';
import { TemplatesExplorer } from '@/components/templates/templates-explorer';

/**
 * /templates - Kho Template Instruction.
 * SSG (data build-time từ Velite). Filter client-side; pSEO routes (/templates/nganh/[industry])
 * lo phần index theo ngành.
 */
const TITLE = 'Kho Template Instruction';
const DESCRIPTION =
  'Bộ template instruction chatbot AI theo mô hình kinh doanh và ngành - chọn nhanh, áp dụng ngay cho shop của bạn.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/templates' },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', url: '/templates' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function TemplatesPage() {
  const templates = getTemplates();

  return (
    <main
      id="main"
      className="mx-auto w-full max-w-6xl px-5 pb-14 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <header className="max-w-2xl">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-violet">
          Kho mẫu
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Kho Template Instruction
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
          Chọn theo mô hình kinh doanh và ngành của anh/chị - copy bộ instruction về,
          chỉnh nhẹ là chatbot dùng được ngay, không phải bắt đầu từ con số 0.
        </p>
      </header>

      <div className="mt-5 sm:mt-6">
        <TemplatesExplorer templates={templates} />
      </div>
    </main>
  );
}
