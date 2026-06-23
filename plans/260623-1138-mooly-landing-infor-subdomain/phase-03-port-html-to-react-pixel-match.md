# Phase 03 — Port HTML → React, pixel-match (CSS scope, canvas/JS)

## Context links
- Parent: [plan.md](plan.md) · Nguồn: `mooly-landing.html` (1117 dòng)
- Files: `src/app/landing/*`

## Overview
- Date: 2026-06-23 · Priority: P0 · Status: pending · Review: pending
- Mục tiêu: giữ NGUYÊN 100% visual + animation của file HTML trong route React.

## Key insights
- File HTML self-contained: `<style>` (dòng 14-554) + markup (556-1033) + **8 khối JS** (894-1114).
- Class names generic (`.btn .head .hero .nav .chip ...`) → ĐỤNG globals.css. Phải SCOPE `#mooly-lp`.
- Ảnh từ R2 `pub-c01be4db0ffa48e7bd267dfd32067311.r2.dev` → dùng `<img>` thường (KHÔNG next/image) để pixel-match + né `remotePatterns`.
- JS dùng canvas + requestAnimationFrame + IntersectionObserver + DOM listeners → cần `'use client'`.
- **Font literal**: CSS landing dùng tên `'Be Vietnam Pro'`/`'Space Grotesk'` literal (vars `--font-body/--font-display`). next/font sinh tên hash → KHÔNG khớp literal. → GIỮ `<link>` Google Fonts gốc (dòng 10-12) trong landing để tên literal resolve (an toàn nhất cho fidelity).

## ⚠️ Red-team hardening (bắt buộc cho 100% fidelity)
Nguồn: `reports/red-team-260623-1233-html-fidelity-gaps-report.md`.
1. **8 khối JS (đếm lại, đừng sót):** marquee-clone (897-910), nav-scrolled (1036-1039), mobile-menu (1041-1044), reveal-IO (1046-1047), chat-autoscroll (1050-1065), hero-sparks (1068-1082), FAQ-accordion (1084), cost-sparks (1087-1102), form-validate (1104-1113). (Bản phase-03 cũ ghi "4 script" → SAI.)
2. **Scope `*`:** `*{}` reset (42) + reduced-motion `@media{*{!important}}` (509) → đổi thành `#mooly-lp *` — KHÔNG để `*` trần lọt globals (sẽ đè cả main site).
3. **Marquee clone double-invoke (StrictMode dev clone 2 lần → 3 bản → vỡ `scrollx` 504):** guard `if(track.dataset.cloned)return; track.dataset.cloned='1'`; cleanup remove các node `aria-hidden`.
4. **Copy-paste, KHÔNG gõ tay** toàn bộ: copy text + `@media` + `@keyframes` + SVG path + R2 URLs. Tránh sai `&amp;`→`&`, `&nbsp;`, `&lt;5 giây` (giữ `<`), emoji 🥰✨🎉👇.
5. **Cost block lấy BẢN MỚI** (đã sửa): `500.000đ/tháng` (831), `≈16.000đ/ngày`+`hơn 4 tiếng rảnh` (833), split `+4 giờ/24/7/0đ` (835-837), cost-note (840).
6. **Inline styles → `style={{}}` camelCase** (đủ cell-level): 805, 811, 813, 814, 851, 852, 861, 871.
7. **3 canvas/observer cleanup riêng:** hero-sparks RAF+resize, cost-sparks RAF+resize+IO(observe 1101), chat-autoscroll RAF. `cancelAnimationFrame` + `disconnect()` + remove listener khi unmount.
8. **Giữ 3 guard `prefers-reduced-motion` độc lập** (chat 1055 — giữ ở đầu KHÔNG auto-scroll; hero-sparks 1070; cost-sparks 1089). Đừng gộp điều kiện.
9. **GIỮ NGUYÊN CSS "thừa"** (pricing block 296-323, `var(--violet-2)` undefined dùng ở 306/407/484): KHÔNG dọn — `--violet-2` còn nuôi border `.faq.open`/`.pc.pop`/`.ticket-rip`. Dọn nhầm = vỡ visual.
10. **Verify base elements sau scope** (`#mooly-lp button/input/select/svg/h1-h4`): id-specificity thắng Tailwind preflight — kiểm focus ring, bg, font khớp.

## Requirements
- FR: render khớp pixel (layout, gradient, animation, marquee, chat auto-scroll, sparks, FAQ, mobile nav).
- FR: `prefers-reduced-motion` giữ nguyên hành vi (đã có trong CSS/JS gốc).
- NFR: không rò CSS sang/ từ globals.

## Architecture
**Chiến lược CSS scope = inline scoped `<style>` (CHỐT, không CSS Module):**
- Bọc toàn bộ landing trong `<div id="mooly-lp"> ... </div>`.
- CSS gốc đặt trong **`<style dangerouslySetInnerHTML={{__html: CSS}}>`** (CSS tĩnh, không user input → an toàn). Giữ NGUYÊN keyframes/vars (Module sẽ rename keyframes → đã loại).
- Prefix mọi selector bằng `#mooly-lp ` TRỪ: `@keyframes`/`@media` (giữ nguyên), `:root`→`#mooly-lp`, `*`→`#mooly-lp *` (cả reset 42 + reduced-motion 509).
- Tách CSS ra hằng `landing-styles.ts` (export string) cho gọn page, hoặc giữ trong page. 1 nguồn CSS duy nhất.

**Cấu trúc component (`src/app/landing/`):**
- `page.tsx` (Server) — markup tĩnh (hero, proof, problem, features, why, cost, objection, steps, faq, footer landing, nav landing). Import CSS scoped.
- `landing-interactions.tsx` (`'use client'`) — gộp 6 script: nav scroll state, mobile menu, reveal IO, chat auto-scroll, hero sparks canvas, cost sparks canvas, FAQ accordion. Mount qua `useEffect`, cleanup RAF/observer.
- `lead-form.tsx` (`'use client'`) — form + submit (phase 04).
- Asset: giữ URL R2 tuyệt đối trong `<img src>`.

**Lưu ý port:**
- `<canvas id="sparks">`, `#costSparks`, `#chatScroll`, `#mqTrack`, `#leadForm` → giữ id để JS query (scope trong `#mooly-lp`).
- SVG inline giữ nguyên.
- Nav landing + footer landing là CỦA FILE HTML (không phải main) → port nguyên.

## Related code files
- Tạo: `src/app/landing/page.tsx`, `landing.module.css` (hoặc styles inline), `landing-interactions.tsx`, `lead-form.tsx`
- Tham chiếu: `mooly-landing.html`

## Implementation steps
1. Tách `<style>` → `landing.module.css`, prefix `#mooly-lp`, đổi `:root`→`#mooly-lp`. Giữ keyframes/media nguyên.
2. Port markup → `page.tsx` JSX (đổi `class`→`className`, `for`→`htmlFor`, self-close, `style="..."`→object hoặc giữ trong CSS). Bọc `#mooly-lp`.
3. Chuyển 6 script → `landing-interactions.tsx` (`'use client'`, `useEffect`, cleanup). Query trong `document.getElementById` vẫn OK (id giữ).
4. Form markup → `lead-form.tsx` (phase 04 nối API). Tạm giữ success-state DOM như gốc.
5. So pixel với file HTML (browser side-by-side / screenshot diff) → chỉnh sai khác.

## Todo
- [ ] CSS scoped module (prefix #mooly-lp)
- [ ] Markup → JSX
- [ ] interactions client component (6 scripts) + cleanup
- [ ] images R2 <img>
- [ ] pixel diff vs HTML

## Success criteria
- Side-by-side với `mooly-landing.html`: không lệch layout/màu/animation ở desktop + mobile (≤640px).
- Không có lỗi console; RAF/IO cleanup khi unmount; reduced-motion hoạt động.

## Risk assessment
- R: globals.css (Tailwind preflight) đè base. M: scope `#mooly-lp` + reset cục bộ + thứ tự load sau.
- R: hydration mismatch do canvas/random. M: canvas init trong useEffect (client-only), không render khác giữa server/client.
- R: marquee clone (JS nhân đôi node) lặp khi re-render. M: guard trong useEffect (chạy 1 lần, cleanup remove clone).

## Security
- `dangerouslySetInnerHTML` chỉ dùng cho CSS tĩnh (không user input) — an toàn. Ưu tiên CSS Module để né hẳn.

## Next steps
→ Phase 04 nối form vào API; Phase 05 pixel QA cuối.
