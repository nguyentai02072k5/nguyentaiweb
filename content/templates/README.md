# Hướng dẫn thêm Template Instruction

Mỗi template là 1 file `.mdx` trong thư mục này. Thêm file mới → chạy lại build (`pnpm build`) hoặc dev (`pnpm dev`) là template xuất hiện trên `/templates`.

## Đặt tên file

- Dùng kebab-case, tiếng Việt không dấu: `mau-spa-chot-don.mdx`
- Tên file = slug URL: file `mau-spa-chot-don.mdx` → `/templates/mau-spa-chot-don`

## Frontmatter (phần `---` đầu file) - BẮT BUỘC đúng

```yaml
---
title: "Tiêu đề template"              # bắt buộc, ≤120 ký tự
description: "Mô tả ngắn 1-2 câu"      # bắt buộc, ≤300 ký tự (hiện ở card + SEO)
businessModel: dich-vu                 # bắt buộc: ban-le | dich-vu
industry: spa                          # bắt buộc: phải thuộc đúng businessModel (xem bảng dưới)
tags: [chatbot, cskh]                  # tuỳ chọn: lọc phụ
cover: /templates/mau-spa-chot-don/cover.png   # tuỳ chọn: ảnh card (đặt trong public/)
attachments:                           # tuỳ chọn: file/ảnh đính kèm
  - label: "Bảng giá mẫu"
    href: /templates/mau-spa-chot-don/bang-gia.pdf
featured: true                         # tuỳ chọn: ghim lên đầu (mặc định false)
schemaType: howto                      # tuỳ chọn: article (mặc định) | howto (bài dạng các bước)
publishedAt: 2026-06-09                # bắt buộc: ngày đăng (YYYY-MM-DD)
updatedAt: 2026-06-10                  # tuỳ chọn: ngày cập nhật
---
```

> Nếu frontmatter sai (vd `industry` không thuộc `businessModel`), **build sẽ báo lỗi** - đây là cố ý để chặn phân loại sai.

## Danh sách `businessModel` × `industry` hợp lệ

| businessModel | industry hợp lệ |
|---|---|
| `ban-le` | `thoi-trang`, `my-pham`, `me-va-be`, `thuc-pham`, `do-gia-dung`, `dien-tu` |
| `dich-vu` | `spa`, `nha-hang`, `bat-dong-san`, `giao-duc`, `gym`, `nha-khoa`, `du-lich` |

Thêm ngành mới? Sửa `src/lib/content/taxonomy.ts` (thêm slug + label + businessModel + description).

## Phần nội dung (sau frontmatter)

Viết Markdown/MDX bình thường: heading `##`, list, `> callout`, và code block ```` ```text ```` cho đoạn instruction (sẽ có nút Copy). Ảnh đính kèm đặt trong `public/templates/<slug>/`.
