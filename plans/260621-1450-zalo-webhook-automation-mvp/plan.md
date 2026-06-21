# Zalo Webhook Automation — MVP

Subdomain `webhook.nguyenvantai.com` + worker Node độc lập chạy zca-js.

## Quyết định chốt (user)
- Runtime: **worker Node standalone** → deploy Railway/Render free tier (code chạy local y hệt). n8n account-only KHÔNG đủ (không cài được npm ngoài + không giữ session websocket).
- Lưu state: **Supabase**, credential mã hóa AES-256-GCM.
- Trigger: hook vào leads hiện có (Phase 2).
- Scope Phase 1 (MVP): QR login + lưu/khôi phục state + gửi tin nhắn theo SĐT (findUser→sendMessage) + parser format HTML.

## Kiến trúc
```
webhook.nguyenvantai.com (Next/Vercel)  --iframe-->  zalo-worker (Railway/Render, Node 24/7)
                                                         |-- zca-js (QR login, findUser, sendMessage)
                                                         |-- Supabase (zalo_credentials, encrypted)
```

## zca-js facts (đã verify từ dist/*.d.ts)
- `zalo.loginQR({userAgent}, cb)` — cb nhận event `.type` (LoginQRCallbackEventType: QRCodeGenerated=0, Expired=1, Scanned=2, Declined=3, GotLoginInfo=4). QRCodeGenerated.data.image = base64 PNG. GotLoginInfo.data = {cookie[], imei, userAgent}.
- Login lại: `zalo.login({cookie, imei, userAgent})`.
- `api.findUser(phone)` → {uid, display_name, zalo_name, ...}.
- `api.sendFriendRequest(msg, uid)`.
- `api.sendMessage({msg, styles, urgency}, threadId, ThreadType.User)`.
- TextStyle: Bold="b" Italic="i" Underline="u" StrikeThrough="s" Red="c_db342e" Orange="c_f27806" Yellow="c_f7b503" Green="c_15a85f" Small="f_13" Big="f_18". Style={start,len,st} (offset UTF-16).
- Format HTML `<b><red>..</red></b>` KHÔNG nhận trực tiếp → parser `html-to-styles.js` convert tag → styles[].

## Files
- `zalo-worker/` — service độc lập (package riêng, ESM JS).
- `src/proxy.ts` — thêm rewrite `webhook.*` → `/webhook`.
- `src/app/webhook/page.tsx` — control panel (iframe worker).
- `supabase/migrations/0012_init_zalo_credentials.sql`.

## Phase 2 (sau)
- Hook lead-capture → POST /api/send tới worker (fire-and-forget) khi khách đăng ký SĐT.
- Listener nhận reply khách → lưu/đẩy về CRM.
- Auto bắn link Meet gần giờ hẹn.

## Rủi ro
- Tài khoản Zalo có thể bị khóa khi dùng API không chính thức (cảnh báo của zca-js).
- Style offset tính theo UTF-16 — emoji astral có thể lệch nhẹ (chấp nhận MVP).
- Free tier có thể sleep → session mất; auto-login từ Supabase khi wake.
