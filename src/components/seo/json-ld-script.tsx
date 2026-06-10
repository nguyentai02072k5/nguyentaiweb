/**
 * json-ld-script.tsx - Inject structured data an toàn trong RSC.
 *
 * JSON.stringify KHÔNG escape `<`/`>`/`&` → một chuỗi chứa `</script>` (vd FAQ answer)
 * có thể phá thẻ script + chèn markup. Escape sang \uXXXX để đóng kẽ hở đó.
 * suppressHydrationWarning vì React không track <script> này.
 */
function safeJsonLd(data: object | object[]): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function JsonLdScript({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
