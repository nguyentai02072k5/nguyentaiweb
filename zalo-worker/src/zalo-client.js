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

// Gửi lời mời kết bạn tới uid. Trả false nếu đã là bạn / lỗi (không chặn flow).
export async function sendFriendRequestToUid(uid, message) {
  const api = await ensureApi();
  try {
    await api.sendFriendRequest(message?.trim() || "Xin chào, kết bạn nhé!", uid);
    return true;
  } catch (e) {
    console.warn("[zalo] sendFriendRequest:", e?.message);
    return false;
  }
}

// --- High-level theo SĐT (dùng cho /api/send thủ công) ---

// findUser → (tùy chọn) kết bạn → sendMessage (có format).
export async function sendMessageByPhone({ phone, message, addFriend, friendMessage }) {
  const { uid, user } = await findUidByPhone(phone);
  let friendRequestSent = false;
  if (addFriend) friendRequestSent = await sendFriendRequestToUid(uid, friendMessage);
  const result = await sendMessageToUid(uid, message);
  return {
    uid,
    displayName: user?.display_name ?? user?.zalo_name ?? null,
    friendRequestSent,
    result,
  };
}

// Gửi riêng lời mời kết bạn theo SĐT.
export async function sendFriendRequestByPhone(phone, message) {
  const { uid } = await findUidByPhone(phone);
  const ok = await sendFriendRequestToUid(uid, message);
  return { uid, friendRequestSent: ok };
}

export async function logout() {
  state.api = null;
  state.userInfo = null;
  state.status = "logged_out";
  zalo = null;
  await clearCredentials();
}
