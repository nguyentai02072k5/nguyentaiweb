# Audit chống-loop Course LMS — báo cáo review độc lập

Ngày: 2026-07-18 | Reviewer: code-reviewer (độc lập) | Chỉ review, KHÔNG sửa code.
Phạm vi: hệ thống Course LMS (subdomain `course.nguyenvantai.com`) — mọi đường gây RELOAD / RETRY / LOOP và tính đúng+đủ của fix chống-loop vừa áp.

## Scope
- Files đọc thật (14): `lesson-player.tsx`, `course-sidebar.tsx`, `lesson-nav.tsx`, `classroom-shell.tsx`, `classroom-topbar.tsx`, `learn/layout.tsx`, `learn/[khoa]/[bai]/page.tsx`, `api/course/video-url/route.ts`, `rate-limit.ts`, `require-course-user.ts`, `auth/callback/route.ts`, `dang-nhap/page.tsx`, `login-form.tsx`, `actions.ts`, `safe-next-path.ts`, `get-user.ts`, `proxy.ts`, `r2/client.ts` (grep TTL).
- Verify phụ: cây `src/app/course/**` (dang-nhap/callback NẰM NGOÀI gate `learn/`), grep polling/`setInterval`/`useSWR`/`router.refresh` trong `components/course` → chỉ 1 `useEffect` (timer), KHÔNG polling ẩn.

## Overall Assessment
Bộ fix chống-loop về cơ bản ĐÚNG và chặn được các đường loop nguy hiểm nhất (runaway storm onError, prefetch-farm gate, redirect auth vô hạn). Còn **1 residual loop thật ở tầng player (flapping)** — không phải runaway (đã bị debounce 5s giới hạn tốc độ) nhưng là loop **vô hạn về thời gian** (refresh mãi ~1 lần/5s), làm video giật/reload liên tục và bắn mint API đều đặn. Không có Critical. 1 High (flapping), vài Medium/Low.

---

## Critical Issues
KHÔNG có.

Xác nhận các đường loop nghiêm trọng ĐÃ bị chặn:
- **Vòng redirect auth vô hạn: KHÔNG tồn tại.** `dang-nhap/page.tsx` và `auth/callback/route.ts` là sibling của `learn/`, KHÔNG nằm dưới gate layout (`learn/layout.tsx`), nên vào trang đăng nhập không kích lại gate → không có `/dang-nhap → gate → /dang-nhap`. `safeNextPath` chỉ trả path trần same-origin; kể cả `next` trỏ vào route gated thì sau login-fail user về `/dang-nhap` (ngoài gate), không lặp. `callback` lỗi/expired → `/dang-nhap?error=link-expired` (ngoài gate) — không loop (RT-14 đúng).
- **Proxy tự-kích-lại: KHÔNG.** Nhánh `course.*` dùng `NextResponse.rewrite` (không redirect) → 1 lần proxy/request, rewrite không tạo request mới. `/api` được `return NextResponse.next()` NGAY đầu nhánh (proxy.ts:91-93) trước khi tạo bất kỳ supabase client nào → mint API không bị `getSession()` 2 lần.

---

## High Priority

### H-1. Flapping loop: `handleRecovered` reset counter GIỮA chuỗi lỗi → cap MAX_CONSECUTIVE_ERRORS không bao giờ đạt
**Severity: High** | Evidence: `lesson-player.tsx:127-141,187-189`

Kịch bản trigger (video hỏng kiểu "bật được rồi rớt"):
1. Src load → `onLoadedData`/`onPlaying` bắn → `handleRecovered()` → `errorCountRef = 0` (line 140).
2. Vài giây sau video lỗi (network chập chờn / segment 403 giữa chừng / codec biên) → `onError` code 2/4 → `errorCountRef = 1` (line 127) → `refresh()`.
3. Src mới load lại phát được → `onPlaying` → `errorCountRef = 0` lần nữa.
4. Lặp bước 2-3 vô hạn: counter **luôn bị reset về 0 trước khi chạm 3** → `fatal` KHÔNG bao giờ bật → auto-refresh chạy mãi.

Cap `MAX_CONSECUTIVE_ERRORS` chỉ chặn được chuỗi lỗi **liên tiếp không xen recovered** (vd object R2 thiếu hẳn → load fail liền 3 lần). Với video "flapping" (bật→lỗi→bật→lỗi) thì cap vô dụng.

Mức hại: KHÔNG phải runaway storm — `lastRefreshRef` set ở đầu MỌI lần thử (line 59) và KHÔNG được reset trong `handleRecovered`, nên debounce 5s vẫn giữ → tốc độ tối đa ~1 refresh/5s = ~12 mint request/phút/client. Nhưng đây là **loop vô hạn theo thời gian**: user thấy video reload/giật liên tục không bao giờ dừng, không bao giờ thấy UI fatal "Thử lại". Trên nhiều client đồng thời → mint API + R2 sign chịu tải nền đều đặn.

Đề xuất fix (chọn 1, ngắn):
- Thêm bộ đếm/lịch sử lỗi theo **cửa sổ thời gian** không bị recovered xoá: vd `errorTimestamps` giữ mốc các lần error, nếu ≥ N lỗi trong T giây (kể cả có recovered xen) → `fatal`. `handleRecovered` chỉ reset chuỗi-liên-tiếp, KHÔNG xoá lịch-sử-cửa-sổ.
- Hoặc: chỉ reset `errorCountRef` trong `handleRecovered` khi đã phát ỔN ĐỊNH một khoảng (vd `timeupdate` tích luỹ > 10s liên tục) thay vì reset ngay lần `onPlaying`/`onLoadedData` đầu tiên (dễ bị flapping lừa).
- Tối thiểu: giữ thêm 1 "hard cap" tổng số refresh trong đời component (vd 8 lần bất kể recovered) → chặn trần tuyệt đối.

---

## Medium Priority

### M-1. Timer chủ động 3.5h KHÔNG bị chặn bởi `fatal` — có thể "hồi sinh" trạng thái fatal
**Severity: Medium** | Evidence: `lesson-player.tsx:112-118,53-55`

`useEffect` timer (deps `[src, refresh]`) đặt `setTimeout` gọi `refresh()` ở 3.5h, KHÔNG kiểm tra `fatal`. Khi đã fatal, `<video>` bị unmount (nhánh `if (fatal)` return StatusCard, line 162-178) nhưng effect timer KHÔNG bị clear vì `src` không đổi → timer vẫn còn. Sau 3.5h nếu user để tab mở, timer chạy `refresh()` → nếu thành công `setSrc(newUrl)` → nhưng component đang ở nhánh `fatal` nên `setSrc` KHÔNG remount video (vẫn hiển thị fatal card cho tới khi bấm "Thử lại"). Không tạo loop, nhưng: (a) mint 1 lần vô ích khi đã fatal; (b) `src` đổi → effect re-arm timer mới 3.5h nữa → lặp mint mỗi 3.5h khi tab mở lâu ở trạng thái fatal.

Tần suất cực thấp (3.5h/lần) → không phải loop nóng, nhưng là hành vi thừa. Đề xuất: guard đầu timer `if (fatal) return;` (thêm `fatal` vào deps), hoặc clear timer khi `fatal` bật.

Lưu ý re-arm bình thường: mỗi lần `refresh` thành công `setSrc` → effect chạy lại → timer cũ clear (cleanup line 117) + arm timer mới. Đây là hành vi ĐÚNG mong muốn (re-arm theo src mới), KHÔNG phải loop — chỉ vấn đề khi kết hợp `fatal` như trên.

### M-2. `handleManualRetry` bỏ debounce (`lastRefreshRef=0`) — mở cửa spam thủ công
**Severity: Medium (thấp)** | Evidence: `lesson-player.tsx:144-149`

Đặt `lastRefreshRef.current = 0` → lần `refresh()` ngay sau đó bỏ qua debounce (đúng ý: cho user retry ngay). Rủi ro: nếu user bấm "Thử lại" liên tục, mỗi lần reset debounce + reset counter → có thể bắn mint dồn. Nhưng: (a) cần click thủ công (không tự động) → không phải loop tự thân; (b) mint API có rate-limit token-bucket (capacity 20, refill 0.5/s) chặn ở server. Chấp nhận được. Đề xuất tuỳ chọn: disable nút "Thử lại" ~2s sau click để chống double-click, hoặc chỉ reset counter mà giữ debounce.

### M-3. Race timer-refresh vs onError-refresh: chặn ĐỦ nhưng có khe hẹp
**Severity: Medium (thấp)** | Evidence: `lesson-player.tsx:53-59`

`refreshingRef` (line 54) chặn 2 `refresh()` chạy song song — nếu timer và onError cùng lúc, cái sau `return` ngay. Debounce (line 55) chặn refresh dồn < 5s. ĐỦ cho trường hợp thường. Khe hẹp: giữa lúc `refreshingRef=false` (finally line 107) và trước khi src mới thực sự load, nếu onError của src CŨ còn bắn trễ → có thể vào `refresh()` lần nữa; nhưng debounce 5s bắt được (line 59 set mốc ở lần trước). Không phải lỗ hổng loop. Không cần sửa.

---

## Low Priority

### L-1. Listener `loadedmetadata` add trong `refresh` — không rò nhưng phụ thuộc `{ once: true }`
Evidence: `lesson-player.tsx:88-102`. Mỗi lần `refresh` add 1 listener `{ once: true }` trên `el` capture local. `once` tự gỡ sau lần bắn đầu → không dồn tích. Rủi ro nhỏ: nếu src mới KHÔNG bao giờ bắn `loadedmetadata` (load fail hẳn), listener treo tới khi element unmount (remount đổi bài dọn sạch qua `key`). Không rò nghiêm trọng. Không cần sửa; chỉ ghi nhận phụ thuộc vào `once`.

### L-2. `handleError` bỏ qua code 3 (DECODE) → video codec-hỏng im lặng, không fatal, không loop
Evidence: `lesson-player.tsx:125`. code 1/3 `return` sớm KHÔNG tăng counter → đúng (không loop trên ABORTED do swap src). Nhưng code 3 (decode) làm video đứng im không thông báo gì cho user (không refresh, không fatal). Không phải loop — chỉ UX. Cân nhắc hiện toast/status khi code 3 để user biết "video lỗi định dạng".

---

## Đánh giá các fix ĐÃ ĐÚNG + ĐỦ (KHÔNG đảo ngược)

1. **`prefetch={false}` ở `course-sidebar.tsx:144` và `lesson-nav.tsx:29,45`** — ĐÚNG + ĐỦ. Chặn Next prefetch route gated `force-dynamic` → tránh hover-farm `getUser()`+mint hàng loạt. Đã grep: mọi `<Link>` trỏ route gated (`/learn/...`) đều có `prefetch={false}`. Back-link "/" (sidebar:43, topbar:56) là public (landing) — KHÔNG cần `prefetch={false}`, giữ nguyên đúng.
2. **Bỏ effect sync src, dùng `key={lesson.slug}`** — XÁC NHẬN. `classroom-shell.tsx:97` đặt `key`; `lesson-player.tsx:151-152` comment ghi rõ không có effect sync. `useState(initialVideoUrl)` khởi tạo lại khi remount → KHÔNG cascading re-render. ĐÚNG.
3. **Debounce đánh mốc ở MỌI lần thử (kể cả fail)** — `lesson-player.tsx:57-59`. ĐÚNG. Đây là điểm mấu chốt chặn onError-storm: dù mint fail (src mới vẫn 403) thì mốc debounce vẫn set → lần onError kế bị chặn 5s. Nếu chỉ đánh mốc khi thành công sẽ loop nóng — họ tránh đúng.
4. **Cap `MAX_CONSECUTIVE_ERRORS=3` cho chuỗi lỗi LIÊN TIẾP** — ĐÚNG cho case "hỏng vĩnh viễn" (object thiếu, key sai → load fail liền). ĐỦ cho case đó, KHÔNG đủ cho flapping (xem H-1).
5. **Proxy skip `/api` trước khi tạo client** — `proxy.ts:91-93`. ĐÚNG + ĐỦ. Không double round-trip, không refresh cookie 2 lần cho mint.
6. **`getSession()` ở proxy (refresh) vs `getUser()` ở gate/mint (authz)** — ĐÚNG. proxy.ts:142 refresh cookie (rẻ, không authz); `get-user.ts:40` + `require-course-user.ts` dùng `getUser()` revalidate. Không tạo loop; anon fast-path (get-user.ts:33-37) tránh round-trip cho khách chưa login → giảm tải, không loop.
7. **Rate-limit token-bucket** — `rate-limit.ts`. Tính ĐÚNG: bucket đầu tạo `tokens=capacity-1` (line 51), refill `min(capacity, tokens + elapsed*0.5)` (line 57), `<1 → false` (line 60). KHÔNG cho burst vô hạn: sau 20 request tức thời thì phải chờ ~2s/token. Residual per-instance đã được document trung thực (không mô tả sai là "chống farming"). ĐỦ cho mục tiêu "chặn 1 client spam trên cùng instance". Lưu ý: đây là hàng rào cuối chặn hậu quả loop client-side, KHÔNG thay được fix H-1 (client vẫn reload video liên tục dù bị 429 — 429 chỉ làm refresh fail, không dừng vòng flapping).

---

## Edge Cases (scout)
- **Tab để mở > 3.5h ở trạng thái fatal** → M-1 (mint thừa mỗi 3.5h).
- **Video flapping (network chập chờn di động)** → H-1, đường loop thực tế dễ gặp nhất trên mobile 3G/4G yếu.
- **429 từ rate-limit trong lúc flapping** → refresh fail, toast "Thao tác quá nhanh", nhưng `errorCountRef` vẫn reset bởi recovered → vòng vẫn tiếp, chỉ chậm hơn. Không tự thoát.
- **`initialVideoUrl=null` (env R2 thiếu)** → nhánh `if (!src)` StatusCard, KHÔNG vào timer/refresh (line 113 `if (!src) return`) → không loop. ĐÚNG.

## Recommended Actions (ưu tiên)
1. **[High] Sửa H-1**: thêm cap theo cửa-sổ-thời-gian hoặc hard-cap tổng refresh để flapping cũng chạm fatal. Đây là loop residual thật duy nhất còn lại.
2. **[Med] Sửa M-1**: guard `if (fatal) return` trong timer effect (+ thêm `fatal` vào deps) hoặc clear timer khi fatal.
3. **[Low] M-2**: cân nhắc disable nút "Thử lại" ngắn sau click.
4. **[Low] L-2**: hiện thông báo khi MediaError code 3.

## Metrics
- Lint/Build: KHÔNG chạy lại (đề đã verify trước: lint 0 error, build xanh). Không đọc thấy lỗi type/lint mới trong các file review.
- Type: các file TS strict, không thấy `any` widening hay suppression mới.
- Test coverage: không có test tự động cho player loop (chỉ "test tay" ghi trong comment `safe-next-path.ts:14-21`). Đề xuất thêm unit test cho scenario flapping H-1 nếu muốn khoá hồi quy.

## Unresolved Questions
1. RT2-11 (proxy `@supabase/ssr` trên Vercel Edge thật) — comment proxy.ts:110-112 nói CHƯA verify; nếu Edge lỗi runtime, `getSession()` throw → bắt bởi try/catch (không loop) nhưng cookie không refresh → user có thể bị đá về `/dang-nhap` sớm hơn TTL. Không phải loop, nhưng cần spike trước ship như comment ghi.
2. Video "flapping" H-1 tần suất thực tế phụ thuộc chất lượng encode + mạng user — cần quyết định ngưỡng cap cửa-sổ (N lỗi / T giây) theo product intent (mobile-heavy → nới T).

---

Status: DONE_WITH_CONCERNS
Summary: Fix chống-loop chặn đúng các đường nguy hiểm (runaway onError, prefetch-farm, redirect auth) nhưng còn 1 loop residual thật: video "flapping" khiến `handleRecovered` reset counter giữa chuỗi lỗi → cap MAX_CONSECUTIVE_ERRORS không bao giờ đạt → refresh vô hạn (~1 lần/5s).
Concerns: High = H-1 flapping loop (lesson-player.tsx:127-141,187-189). Medium = M-1 timer 3.5h không guard fatal.
