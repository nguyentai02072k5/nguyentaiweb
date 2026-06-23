# RED-TEAM — HTML→React fidelity gaps (mooly-landing → /landing)

Date: 2026-06-23 · Scope: chứng minh plan CHƯA đảm bảo 100% sao chép giao diện+nội dung.
Sources: `mooly-landing.html` (1117 dòng) vs phases 02–05. Read-only.

Verdict: plan ĐÚNG hướng (scope `#mooly-lp`, giữ markup/CSS/JS) NHƯNG mô tả ở mức "port nguyên" — thiếu chỉ dẫn cụ thể cho ~10 điểm dễ vỡ. Không có bằng chứng nào cho thấy plan đã liệt kê copy/asset/keyframe chính xác → rủi ro lệch THẬT khi cook.

---

## BLOCKER

### B1. Plan COUNT script SAI → dễ sót script
- Lệch: phase-03 (dòng 12,30) ghi "4 script JS" rồi liệt kê 6, todo ghi "6 scripts". Thực tế HTML có **8 khối JS** riêng biệt: marquee clone (897-910), nav scrolled (1036-1039), mobile menu (1041-1044), reveal IO (1046-1047), chat auto-scroll (1050-1065), hero sparks (1068-1082), FAQ accordion (1084), cost sparks (1087-1102), form (1104-1113).
- Plan thiếu: KHÔNG nhắc **marquee clone** trong danh sách gộp (phase-03:30 liệt kê 7 việc, bỏ marquee clone); KHÔNG nhắc **form** (đẩy sang phase 04 nhưng phase-03 success-state cần). Đếm "4/6" → reviewer/cook dễ bỏ 1-2 script.
- Sửa: phase-03 ghi đủ 8 khối, đặc biệt marquee clone + touch pause (897-910) là 1 script độc lập.

### B2. `:root` đổi thành `#mooly-lp` PHÁ biến số dùng ở `@keyframes`/scope ngoài wrapper
- Lệch: phase-03:25 nói "đổi `:root`→`#mooly-lp`". Nhưng CSS vars (`--grad`, `--violet-soft`...) được dùng TRONG markup con; OK. VẤN ĐỀ thật: **`@media(prefers-reduced-motion)` dòng 509 dùng `*{}` global** (`*{animation-duration:.01ms!important}`) — nếu prefix `#mooly-lp *` thì OK, nhưng nếu để nguyên `*` sẽ đè CẢ main site. Plan không nói xử lý `*{}` reset (42) + reduced-motion `*` (509) ra sao.
- Bằng chứng: dòng 42 `*{box-sizing;margin;padding}`, dòng 509 `@media(prefers-reduced-motion:reduce){*{...!important}}`.
- Sửa: phase-03 chỉ rõ: `*`→`#mooly-lp *` (cả 2 chỗ); KHÔNG để `*` trần lọt globals.

---

## HIGH

### H1. Tailwind preflight đè base elements — plan chỉ nói "scope" chung chung
- Lệch: globals.css/preflight reset `button,ul,ol,a,img,h1..` → landing dựa default ở nhiều chỗ:
  - `.seg button`,`.fq`,`.burger`,`.mnav-x`,`form button` — preflight set `button{background:transparent;background-image:none}` có thể OK, nhưng `.btn` có gradient inline nên thắng; `.burger span` dựa background set rõ → OK.
  - `ul.cbul/.pfeats` dùng `list-style:none` rõ ràng → an toàn.
  - **Rủi ro thật:** preflight `img{display:block}` đã set trong HTML (50) → trùng OK. `a{color:inherit}` set rõ (46).
- Kết luận: phần lớn HTML đã set explicit → đa số AN TOÀN. Nhưng **specificity**: preflight `#mooly-lp button` (id) > preflight `button` (element) → scope ĐỦ thắng. Plan nên VERIFY, không giả định.
- Sửa: phase-03 thêm bước: sau scope, kiểm `button/input/select/svg/h1-h4` render khớp (focus ring, font, bg).

### H2. Marquee clone re-render lặp/vỡ trong React
- Lệch: script (897-910) `cloneNode(true)` append → nhân đôi track cho loop liền mạch. Keyframe `scrollx` (504) dịch `-50% - 8px` GIẢ ĐỊNH đúng 2 bản. Trong React StrictMode (dev) useEffect chạy 2 lần → clone 2 lần → 3 bản → marquee vỡ tốc độ/khoảng cách.
- Bằng chứng: dòng 504 `translateX(calc(-50% - 8px))`; phase-03 risk (64) CÓ nhận diện nhưng chỉ "guard chạy 1 lần, cleanup remove clone" — chưa nói StrictMode double-invoke + cách cleanup chính xác (remove các node `aria-hidden`).
- Sửa: phase-03 ghi rõ: guard `if(track.dataset.cloned)return`; cleanup remove cloned nodes; test trong StrictMode dev.

### H3. Nội dung copy: plan KHÔNG liệt kê 1 chữ copy nào → không thể verify "100% nội dung"
- Lệch: phases mô tả "port markup" nhưng KHÔNG có bản kê text. Rủi ro sót/đổi khi gõ tay JSX (escape `&amp;`→`&`, `&nbsp;`, emoji 🥰✨🎉👇, số liệu).
- Các con số/chuỗi DỄ SAI (bằng chứng HTML):
  - Hero H1 "Bán hàng không ngừng / chốt đơn kể cả khi bạn đang nghỉ" (597); lead (598).
  - Proof: `500+`,`5 kênh`,`24/7`,`<5 giây` (663-666) — `&lt;5 giây` phải giữ `<`.
  - Cost (ĐÃ SỬA bản mới): `500.000đ/tháng` (831), `≈16.000đ/ngày` + `hơn 4 tiếng rảnh` (833), split `+4 giờ/24/7/0đ` (835-837), cost-note (840). Bản port PHẢI lấy bản mới này.
  - Order card: `#ML1024` (642), `199.000đ·COD` (647), SĐT `0345324467`, địa chỉ "62 Thạnh Lộc 13…" (639,646).
  - Testimonial: 3 text (HT/MQ/PL/TV — thực ra 4 text card: 879,882,884,887) + tên/ngành; 6 ảnh feedback.
  - Compare 6 dòng (809-814) gồm cell text "Một phần"/"Tùy người"/"Cố định"/"Lương + rủi ro".
  - Objection 4 Q&A (856-859); FAQ 5 câu (1010-1014) — FAQ#5 có "(tới 55%)".
  - Footer copy "© 2026 Mooly · Đồng hành cùng shop Việt · Bảo mật · Điều khoản dịch vụ" (1031).
- Sửa: thêm checklist copy vào phase-03 (hoặc phase-05 QA) đối chiếu từng block; ưu tiên dùng COPY-PASTE từ HTML, không gõ lại.

### H4. Form: 7 industry options + 4 scale options + value rỗng — plan map dễ thiếu
- Lệch: phase-04 schema OK nhưng form-render phải giữ ĐÚNG options: industry 7 (`Thời trang,Mỹ phẩm,Mẹ & bé,Gia dụng,F&B,Công nghệ,Khác` — 975-976, KHÔNG có `value=`, text=value), scale 4 (`Dưới 50/50–200/200–500/Trên 500 tin/ngày` — 984-985). Placeholder name "VD: Nguyễn Văn A" (964), phone "09xx xxx xxx" (969).
- Bằng chứng: 974-986.
- Plan thiếu: không kê option labels; risk gõ sai dấu `&` (Mẹ & bé, F&B). `message_volume` lưu text label (vì option không có value) → map `scale`→`message_volume` phải lấy `.value` = textContent.
- Sửa: phase-04 kê đủ 7+4 option text; xác nhận lưu label tiếng Việt.

---

## MED

### M1. `<head>` metadata — phase chỉ nói "title+description", THIẾU OG + favicon
- Lệch: HTML head (6-12) có: title (6), description (7), **favicon** R2 (8), Google Fonts link (12). KHÔNG có sẵn OG tags trong HTML. Plan (plan.md:65) yêu cầu "openGraph đầy đủ" nhưng HTML KHÔNG có OG → cook phải TẠO MỚI (không có nguồn để match) → đây là THÊM, không phải port. Favicon R2 (8) chưa được nhắc trong bất kỳ phase nào.
- Bằng chứng: dòng 8 `rel="icon" href=".../LOGO MOOLY blank.png"`.
- Sửa: phase-02 metadata thêm `icons.icon` = URL R2 dòng 8; OG ghi rõ là nội dung MỚI (cần user duyệt text/ảnh OG).

### M2. Google Fonts: weight khớp?
- Lệch: HTML (12) load `Space Grotesk:500;600;700` + `Be Vietnam Pro:300;400;500;600;700`. Phase-02 (14) nói "fonts đã load global → dùng lại, KHÔNG khai báo lại". RỦI RO: next/font global hiện tại có ĐỦ weight 300/400/500/600/700 (body) + 500/600/700 (display) không? Nếu thiếu 300 (hero lead, .pamt nhẹ) → chữ render đậm hơn.
- Bằng chứng: `.hero .lead` dùng body 300? (font-body default 400; `.pfeats`/captions nhẹ). Cụ thể weight 300 dùng ở body mỏng.
- Sửa: phase-02 VERIFY `next/font` config có subsets+weights ⊇ {300..700}; nếu thiếu → thêm weight (không thêm request mới vì cùng family).

### M3. Inline `style="..."` attributes — JSX cần chuyển object
- Lệch: nhiều inline style: `.crit` (805 `style="background:#fff;text-align:left"`), compare cells (811,813,814 `style="font-size:.78rem;font-weight:600"`), obj eyebrow (851), obj h2 (852 `margin-top:14px`), obj-grid wrapper button center (861), mq head (871 `margin-bottom:40px`), avatars... JSX `style="..."` string → lỗi; phải đổi `style={{...}}` camelCase.
- Bằng chứng: 805,811,813,814,851,852,861,871.
- Plan: phase-03:45 nhắc chung "`style="..."`→object hoặc giữ trong CSS" — OK nhưng dễ sót cell-level. Liệt kê để không quên.

### M4. Canvas hydration + DPR/visibility — RAF cleanup
- Lệch: hero sparks (1068) + cost sparks (1087) + chat auto-scroll (1050) phụ thuộc `devicePixelRatio`,`matchMedia`,`requestAnimationFrame`,`IntersectionObserver`,`getBoundingClientRect`,`clientWidth/Height`. Cost sparks chỉ chạy khi card visible (IO, 1101). Chat dùng `scrollHeight` (cần DOM mounted). Trong useEffect (client) → OK, nhưng phải cleanup `cancelAnimationFrame` + disconnect IO + remove resize listener, nếu không → leak/double-RAF khi route đổi.
- Bằng chứng: 1071 DPR, 1081 resize, 1101 IO observe.
- Plan: phase-03:30,59 có nói cleanup chung. Đủ ý nhưng cần liệt kê 3 canvas/observer riêng để không sót cleanup cost-sparks IO.

### M5. `prefers-reduced-motion` rẽ nhánh JS — giữ early-return
- Lệch: chat (1055), hero sparks (1070), cost sparks (1089) đều `if(matchMedia('(prefers-reduced-motion: reduce)').matches)return`. Khi gộp 6 script vào 1 component, phải GIỮ từng early-return riêng — nếu refactor gộp điều kiện dễ làm sai (vd reduced-motion vẫn để chat ở đầu, KHÔNG auto-scroll — 1055 comment).
- Sửa: phase-03 ghi giữ nguyên 3 guard reduced-motion độc lập.

---

## LOW

### L1. Pre-existing CSS quirks (không phải lỗi port, nhưng port-nguyên sẽ mang theo)
- `var(--violet-2)` dùng ở 306,407,484-comment nhưng `:root` (19-41) KHÔNG định nghĩa `--violet-2` → fallback rỗng (border/box-shadow không hiện ở `.pc.pop`,`.faq.open`,`.ticket-rip .ln`). `.compare`/`.pgrid`/`.seg`/`.pc` (PRICING block 296-323) + `.fg` selector (517,528) — markup KHÔNG có `.pgrid/.pc/.seg/.fg` (pricing đã thay bằng cost-card). → CSS thừa, không ảnh hưởng visual. Port nguyên = giữ y chang (đúng yêu cầu 100%), KHÔNG "dọn".
- Bằng chứng: 306 `var(--violet-2)`; markup không có `class="pc"`.
- Lưu ý: nếu cook "tối ưu" xóa CSS thừa → vẫn khớp visual; nhưng nếu xóa nhầm `--violet-2` usage mà KHÔNG thấy nó vô hại → `.faq.open` mất border tím. Giữ NGUYÊN an toàn nhất.

### L2. Responsive breakpoints phải giữ NGUYÊN số
- @media: 980(512),880(113),680(519),640(388),600(500),560(350),400(116). CSS Module giữ nguyên text → breakpoint không đổi. AN TOÀN nếu copy nguyên. Rủi ro chỉ khi gõ lại tay.
- Sửa: copy-paste khối @media, không gõ lại.

### L3. Animation tinh vi — giữ keyframes + vars
- navPulse(100),navShine(101),lblPulse(256),neon(472),floaty(503),scrollx(504),popin(505); backdrop-filter glass (162,261); mask-image (125,131,137,369); `.hero-arc`/`.hero-glow`/`feat-deco blob blur`. Tất cả trong `<style>` → copy nguyên là khớp. Rủi ro: nếu CSS Module xử lý `@keyframes` đổi tên (CSS Modules scope keyframe names) → `animation:floaty` không khớp tên đã scope. **CSS Modules tự rename keyframes** → nếu dùng `.module.css`, `animation:navPulse` và `@keyframes navPulse` PHẢI cùng file (Modules nối đúng) — OK trong cùng file. Nhưng nếu tách → vỡ.
- Sửa: giữ keyframes CÙNG file module với rule dùng nó; HOẶC dùng `:global(@keyframes ...)`.

---

## Checklist BẮT BUỘC để đạt "100% fidelity"
1. [ ] Scope `*{}` (42) + reduced-motion `*` (509) thành `#mooly-lp *` — KHÔNG để `*` lọt globals. (B2)
2. [ ] Port ĐỦ 8 khối JS (đếm lại): marquee-clone, nav-scroll, mobile-menu, reveal-IO, chat-autoscroll, hero-sparks, cost-sparks, FAQ, form. (B1)
3. [ ] Marquee clone: guard chống double (StrictMode), cleanup remove clone. (H2)
4. [ ] CSS Module: keyframes CÙNG file với rule dùng; verify tên animation không bị rename lệch. (L3)
5. [ ] Copy-paste (KHÔNG gõ tay) toàn bộ: copy text, @media, keyframes, SVG path, R2 URLs. (H3,L2)
6. [ ] Cost block lấy bản MỚI: 500.000đ, 16.000đ, +4 giờ/24/7/0đ, cost-note. (H3)
7. [ ] Form options: 7 industry + 4 scale + placeholders + emoji; lưu label tiếng Việt vào message_volume. (H4)
8. [ ] Metadata: title+description (6,7) + favicon R2 (8) + fonts weight ⊇{300–700}. OG = nội dung MỚI cần duyệt. (M1,M2)
9. [ ] Inline styles → `style={{}}` camelCase (đủ cell-level: 805,811,813,814,851,852,861,871). (M3)
10. [ ] 3 canvas/IO: cleanup RAF + disconnect IO + remove resize; giữ 3 guard reduced-motion. (M4,M5)
11. [ ] Giữ NGUYÊN CSS "thừa" (pricing block, --violet-2) — không dọn kẻo vỡ `.faq.open`/`.ticket`. (L1)
12. [ ] Side-by-side screenshot diff desktop + ≤640px (phase-05 đã có) — thêm checkpoint từng section.

## Câu hỏi chưa rõ
1. OG image/text: HTML KHÔNG có sẵn OG tags → nội dung OG lấy từ đâu? (cần user cung cấp ảnh+text OG, nếu không thì KHÔNG đạt "port nguyên" vì không có nguồn).
2. next/font hiện tại có đủ weight 300 (Be Vietnam Pro) chưa? (cần đọc layout.tsx config — chưa verify trong report này).
3. CSS Module vs `<style dangerouslySetInnerHTML>`: phase-03 để ngỏ 2 lựa chọn. Module rename keyframes/scope → rủi ro L3; inline `<style>` giữ nguyên 100% an toàn hơn cho fidelity. Chọn cái nào?
4. Pricing CSS thừa (296-323) + `.fg`/`.pgrid` selectors không có markup: giữ nguyên (an toàn) hay dọn (gọn nhưng rủi ro)? Khuyến nghị GIỮ.

Status: DONE_WITH_CONCERNS
Tóm tắt: Plan đúng kiến trúc nhưng thiếu cụ thể ~10 điểm dễ vỡ — nghiêm trọng nhất: đếm script sai (4/6 vs thực 8), không kê copy/option/asset để verify, `*{}` scope chưa nói rõ, marquee StrictMode, CSS-Module keyframe rename, favicon/OG/font-weight chưa chốt. Rủi ro lệch THẬT khi cook nếu không copy-paste nguyên + bổ sung checklist trên.
