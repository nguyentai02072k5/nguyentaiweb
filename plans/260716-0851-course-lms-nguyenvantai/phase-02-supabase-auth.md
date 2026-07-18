---
phase: 2
title: "Supabase Auth"
status: pending
priority: P1
dependencies: [1]
---

# Phase 2: Supabase Auth

## Overview

Đăng nhập học viên miễn phí bằng Supabase Auth, cookie-based SSR qua `@supabase/ssr` cho Next 16. Trang `/course/dang-nhap`, callback route, đăng xuất. KHÔNG đụng auth admin HMAC. <!-- Updated: Validation Session 1 - v1 CHỈ magic-link email; Google OAuth HOÃN v1.1 (callback vẫn viết OAuth-ready, chỉ ẩn nút Google). -->
**v1 scope: chỉ magic-link email.** Google OAuth hoãn v1.1 — callback route viết sẵn nhận cả code OAuth để bật sau không phải sửa cấu trúc.

## Requirements

- Functional: user nhập email → nhận magic link → đăng nhập. Session lưu cookie, đọc được ở Server Component. Có đăng xuất. (Nút "Đăng nhập Google" hoãn v1.1.)
- Non-functional: session không rò sang bundle client (anon key ok để lộ, service-role thì không); redirect `next` param an toàn (chỉ path nội bộ, chống open-redirect).

## Architecture

- **Package**: chỉ thêm `@supabase/ssr`. **`NEXT_PUBLIC_SUPABASE_ANON_KEY` ĐÃ tồn tại** (`.env.local.example:8`, cạnh URL `:7` + service-role `:9`) — KHÔNG phải env mới; chỉ cần xác nhận đã set trên Vercel, không thêm var trùng. (RT-13)
- **Clients** `src/lib/supabase/` (tất cả module server-side dưới đây BẮT BUỘC `import 'server-only'` ở dòng đầu — guard build-time, không dựa grep thủ công; browser-client KHÔNG có) (RT-13):
  - `browser-client.ts` — `createBrowserClient` (anon key), dùng trong Client Component login. (KHÔNG `server-only`.)
  - `ssr-client.ts` (`server-only`) — `createServerClient` gắn `cookies()` của Next (get/set/remove) cho Route Handler / Server Action. **Cảnh báo RSC (RT-2)**: RSC KHÔNG ghi được cookie → khi SDK xoay access token (TTL ~1h) callback `setAll` bị drop. Vì vậy `setAll` phải `try/catch` nuốt lỗi khi gọi trong RSC; **điểm refresh THẬT nằm ở proxy** (xem dưới) + Server Action. TÁCH BIỆT hoàn toàn với `server-client.ts` (service-role) — comment rõ.
  - `get-user.ts` (`server-only`) — helper `getCurrentUser()` **BẮT BUỘC `const { data } = await supabase.auth.getUser()`** (revalidate JWT), **CẤM `getSession()`** cho authz (RT-1). Trả user|null; dùng ở layout gate (phase 3) + account (phase 4).
- **Proxy refresh + header (RT-2/RT-3, sửa RT2-10)** trong `src/proxy.ts`, nhánh `course.*`: **BỎ QUA `/api/course/*`** (`if (pathname.startsWith('/api')) return NextResponse.next()` trước khi tạo client — tránh double round-trip vì mint API tự `requireCourseUser()`). Với route trang: tạo `createServerClient` trên `NextResponse`, gọi **`await supabase.auth.getSession()`** (KHÔNG `getUser()` — chỉ cần exchange refresh-token để xoay cookie; `getUser()` là HTTP revalidate đắt, để dành cho gate) và **forward cookie đã set** (nơi DUY NHẤT ghi cookie refresh cho navigation RSC); `requestHeaders.set('x-pathname', url.pathname)` → `NextResponse.rewrite(url, { request: { headers: requestHeaders }})`. KHÔNG redirect-gate. Layout đọc `(await headers()).get('x-pathname')`.
- **Edge-runtime compat (RT2-11)**: proxy chạy Edge (proxy.ts:9 ghi rõ Node `crypto` vắng). `@supabase/ssr` CHƯA từng chạy ở repo này → **spike bắt buộc**: deploy 1 proxy tối thiểu gọi `createServerClient` + `getSession()` lên **Vercel Edge thật** (không chỉ `next dev`) trước khi xây P3–P5. Nếu SDK không Edge-safe → cân nhắc `runtime: 'nodejs'` cho proxy (đổi đặc tính cold-start — quyết định ngay).
- **Cookie flags (RT2-7)**: cookie session Supabase (viết ở proxy + callback) BẮT BUỘC `httpOnly: true, secure: (prod), sameSite: 'lax', path: '/'` — mirror `adminCookieOptions` (`src/lib/admin/session.ts:72-80`). Chống XSS đọc token.
- **Routes**:
  - `src/app/course/dang-nhap/page.tsx` — form email (magic-link) gọi `supabase.auth.signInWithOtp`. **Throttle + intent (RT2-9)**: `signInWithOtp` là endpoint không auth gửi email/lần → dễ email-bomb/enumeration. Thêm throttle trước khi gửi (per-email + per-IP, đặt ở Server Action/route để không bypass client-side), chốt `options.shouldCreateUser` (mặc định `true` = ai nhập email cũng tạo user — hợp "đăng ký free", xác nhận là chủ đích), ghi rõ phụ thuộc rate-limit email project-level của Supabase (quota dùng chung). (Nút Google + `signInWithOAuth` để sẵn code path nhưng ẨN ở v1, bật v1.1.)
  - `src/app/course/auth/callback/route.ts` — Route Handler: **try/catch quanh `exchangeCodeForSession(code)`** (RT-14). Lỗi/expired/đã tiêu thụ (mail client như Outlook/Apple Mail prefetch nuốt one-time code) → `redirect('/course/dang-nhap?error=link-expired&next=' + safeNext)` kèm UI "link hết hạn, gửi lại", KHÔNG để 500/loop. Thành công → `redirect(safeNext)`.
  - **`safe-next-path.ts` — thuật toán cụ thể (RT-12)**, KHÔNG chỉ `startsWith('/course')`: reject nếu `next` không khớp `^/[^/\\]` (loại protocol-relative `//evil.com` và backslash `/\evil.com`); sau đó `new URL(next, base).pathname` rồi require `startsWith('/course')`; fail → fallback `/course`.
  - Đăng xuất: Server Action `signOut()` → `supabase.auth.signOut()` → redirect `/course`.
- **Supabase dashboard config** (ghi vào README/docs, không phải code): bật Email provider (magic link) + Redirect URLs `https://course.nguyenvantai.com/course/auth/callback` + `http://course.localhost:3001/course/auth/callback`. (Google provider: bật ở v1.1 khi cần.)
- **Proxy**: `/course/dang-nhap` và `/course/auth/*` vẫn public (đã nằm trong nhánh rewrite `course.*` phase 1) — không cần thêm gate.

## Related Code Files

- Modify: `package.json` (`@supabase/ssr`), `.env.example`/docs (anon key + redirect URLs)
- Create: `src/lib/supabase/browser-client.ts`, `src/lib/supabase/ssr-client.ts`, `src/lib/supabase/get-user.ts`, `src/app/course/dang-nhap/page.tsx`, `src/app/course/auth/callback/route.ts`, `src/components/course/login-form.tsx`, `src/lib/course/safe-next-path.ts`
- Reference: `src/lib/supabase/server-client.ts` (mẫu lazy client + `server-only`)

## Implementation Steps

1. `pnpm.cmd add @supabase/ssr`; thêm env anon key.
2. `browser-client.ts` + `ssr-client.ts` + `get-user.ts`.
3. `safe-next-path.ts` (whitelist path `/course...`).
4. `login-form.tsx` (magic-link; Google button ẩn/feature-flag v1.1) + trang `/course/dang-nhap`.
5. Callback route `exchangeCodeForSession` + redirect an toàn.
6. Server Action `signOut` + nút đăng xuất (đặt tạm ở header course).
7. Config Supabase dashboard (Email magic-link + redirect URLs); ghi hướng dẫn vào docs. (Google để v1.1.)
8. Verify local: đăng nhập magic-link (dùng Inbucket/log link dev), session đọc được ở một Server Component test.

## Success Criteria

- [ ] Đăng nhập magic-link thành công, `getCurrentUser()` trả user ở server.
- [ ] `getCurrentUser()` dùng `auth.getUser()` (grep xác nhận KHÔNG `getSession()` trong đường authz). (RT-1)
- [ ] Session sống >1h vẫn hoạt động qua navigation RSC (proxy refresh cookie chạy — không bị đá về login sau 1h). (RT-2)
- [ ] Deep-link bài bị gate → login xong về ĐÚNG bài (nhờ `x-pathname` → `next`). (RT-3)
- [ ] (v1.1) Google OAuth chạy tới màn consent — KHÔNG tính vào nghiệm thu v1.
- [ ] Đăng xuất xoá session, quay lại ẩn danh.
- [ ] `next=//evil.com` và `next=/\evil.com` → fallback `/course`; chỉ path `/course...` hợp lệ được nhận. (RT-12)
- [ ] Magic-link đã tiêu thụ/expired → trang "link hết hạn" + nút gửi lại, KHÔNG 500/loop. (RT-14)
- [ ] Các module server (`ssr-client`, `get-user`) có `import 'server-only'`; service-role không vào client bundle. (RT-13)
- [ ] Proxy dùng `getSession()` (KHÔNG `getUser()`) để refresh; `/api/course/*` không kích hoạt refresh (grep). (RT2-10)
- [ ] Spike `@supabase/ssr` chạy OK trên Vercel Edge thật (không 500). (RT2-11)
- [ ] Cookie session có `httpOnly+secure(prod)+sameSite=lax`. (RT2-7)
- [ ] `signInWithOtp` có throttle per-email/IP; `shouldCreateUser` set tường minh. (RT2-9)
- [ ] Lint + build xanh.

## Risk Assessment

- **`@supabase/ssr` cookie API lệch Next 16**: `cookies()` là async trong Next 15+. Mitigation: dùng đúng `await cookies()` trong handler/RSC; theo docs `@supabase/ssr` bản mới.
- **Open-redirect qua `next`**: bắt buộc validate whitelist path.
- **Nhầm client**: dev có thể import nhầm `server-client` (service-role) cho auth. Mitigation: comment cảnh báo + tên file rõ + review.
- **Lộ anon vs service**: chỉ anon key được `NEXT_PUBLIC_`. Kiểm tra không có `SERVICE_ROLE` prefix public.
