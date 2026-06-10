import { ChevronDown } from 'lucide-react';

/**
 * post-faq.tsx - Section FAQ accordion (native <details>) cuối bài.
 * Nguồn dữ liệu = frontmatter `faqs` (cùng nguồn với FAQPage JSON-LD) → AEO/rich result.
 * Đặt NGOÀI `.prose` nên không dính style typography của article body.
 */
export function PostFaq({
  faqs,
}: {
  faqs?: { question: string; answer: string }[];
}) {
  if (!faqs?.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-14">
      <h2
        id="faq-heading"
        className="font-display text-2xl font-bold tracking-tight text-text-primary"
      >
        Câu hỏi thường gặp
      </h2>
      <div className="mt-5 divide-y divide-border-default overflow-hidden rounded-xl border border-border-default bg-surface-elevated">
        {faqs.map((f, i) => (
          <details key={i} className="group px-5 py-4 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-base font-semibold text-text-primary">
              {f.question}
              <ChevronDown
                className="h-4 w-4 flex-shrink-0 text-text-tertiary transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="mt-3 text-[0.97rem] leading-relaxed text-text-secondary">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
