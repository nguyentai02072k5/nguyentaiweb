# Cấu hình R2 cho video khoá học (Phase 3)

Khu học `course.nguyenvantai.com` phát video từ **Cloudflare R2 bucket private**
qua **signed URL** (TTL 4h, mint server-side). Tài liệu này liệt kê những gì cần
cấu hình để video chạy trên prod.

## 1. Biến môi trường

Thêm vào `.env.local` (dev) và Vercel Project → Settings → Environment Variables (prod):

| Biến | Nguồn | Ghi chú |
|------|-------|---------|
| `R2_ACCOUNT_ID` | Cloudflare Dashboard → R2 → Overview | Cũng nằm trong endpoint `https://<id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | R2 → **Manage R2 API Tokens** → Create API Token | Token **S3-compatible** (SigV4), KHÁC `CLOUDFLARE_API_TOKEN` (Bearer) |
| `R2_SECRET_ACCESS_KEY` | Hiện 1 lần khi tạo token trên | Lưu ngay, không xem lại được |
| `R2_BUCKET` | Tên bucket chứa video | Ví dụ `course-videos` |

> **Quyền token S3**: chỉ cần **Object Read** cho phát video (presigned GET).
> Nếu dùng cùng token để upload thì cần thêm Object Write.

Endpoint S3 dựng tự động trong `src/lib/r2/client.ts`:
`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`.

## 2. Đặt tên object key (videoKey)

`videoKey` trong frontmatter MDX (`content/courses/*.mdx`) = object key trong bucket.
Quy ước gợi ý: `courses/<slug-khoa>/<slug-bai>.mp4`.
Dev để `test/sample.mp4` (đã dùng ở khoá mẫu).

## 3. Upload video (khuyến nghị `+faststart`)

MP4 cần `+faststart` (moov atom đưa lên đầu) để seek/tua mượt khi stream:

```bash
ffmpeg -i input.mp4 -c copy -movflags +faststart output.mp4
# rồi upload lên bucket với đúng key, ví dụ dùng wrangler:
npx wrangler r2 object put course-videos/test/sample.mp4 --file output.mp4
```

R2 hỗ trợ HTTP range request → tua vùng chưa buffer hoạt động với signed URL.

## 4. CORS

**Lưu ý quan trọng:** thẻ `<video src>` thuần (không đặt `crossorigin`) **KHÔNG
lệ thuộc CORS** để phát — nên video vẫn chạy dù chưa cấu hình CORS. Vẫn nên set
CORS để dự phòng khi sau này dùng `fetch`/MSE/subtitle.

Cấu hình CORS cho bucket (R2 → bucket → Settings → CORS Policy), allow origin:

```json
[
  {
    "AllowedOrigins": [
      "https://course.nguyenvantai.com",
      "http://course.localhost:3001"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range", "Content-Type"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"],
    "MaxAgeSeconds": 3600
  }
]
```

Áp bằng dashboard, hoặc `wrangler r2 bucket cors put`, hoặc script API
(`zalo-worker/`-style) dùng `CLOUDFLARE_API_TOKEN` — token này phải là **Bearer
token hợp lệ 40 ký tự** với quyền `Workers R2 Storage:Edit`.

## 5. Kiểm tra

1. `pnpm build` xanh (aws-sdk import trong route không vỡ Turbopack).
2. Chưa login vào `/learn/<khoa>/<bai>` → redirect `/dang-nhap?next=…`.
3. Login → video phát (nếu env R2 đủ). Thiếu env → player hiện thông báo "Video
   chưa sẵn sàng. Kiểm tra cấu hình R2".
4. `POST /api/course/video-url` không session → 401; lesson không tồn tại → 400.

## Câu hỏi còn treo

- `CLOUDFLARE_API_TOKEN` hiện trong `.env.local` **sai format (37/40 ký tự)** →
  không dùng được để tự động cấu hình CORS qua API. Cần token Bearer đầy đủ nếu
  muốn tự động hoá; nếu không, cấu hình CORS thủ công qua dashboard.
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_ACCOUNT_ID` / `R2_BUCKET`
  chưa có trong `.env.local` → cần điền để video phát thật.
