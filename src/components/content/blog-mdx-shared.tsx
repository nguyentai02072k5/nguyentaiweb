/**
 * blog-mdx-shared.tsx - Tiện ích dùng chung cho các block MDX của blog.
 */

/**
 * LeadText - tách "Nhãn: phần còn lại" → in đậm phần nhãn.
 * Tái tạo pattern `<strong>label:</strong> text` của bài gốc mà không cần parse markdown.
 * Chỉ bôi đậm khi dấu ":" nằm gần đầu (nhãn ngắn) để tránh đậm nguyên câu.
 */
export function LeadText({ text }: { text: string }) {
  const idx = text.indexOf(':');
  if (idx > 0 && idx < 48) {
    return (
      <>
        <strong className="font-semibold text-text-primary">
          {text.slice(0, idx + 1)}
        </strong>{' '}
        {text.slice(idx + 1).trim()}
      </>
    );
  }
  return <>{text}</>;
}
