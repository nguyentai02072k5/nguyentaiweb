// Cấu hình worker đọc từ biến môi trường. Không hardcode secret ở đây.
// Trên local: tạo file .env (xem .env.example) + chạy `node --env-file=.env src/index.js`.
// Trên Railway/Render: set biến môi trường trong dashboard.

export const config = {
  // Cổng HTTP — Railway/Render tự inject PORT.
  port: Number(process.env.PORT) || 8080,

  // Token bảo vệ các endpoint /api (gửi qua header x-api-token hoặc ?token=).
  // Để rỗng = tắt bảo vệ (chỉ nên dùng khi chạy local).
  apiToken: process.env.WORKER_API_TOKEN || "",

  // Supabase (service_role key — chỉ dùng phía server).
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Khóa mã hóa credential: 64 ký tự hex (32 byte) hoặc chuỗi bất kỳ (sẽ hash SHA-256).
  encKey: process.env.ZALO_ENC_KEY || "",

  // Định danh credential trong bảng (cho phép nhiều tài khoản sau này).
  credId: process.env.ZALO_CRED_ID || "default",

  // URL public của chính worker (để dựng resumeUrl gửi cho n8n callback).
  // VD: https://nguyentaiweb.onrender.com — KHÔNG có dấu / cuối.
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, ""),

  // User-Agent dùng khi login QR (nên cố định để session ổn định).
  userAgent:
    process.env.ZALO_USER_AGENT ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// Cảnh báo sớm nếu thiếu cấu hình bắt buộc cho việc lưu state.
export function assertStoreConfig() {
  const missing = [];
  if (!config.supabaseUrl) missing.push("SUPABASE_URL");
  if (!config.supabaseServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!config.encKey) missing.push("ZALO_ENC_KEY");
  if (missing.length) {
    throw new Error(`Thiếu biến môi trường: ${missing.join(", ")}`);
  }
}
