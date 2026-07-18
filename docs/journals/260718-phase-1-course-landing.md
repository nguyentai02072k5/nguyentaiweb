# Phase 1 Course LMS — Landing thư viện khoá học công khai

**Date**: 2026-07-18 09:35  
**Severity**: High (pivot kiến trúc + 2 bug tinh tế)  
**Component**: `/course` landing, proxy, theme, velite  
**Status**: Resolved (commit `defce60`)

---

## What Happened

Hoàn thành Phase 1: subdomain `course.*` → `/course` landing thư viện học công khai, dark-teal scoped, 6 khoá placeholder. Pivot từ plan cũ (catalog + trang chi tiết từng khoá) sang kiến trúc mới: landing là bước 1, gated vault dành cho P3. Commit `defce60` chứa 35 file, 3415 dòng.

Bố cục landing: hero → "Vì sao học" (value grid) → danh sách khoá (accordion teaser) → testimonials → giảng viên → FAQ → CTA → footer. Proxy khóa `/course` trên host không phải `course.*`. Root layout giữ nguyên analytics, bỏ hết chrome marketing. Font chuyển Plus Jakarta Sans (subset Vietnamese).

---

## The Brutal Truth

Hai bug **cực kỳ** khó lần cứu vì lặn sâu vào specificity CSS + browser rendering quirk:

1. **Heading vô hình (đen trên đen)**: `globals.css @layer base { h1..h6 { color: #1a1a2e } }` (rule element-level, cố định màu navy) bị lồng sâu hơn thừa kế màu teal scope → heading luôn navy thay vì teal. Agent-browser lên trang → toàn màu đen, không thấy đâu là tiêu đề.

2. **Section dưới vô hình** (opacity treo): thử `animation-timeline: view()` (reveal khi cuộn) + `content-visibility: auto` (tối ưu render) → các section chưa cuộn tới bị locked opacity:0 vĩnh viễn. Screenshot desktop xong, mobile cũng lỗi. Chỉ phát hiện khi full-page screenshot — nếu không verify kỹ, sẽ ship live được bug này!

**Điều khó chịu nhất**: cả 2 bug này chỉ lộ trên staging/snapshot browser, không thấy ở dev mode (dev mode không build tĩnh, không lazy render). Phải chụp screenshot 3–4 lần mới bắt được.

---

## Technical Details

### Bug #1: Heading Color Override

**Triệu chứng**: Tất cả `h1..h6` trên `/course` hiện màu navy (#1a1a2e) thay vì teal (#ecfff9).

**Nguyên nhân**:
```css
/* globals.css @layer base — element-level rule */
h1, h2, h3, h4, h5, h6 { color: #1a1a2e; }

/* course-theme.css — selector .course-app :is(...) vẫn rằng color teal */
.course-app :is(h1, h2, h3, h4, h5, h6) { color: var(--ink); }
```

Specificity so sánh:
- `h1` (`@layer base` — weight 0,0,1) + element selector = **0,0,1**
- `.course-app :is(h1)` = **0,1,1** (class + pseudo-class)

Nhưng `@layer base` kích hoạt **layer order** (base < components < utilities), override specificity. Layer base **luôn thắng** khi không có `!important`.

**Fix**:
```css
.course-app :is(h1, h2, h3, h4, h5, h6) {
  color: var(--ink);
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: var(--tracking-heading);
  line-height: var(--lh-heading);
}
```

Bỏ quy tắc khỏi `@layer` → **unlayered rule luôn thắng layered rule** (CSS Cascade L3).

### Bug #2: Animation + Content-Visibility = Section Trống

**Triệu chứng**: `course.localhost/course` screenshot → section 1 hiện, section 2–6 **toàn trống** (trắng).

**Code lỗi**:
```css
@keyframes c-reveal {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: none; }
}

.c-reveal {
  animation: c-reveal 0.5s ease-out both;
  content-visibility: auto; /* ← thủ phạm */
}
```

**Cơ chế lỗi**:
- Browser: "Phần tử `.c-reveal` outside viewport → `content-visibility: auto` skip paint"
- Animation timer: ngừng tick (browser tối ưu), opacity vẫn dừng ở **0** (frame đầu tiên)
- Khi scroll tới: `content-visibility` bật lại nhưng animation **không tự restart** → element vẫn opacity:0

**Fix**: Đổi sang **fade-on-load** (không phụ thuộc scroll), bỏ `content-visibility`:
```css
.c-reveal {
  animation: c-reveal 0.5s ease-out forwards;
  /* KHÔNG content-visibility: auto */
}

/* Stagger nhẹ để có nhịp */
.c-reveal:nth-of-type(n) { animation-delay: 0.08s * (n - 1); }
```

**Bản sửa code**: `src/app/course/course-theme.css` line 95–100 (heading), line 365–375 (reveal).

---

## What We Tried

1. **Thêm `!important`** vào `color: var(--ink) !important;` — fix ngắn hạn, nhưng không giải quyết root cause (CSS Cascade bị hỏng).
2. **Dịch `@layer base`** từ globals sang layout scope — quá phức tạp, break cấu trúc Tailwind chung.
3. **Xoá `content-visibility: auto`** mà giữ `animation-timeline: view()` — animation vẫn treo opacity:0.
4. **Thử `animation: none` → opacity: 1 inline** — workaround, nhưng mất animation reveal.

**Kết luận**: Giải pháp đầu (unlayered rule + fade-on-load) là cleanest, không side effect.

---

## Root Cause Analysis

### Quyết định kiến trúc dẫn tới bug

1. **Pivot muộn (16/7 → 17/7)**: Plan cũ (catalog + detail per-course) → chốt mới (1 landing, detail dành P3). Thay đổi lại bố cục animation từ scroll-reveal → load-reveal, nhưng tuyên bố fix quá sớm mà **không verify full-page** (dev mode != staging build).

2. **Global `@layer base` ở `globals.css`**: Thiết kế cũ (site tím violet) định nghĩa heading color ở layer base để "consistency". Khi thêm scope `.course-app`, không nhớ layer base priority — đâm đầu vào "tại sao CSS không làm việc".

3. **`content-visibility: auto` như "trick" tối ưu**: Copy paste từ tutorial, không test kỹ kết hợp với `animation-timeline` → lỗi rendertrack rất hiếm (chỉ lộ ở Chromium full-page snapshot).

### Lesson từ những cái sai

1. **Biết CSS Cascade**: `@layer base` không phải "special", chỉ là order. Unlayered rule luôn priority hơn layered. Scope toggle `.course-app` không cứu được vì layer thắng specificity.

2. **Scope CSS = global CSS được reset cục bộ**: Không phải "cái gì cũng vứt vào scope CSS rồi quên". Phải review mọi rule toàn cầu (`globals.css`, `tailwind.config.ts`) xem có xung đột không.

3. **Screenshot full-page là test thật**: Dev mode (dev:3000) skip static build, dev mode không `content-visibility` tối ưu. **Bắt buộc** `next build && next start` (hoặc agent-browser với staging) để lộ bug ẩn.

4. **Chỉ đổi copy, không động bố cục**: Lần này lỡ đổi luôn animation strategy khi user chỉ muốn thay text. Trigger confusion vì "tối ưu thêm", kéo dài debug.

---

## Lessons Learned

- **CSS Cascade không phải Black Magic** — layer order + specificity đơn giản, nhưng dễ forget. Ghi chú comment khi scope toggle (vd: "Fix lớp base: XYZ nhờ unlayered rule").

- **`content-visibility: auto` + animation bị lạc**: Nếu dùng, phải test full-page render. Safe play: bỏ auto, dùng `content-visibility: hidden` (manual control) hoặc bỏ luôn khi animation động.

- **Theme scoped = phải audit toàn bộ globals**: Khi thêm subdomain theme, checklist: heading, text, border, link, form input, button. Thường "quên" 1–2 cái (lần này là heading).

- **Pivot vào design preview muộn** (07/16 chốt mock → 07/17 design → code 18/07) ⇒ khoảng thời gian hẹp, dễ xảy sơ sót. Tính thêm 10% buffer verify.

- **Agent-browser screenshot là "build validator"** — chỉ TRỬ full-page screenshot, buộc bắt 90% bug render. Không thì ship live rồi user tìm thấy trước.

---

## Next Steps

### Immediate (Done ✓)
- [x] Fix heading color scope (unlayered rule, line 98–100 course-theme.css)
- [x] Swap animation strategy (fade-on-load, bỏ content-visibility, line 368–375)
- [x] Verify desktop + mobile screenshot (agent-browser ✓)
- [x] Code review 2 vòng (0 Critical/High)
- [x] Build xanh, lint sạch, JSON-LD hợp lệ

### Short-term (Before P2 — Supabase Auth)
- [ ] **Nội dung khoá thật**: Placeholder 6 khoá tạm hàng; đợi chủ dự án submit nội dung (video key, lesson-slug, modules). Hiện tại placeholder là khoá "test" + "sample".
- [ ] **Social link + footer thật**: Facebook/TikTok/YouTube/Zalo hiện lấy từ `landing.ts`, xác nhận link đúng (Zalo là OA hay personal?).
- [ ] **Dọn file rác gốc repo**: `--selector/`, `_cmp-m.png`, `plans/reports/brainstorm-*.md` (duplicate với phase-01), `phan-tich-DRMcourse.txt` (notes cũ). Chạy `git clean -fd` nhưng **TRƯỚC KHI** push.
- [ ] **Push remote `nguyentaiweb`**: Hiện branch `feat/template-library-blog` chỉ local; cần verify git remote (`git remote -v`) = `nguyentaiweb`, rồi `git push -u origin feat/template-library-blog`.

### Medium-term (Animation Polish dời P5)
- [ ] **Animation reveal tinh chỉnh**: Stagger delay có thể tune thêm (hiện 0.08s*n, có thể smooth hơn). Dời vào P5 "Polish" khi có thời gian.
- [ ] **Mobile: Bottom sheet vs Drawer**: Hiện chưa code khu học (P3), nhưng landing mobile accordion có thể test drawer toggle.

### Ranh giới P1 → P2
- **P1 scope đã CLOSED**: `/course` landing public, SSG ✓, scope theme ✓, proxy ✓, footer + legal pages ✓, 6 khoá placeholder ✓, CTA login → `/course/dang-nhap` stub ✓.
- **P2 scope (Supabase Auth)**: Wiring `/course/dang-nhap` (magic-link/Google) + session check + RLS, gate `/course/learn/*` (placeholder).

---

## Unresolved Questions

- Khoá học nội dung **bao gồm video thật chưa**, hay chỉ cuốn lesson teaser demo để verify UX? (Hiện 6 khoá = text + `videoKey: 'test/sample.mp4'` placeholder.)
- Supabase project đã set up chưa, hay chuyên gia P2 lo? (P1 không cần auth.)
- Build Vercel preview (staging) tự động chạy agent-browser verify, hay manual mỗi merge?
- Dấu tiếng Việt trên heading Plus Jakarta Sans có cần eyeball lại không? (Font đã có subset, nhưng chưa chụp kỹ.)

---

**Next reviewer**: QA/code-reviewer. Accept khi:
1. Desktop + mobile screenshot xanh lá cây (không đen vô hình).
2. Lint `pnpm lint` 0 error.
3. Build `pnpm build` xanh, 78 pages.
4. JSON-LD `course-collection` validate qua schema.org.
