# Hướng dẫn thêm bài Blog

Mỗi bài là 1 file `.mdx` trong thư mục này. Thêm file → chạy lại build/dev là bài xuất hiện ở `/blog`.

## Frontmatter — BẮT BUỘC đúng

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
---
```

## 3 chủ đề cố định (chỉ dùng đúng 3 giá trị này trong `tags`)

- `"Phát triển kinh doanh"`
- `"Phát triển bản thân"`
- `"Phân tích trên thế gian"`

Một bài có thể gắn 1–2 chủ đề. Dùng giá trị ngoài danh sách → **build báo lỗi** (cố ý). Đổi danh sách chủ đề: sửa `src/lib/content/blog-taxonomy.ts`.

Nội dung viết Markdown/MDX bình thường (heading `##`, list, `> callout`, code block ```` ```text ````). Ảnh đặt trong `public/blog/<slug>/`.
