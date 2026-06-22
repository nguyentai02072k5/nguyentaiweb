# Zalo Worker — Credential, ENV & Automation Flow (giải thích cặn kẽ)

Tài liệu này giải thích **mối quan hệ giữa các biến môi trường, credential Zalo, và automation flow** trên 3 "nơi": worker **local**, worker **Render**, và app **Next.js**. Đọc xong bạn sẽ biết: đổi biến ở file nào ảnh hưởng cái gì, đăng nhập trên Render vs localhost khác nhau ra sao, và khi chạy Flow thì dùng credential nào.

---

## 1. Có 3 "nơi" cấu hình — đừng nhầm lẫn

| Ký hiệu | Nơi | File/Chỗ đặt ENV | Chạy cái gì |
|---|---|---|---|
| **A** | Worker **local** | `zalo-worker/.env` (nạp bằng `node --env-file=.env src/index.js`) | Express worker zca-js ở `localhost:10000` |
| **B** | Worker **Render** | Render Dashboard → Environment (khai báo trong `render.yaml`) | Cùng code worker, chạy ở `https://nguyentaiweb.onrender.com` |
| **C** | App **Next.js** | `.env.local` (dev) **và** Vercel env (production) | Web admin + landing page (KHÔNG phải worker) |

> **Cốt lõi:** A và B là **cùng một code worker**, chỉ khác giá trị ENV. C là **ứng dụng khác** — nó chỉ *gọi sang* worker qua HTTP, không tự đăng nhập Zalo.

---

## 2. Bảng biến môi trường

### 2.1. Biến của WORKER (dùng ở A = `zalo-worker/.env` và B = Render)

Đọc trong `zalo-worker/src/config.js`:

| Biến | Ý nghĩa | Ghi chú |
|---|---|---|
| `PORT` | Cổng HTTP worker lắng nghe | Local đặt `10000`. Render **tự inject** (thường 10000) — không cần set. |
| `WORKER_API_TOKEN` | Token bảo vệ mọi route `/api/*` | Worker so khớp header `x-api-token` (hoặc `?token=`). **Rỗng = tắt bảo vệ** (chỉ nên dùng local). |
| `SUPABASE_URL` | URL dự án Supabase | Để đọc/ghi `zalo_credentials`, `automation_flows`, `automation_runs`, `leads`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (bypass RLS) | Bí mật, chỉ ở phía server. |
| `ZALO_ENC_KEY` | **Khóa AES** mã hóa/giải mã credential | 64 ký tự hex → dùng trực tiếp 32 byte; còn lại → SHA-256 ra 32 byte (`crypto-store.js`). |
| `ZALO_CRED_ID` | **ID dòng** credential trong bảng `zalo_credentials` | Mặc định `"default"`. Đây là "ngăn tủ" chứa phiên đăng nhập. **Biến quan trọng nhất để tách local/Render.** |
| `PUBLIC_BASE_URL` | URL public của chính worker | Dùng dựng `resumeUrl` gửi cho n8n callback (bước `delay_webhook`). |
| `ZALO_USER_AGENT` | User-Agent khi login QR | Nên cố định để phiên ổn định. |

### 2.2. Biến của APP Next.js (C = `.env.local` + Vercel)

Đọc trong `src/lib/automation/flow-actions.ts` và `trigger-lead-automation.ts`:

| Biến | Ý nghĩa | Ghi chú |
|---|---|---|
| `ZALO_WORKER_URL` **hoặc** `NEXT_PUBLIC_ZALO_WORKER_URL` | **URL worker mà app sẽ gọi tới** để trigger flow | App ưu tiên `ZALO_WORKER_URL`, không có thì lấy `NEXT_PUBLIC_ZALO_WORKER_URL`. **Đây quyết định flow chạy ở worker NÀO.** |
| `WORKER_API_TOKEN` | Token app gắn vào header khi gọi worker | **PHẢI khớp** `WORKER_API_TOKEN` của worker đích, nếu không worker trả `401`. |
| `SUPABASE_*` | Để admin CRUD flow (`supabaseAdmin`) | Lưu/sửa `automation_flows`. |

> ⚠️ `WORKER_API_TOKEN` xuất hiện ở **cả** worker (để *kiểm tra*) lẫn app (để *gửi*). Hai bên phải **bằng nhau** mới gọi được.

---

## 3. Credential hoạt động thế nào (phần mấu chốt)

### 3.1. Một bảng dùng chung: `zalo_credentials`

Code: `zalo-worker/src/supabase-credential-store.js`

```
Bảng zalo_credentials
┌─────────────┬──────────────────────────────┬──────────────┐
│ id (PK)     │ enc_payload (mã hóa)          │ display_name │
├─────────────┼──────────────────────────────┼──────────────┤
│ "default"   │ AES(cookie + imei + UA)       │ Nguyễn Tài   │  ← phiên của Render
│ "local"     │ AES(cookie + imei + UA)       │ Nguyễn Tài   │  ← phiên của local
└─────────────┴──────────────────────────────┴──────────────┘
        ▲                    ▲
        │                    └── giải mã bằng ZALO_ENC_KEY
        └── chọn dòng bằng ZALO_CRED_ID
```

- **Khi quét QR thành công**, worker chạy `saveCredentials()` → **upsert** một dòng có `id = ZALO_CRED_ID`, lưu cookie+imei **đã mã hóa bằng `ZALO_ENC_KEY`**.
- **Khi khởi động**, worker chạy `loadCredentials()` → đọc dòng `id = ZALO_CRED_ID`, **giải mã bằng `ZALO_ENC_KEY`** → auto-login (không cần QR).

### 3.2. Hai "chìa khóa" quyết định: `ZALO_CRED_ID` + `ZALO_ENC_KEY`

| Tình huống | Kết quả |
|---|---|
| 2 worker **cùng** `credId` + **cùng** `encKey` | Dùng **chung 1 phiên** (chung cookie+imei). Quét QR ở nơi này → **ghi đè** dòng → nơi kia auto-login đọc cookie mới. **→ Zalo coi là trùng thiết bị → dễ lỗi 311 khi gửi lời mời.** ❌ |
| 2 worker **khác** `credId` (cùng encKey) | **2 phiên độc lập**, 2 dòng riêng. Quét QR mỗi nơi 1 lần. Không đụng nhau. ✅ **Đây là cách tách local vs Render.** |
| Cùng `credId` nhưng **khác** `encKey` | Đọc được dòng nhưng **giải mã THẤT BẠI** (sai auth tag) → auto-login lỗi → phải quét QR lại. ❌ |
| `encKey` thay đổi sau khi đã lưu | Các credential cũ **không giải mã được nữa** → phải quét QR lại để ghi đè bằng key mới. ⚠️ |

---

## 4. Sơ đồ quan hệ tổng thể

```
        ┌──────────────────────── Supabase (CHUNG cho tất cả) ────────────────────────┐
        │  zalo_credentials   automation_flows   automation_runs   leads               │
        └───────▲───────────────────▲────────────────▲──────────────────────────────-─┘
                │ đọc/ghi theo        │ đọc flow        │ ghi run state
                │ credId+encKey       │ (enabled,steps) │ (friend_error...)
        ┌───────┴────────┐   ┌───────┴────────┐
        │ Worker LOCAL   │   │ Worker RENDER  │
        │ (A: .env)      │   │ (B: dashboard) │
        │ credId=local   │   │ credId=default │
        │ port 10000     │   │ port auto      │
        │ QR → dòng local│   │ QR → dòng deflt│
        └───────▲────────┘   └───────▲────────┘
                │ HTTP /api/flow/trigger      │
                │                             │
        ┌───────┴─────────────────────────-──┴───────┐
        │              App Next.js (C)                │
        │  ZALO_WORKER_URL  → trỏ tới worker NÀO      │
        │  WORKER_API_TOKEN → phải khớp worker đích   │
        │  - admin "Chạy thử" (flow-actions.ts)       │
        │  - auto-trigger lead (trigger-lead-...ts)   │
        └─────────────────────────────────────────────┘
```

**Điểm cần nhớ:**
- **Credential** gắn với **từng worker** (qua credId của worker đó), KHÔNG gắn với app Next.js.
- **App Next.js không đăng nhập Zalo.** Nó chỉ chọn *gọi worker nào* qua `ZALO_WORKER_URL`.

---

## 5. Khi tôi ĐĂNG NHẬP (quét QR) — chuyện gì xảy ra?

1. Bạn mở control panel của **một** worker (vd `http://localhost:10000` hoặc `https://nguyentaiweb.onrender.com`).
2. Quét QR bằng app Zalo điện thoại.
3. Worker đó bắt được cookie+imei → mã hóa bằng **`ZALO_ENC_KEY` của chính nó** → lưu vào dòng **`id = ZALO_CRED_ID` của chính nó**.

→ **Đăng nhập trên Render** ghi vào dòng `default` (theo cấu hình Render).
→ **Đăng nhập trên localhost** ghi vào dòng `local` (theo `zalo-worker/.env` hiện tại).

Hai lần đăng nhập này **độc lập** vì khác `credId` → đúng như bạn muốn để test tách bạch.

> Nếu **cùng account Zalo** đăng nhập ở cả 2 nơi: vẫn là 2 phiên/2 cookie riêng (vì credId khác). Zalo cho phép 1 tài khoản đăng nhập nhiều thiết bị, nhưng **gửi lời mời kết bạn dồn dập từ 2 phiên cùng lúc** vẫn có thể bị anti-spam. Test sạch nhất: **mỗi lúc chỉ chạy 1 worker**, hoặc dùng **2 account Zalo khác nhau**.

---

## 6. Khi tôi chạy FLOW — dùng credential nào?

Quy tắc: **Flow chạy trên worker nào → dùng credential của worker đó (theo credId của worker đó).**

Worker nào nhận lệnh chạy flow? Tùy **ai gọi `/api/flow/trigger` và gọi tới URL nào**:

| Cách trigger | Gọi tới URL | Flow chạy ở | Dùng credential |
|---|---|---|---|
| `curl` tới `localhost:10000` | local | Worker local | dòng `local` |
| `curl` tới `nguyentaiweb.onrender.com` | render | Worker Render | dòng `default` |
| Admin "Chạy thử" (dev, `.env.local`) | giá trị `ZALO_WORKER_URL`/`NEXT_PUBLIC_ZALO_WORKER_URL` trong `.env.local` | worker mà URL đó trỏ | credId của worker đó |
| Admin "Chạy thử" (production, Vercel) | giá trị `NEXT_PUBLIC_ZALO_WORKER_URL` trên Vercel | worker mà URL đó trỏ | credId của worker đó |
| Lead thật vào (auto-trigger) | `trigger-lead-automation.ts` → cùng biến URL như trên | worker mà URL đó trỏ | credId của worker đó |

→ **Flow KHÔNG tự chọn credential.** Nó chỉ gọi `sendMessage`/`sendFriendRequest` trên phiên Zalo **đang active của worker nhận request**. Phiên đó = credential mà worker đã load theo `credId` của nó.

---

## 7. Ma trận: ĐỔI biến ở file A / B / C → ảnh hưởng gì?

| Đổi biến | Ở đâu | Ảnh hưởng |
|---|---|---|
| `ZALO_CRED_ID` | A (`zalo-worker/.env`) | **Chỉ** worker local: đọc/ghi *dòng credential khác*. Phải restart worker. Không ảnh hưởng Render. |
| `ZALO_CRED_ID` | B (Render) | **Chỉ** Render: dùng dòng khác. Render redeploy/restart mới áp dụng. |
| `ZALO_ENC_KEY` | A hoặc B | Đổi khóa giải mã. Nếu khác key đã dùng lúc lưu → **credential cũ không giải mã được** → phải quét QR lại ở worker đó. |
| `WORKER_API_TOKEN` | A/B (worker) | Đổi token mà worker *kiểm tra*. Khi đó app (C) **phải đổi theo** cho khớp, nếu không bị `401`. |
| `WORKER_API_TOKEN` | C (app) | Đổi token app *gửi đi*. Phải khớp token của worker đích. |
| `ZALO_WORKER_URL` / `NEXT_PUBLIC_ZALO_WORKER_URL` | C (`.env.local`) | Đổi **worker mà app dev gọi tới** khi trigger flow (local ↔ render). |
| `NEXT_PUBLIC_ZALO_WORKER_URL` | C (Vercel) | Đổi worker mà **app production** gọi tới (quyết định lead thật chạy qua local hay render). |
| `PORT` | A | Đổi cổng worker local (vd 10000). Nhớ sửa URL app trỏ tới cho khớp. |
| `PUBLIC_BASE_URL` | A/B | Đổi URL trong `resumeUrl` gửi n8n (bước `delay_webhook`). |

---

## 8. Các lỗi hay gặp & nguyên nhân theo cấu hình

| Triệu chứng | Nguyên nhân theo ENV/credential |
|---|---|
| Gửi lời mời kết bạn lỗi **311** dù state người nhận sạch | Trùng phiên: local + Render **cùng `credId`** đang chạy song song; **hoặc** nội dung lời mời quá dài/quảng cáo (Zalo chặn). |
| Worker `logged_out` sau khi restart | Dòng `credId` chưa có credential (đã xóa / chưa quét QR) **hoặc** `ZALO_ENC_KEY` đổi nên giải mã fail. |
| App gọi worker bị **401** | `WORKER_API_TOKEN` của app (C) **không khớp** worker đích (A/B). |
| Trigger nhưng "không thấy gì chạy" | `ZALO_WORKER_URL` đang trỏ **sai worker** (vd trỏ render nhưng bạn đang xem log local). |
| Flow chạy đúng nhưng gửi từ **account sai** | Worker nhận request đang login bằng credential của **credId khác** với mong đợi. |

---

## 9. Cấu hình KHUYẾN NGHỊ (tách bạch local vs Render)

**Worker local — `zalo-worker/.env` (A):**
```dotenv
PORT=10000
ZALO_CRED_ID=local          # tách khỏi Render
ZALO_ENC_KEY=<đúng key đã dùng>
WORKER_API_TOKEN=           # rỗng cho dễ test local
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
PUBLIC_BASE_URL=            # local không cần n8n callback
```

**Worker Render — Dashboard (B):**
```
ZALO_CRED_ID=default
ZALO_ENC_KEY=<CÙNG key với local nếu muốn dùng chung được, nhưng credId khác là đủ tách>
WORKER_API_TOKEN=<token mạnh>
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
# PORT: KHÔNG set (Render tự inject)
PUBLIC_BASE_URL=https://nguyentaiweb.onrender.com
```

**App Next.js (C):**
- `.env.local` (dev) khi muốn test qua **local worker**:
  ```dotenv
  ZALO_WORKER_URL=http://localhost:10000
  WORKER_API_TOKEN=               # khớp worker local (đang rỗng)
  ```
- Vercel (production) khi muốn lead thật chạy qua **Render**:
  ```
  NEXT_PUBLIC_ZALO_WORKER_URL=https://nguyentaiweb.onrender.com
  WORKER_API_TOKEN=<khớp token Render>
  ```

**Quy tắc vàng để khỏi dính 311 do trùng phiên:** khi test local thì **tắt** việc Render dùng *cùng account* (hoặc chấp nhận 2 credId riêng + không bắn lời mời dồn dập từ 2 nơi cùng lúc).

---

## 10. Tóm tắt 1 dòng

- **`ZALO_CRED_ID`** = chọn "ngăn tủ" credential → tách phiên local/Render.
- **`ZALO_ENC_KEY`** = chìa khóa mở ngăn tủ đó → phải nhất quán.
- **`ZALO_WORKER_URL`** (bên app) = quyết định flow chạy ở worker nào → từ đó dùng credential nào.
- **`WORKER_API_TOKEN`** = phải khớp giữa app (gửi) và worker (kiểm tra).
- **Flow không chọn credential**; nó dùng phiên Zalo của **worker nhận request**.

---

## Câu hỏi chưa chốt

- Account Zalo dùng cho `local` và `default` có phải **cùng một** account không? Nếu cùng → vẫn nên tránh chạy 2 worker song song lúc bắn lời mời để khỏi nghi ngờ anti-spam.
- `ZALO_ENC_KEY` trên Render và local hiện có **giống nhau** không? (Nếu định thỉnh thoảng dùng chung 1 credId thì phải giống; nếu tách hẳn credId thì không bắt buộc.)
