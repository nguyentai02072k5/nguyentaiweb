// Bootstrap worker: khởi tạo Express, CORS, mount routes, auto-login khi start.

import express from "express";
import { router } from "./routes.js";
import { config } from "./config.js";
import { tryAutoLogin } from "./zalo-client.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// CORS mở cho /api (đã có token bảo vệ) — cho phép trang webhook.* (Vercel) gọi sang nếu cần.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-api-token");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(router);

app.listen(config.port, async () => {
  console.log(`[zalo-worker] Đang chạy tại http://localhost:${config.port}`);
  try {
    const ok = await tryAutoLogin();
    console.log(
      ok
        ? "[zalo-worker] Auto-login thành công từ credential đã lưu."
        : "[zalo-worker] Chưa có/ hết hạn credential — mở trang điều khiển để quét QR.",
    );
  } catch (e) {
    console.warn("[zalo-worker] Bỏ qua auto-login:", e?.message);
  }
});
