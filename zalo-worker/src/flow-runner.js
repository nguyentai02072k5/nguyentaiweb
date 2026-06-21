// Engine thực thi flow automation: chạy step tuần tự, hỗ trợ delay qua webhook n8n
// (set run = waiting + POST n8n; n8n callback /api/flow/resume để chạy tiếp).

import crypto from "node:crypto";
import { config } from "./config.js";
import { getActiveFlow, getFlowById, createRun, getRun, updateRun, getLeadByPhone, hasRecentRun } from "./flow-store.js";
import { findUidByPhone, sendMessageToUid, sendFriendRequestToUid } from "./zalo-client.js";

// Resolve uid 1 lần/run rồi cache vào context (persist qua resume) — tránh findUser lặp.
async function ensureUid(context) {
  if (context.uid) return context.uid;
  const { uid } = await findUidByPhone(context.phone);
  context.uid = uid;
  return uid;
}

// Thay biến {{key}} bằng context[key] (rỗng nếu thiếu).
function applyVars(text, context) {
  if (!text) return "";
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => {
    const v = context?.[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

// Khởi chạy flow cho 1 liên hệ. flow truyền vào hoặc tự tìm theo source.
export async function startFlow({ flowId, source, context }) {
  const flow = flowId ? await getFlowById(flowId) : await getActiveFlow(source);
  if (!flow) throw new Error("Không tìm thấy flow phù hợp (chưa bật hoặc sai nguồn).");
  if (!context?.phone) throw new Error("Thiếu 'phone' trong context.");
  // Auto-trigger (không truyền flowId) → dedup 10' để không bắn trùng. Chạy thử
  // thủ công (có flowId) thì luôn cho chạy.
  if (!flowId && (await hasRecentRun(flow.id, context.phone, 10))) {
    return { status: "skipped", reason: "Đã có run gần đây cho SĐT này (dedup 10 phút)." };
  }
  const run = await createRun(flow.id, context);
  return executeFrom(flow, run, 0);
}

// n8n gọi lại sau khi hết thời gian chờ.
export async function resumeFlow({ runId, token, vars }) {
  const run = await getRun(runId);
  if (!run) throw new Error("Run không tồn tại.");
  if (run.status !== "waiting") throw new Error(`Run đang ở trạng thái '${run.status}', không thể resume.`);
  if (!run.resume_token || run.resume_token !== token) throw new Error("resume_token không hợp lệ.");
  const flow = await getFlowById(run.flow_id);
  if (!flow) throw new Error("Flow đã bị xóa.");
  const context = { ...run.context, ...(vars || {}) };
  await updateRun(run.id, { status: "running", context });
  return executeFrom(flow, { ...run, context }, run.current_step);
}

// Chạy các step từ index `idx`. Gặp delay_webhook → dừng (waiting) và trả về.
async function executeFrom(flow, run, idx) {
  const steps = Array.isArray(flow.steps) ? flow.steps : [];
  let context = { ...run.context };

  for (let i = idx; i < steps.length; i++) {
    const step = steps[i] || {};
    try {
      if (step.type === "delay_webhook") {
        const token = crypto.randomBytes(16).toString("hex");
        await updateRun(run.id, { status: "waiting", current_step: i + 1, resume_token: token, context });
        await postDelayWebhook(step.config, run.id, token, context);
        return { status: "waiting", runId: run.id, atStep: i };
      }

      if (step.type === "check_form") {
        // Check lead theo SĐT (form đã điền chưa) rồi gửi tin tương ứng.
        const source = step.config?.source || flow.trigger_source || null;
        const lead = await getLeadByPhone(context.phone, source);
        const filled = !!(lead && (lead.status === "submitted" || lead.submitted_at));
        context.form_filled = filled;
        context.lead_status = lead?.status || "none";
        context.trang_thai = filled ? "đã điền" : "chưa điền";
        if (lead?.full_name && !context.ten) context.ten = lead.full_name;

        const msg = filled ? step.config?.messageFilled : step.config?.messageNotFilled;
        if (msg && msg.trim()) {
          await sendMessageToUid(await ensureUid(context), applyVars(msg, context));
        }
      } else if (step.type === "send_friend_request") {
        const fr = await sendFriendRequestToUid(await ensureUid(context), applyVars(step.config?.message, context));
        if (!fr.ok) context.friend_error = fr.error; // lưu lý do vào run để debug
      } else if (step.type === "send_message") {
        await sendMessageToUid(await ensureUid(context), applyVars(step.config?.message, context));
      } else {
        // type lạ → bỏ qua (không chặn flow).
      }

      await updateRun(run.id, { current_step: i + 1, context });
    } catch (e) {
      await updateRun(run.id, { status: "failed", last_error: `step ${i} (${step.type}): ${e?.message}`, context });
      return { status: "failed", runId: run.id, atStep: i, error: e?.message };
    }
  }

  await updateRun(run.id, { status: "done", context });
  return { status: "done", runId: run.id };
}

async function postDelayWebhook(cfg, runId, token, context) {
  const url = cfg?.url;
  if (!url) throw new Error("delay_webhook thiếu 'url'.");
  const resumeUrl = config.publicBaseUrl
    ? `${config.publicBaseUrl}/api/flow/resume?runId=${runId}&token=${token}`
    : null;
  // Gửi kèm phone ở top-level cho n8n tiện dùng; context cũng chứa đầy đủ biến.
  const payload = { runId, resumeToken: token, resumeUrl, label: cfg.label ?? null, phone: context.phone, context };
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Gọi webhook n8n lỗi: HTTP ${res.status}`);
}
