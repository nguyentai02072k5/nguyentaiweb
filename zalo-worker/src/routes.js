// Định nghĩa HTTP API + SSE cho việc đăng nhập QR và gửi tin nhắn.

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import * as zalo from "./zalo-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const router = express.Router();

// Bảo vệ /api bằng token (header x-api-token hoặc ?token=). Rỗng = tắt (chỉ local).
function requireToken(req, res, next) {
  if (!config.apiToken) return next();
  const token = req.get("x-api-token") || req.query.token;
  if (token !== config.apiToken) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// Health check KHÔNG cần token — cho Render/uptime ping (tránh 401 lúc deploy
// và dùng để giữ service "thức" nếu cần). Trả 200 ngay cả khi chưa login.
router.get("/healthz", (req, res) => {
  res.json({ ok: true, status: zalo.getStatus().status });
});

// Trạng thái phiên Zalo hiện tại (cần token).
router.get("/api/status", requireToken, (req, res) => {
  res.json(zalo.getStatus());
});

// Đăng nhập QR qua Server-Sent Events: stream các event qr / scanned / success / error.
// EventSource không set được header → token truyền qua ?token=.
router.get("/api/login/qr", requireToken, async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  // Heartbeat tránh proxy đóng kết nối idle.
  const ping = setInterval(() => res.write(": ping\n\n"), 15000);

  try {
    await zalo.loginQR((ev) => send(ev));
  } catch (e) {
    send({ type: "error", message: e?.message || "Lỗi đăng nhập QR" });
  } finally {
    clearInterval(ping);
    send({ type: "end" });
    res.end();
  }
});

// Gửi tin nhắn theo SĐT (kèm tùy chọn gửi lời mời kết bạn).
router.post("/api/send", requireToken, async (req, res) => {
  try {
    const { phone, message, addFriend, friendMessage } = req.body || {};
    if (!phone || !message) {
      return res.status(400).json({ ok: false, error: "Thiếu 'phone' hoặc 'message'." });
    }
    const result = await zalo.sendMessageByPhone({
      phone,
      message,
      addFriend: Boolean(addFriend),
      friendMessage,
    });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Gửi thất bại" });
  }
});

// Đăng xuất + xóa credential đã lưu.
router.post("/api/logout", requireToken, async (req, res) => {
  try {
    await zalo.logout();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});

// Trang điều khiển tĩnh.
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "control-panel.html"));
});
