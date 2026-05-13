# Final Audit - Tài AI Automation Landing Copy + Privacy Policy

**Report ID:** `content-reviewer-260512-1013-tai-ai-landing-final-audit`
**Date:** 2026-05-12
**Phase:** 02 Close-out - Final pre-Phase 03 gate
**Files audited:**
- `plans/260509-1059-tai-ai-automation-landing-page/content-copy.md` (771 dòng)
- `plans/260509-1059-tai-ai-automation-landing-page/legal/privacy-policy.md` (246 dòng)
- `phase-02-content-and-copywriting.md` - status skim only
**Baseline:** Audit 260511-1603 → 76/100 · 5 blocking issues

---

## 1. Executive Summary

| | |
|---|---|
| **Verdict** | **PASS WITH NOTES** |
| **Score** | **89/100** (+13 từ baseline 76) |
| **Blocking issues remaining** | 0 (tất cả 5 blocking cũ đã resolved hoặc owner-accepted) |
| **New issues found** | 2 Medium · 1 Low (không blocking Phase 03) |
| **Owner-accepted risks** | 3 (trọn đời · hoàn toàn vô dụng · vision ai shop keyword) |

Score breakdown: +13 chủ yếu nhờ S6 story filled (+6) + Module CTAs fixed (+3) + S10 contact filled (+2) + footer tagline locked (+2).

---

## 2. Changes Verification - 7 Decisions Applied

| # | Decision | Spec | Verified | Note |
|---|---|---|---|---|
| 1 | S6 Builder Background story | 4 paragraphs · §1 Background · §2 Insight · §3 Khác biệt · §4 Mission | ✅ | Đầy đủ 4 §. Bold anchors có. 3 highlight `==...==` markers đúng chỗ. Payoff `Đêm không rớt đơn, ngày không quá tải` cuối §4. |
| 2 | Contact info S10 | Nguyễn Văn Tài · titai2277@gmail.com · 0345 324 467 · FB · TikTok | ✅ | Khớp 100%. TikTok `@vtai027` thay slot YouTube đúng spec. |
| 3 | Privacy Policy v1.0 | Họ tên + email + Zalo filled · Supabase = Singapore · lawyer skip | ✅ | Mục 2 = Nguyễn Văn Tài · titai2277@gmail.com · 0345 324 467. Mục 7 Supabase "Singapore (ap-southeast-1)" locked. Lawyer skip ghi `[~]` đúng. |
| 4 | Footer tagline | `Đêm không rớt đơn, ngày không quá tải` | ✅ | S10 L617 confirmed. Alt A cũ giữ làm A/B fallback. |
| 5 | S1 Hero Alt E | `Đêm không rớt đơn, ngày không quá tải` | ✅ | L41 confirmed, labeled "(slogan-led - owner-approved reuse từ S6)". |
| 6 | S3 Module CTAs | `Đặt lịch demo Module X →` | ✅ | 3/3 modules đã rename. CTA verb "Đặt" đúng whitelist. |
| 7 | Mobile Sticky CTA | Text `Demo miễn phí - 20 phút →` · gradient Aurora · magnetic + shine | ✅ | S10 L640-645 đầy đủ spec: màu hex, height, padding, E3 magnetic, E1 shine, intersection observer, z-index. |

**Verdict:** 7/7 decisions applied correctly.

---

## 3. New Issues Found

### MEDIUM - M1: Module CTA anchor inconsistency (S3)

**Vấn đề:** Module 1 CTA ghi rõ `anchor #booking` trong spec:
```
Module CTA (card-level, scroll → S8 Booking, anchor `#booking`): Đặt lịch demo Module 1 →
```
Nhưng Module 2 và Module 3 chỉ ghi `scroll → S8 Booking` - thiếu anchor fragment explicit.

**Rủi ro Phase 03:** Dev có thể implement Module 2/3 với scroll-to-section behavior khác nhau nếu đọc spec không đồng nhất. Module 1 làm `<a href="#booking">`, Module 2/3 làm `onClick scrollIntoView` hoặc bỏ sót.

**Fix:** Thêm `(anchor #booking)` vào Module 2 + Module 3 CTA spec để nhất quán. (1 dòng edit mỗi module)

---

### MEDIUM - M2: Domain canonical chưa được tuyên bố dứt khoát

**Vấn đề (domain inconsistency):**
- `privacy-policy.md` header + Mục 2 Website: `https://nguyenvantai.com` ✅
- `content-copy.md` SEO meta `og:url`: `https://nguyenvantai.com` ✅
- `content-copy.md` SEO Keywords section: keyword `vision ai shop` - vẫn ref brand angle cũ, không ref domain
- `phase-02-content-and-copywriting.md` không có domain reference
- **Plan-level** (`plan.md` nếu tồn tại) có thể vẫn ref `schedule.1funn.click` theo audit brief

**Status:** Trong 3 file được audit, `nguyenvantai.com` nhất quán. Tuy nhiên plan-level docs (ngoài scope audit này) chưa confirmed update. Phase 03 dev cần config `NEXT_PUBLIC_SITE_URL=https://nguyenvantai.com` và confirm deploy target.

**Action required trước go-live (không blocking Phase 03 build):** Owner confirm canonical domain = `nguyenvantai.com` cho dev setup `next.config.js` + Vercel project settings.

---

### LOW - L1: S3 Module 3 feature line ambiguous "miễn phí" scope

**Vấn đề:** L198:
```
🛠 30 ngày ưu tiên hỗ trợ tinh chỉnh - hỗ trợ sử dụng trọn đời miễn phí sau bàn giao
```
Dấu gạch ngang `-` giữa "tinh chỉnh" và "hỗ trợ sử dụng trọn đời" tạo ambiguity về phạm vi "miễn phí": 30 ngày miễn phí hay trọn đời miễn phí?

**Ngữ nghĩa hiện tại có thể đọc là:** "30 ngày ưu tiên hỗ trợ tinh chỉnh [và] hỗ trợ sử dụng trọn đời miễn phí sau bàn giao" - ngụ ý trọn đời cũng miễn phí.

**Thực tế theo Terms + Q5 FAQ:** 30 ngày miễn phí, sau đó tự sửa hoặc gói maintenance.

**Fix gợi ý (nếu owner muốn làm rõ):**
```
🛠 30 ngày hỗ trợ tinh chỉnh ưu tiên (miễn phí) - hỗ trợ sử dụng trọn đời
```
Tách "miễn phí" vào ngoặc gắn với "30 ngày". Nhưng do owner đã explicitly keep "trọn đời" claim, chỉ flag để owner quyết định có cần clarify không.

---

## 4. Cross-File Consistency Check

| Item | content-copy.md | privacy-policy.md | Status |
|---|---|---|---|
| **Domain** | `nguyenvantai.com` (og:url) | `nguyenvantai.com` (Mục 2 + header) | ✅ Consistent |
| **Owner name** | "Tài" / "Nguyễn Văn Tài" | "Nguyễn Văn Tài" | ✅ |
| **Email** | `titai2277@gmail.com` (S10) | `titai2277@gmail.com` (Mục 2 + 11) | ✅ |
| **Phone Zalo** | `0345 324 467` (S10 + S9) | `0345 324 467` (Mục 2 + 11) | ✅ |
| **Zalo URL** | `https://zalo.me/0345324467` | `https://zalo.me/0345324467` | ✅ |
| **Facebook** | `profile.php?id=61589059652030` | Not referenced (N/A) | ✅ |
| **TikTok** | `@vtai027` | Not referenced (N/A) | ✅ |
| **Supabase region** | Not referenced (N/A) | Singapore ap-southeast-1 | ✅ |
| **Slug `image-recognition`** | S8 form option slug `image-recognition` | Not referenced | ✅ No conflict |
| **Terminology "Nhận diện hình ảnh"** | S3 L169 · S4 caption · S7 Q6 | Not referenced | ✅ Consistent across content-copy.md |
| **"chúng tôi" trong PP** | - | Dùng "chúng tôi" xuyên suốt PP | ⚠️ Voice switch - xem mục dưới |

**Note on "chúng tôi" trong Privacy Policy:** PP dùng "chúng tôi" thay vì "tôi" nhất quán với content-copy.md. Đây là acceptable choice cho legal document (thể hiện trách nhiệm pháp nhân), không phải voice inconsistency - nhưng khác với tone personal "tôi (Tài)" của landing. Mục 13 "Cam kết cuối cùng" đã chuyển về "tôi" rất khéo làm bridge. Không cần fix.

---

## 5. S6 Quality Check - Variant A Builder Background

### Structure completeness
| Element | Spec | Present | Quality |
|---|---|---|---|
| 4 paragraphs | §1 Background · §2 Insight · §3 Khác biệt · §4 Mission | ✅ | 4 §, đúng thứ tự |
| Sentence-label badges | Background · Insight · Khác biệt · Mission | ✅ (ghi trong spec) | |
| 3 highlight `==...==` | Cụm USP core | ✅ | §1: "tự tay làm chủ được" · §3: "AI phải đọc hiểu được hình ảnh" · §4: "Đêm không rớt đơn, ngày không quá tải" |
| Bold anchors phụ | Multiple `**...**` | ✅ | 2024, xưởng Loma, mỹ phẩm/spa, lười gõ, tịt, rớt khách liền, v.v. |
| Payoff cuối §4 | `Đêm không rớt đơn, ngày không quá tải` | ✅ | Đặt trong `==...==` = highlight. Tiếp theo câu "Anh/chị rảnh tay..." = payoff clear |
| Highlight bullets | 4 điểm bao gồm payoff | ✅ | Thực chiến từ 2024 · AI đọc hiểu hình ảnh · Tự tay làm chủ · Đêm không rớt đơn |
| Photo + alt text | R2 URL + alt "Tài - owner" | ✅ | |
| Optional CTA | `Đặt lịch nói chuyện trực tiếp →` → S8 | ✅ | |

### Bold strategy assessment
5 bold anchors trong §2 + §3 là mật độ cao nhất (4 bolds/paragraph §3). Không đạt "loãng" - mỗi bold có chức năng rõ: `lười gõ` (consumer truth) · `"tịt"` (visual word) · `rớt khách liền` (consequence). §4 có 3 bolds + 1 highlight - cũng OK vì đây là Mission paragraph quan trọng nhất.

**Verdict S6:** ✅ Đầy đủ structure, bold strategy không loãng, F1 highlight đặt đúng chỗ USP cốt lõi.

---

## 6. Slogan Cross-Section Reuse Analysis

`Đêm không rớt đơn, ngày không quá tải` xuất hiện tại:

| Placement | Role | Tần suất user thấy | Assessment |
|---|---|---|---|
| **S6 §4 Mission** (canonical) | Payoff của story, inline highlight | High (text block) | ✅ - đây là placement "earn" slogan |
| **S6 Highlight bullets** | Bullet cuối trong list 4 điểm | High (dưới story) | ✅ - reinforcement ngay dưới |
| **S1 Alt E** (A/B only) | Headline alternative - chưa active | Không dùng đồng thời | ✅ - không conflict |
| **S10 Footer tagline** | Brand statement dưới logo | Low (footer) | ✅ - brand stamp nhất quán |
| **Sticky CTA bar** (spec note) | Ghi trong S6 cross-section note, nhưng actual sticky CTA text = `Demo miễn phí - 20 phút →` | Active mobile | ✅ - sticky KHÔNG dùng slogan, dùng offer-led copy |

**Verdict:** Không thừa/trùng. Slogan xuất hiện ở 3 placement đồng thời (S6 inline · S6 bullets · S10 footer) - mức độ này hợp lý cho landing page single-product. Canonical placement = S6 §4 Mission (user đọc story trước khi thấy ở footer). Sticky CTA đã đúng khi dùng offer-led "Demo miễn phí" thay slogan - không cạnh tranh.

---

## 7. Mobile Sticky CTA - Phase 03 Spec Completeness

Spec tại S10 L640-645:

| Element | Specified | Sufficient for dev? |
|---|---|---|
| Text content | `Demo miễn phí - 20 phút →` | ✅ |
| Trigger | Scroll qua Hero | ✅ - nhưng thiếu pixel/percentage threshold |
| Action | smooth scroll → `#booking` | ✅ |
| Style | gradient Aurora hex codes · glow shadow · height 56px · padding 16px | ✅ |
| Animation | magnetic E3 · shine sweep E1 on hover/tap | ✅ |
| Hide condition | intersection observer khi user vào S8 | ✅ |
| Z-index | trên FAQ accordion | ✅ - nhưng thiếu exact z-index value |
| Mobile-only | "mobile only" stated | ✅ |

**Conflict với S1 Secondary CTA "Xem cách hoạt động ↓":** Không conflict - secondary CTA scroll → S4, sticky CTA scroll → S8. Hai action khác nhau, không cạnh tranh. Sticky xuất hiện sau khi user đã pass S1, secondary CTA không còn visible.

**Minor gap:** Trigger threshold (scroll bao nhiêu px/% qua Hero) + exact z-index value chưa spec. Phase 03 dev sẽ phải tự quyết. Không blocking nhưng nên note trong Phase 03 kickoff.

---

## 8. Privacy Policy Compliance - NĐ 13/2022/NĐ-CP

### 8.1 Nine Rights Checklist

| Quyền | NĐ 13/2022 ref | PP Mục 8 | Status |
|---|---|---|---|
| 1. Quyền được biết | Điều 9a | ✅ Có - "Đọc chính sách hoặc liên hệ" | ✅ |
| 2. Quyền đồng ý | Điều 9b | ✅ Có - "Tick checkbox khi submit form" | ✅ |
| 3. Quyền truy cập | Điều 9c | ✅ Có - "72 giờ" | ✅ |
| 4. Quyền rút lại đồng ý | Điều 9d | ✅ Có - "24 giờ xác nhận" | ✅ |
| 5. Quyền xóa dữ liệu | Điều 9đ | ✅ Có - "72 giờ" | ✅ |
| 6. Quyền hạn chế xử lý | Điều 9e | ✅ Có - "áp dụng ngay" | ✅ |
| 7. Quyền phản đối | Điều 9g | ✅ Có - "nhắn yêu cầu kèm lý do" | ✅ |
| 8. Quyền khiếu nại | Điều 9h | ✅ Có - Cục An toàn Thông tin + ais.gov.vn | ✅ |
| 9. Quyền yêu cầu bồi thường | Điều 9i | ✅ Có - "Theo quy định pháp luật" | ✅ |

**Verdict: 9/9 quyền có đủ.**

### 8.2 Legal Basis Assessment

| Mục đích | Căn cứ trong PP | Đánh giá |
|---|---|---|
| Xác nhận lịch hẹn | "Sự đồng ý" + "Thực hiện hợp đồng" | ✅ Đúng - form có consent checkbox |
| Liên hệ Zalo/gửi Meet | "Sự đồng ý" | ✅ - checkbox ghi rõ "nhận tin Zalo" |
| Phân tích UX anonymous | "Lợi ích hợp pháp" | ✅ - anonymous analytics không cần consent riêng |
| Bảo mật/phòng spam | "Lợi ích hợp pháp" + "Tuân thủ pháp luật" | ✅ |
| Lưu trữ giao dịch | "Tuân thủ pháp luật" kế toán/thuế | ✅ |

**Note:** PP chưa ghi rõ cơ sở pháp lý cụ thể (Điều X, NĐ 13) cho từng mục đích - chỉ ghi tên loại. Với v1 scope nhỏ + lawyer skip, đây là acceptable. Nếu scale lên, cần cite điều khoản cụ thể.

### 8.3 Retention Period Assessment

| Dữ liệu | Period | Hợp lý? |
|---|---|---|
| Booking info | 24 tháng | ✅ Hợp lý cho SMB follow-up dài hạn |
| Cancelled booking | 6 tháng | ✅ Đủ cho dispute resolution |
| Log IP/User-Agent | 90 ngày | ✅ Industry standard |
| Essential cookies | Session | ✅ |
| Analytics cookies | 12 tháng | ✅ Industry standard |

**Verdict:** Retention hợp lý, không có period nào quá dài hay bất thường.

### 8.4 Domain in Privacy Policy

PP header: `nguyenvantai.com`. Nhất quán với og:url trong content-copy.md. Không có reference nào đến `schedule.1funn.click` trong PP. **PP sạch.**

### 8.5 Consent Checkbox - Linkage gap

PP Phần dev notes (L236) ghi cần update consent label thành:
```
Tôi đồng ý... và đã đọc <a href="/privacy">Chính sách Bảo mật</a>
```
Nhưng content-copy.md S8 Field 5 L544 vẫn là:
```
Tôi đồng ý nhận tin Zalo xác nhận lịch từ Tài AI Automation
```
Thiếu link `/privacy`. Đây là Phase 03 implementation task - không phải content error. Cần note cho dev.

---

## 9. Forbidden Phrase Final Scan

Scan live trên file (confirmed by Grep tool):

| Phrase | Hits (display content) | Status |
|---|---|---|
| Đột phá | 0 | ✅ |
| Cách mạng | 0 | ✅ |
| Tiên tiến nhất | 0 | ✅ |
| Số 1 thị trường | 0 | ✅ |
| Giải pháp toàn diện | 0 | ✅ |
| Tối ưu tối đa | 0 | ✅ |
| Đỉnh cao | 0 | ✅ |
| Hoàn hảo | 0 | ✅ |
| Tuyệt đối | 0 | ✅ |

**Verdict: 0/9 forbidden phrases. Pass.**

**Note:** "tối ưu chi phí vận hành" trong S1 body - không phải "Tối ưu tối đa", không vi phạm. "hoàn toàn vô dụng" S2 Card 3 - owner-accepted, không trong forbidden list.

---

## 10. Voice Consistency Check

**"Tôi/Tài" scan:**
- S6 story: "tôi" consistent throughout 4 paragraphs ✅
- S8 helpers: "tôi sẽ liên hệ Zalo", "tôi sẽ chuẩn bị" - ✅ (đã fix từ "Em" cũ)
- S8.2 Field 4 group helper L511: "Tôi sẽ chuẩn bị demo phù hợp" ✅
- S9 trust close L600: "Cảm ơn anh/chị đã tin tưởng. Hẹn gặp ở Meet - tôi sẽ demo đúng những gì anh/chị quan tâm." ✅
- S9 next steps L591: "số gọi từ `0345 324 467`" - dấu backtick trên số điện thoại trong next steps bullet có thể render oddly tùy UI. Minor render risk.

**"Anh/chị" scan:** 60+ occurrences, không tìm thấy "bạn", "quý khách", "bên bạn" lạc tone. ✅

**Không có "chúng tôi" trong content-copy.md display content.** (Only in meta/voice note). ✅

**S9 "Khi vào Meet: Vào link Google Meet - không cần cài app gì"** - dùng "Vào link" không phải "Click link". ✅ Owner-kept behavior đã sanitized naturally.

---

## 11. Final Section Heatmap

| Section | Audit Cũ | Final Score | Delta | Note |
|---|---|---|---|---|
| S1 Hero | 4/5 | 4.5/5 | +0.5 | Alt E locked · "trọn đời" owner-kept (noted) |
| S2 Problem | 4.5/5 | 4.5/5 | 0 | "hoàn toàn vô dụng" owner-kept (noted) |
| S3 Services | 3.5/5 | 4.5/5 | +1.0 | CTAs fixed · "trọn đời" owner-kept · M1 anchor inconsistency minor |
| S4 Tech Graph | 4/5 | 4/5 | 0 | Stable |
| S5 Process | 5/5 | 5/5 | 0 | Solid |
| S6 About | 1/5* | 5/5 | +4.0 | *Cũ = placeholder; nay = full content, locked |
| S7 FAQ | 4.5/5 | 4.5/5 | 0 | Generic title owner-kept |
| S8 Booking | 4/5 | 4.5/5 | +0.5 | "Em → Tôi" fixed, form complete |
| S9 Thank-you | 4.5/5 | 4.5/5 | 0 | Phone in backtick minor render risk |
| S10 Footer | 2/5* | 5/5 | +3.0 | *Cũ = empty contact; nay = all filled + sticky spec |
| SEO Meta | 3.5/5 | 4/5 | +0.5 | og:url nguyenvantai.com ✅ · og:image deferred |
| Privacy Policy | N/A | 4.5/5 | - | 9/9 rights · consent link gap (Phase 03 task) |

**Overall: 89/100**

---

## 12. Recommendations - MUST-FIX trước Phase 03 Build

### MUST-FIX (2 items)

**R1 - Module 2 + Module 3 CTA: thêm anchor `#booking`**
Hiện tại chỉ Module 1 có explicit `anchor #booking`. Module 2 + 3 thiếu. Dev có thể implement inconsistently.
```
# Hiện tại (Module 2):
Module CTA (scroll → S8 Booking): Đặt lịch demo Module 2 →

# Fix:
Module CTA (scroll → S8 Booking, anchor `#booking`): Đặt lịch demo Module 2 →
```
Same fix cho Module 3.

**R2 - Phase 03 kickoff note: consent checkbox cần link `/privacy`**
Content-copy.md S8 Field 5 text cần được dev update khi wiring form:
```
Tôi đồng ý nhận tin Zalo xác nhận lịch từ Tài AI Automation và đã đọc 
<a href="/privacy">Chính sách Bảo mật</a>
```
Đây là Phase 03 implementation task, không phải content edit. Nhưng cần explicit note để không bị bỏ sót.

### INFORMATIONAL (không blocking, không cần fix ngay)

**I1 - Canonical domain:** Confirm `nguyenvantai.com` = deploy target cho dev setup `NEXT_PUBLIC_SITE_URL` + Vercel config trước Phase 03.

**I2 - Sticky CTA trigger threshold:** Spec chưa có pixel/% scroll threshold và z-index exact value. Dev cần tự quyết - nên discuss ở Phase 03 kickoff.

**I3 - S9 phone in backtick:** `số gọi từ \`0345 324 467\`` có thể render as inline code. Verify UI intent.

---

## 13. Owner-Accepted Risks (không re-flag, chỉ document)

| Item | Location | Risk level | Owner decision |
|---|---|---|---|
| `trọn đời` claim unqualified | S1 L50, L63 · S3 L198 | Medium business/legal | Keep - scope documented in Terms |
| `hoàn toàn vô dụng` absolute claim | S2 Card 3 L114 | Low | Keep intentionally |
| `vision ai shop` keyword | SEO secondary L669 | Low SEO | Keep |
| Generic S7 title "Câu hỏi thường gặp" | S7 L359 | Low conversion | Keep |

---

## 14. Positive Observations

- S6 story quality cao - §2 Insight đặc biệt mạnh: "lười gõ + quăng ảnh vô inbox + 'Mẫu này còn không?'" là consumer truth authentic, không bịa.
- Sticky CTA spec rất đầy đủ cho landing page SMB: hex codes · animation refs · intersection observer · z-index context. Dev không cần hỏi lại.
- Privacy Policy tone balance tốt: legal rigor ở Mục 5-9, personal voice ở Mục 13 "Cam kết cuối cùng" - bridge thuyết phục.
- CTA table (S audit) 8/8 CTAs pass verb whitelist. Zero "Tìm hiểu thêm" hay "Click" còn sót.
- Cross-file contact info 100% consistent - không có typo hay mismatch giữa PP và landing content.

---

## Phase 02 Status Confirmation

`phase-02-content-and-copywriting.md` → Status: ✅ **Complete (locked 2026-05-12)**. Todo list: tất cả checked ngoài TypeScript files (đúng theo DEFERRED spec). Phase 02 đã đủ điều kiện close.

---

## Unresolved Questions

1. **Canonical domain confirmed bởi ai?** Audit brief nói `plan.md` có thể còn ref `schedule.1funn.click`. Cần owner/dev confirm `nguyenvantai.com` = Vercel project URL trước Phase 03 deploy setup.
2. **S3 Module 3 "30 ngày ưu tiên hỗ trợ tinh chỉnh - hỗ trợ sử dụng trọn đời miễn phí"** - owner có muốn clarify scope "miễn phí" chỉ cho 30 ngày, hay để nguyên ambiguity intentionally?
3. **og:image** deferred Phase 03 - Aurora hero/banner art direction đã brief chưa hay Phase 03 cần thêm brief?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** content-copy.md + privacy-policy.md PASS với 89/100. 0 blocking issues còn lại. 2 medium issues (M1 anchor inconsistency · M2 domain canonical) không blocking Phase 03 build nhưng cần resolve trước go-live.
**Concerns:** Domain canonical (`schedule.1funn.click` vs `nguyenvantai.com`) chưa confirmed ở plan-level docs ngoài scope audit này - cần owner confirm cho Phase 03 dev config.
