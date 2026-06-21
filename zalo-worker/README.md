# Zalo Worker

Worker Node độc lập chạy [`zca-js`](https://github.com/RFS-ADRENO/zca-js): đăng nhập QR, lưu state (Supabase, mã hóa), gửi tin nhắn Zalo theo số điện thoại với format. Phục vụ trang `webhook.nguyenvantai.com`.

> ⚠️ zca-js là API Zalo **không chính thức**. Tài khoản có thể bị hạn chế/khóa. Dùng tài khoản phụ và gửi với tần suất hợp lý.

## Vì sao tách worker riêng?
zca-js cần 1 process Node chạy liên tục (giữ session + websocket). Vercel serverless và n8n Cloud **không** chạy được. Worker này chạy y hệt trên: máy bạn, Railway, Render, Fly.io.

## Chạy local
```bash
cd zalo-worker
npm install
cp .env.example .env   # điền SUPABASE_*, ZALO_ENC_KEY, WORKER_API_TOKEN
node --env-file=.env src/index.js
```
Mở http://localhost:8080 → nhập token → **Quét QR đăng nhập** → quét bằng Zalo trên điện thoại (~5s) → nhập SĐT + nội dung → **Gửi**.

Tạo `ZALO_ENC_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Trước khi chạy: tạo bảng Supabase
Áp migration `supabase/migrations/0012_init_zalo_credentials.sql` (qua Supabase CLI hoặc dán vào SQL Editor).

## Deploy lên Render (Free — khuyến nghị cho MVP)
1. Push repo lên GitHub.
2. Render Dashboard → **New → Blueprint** → chọn repo (Render đọc `render.yaml`, root `zalo-worker`).
   Hoặc **New → Web Service** → Root Directory `zalo-worker`, Build `npm install`, Start `node src/index.js`, Health Check Path `/healthz`.
3. Set biến môi trường (Environment): `WORKER_API_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ZALO_ENC_KEY`, (tùy chọn) `ZALO_USER_AGENT`. **KHÔNG set `PORT`** — Render tự inject.
4. Sau khi có URL (vd `https://zalo-worker.onrender.com`):
   - Mở URL → quét QR 1 lần (state lưu Supabase mã hóa, restart/wake tự login lại — không cần QR lại).
   - Đặt `NEXT_PUBLIC_ZALO_WORKER_URL` = URL này trên Vercel để trang `webhook.*` nhúng bảng điều khiển.

### Về cold-start của Render Free
- Service **ngủ sau ~15' không có request**. Lần gọi đầu sau khi ngủ mất **~30–50s** khởi động → worker auto-login lại từ Supabase rồi gửi bình thường. Trang `webhook.*` đã có overlay "đang đánh thức".
- `/healthz` không cần token (Render health check + ping không bị 401).
- **Muốn giữ thức (giảm cold-start, cần cho Phase 2 listener):** dùng dịch vụ ping miễn phí (vd cron-job.org / UptimeRobot) gọi `GET https://<app>.onrender.com/healthz` mỗi ~10–14'. Lưu ý điều này dùng gần hết 750h/tháng của Free (đủ cho 1 service duy nhất).
- Free tier không hợp listener nhận reply 24/7 (ngủ là mất kết nối) — Phase 2 nên dùng Render trả phí / Oracle Always Free VM.

## API
| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/status` | Trạng thái phiên |
| GET | `/api/login/qr` | SSE: stream QR + tiến trình đăng nhập |
| POST | `/api/send` | `{ phone, message, addFriend?, friendMessage? }` |
| POST | `/api/logout` | Đăng xuất + xóa state |

Tất cả `/api` cần header `x-api-token` (hoặc `?token=` cho SSE) nếu đặt `WORKER_API_TOKEN`.

### Format tin nhắn
Hỗ trợ tag: `<b> <i> <u> <s> <red> <orange> <yellow> <green> <big> <small>` (lồng nhau được). Parser `src/html-to-styles.js` convert sang `styles[]` của zca-js. Màu Zalo cố định: đỏ/cam/vàng/lục.

## Phase 2 (chưa làm)
- Hook lead-capture của app Next → POST `/api/send` khi khách đăng ký SĐT.
- Lắng nghe reply khách (`api.listener`) → đẩy về CRM.
- Tự bắn link Meet gần giờ hẹn.
