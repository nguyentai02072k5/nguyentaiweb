# Hướng dẫn thêm khoá học

## Cấu trúc thư mục

```
content/courses/
  ten-khoa.mdx        ← mỗi khoá = 1 file MDX
  README.md           ← file này
```

## Frontmatter bắt buộc

```yaml
title: "Tên khoá" # tối đa 120 ký tự
description: "Mô tả ngắn" # tối đa 300 ký tự
level: co-ban | nang-cao
order: 7 # số thứ tự hiển thị (tăng dần)
instructor:
  name: "Nguyễn Văn Tài"
  title: "Chuyên gia AI · Web · Automation"
featured: false
durationLabel: "1h20" # chuỗi hiển thị tuỳ ý
publishedAt: "2026-07-15"
modules:
  - title: "Tên module"
    lessons:
      - slug: "slug-bai-hoc-duy-nhat" # PHẢI duy nhất trong khoá
        title: "Tên bài học"
        duration: "8ph" # tuỳ chọn
        videoKey: "courses/ten-khoa/ten-bai.mp4" # object key R2, KHÔNG được rỗng
        free: true # true = hiện badge "Xem thử" công khai
```

## Quy tắc quan trọng

- **`slug` bài học phải duy nhất trong mỗi khoá** — dùng làm anchor URL và progress tracking (P4).
- **`videoKey` KHÔNG được rỗng** — điền key R2 thật (P3) hoặc placeholder `test/sample.mp4` khi dev.
- **`order`** quyết định thứ tự hiển thị trên landing — đặt số không trùng.
- Thêm `free: true` cho ≥1 lesson mỗi module để người dùng xem thử trước khi đăng nhập.
- Build sẽ **FAIL** nếu frontmatter sai schema hoặc `slug` trùng → bắt lỗi sớm.

## Thêm khoá mới

1. Tạo file `content/courses/ten-khoa-moi.mdx`
2. Điền đầy đủ frontmatter theo mẫu trên
3. Viết body MDX ngắn mô tả khoá (vài đoạn, Markdown bình thường)
4. Chạy `pnpm.cmd build` — xanh là ok, đỏ là frontmatter sai
