# Automation Flow Builder (step-list kéo-thả) + Engine

## Quyết định (user)
- Builder: **step-list kéo-thả** (không React Flow) — nhẹ, mobile-friendly.
- Vị trí: **admin.nguyenvantai.com** (auth sẵn qua proxy.ts).
- Hẹn giờ: **node delay = webhook chờ n8n** — worker POST sang n8n (webhook.mooly.vn), n8n giữ thời gian rồi callback `/api/flow/resume` → worker chạy tiếp. Né Render ngủ (callback đánh thức).
- Scope: Trigger (lead) + Delay-webhook + Send friend request + Send message (format + biến `{{ten}}`,`{{sdt}}`,`{{link_meet}}`).

## Data (Supabase) — migration 0013
- `automation_flows`: id, name, enabled, trigger_source (null|mooly|infor), steps jsonb, timestamps.
- `automation_runs`: id, flow_id, status (running|waiting|done|failed), context jsonb, current_step, resume_token, last_error, timestamps.

## Step JSON
```
{ id, type, config }
- send_friend_request: { message }
- send_message:        { message }    // tag format + {{biến}}
- delay_webhook:       { url, label }  // n8n wait; worker gửi {runId, resumeToken, resumeUrl, context}
```
Trigger ở cấp flow (trigger_source). Context khởi tạo: { phone, ten, ... }. Biến `{{key}}` → context[key]. Vars thay trước, rồi htmlToStyles parse tag.

## Worker (mới)
- `src/flow-store.js` — đọc flow active theo source, CRUD runs (Supabase).
- `src/flow-runner.js` — runFlow / resumeFlow / executeFrom; delay_webhook → set waiting + POST n8n; action → substitute + gửi.
- `zalo-client.js` thêm `sendFriendRequestByPhone`.
- routes: `POST /api/flow/trigger` (token), `POST /api/flow/resume?runId&token` (dùng resume_token, không cần api token).
- config: thêm `PUBLIC_BASE_URL` (Render URL) để dựng resumeUrl.

## Next admin (mới)
- `src/lib/automation/flow-types.ts`, `sample-template.ts`.
- `src/lib/automation/flow-actions.ts` — server actions: list/get/save/delete/toggle + testTrigger (gọi worker bằng WORKER_API_TOKEN + ZALO_WORKER_URL server env).
- `src/app/admin/automation/page.tsx` (list) + `[id]/page.tsx` (builder).
- `src/components/admin/automation/`: `flow-builder.tsx` (kéo-thả HTML5), `step-editor.tsx`, `message-format-editor.tsx` (toolbar tag + chèn biến + preview).

## Sample template (nút "Nạp mẫu")
1. send_friend_request (mời kết bạn) → 2. send_message (template chào + format) → 3. delay_webhook (chờ gần giờ hẹn qua n8n) → 4. send_message (link Meet {{link_meet}}).

## Env thêm
- Worker: `PUBLIC_BASE_URL=https://nguyentaiweb.onrender.com`.
- Next/Vercel: `ZALO_WORKER_URL` (server) + `WORKER_API_TOKEN` (server) để server action gọi worker.

## Trạng thái: ✅ DONE (Phase 1)
- Worker engine + endpoints, migration 0013, builder admin, nav tab, env — xong, tsc 0 lỗi, syntax worker OK.
- Cần làm thủ công: áp migration 0013 lên Supabase; set `PUBLIC_BASE_URL` trên Render; set `WORKER_API_TOKEN`+`ZALO_WORKER_URL` (hoặc `NEXT_PUBLIC_ZALO_WORKER_URL`) trên Vercel; redeploy worker (Render) để có endpoint flow.

## Phase sau
- Hook lead-capture thật (record-lead-open / submit_lead) → tự gọi /api/flow/trigger.
- Listener nhận reply → dừng flow nếu khách đã trả lời.
