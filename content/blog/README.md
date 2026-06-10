# Hướng dẫn thêm bài Blog

Mỗi bài là 1 file `.mdx` trong thư mục này. Thêm file → chạy lại build/dev là bài xuất hiện ở `/blog`.

## Frontmatter - BẮT BUỘC đúng

```yaml
---
title: "Tiêu đề bài viết"          # ≤120 ký tự
description: "Mô tả ngắn 1-2 câu"  # ≤300 ký tự (card + SEO)
tags: ["Phát triển kinh doanh"]    # BẮT BUỘC ≥1, chỉ dùng 3 chủ đề cố định bên dưới
author: "Tài"                      # tuỳ chọn (mặc định "Tài")
cover: /blog/<slug>/cover.png      # tuỳ chọn
draft: false                       # tuỳ chọn: true = ẩn khỏi /blog
publishedAt: 2026-06-09            # ngày đăng (YYYY-MM-DD)
updatedAt: 2026-06-10              # tuỳ chọn
faqs:                              # tuỳ chọn → render section FAQ + FAQPage JSON-LD (AEO)
  - question: "Câu hỏi?"
    answer: "Câu trả lời ngắn gọn, trực tiếp."
---
```

## 3 chủ đề cố định (chỉ dùng đúng 3 giá trị này trong `tags`)

- `"Phát triển kinh doanh"`
- `"Phát triển bản thân"`
- `"Phân tích trên thế gian"`

Một bài có thể gắn 1–2 chủ đề. Dùng giá trị ngoài danh sách → **build báo lỗi** (cố ý). Đổi danh sách chủ đề: sửa `src/lib/content/blog-taxonomy.ts`.

Nội dung viết Markdown/MDX bình thường (heading `##`, list, `> callout`, code block ```` ```text ````). Ảnh đặt trong `public/blog/<slug>/`.

## Block "rich" cho bài dạng landing (tuỳ chọn)

Dùng trực tiếp trong `.mdx` theo TÊN (không cần import - đã đăng ký ở `src/components/content/mdx-components.tsx`). Tất cả dùng Aurora design token, an toàn light/dark. Cách nhau bằng dòng trống.

- `<StatGrid items={[{value,label}]} />` - lưới 3 chỉ số nổi bật đầu bài.
- `<KeyTakeaways title intro ordered items={[...]} />` - hộp TL;DR / lộ trình đọc (tốt cho AEO). `ordered` → đánh số.
- `<Callout tone="violet|cyan|amber" icon title>…</Callout>` - hộp giải nghĩa / lưu ý.
- `<AdminNote label>…</AdminNote>` - bong bóng chat giọng "người thật".
- `<DataStat label value unit bar barLabel barValue scale={[a,b,c]}>…</DataStat>` - band số lớn nền tối + thanh đo tĩnh.
- `<Fork items={[{tone:'lose|win',tag,title,points:[...]}]} />` - so sánh 2 hướng.
- `<CardGrid cols={1|2} items={[{icon|num,title,body}]} />` - lưới thẻ icon/số.
- `<Tiers items={[{color:'orange|green|yellow',emoji,tag,title,body}]} />` - các tầng (viền màu).
- `<Steps tag heading items={[{title,body}]} />` / `<Checklist tag heading items={[...]} />` - lộ trình bước / checklist.
- `<PullQuote>…</PullQuote>` - trích dẫn nhấn mạnh (bọc `<span className="text-aurora">…</span>` để tô gradient).
- `<CTACard eyebrow title href note>…</CTACard>` - CTA mềm cuối bài (mặc định `href="/booking"`).

Mẹo: trong `KeyTakeaways`/`Checklist`, viết item dạng `Nhãn: nội dung` → phần "Nhãn:" tự được in đậm.
