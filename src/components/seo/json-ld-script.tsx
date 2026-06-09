/**
 * json-ld-script.tsx — Inject structured data an toàn trong RSC.
 * JSON.stringify chống XSS; suppressHydrationWarning vì React không track <script> này.
 */
export function JsonLdScript({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
