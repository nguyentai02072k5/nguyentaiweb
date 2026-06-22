// Singleton quản lý phiên Zalo qua zca-js: QR login, auto re-login từ Supabase,
// tìm user theo SĐT, gửi kết bạn, gửi tin nhắn (có format).

import { Zalo, ThreadType, Urgency, LoginQRCallbackEventType } from "zca-js";
import { config } from "./config.js";
import { htmlToStyles } from "./html-to-styles.js";
import {
  saveCredentials,
  loadCredentials,
  clearCredentials,
} from "./supabase-credential-store.js";

const state = {
  api: null,
  status: "logged_out", // logged_out | awaiting_qr | scanned | logged_in
  userInfo: null, // { name, avatar }
  loginInProgress: false,
};
let zalo = null;

export function getStatus() {
  return {
    status: state.status,
    loggedIn: !!state.api,
    userInfo: state.userInfo,
  };
}

// Thử đăng nhập lại bằng credential đã lưu (không cần QR). Gọi lúc khởi động + lazy khi gửi.
export async function tryAutoLogin() {
  if (state.api) return true;
  try {
    const stored = await loadCredentials();
    if (!stored) return false;
    zalo = new Zalo();
    state.api = await zalo.login(stored.creds); // { cookie, imei, userAgent }
    state.status = "logged_in";
    state.userInfo = { name: stored.displayName ?? null };
    return true;
  } catch (e) {
    console.error("[zalo] Auto-login thất bại:", e?.message);
    state.api = null;
    state.status = "logged_out";
    return false;
  }
}

// Đăng nhập bằng QR. onEvent đẩy sự kiện realtime ra ngoài (SSE) để hiển thị QR/scan/success.
export async function loginQR(onEvent) {
  if (state.loginInProgress) throw new Error("Đang có phiên quét QR khác, thử lại sau.");
  state.loginInProgress = true;
  state.status = "awaiting_qr";

  let captured = null; // { cookie, imei, userAgent } từ event GotLoginInfo
  let scanned = null; // { display_name, avatar } từ event QRCodeScanned

  try {
    zalo = new Zalo();
    const api = await zalo.loginQR({ userAgent: config.userAgent }, (event) => {
      switch (event.type) {
        case LoginQRCallbackEventType.QRCodeGenerated:
          onEvent({ type: "qr", image: event.data?.image });
          break;
        case LoginQRCallbackEventType.QRCodeScanned:
          state.status = "scanned";
          scanned = {
            display_name: event.data?.display_name,
            avatar: event.data?.avatar,
          };
          onEvent({ type: "scanned", data: scanned });
          break;
        case LoginQRCallbackEventType.QRCodeExpired:
          onEvent({ type: "expired" });
          break;
        case LoginQRCallbackEventType.QRCodeDeclined:
          onEvent({ type: "declined" });
          break;
        case LoginQRCallbackEventType.GotLoginInfo:
          captured = {
            cookie: event.data?.cookie,
            imei: event.data?.imei,
            userAgent: event.data?.userAgent,
          };
          break;
        default:
          break;
      }
    });

    state.api = api;
    state.status = "logged_in";
    state.userInfo = { name: scanned?.display_name ?? null, avatar: scanned?.avatar ?? null };

    // Lưu credential để các lần sau login lại không cần QR.
    if (captured?.cookie && captured?.imei) {
      await saveCredentials(captured, scanned?.display_name ?? null);
    } else {
      console.warn("[zalo] Không bắt được GotLoginInfo — lần sau có thể phải quét QR lại.");
    }

    onEvent({ type: "success", userInfo: state.userInfo });
    return api;
  } finally {
    state.loginInProgress = false;
  }
}

// Bảo đảm có api sẵn sàng (lazy auto-login nếu cần).
async function ensureApi() {
  if (state.api) return state.api;
  const ok = await tryAutoLogin();
  if (!ok || !state.api) {
    throw new Error("Chưa đăng nhập Zalo. Hãy quét QR ở trang điều khiển trước.");
  }
  return state.api;
}

// --- Low-level theo uid (tái dùng, tránh gọi findUser lặp trong 1 flow) ---

// Tìm uid Zalo theo SĐT.
export async function findUidByPhone(phone) {
  const api = await ensureApi();
  const user = await api.findUser(String(phone).trim());
  const uid = user?.uid ?? user?.userId;
  if (!uid) throw new Error("Không tìm thấy tài khoản Zalo với số điện thoại này.");
  return { uid, user };
}

// Gửi tin nhắn (có format) tới uid.
export async function sendMessageToUid(uid, message) {
  const api = await ensureApi();
  const { text, styles } = htmlToStyles(message);
  return api.sendMessage({ msg: text, styles, urgency: Urgency.Default }, uid, ThreadType.User);
}

// Khi gửi lời mời lỗi, hỏi Zalo trạng thái thật của uid để biết lý do chính xác
// (đã là bạn / đã có lời mời đang chờ / bị chặn...). Không bao giờ throw — chỉ log.
async function probeFriendState(api, uid) {
  const out = {};
  try {
    out.requestStatus = await api.getFriendRequestStatus(uid);
  } catch (e) {
    out.requestStatus = `err: ${e?.code ?? ""} ${e?.message ?? e}`;
  }
  try {
    const sent = await api.getSentFriendRequest();
    // Có thể là mảng hoặc object map; chỉ cần biết uid này có nằm trong danh sách đã gửi.
    const flat = JSON.stringify(sent ?? "");
    out.alreadySent = flat.includes(String(uid));
  } catch (e) {
    out.alreadySent = `err: ${e?.code ?? ""} ${e?.message ?? e}`;
  }
  return out;
}

// Codes coi là "không cần gửi lại" (không phải lỗi thật sự cần chặn flow):
// 225 đã là bạn, 222 người kia đã gửi lời mời (request tự thành accept).
const BENIGN_FRIEND_CODES = new Set([225, 222]);

// Gửi lời mời kết bạn tới uid. KHÔNG nuốt lỗi: trả { ok, error, code, benign }.
// Lời mời kết bạn là TEXT thuần → strip tag format (Zalo không hỗ trợ; tag thừa
// có thể khiến request fail). Mã hay gặp: 225 đã là bạn, 215 bị chặn,
// 222 người kia đã gửi lời mời trước, 31 quá 30 lời mời/24h hoặc đầy danh bạ,
// 311 Zalo từ chối (thường do trùng phiên đăng nhập / anti-spam / quyền riêng tư).
export async function sendFriendRequestToUid(uid, message) {
  const api = await ensureApi();
  const plain = htmlToStyles(message?.trim() || "Xin chào, kết bạn nhé!").text;
  try {
    await api.sendFriendRequest(plain, uid);
    return { ok: true };
  } catch (e) {
    const code = e?.code ?? null;
    const error = code ? `${e?.message} (code ${code})` : e?.message || String(e);
    // Probe trạng thái thật để debug (in log + trả về để lưu vào run).
    const state = await probeFriendState(api, uid);
    console.error("[zalo] sendFriendRequest FAILED:", { code, message: e?.message, uid, state });
    return { ok: false, error, code, benign: code != null && BENIGN_FRIEND_CODES.has(code), state };
  }
}

// --- High-level theo SĐT (dùng cho /api/send thủ công) ---

// findUser → (tùy chọn) kết bạn → sendMessage (có format).
export async function sendMessageByPhone({ phone, message, addFriend, friendMessage }) {
  const { uid, user } = await findUidByPhone(phone);
  let friendRequestSent = false;
  let friendError = null;
  if (addFriend) {
    const fr = await sendFriendRequestToUid(uid, friendMessage);
    friendRequestSent = fr.ok;
    friendError = fr.error ?? null;
  }
  const result = await sendMessageToUid(uid, message);
  return {
    uid,
    displayName: user?.display_name ?? user?.zalo_name ?? null,
    friendRequestSent,
    friendError,
    result,
  };
}

// Gửi riêng lời mời kết bạn theo SĐT.
export async function sendFriendRequestByPhone(phone, message) {
  const { uid } = await findUidByPhone(phone);
  const fr = await sendFriendRequestToUid(uid, message);
  return { uid, friendRequestSent: fr.ok, friendError: fr.error ?? null };
}

export async function logout() {
  state.api = null;
  state.userInfo = null;
  state.status = "logged_out";
  zalo = null;
  await clearCredentials();
}
