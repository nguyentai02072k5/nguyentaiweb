# Code Review — Phase 3: R2 Gated Video Player

**Ngày:** 2026-07-18
**Reviewer:** code-reviewer (độc lập)
**Nhánh:** feat/template-library-blog
**Phạm vi:** 18 file P3 (r2/client, require-course-user, rate-limit, course-lesson-queries, video-url route, learn layout+page, classroom-shell/sidebar/player/nav/topbar, sheet, tabs, sonner mount, next.config, .env.example) + đọc tham chiếu (proxy, get-user, ssr-client, safe-next-path, velite, course-list, plan/phase spec).
**Verify chạy thật:** `pnpm.cmd lint` = 0 error (4 warning ở file ngoài scope). `pnpm.cmd build` = xanh; `/course/learn/[khoa]/[bai]` và `/api/course/video-url` đều render `ƒ` (Dynamic) — RT-5 ✔.

---

## Overall Assessment

Chất lượng cao, kỷ luật bảo mật tốt. Các invariant trust-boundary trọng yếu (RT-1/RT-5/RT-6/server-only/open-redirect) đều ĐẠT và có bằng chứng. Không tìm thấy Critical. Có 1 High (player error-storm debounce), vài Medium/Low về UX/robustness. Comment giải thích intent thật (why), không phải padding.

Điểm cần lưu ý: đây là mô hình "free = đăng nhập xem hết" (plan.md:32, plan.md:19). Vì vậy việc gate + mint KHÔNG kiểm `lesson.free` là ĐÚNG THIẾT KẾ, không phải lỗ hổng authz — xem "Đã đúng, đừng đảo".

---

## Critical Issues

Không có.

---

## High Priority

### H1 — Player refresh: debounce KHÔNG chặn error-storm khi refresh thất bại
**File:** `src/components/course/lesson-player.tsx:47-97`
**Vấn đề:** `lastRefreshRef.current` CHỈ được cập nhật khi mint thành công (line 76). Trên đường thất bại (res !ok → return line 71; `!data?.url` → return line 75; network throw → catch line 93), `lastRefreshRef` giữ nguyên (0 hoặc giá trị cũ). Debounce đầu hàm (`Date.now() - lastRefreshRef.current < REFRESH_DEBOUNCE_MS`, line 49) do đó KHÔNG chặn lần refresh kế tiếp. Nếu `<video>` bắn `onError` lặp (src mới cũng 403, hoặc mạng chập chờn), mỗi error → 1 POST `/api/course/video-url` không bị hãm → spam API (dựa `refreshingRef` chỉ chặn call ĐỒNG THỜI, không chặn call TUẦN TỰ). Doc comment line 33-34 hứa "chống onError storm" nhưng cơ chế chỉ hoạt động sau lần THÀNH CÔNG đầu tiên.
**Evidence:** line 49 đọc `lastRefreshRef`; line 76 là chỗ DUY NHẤT ghi `lastRefreshRef` và nằm sau mọi return sớm.
**Impact:** loop 403 (URL hết hạn + mint tiếp tục lỗi env/R2, hoặc lesson bị xoá) → hammer mint API; rate-limit per-instance (20 burst) sẽ hãm phần nào nhưng vẫn 20 req tức thời + toast lặp làm UX xấu.
**Đề xuất fix (không tự sửa):** ghi `lastRefreshRef.current = Date.now()` NGAY khi bắt đầu refresh (trước fetch) hoặc trong `finally`, thay vì chỉ khi thành công. Cân nhắc thêm counter giới hạn số lần retry liên tiếp cho một `src` (vd tối đa 3 rồi hiện thông báo "Không tải được video").

---

## Medium Priority

### M1 — `onLoaded` listener có thể rò khi bài đổi giữa lúc chờ metadata
**File:** `src/components/course/lesson-player.tsx:79-92`
**Vấn đề:** `addEventListener('loadedmetadata', onLoaded)` gắn vào `videoRef.current`; `onLoaded` tự gỡ chính nó sau khi chạy. Nhưng nếu `loadedmetadata` KHÔNG bao giờ bắn (src mới lỗi tải), listener không được gỡ. Với remount theo `key={lesson.slug}` (classroom-shell:97) khi đổi bài, element cũ bị hủy nên listener theo nó cũng mất — nên rò thực tế thấp. Trong CÙNG bài (đổi src qua refresh nhiều lần mà lần trước metadata chưa bắn), có thể chồng nhiều listener trên cùng element.
**Đề xuất:** capture element vào biến local (`const el = videoRef.current`) và gắn/gỡ trên chính `el`; cân nhắc `{ once: true }` để tự gỡ kể cả path lỗi, và gỡ listener cũ trước khi gắn mới.

### M2 — Timer refresh chủ động không tự khởi động lại sau khi refresh thành công đúng lịch
**File:** `src/components/course/lesson-player.tsx:100-107`
**Vấn đề:** effect timer phụ thuộc `[src, refresh]`. Khi refresh chủ động (timer) thành công → `setSrc(data.url)` → `src` đổi → effect chạy lại → timer mới đặt. Tốt cho phiên xem >3h30. NHƯNG nếu refresh chủ động THẤT BẠI (không `setSrc`), `src` không đổi → effect KHÔNG re-run → KHÔNG có timer kế tiếp → URL sẽ hết hạn ở mốc 4h mà không còn refresh chủ động; chỉ còn trông chờ `onError`. Chấp nhận được (fallback onError vẫn có) nhưng nên biết.
**Đề xuất:** nếu muốn bền hơn, đặt lại timer cả khi refresh fail (vd reschedule sau X phút). Không bắt buộc cho v1.

### M3 — `getSignedVideoUrl` không validate/normalize `videoKey`
**File:** `src/lib/r2/client.ts:51-59`; caller `src/app/api/course/video-url/route.ts:54`
**Vấn đề:** `videoKey` lấy từ `found.lesson.videoKey` (đã verify lesson tồn tại trong content build-time, videoKey `s.string().min(1)` — velite.config.ts:40). Client KHÔNG điều khiển được `videoKey` trực tiếp (chỉ gửi courseSlug/lessonSlug, server map ra key). Đây là điểm ĐÚNG cốt lõi: mint theo key nội bộ, không theo input client. Residual nhỏ: nếu tương lai ai đó thêm route mint nhận `videoKey` từ body, sẽ mở path arbitrary-object. Hiện tại KHÔNG có lỗ hổng.
**Đề xuất:** không cần sửa ngay. Ghi chú giữ invariant "videoKey chỉ đến từ content, không từ request body" nếu thêm route mint mới.

### M4 — Rate-limit key theo `user.id` — user chưa auth không tới bước này (đúng), nhưng không có tầng chặn theo IP
**File:** `src/app/api/course/video-url/route.ts:23-31`, `src/lib/course/rate-limit.ts`
**Vấn đề:** rate-limit đặt sau auth (`video-url:${user.id}`), nên attacker chưa đăng nhập bị chặn ở 401 trước — hợp lý. Với user đã đăng nhập: cap 20 burst + 0.5 t/s per-instance, per-user. Comment đã trung thực về residual per-instance (RT2-8 ✔), KHÔNG claim "chặn farming" (rate-limit.ts:8). Đạt yêu cầu plan.
**Đề xuất:** không cần sửa. Đúng disposition (a) trong plan.

---

## Low Priority

### L1 — Badge "Xem thử" trên landing gợi ý xem-không-cần-login nhưng thực tế phải login
**File:** `src/components/course/course-list.tsx:154-170`; teaser chỉ hiển thị, KHÔNG có link (course-list.tsx:139-175)
**Vấn đề:** landing hiện badge "Xem thử" cho `lesson.free` và 🔒 cho phần còn lại, nhưng KHÔNG có route preview không-auth (gate chặn toàn bộ `/learn/*`). Text section đã nói "đăng nhập để mở toàn bộ video" (course-list.tsx:37) nên mâu thuẫn nhẹ về kỳ vọng UX, không phải bug bảo mật. `lesson.free` hiện chỉ là nhãn thị giác.
**Đề xuất:** hoặc đổi nhãn "Xem thử" → "Mở đầu"/"Bài 1", hoặc (tương lai) làm preview free thật. Quyết định content, không chặn ship.

### L2 — `handleError` không phân biệt loại lỗi media (chỉ luôn refresh)
**File:** `src/components/course/lesson-player.tsx:109-112`
**Vấn đề:** doc (line 8-11) nói phân biệt buffering (waiting/stalled) vs 403 (error). Thực tế đúng: chỉ `onError` mới gọi refresh; buffering không gắn handler nên không kích. Nhưng `onError` cũng bắn cho lỗi KHÔNG-phải-403 (codec không hỗ trợ, file hỏng) → refresh vô ích rồi lặp (liên quan H1). `video.error.code` không được đọc.
**Đề xuất:** đọc `videoRef.current?.error?.code`; chỉ refresh khi nghi hết hạn (MEDIA_ERR_NETWORK/SRC_NOT_SUPPORTED do 403), tránh refresh vô nghĩa với MEDIA_ERR_DECODE.

### L3 — Comment/doc phase-03 vẫn còn đường dẫn route CŨ ở phần Overview/Architecture
**File:** `plans/260716-0851-course-lms-nguyenvantai/phase-03-r2-gated-player.md:35,44,52,62,81`
**Vấn đề:** phần header note đã sửa đúng route `/course/learn/[khoa]/[bai]`, nhưng body (Overview/Architecture/Success Criteria) vẫn viết `/course/[khoa]/hoc/[bai]` và `hoc/layout.tsx`. Không ảnh hưởng code (code đã dùng route mới) nhưng gây nhầm khi đọc spec.
**Đề xuất:** đồng bộ route trong body phase-03 (việc của planner/lead, không phải reviewer sửa).

---

## Đã ĐÚNG (đừng đảo ngược — đã verify bằng đọc code)

- **RT-1 (authz revalidate):** `getUser()` là đường authz duy nhất (`get-user.ts:40`); `getSession()` chỉ ở proxy để refresh cookie (`proxy.ts:142`), có comment giải thích. `requireCourseUser()` gọi `getCurrentUser()` → `getUser()` ✔.
- **RT-5 (không SSG):** cả layout gate và page đều `export const dynamic = 'force-dynamic'`; build ra `ƒ` (Dynamic) cho `/course/learn/[khoa]/[bai]` + `/api/course/video-url` ✔ (verify bằng build thật).
- **RT-6 (trust boundary mint):** route video-url gọi `requireCourseUser()` (401) → rate-limit (429) → parse+validate body (400) → verify lesson tồn tại (400) → mint (route.ts:22-62). Chỉ có DUY NHẤT 1 route dưới `/api/course/` (glob xác nhận). proxy bỏ qua `/api` trước khi tạo client (`proxy.ts:91-93`) ✔.
- **videoKey không do client điều khiển:** client gửi courseSlug/lessonSlug; server map ra `found.lesson.videoKey` từ content Velite (route.ts:47,54). Không có path mint arbitrary object key ✔.
- **Secret R2 không rò client:** `r2/client.ts` có `import 'server-only'` (line 19); grep xác nhận KHÔNG component `.tsx` nào import `@/lib/r2`; `next.config.ts` `serverExternalPackages` cho aws-sdk (RT2-14) ✔. `lesson-player` (client) chỉ nhận URL đã ký qua prop/fetch.
- **RT2-13 (mint server-side):** page.tsx mint `initialVideoUrl` trong RSC (page.tsx:47) truyền prop; player khởi tạo `useState(initialVideoUrl)` (player:43) — không waterfall on-mount. API chỉ dùng refresh ✔.
- **RT-7 (TTL + giữ currentTime):** TTL 14400s (client.ts:24); refresh capture `resumeTime`/`wasPlaying` (player:53-54), restore qua `loadedmetadata` (player:79-91), không reset 0; try/catch seek ngoài range ✔.
- **Open-redirect gate:** `x-pathname` do proxy inject (server-controlled); consume bằng `safeNextPath()` ở actions.ts:113 + callback route.ts:36 (chặn `//`, `\`, cross-origin) ✔. Redirect `/course/learn/...` không bị proxy double-prefix (`proxy.ts:96` chỉ prefix khi chưa `/course`) ✔.
- **RT2-8 (rate-limit trung thực):** comment nói rõ per-instance, reset cold-start, KHÔNG claim chặn farming ✔.
- **Toaster/useTheme ngoài ThemeProvider:** `sonner.tsx:14` gọi `useTheme()` — hook trả default an toàn khi ngoài provider (theme-provider.tsx:87-95, không throw); course/layout truyền `theme="dark"` spread SAU `theme={theme}` nên override đúng (sonner.tsx:17 vs {...props} line 36). KHÔNG lỗi runtime ✔.
- **Sheet inline (không portal):** dùng Radix Dialog primitive (focus-trap/Esc/aria-modal có sẵn), overlay `fixed inset-0 z-50`, content `z-50` — stacking hợp lý so với topbar z-40. Có `SheetTitle` (a11y), `aria-describedby={undefined}` hợp lệ khi không có description ✔.
- **A11y P3 (RT2-5):** `aria-current="page"` bài hiện tại (sidebar:142), `aria-label` nút drawer (topbar:47) + prev/next (lesson-nav:30,45) + `role=progressbar` (sidebar:67) — dựng ngay P3 ✔.
- **getAdjacentLessons ranh giới module:** flatten toàn khoá rồi index prev/next (queries.ts:71-82) — vượt ranh giới module đúng; đầu/cuối trả null ✔.
- **velite guard:** `videoKey.min(1)` + walk check trùng `lesson.slug` trong khoá (velite.config.ts:40,174-188) ✔.
- **Error boundary mint:** page.tsx mint fail → catch → `initialVideoUrl=null` → player hiện thông báo cấu hình, không crash trang (page.tsx:44-50, player:117-138) ✔.

---

## Đối chiếu Success Criteria (phase-03)

| Tiêu chí | Trạng thái |
|---|---|
| force-dynamic, build không prerender classroom (RT-5) | ✔ verify build |
| Chưa login → redirect `/dang-nhap?next=…` | ✔ (đã verify runtime dev theo phase note; code đúng) |
| Video giữ currentTime qua mốc TTL (RT-7) | ✔ code đúng; e2e browser còn treo (thao tác người dùng) |
| API từ chối 401/400 + rate-limit (RT-6) | ✔ code + runtime 401 verified |
| requireCourseUser ở mọi /api/course/* (RT-6) | ✔ (chỉ 1 route, có gọi) |
| Sheet drawer-cạnh + Toaster mount (RT-9/10/RT2-3) | ✔ |
| initialVideoUrl server-side, không waterfall (RT2-13) | ✔ |
| Chrome-free (RT2-1) | ✔ (topbar riêng; root layout nhánh isCourse) |
| aria-current + aria-label P3 (RT2-5) | ✔ |
| Tabs Radix a11y (RT2-2) | ✔ |
| Rate-limit residual trung thực (RT2-8) | ✔ |
| next build xanh với aws-sdk (RT2-14) | ✔ verify build |
| Prev/next qua ranh giới module | ✔ |
| Lint + build xanh | ✔ verify |

Tất cả success criteria code-level ĐẠT. Residual duy nhất theo phase note: **e2e login browser → phát video thật** (cần người dùng thật) và **revoke Global API Key Cloudflare** thay bằng token scoped (bảo mật vận hành, ngoài code).

---

## Metrics

- Type coverage: TS strict, không thấy `any` mới trong file P3. Input body dùng `unknown` rồi narrow (route.ts:34-41) — tốt.
- Test coverage: KHÔNG có unit/integration test cho P3 (player refresh, rate-limit, getAdjacentLessons, safeNextPath). Verify hiện dựa build + runtime tay. Đề xuất (không chặn ship): test thuần cho `checkRateLimit` (token math), `getAdjacentLessons` (biên module), `safeNextPath` (đã có "test tay" trong doc — nên chuyển thành test chạy được).
- Lint: 0 error.

---

## Recommended Actions (ưu tiên)

1. **H1** — sửa debounce `lastRefreshRef` để chặn error-storm (cập nhật timestamp ở đầu/finally, thêm giới hạn retry liên tiếp).
2. **M1/L2** — đọc `video.error.code`, dùng `{ once: true }` cho listener, chỉ refresh khi nghi hết hạn.
3. **M2** — (tùy chọn) reschedule timer cả khi refresh fail.
4. **L1/L3** — làm rõ nhãn "Xem thử" (content) + đồng bộ route trong body phase-03 (planner).
5. **Vận hành (ngoài code):** revoke Global API Key Cloudflare → token scoped; chạy e2e login→play thật trước khi tính P3 hoàn tất.

---

## Unresolved Questions

- Video onError với src 403 mới có bắn lặp liên tục không (phụ thuộc browser)? Nếu có, H1 nâng ưu tiên. Cần e2e để chốt.
- "Xem thử" free lesson: có kế hoạch làm preview không-login thật (P4/P5) hay chỉ là nhãn? Ảnh hưởng L1.

---

Status: DONE_WITH_CONCERNS
Summary: P3 R2 gated player đạt mọi invariant bảo mật trọng yếu (RT-1/5/6, server-only, open-redirect, mint server-side) — verify bằng lint/build thật; không có Critical. 1 High (player error-storm debounce không chặn refresh lặp khi mint fail) + vài Medium/Low về robustness/UX.
Concerns:
- High H1: `lastRefreshRef` chỉ set khi mint thành công → debounce không chặn spam mint khi onError/mint lặp thất bại (lesson-player.tsx:47-97).
