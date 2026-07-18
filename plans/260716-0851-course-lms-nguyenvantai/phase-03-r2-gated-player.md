---
phase: 3
title: "R2 gated player"
status: done
priority: P1
dependencies: [1, 2]
completedAt: "2026-07-18"
---

> **DONE 2026-07-18 (code) — CẦN env R2 thật + e2e trước khi tính hoàn tất.**
> Route THẬT theo pivot: `/course/learn/[khoa]/[bai]` (không phải `/course/[khoa]/hoc/[bai]`).
> Đã implement: `r2/client.ts` (signed URL TTL 4h, lazy client), `require-course-user.ts`,
> `rate-limit.ts` (token-bucket per-instance, residual trung thực), `ui/sheet.tsx` (drawer
> cạnh, render inline không portal để giữ scope `.course-app`), `ui/tabs.tsx` (Radix a11y),
> `course/layout.tsx` mount `<Toaster theme="dark">`, `learn/layout.tsx` gate force-dynamic,
> `learn/[khoa]/[bai]/page.tsx` mint server-side + noindex, API `video-url` (requireCourseUser
> + rate-limit + verify lesson), `classroom-shell`/`course-sidebar`/`lesson-player`/`lesson-nav`/
> `classroom-topbar`, `next.config.ts` serverExternalPackages aws-sdk, `.env.local.example` R2 vars,
> `docs/course-r2-video-setup.md`.
> Verify: lint 0 error, `next build` xanh, route `ƒ /course/learn/[khoa]/[bai]` + `ƒ /api/course/video-url`
> đều Dynamic (không prerender — RT-5 ✔). Runtime (dev, Host: course.localhost:3001):
> GET `/learn/...` chưa auth → 307 `/dang-nhap?next=/course/learn/...` ✔; POST `/api/course/video-url`
> chưa auth → 401 ✔.
> **R2 provisioned + e2e ✔ (2026-07-18):** account `c7fd050…`, bucket `course`, tạo R2 S3 token
> `course-video-signer` (Read+Write) → 4 biến `R2_*` ghi vào `.env.local`; CORS set (course.nguyenvantai.com
> + course.localhost:3001); upload video test `test/sample.mp4` (+faststart). Presigned GET trả 206 range,
> content-type video/mp4, accept-ranges bytes → phát + seek OK.
> **Code review (2026-07-18, code-reviewer):** 0 Critical, 1 High + M/L. Đã FIX trong `lesson-player.tsx`:
> H1 (debounce set MỌI lần thử refresh, không chỉ khi thành công → chống spam mint khi onError lặp),
> M1 (listener `loadedmetadata` dùng `{once:true}` + capture element local), L2 (bỏ qua MEDIA_ERR_DECODE
> code 3 — re-sign không cứu lỗi codec). Re-lint 0 error, re-build xanh. Report:
> `plans/reports/code-reviewer-260718-1310-course-phase-03-r2-gated-player-report.md`.
> Reviewer xác nhận ĐÚNG (không đảo ngược): RT-1 getUser authz, RT-5 force-dynamic, RT-6 mint trust boundary
> đủ lớp + videoKey server-map (client không điều khiển), secret R2 không rò client, RT2-13 mint server-side,
> gate "không kiểm lesson.free" là ĐÚNG thiết kế free=đăng-nhập-xem-hết.
> **Loop/retry audit (2026-07-18, code-reviewer):** 0 Critical. Xác nhận KHÔNG có vòng redirect auth
> (dang-nhap/callback là sibling ngoài gate) và proxy không tự-kích-lại (rewrite + skip /api). Phát hiện
> H-1 flapping (video bật↔rớt → `handleRecovered` reset counter giữa chừng → cap-liên-tiếp không đạt →
> refresh vô hạn ~1/5s) → FIX: thêm cap CỬA SỔ (6 refresh/60s, recovered KHÔNG reset) + M-1 guard timer
> `fatal` + manual-retry xoá cửa sổ. Cũng đã: cap 3 lỗi liên tiếp, bỏ qua MediaError code 1/3,
> `prefetch={false}` link gated (chống prefetch farm getUser+mint). Re-lint 0 error, re-build xanh.
> Report: `plans/reports/code-reviewer-260718-1345-course-loop-retry-reload-audit-report.md`.
> **Residual (còn lại):** e2e browser đăng nhập magic-link → phát video (cần thao tác người dùng thật);
> `USER_CLOUDFLARE_API_TOKEN` là Global API Key (toàn quyền) — nên revoke/thay bằng token scoped sau khi xong.

# Phase 3: R2 gated player

## Overview

Khu học tập `/course/[khoa]/hoc/[bai]`: layout "lớp học" gated bằng session (chưa login → redirect `/course/dang-nhap?next=…`). Video phát qua R2 signed URL TTL ngắn mint per-request. UI: PC 2 cột (sidebar + player), Mobile video sticky + drawer.

## Requirements

- Functional: chỉ user đăng nhập xem được player; sidebar liệt kê chương/bài, bài hiện tại highlight; prev/next; nội dung MDX bài; video tải qua signed URL.
- Non-functional: signed URL TTL ~4h (phủ 1 bài, RT-7), không cache vào HTML tĩnh; bucket private; CORS chỉ `course.nguyenvantai.com`; mint API gated + rate-limit.

## Architecture

- **Gate (RT-5)**: `src/app/course/[khoa]/hoc/layout.tsx` (Server Component) **BẮT BUỘC `export const dynamic = 'force-dynamic'`** và KHÔNG `generateStaticParams` cho subtree `hoc/*` (mẫu `src/app/admin/page.tsx:13`, `infor/[phone]/page.tsx:21`). Không có → gate chạy build-time (cookie null) = vô hiệu hoặc build lỗi. Gate: `getCurrentUser()` null → `redirect('/course/dang-nhap?next=' + (await headers()).get('x-pathname'))` (pathname từ header proxy inject — RT-3, layout không tự đọc được pathname). Route `hoc/[bai]/page.tsx` cũng `force-dynamic`.
- **Trust boundary thật là mint API, KHÔNG phải layout (RT-6)**: layout chỉ gate render trang; `/api/course/video-url` là route SIBLING, KHÔNG thừa hưởng `hoc/layout.tsx`, và proxy `course.*` bỏ qua `/api` (không gate edge). Vì vậy: tạo helper dùng chung `src/lib/course/require-course-user.ts` (`requireCourseUser()` → `getCurrentUser()` hoặc 401) và MỌI `/api/course/*` phải gọi nó.
- **Rate-limit — trung thực về Vercel (RT2-8)**: token-bucket in-memory là **per-instance, reset mỗi cold start**, KHÔNG chặn cross-instance trên serverless (đúng cảnh báo `phan-tich-DRMcourse.txt:21`). Hai lựa chọn, ghi rõ vào code + success criteria: (a) chấp nhận residual "best-effort per-instance" (nội dung FREE nên tác hại giới hạn — URL 4h coi như public-cho-user-đã-đăng-ký), HOẶC (b) backing bằng shared store (bảng Supabase counter / Vercel KV) nếu cần cap thật. KHÔNG viết "rate-limit chặn farming" như đã xong nếu chọn (a).
- **R2 signed URL (RT-7)**: `src/lib/r2/client.ts` (`server-only`; AWS SDK S3 `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, R2 endpoint). `getSignedVideoUrl(videoKey)` → presigned GET, **`expiresIn` đủ dài phủ 1 bài (vd 4h/14400s)** thay vì 300s — 300s hết hạn giữa bài dài, seek vùng chưa buffer → 403. R2 presigned GET hỗ trợ tới 7 ngày; với lead-magnet free không heartbeat, TTL ngắn không tăng bảo mật đáng kể mà phá UX. Env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- **Mint URL initial SERVER-SIDE, bỏ waterfall (RT2-13)**: page `hoc/[bai]/page.tsx` đã `force-dynamic` + đã `requireCourseUser` → **mint signed URL ngay trong RSC và truyền prop `initialVideoUrl` cho player** → `<video src>` có sẵn trong HTML đầu, không chờ hydrate+POST. Route `/api/course/video-url` (POST, `force-dynamic`, `requireCourseUser()` + rate-limit + verify lesson tồn tại + trả `{ url }`, KHÔNG cache) **chỉ dùng cho REFRESH trước hạn**, không dùng cho load đầu.
- **Player (RT-7)** `src/components/course/lesson-player.tsx` (Client Component): nhận `initialVideoUrl` prop, `<video controls preload="metadata">`. Khi refresh (timer trước hạn hoặc `onError` 403): POST `/api/course/video-url` → **capture `video.currentTime` → set `src` mới → chờ `loadedmetadata` → restore `currentTime` → resume-play** (không reset về 0). Debounce, phân biệt `stalled` buffering vs 403 thật.
- **Layout lớp học** `src/components/course/classroom-shell.tsx`:
  - PC (`lg:`): grid 2 cột — `<aside>` fixed 320px (`course-sidebar.tsx`) | `<section>` player + tabs + nút.
  - Mobile: video sticky top; sidebar → drawer. **`Sheet` CHƯA tồn tại — TẠO `src/components/ui/sheet.tsx` (RT-9/RT2-3)**: KHÔNG copy `dialog.tsx` (ra modal-giữa). Sheet = Radix `Dialog` primitive (`{ Dialog as DialogPrimitive } from "radix-ui"`, mẫu import `dialog.tsx:5`) + custom slide-cạnh `fixed inset-y-0 left-0 w-[85vw] max-w-sm`, transition dùng token `--ease-standard`/`--duration-base`. Focus-trap có sẵn từ Radix Dialog. Nút ☰; nút "Hoàn thành"/"Bài tiếp" đặt dưới.
  - **`Tabs` "Nội dung/Tài liệu/Ghi chú" (RT2-2)**: `Tabs` CHƯA tồn tại trong repo (grep = 0). Hoặc TẠO `src/components/ui/tabs.tsx` (Radix `Tabs`, `role=tablist`/`aria-selected`/arrow-key) — thêm vào Create list; HOẶC cắt tabs v1, render Nội dung/Tài liệu/Ghi chú thành section xếp dọc. KHÔNG để "+ tabs" như primitive có sẵn.
- **Chrome-free (RT2-1)**: `src/app/course/layout.tsx` mount `<Toaster/>` (RT-10, sonner chưa mount ở đâu). Classroom (`hoc/*`) phải chrome-free — dựa nhánh `isCourse` ở root `layout.tsx` (P1) để KHÔNG render NavBar/SiteFooter/Chatwoot/ScrollToTop marketing; classroom chỉ có `classroom-topbar` riêng.
- **A11y cấu trúc build NGAY ở P3 (RT2-5)**: `aria-current="true"` trên bài đang học (đi kèm highlight), `role`/`aria-label` cho nút mở drawer + prev/next — dựng cùng component, KHÔNG đẩy sang P5 (P5 chỉ lo motion-reduction + visual). Tránh retrofit aria sau khi memo (P5) gây stale-prop.
  - `course-sidebar.tsx`: progress bar (phase 4 nối data; phase 3 để 0%), accordion chương → bài, bài hiện tại highlight, chỗ chừa checkmark.
  - `lesson-nav.tsx`: prev/next từ `getAdjacentLessons`.
- **Top bar** khu học: logo + tên khoá + avatar/đăng xuất (reuse signOut phase 2).

## Related Code Files

- Create: `src/lib/r2/client.ts`, `src/lib/course/require-course-user.ts`, `src/lib/course/rate-limit.ts`, `src/app/course/layout.tsx` (mount Toaster), `src/components/ui/sheet.tsx` (Radix Dialog, edge-drawer), `src/components/ui/tabs.tsx` (Radix Tabs — nếu giữ tabs), `src/app/course/[khoa]/hoc/layout.tsx`, `src/app/course/[khoa]/hoc/[bai]/page.tsx`, `src/app/api/course/video-url/route.ts`, `src/components/course/classroom-shell.tsx`, `src/components/course/course-sidebar.tsx`, `src/components/course/lesson-player.tsx`, `src/components/course/lesson-nav.tsx`, `src/components/course/classroom-topbar.tsx`
- Modify: `package.json` (aws-sdk s3 + presigner), `next.config.ts` (**`serverExternalPackages: ['@aws-sdk/client-s3','@aws-sdk/s3-request-presigner']`** nếu Turbopack flag — RT2-14; verify `next build` không chỉ `next dev`), `src/app/layout.tsx` (nhánh `isCourse` chrome-free — nếu chưa làm ở P1), `.env.example`/docs (R2 vars + CORS note)
- Reference: `src/lib/content/course-queries.ts` (phase 1), `src/lib/supabase/get-user.ts` (phase 2)

## Implementation Steps

1. `pnpm.cmd add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`; env R2.
2. `r2/client.ts` + `getSignedVideoUrl` (TTL ~4h).
3. `require-course-user.ts` + `rate-limit.ts`; tạo `src/components/ui/sheet.tsx` (Radix Dialog); tạo `src/app/course/layout.tsx` mount `<Toaster/>`.
4. API `video-url` (`requireCourseUser` + rate-limit + verify lesson tồn tại + mint).
5. Layout gate `hoc/layout.tsx` (`force-dynamic`, đọc `x-pathname` dựng `next`).
6. `classroom-shell` + `course-sidebar` + `classroom-topbar` (responsive PC/Mobile, drawer Sheet).
7. `lesson-player` (fetch URL, refresh chủ động trước hạn + khôi phục `currentTime`) + `lesson-nav`.
8. Route `hoc/[bai]/page.tsx` (`force-dynamic`) ráp: lấy lesson từ MDX, render shell + player + đoạn nội dung theo `lesson.slug` + tabs.
9. Cấu hình R2 CORS (allow `course.nguyenvantai.com`) — ghi hướng dẫn docs; upload 1 video test (`+faststart`) vào bucket.
10. Verify: chưa login → redirect login (đúng bài qua `next`); login → video phát; seek sau >TTL cũ vẫn ổn nhờ refresh giữ vị trí; mint API không session/không tồn tại lesson → 401/400; spam mint → rate-limit chặn.

## Success Criteria

- [ ] `hoc/layout.tsx` + `hoc/[bai]/page.tsx` có `force-dynamic`; build prod KHÔNG prerender route classroom. (RT-5)
- [ ] Chưa login vào `/course/[khoa]/hoc/[bai]` → redirect `/course/dang-nhap?next=…`, login xong quay lại đúng bài.
- [ ] Video phát khi đã login; xem/seek bài dài qua mốc TTL cũ KHÔNG mất vị trí (refresh giữ `currentTime`). (RT-7)
- [ ] API `video-url` từ chối khi không có session (401) hoặc lesson không tồn tại (400); spam mint bị rate-limit. (RT-6)
- [ ] `requireCourseUser()` được gọi ở mọi `/api/course/*`; layout KHÔNG phải nơi bảo vệ video. (RT-6)
- [ ] `src/components/ui/sheet.tsx` là drawer-cạnh (không modal-giữa), focus-trap OK; `<Toaster/>` mount ở `course/layout.tsx`. (RT-9, RT-10, RT2-3)
- [ ] `initialVideoUrl` mint server-side, `<video src>` có trong HTML đầu (không waterfall on-mount). (RT2-13)
- [ ] Classroom chrome-free (không NavBar/Footer/Chatwoot marketing); chỉ `classroom-topbar`. (RT2-1)
- [ ] `aria-current` trên bài đang học + `aria-label` drawer/nav dựng ngay ở P3. (RT2-5)
- [ ] Tabs: hoặc `tabs.tsx` (Radix, a11y) hoặc section dọc — không giả định primitive có sẵn. (RT2-2)
- [ ] Rate-limit ghi rõ residual per-instance (hoặc dùng shared store); không claim "chặn farming" nếu chọn best-effort. (RT2-8)
- [ ] `next build` (không chỉ `next dev`) xanh với aws-sdk import trong route. (RT2-14)
- [ ] PC: 2 cột, sidebar highlight bài hiện tại. Mobile: video sticky, drawer danh sách bài mở/đóng.
- [ ] Prev/next điều hướng đúng qua ranh giới module.
- [ ] Lint + build xanh.

## Risk Assessment

- **Mint API không gate bởi layout (RT-6)**: `/api/course/*` KHÔNG thừa hưởng `hoc/layout.tsx` + proxy bỏ qua `/api`. Mitigation: `requireCourseUser()` bắt buộc mọi route + rate-limit; coi mint handler là trust boundary.
- **Gated route bị SSG hoá (RT-5)**: nếu quên `force-dynamic`, gate build-time = vô hiệu. Mitigation: `force-dynamic` cả layout + page, không `generateStaticParams`.
- **TTL ngắn phá UX (RT-7)**: 5' hết hạn giữa bài dài, refetch reset vị trí. Mitigation: TTL ~4h + capture/restore `currentTime`.
- **R2 CORS** (lỗi kinh điển): sai origin → video chặn. Mitigation: allow đúng `course.nguyenvantai.com`, test sớm.
- **Sheet/Toaster tưởng có sẵn (RT-9/RT-10)**: đều CHƯA có → phải tạo/mount trong phase này, đừng để P5 giả định.
- **Seek/resume video R2 thuần** (MP4, không HLS): range request R2 hỗ trợ; MP4 `+faststart` để seek mượt.
- **AWS SDK bundle size** trong route: chỉ import ở server route, không vào client.
