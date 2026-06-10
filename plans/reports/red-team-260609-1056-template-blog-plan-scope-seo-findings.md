# Red Team Report - Template + Blog Plan
## Scope · UX · SEO · Maintainability

**Date:** 2026-06-09  
**Plan:** `plans/260609-1056-template-instruction-library-and-blog/`  
**Reviewer stance:** Adversarial - hoài nghi, brutal, YAGNI/KISS/DRY  
**User decisions locked (không đảo ngược):** MDX/Velite, taxonomy 3 chiều, no-gate, client-side filter v1, Templates trước Blog.

---

## Findings

---

### [HIGH] F1 - Client-side filter = hy sinh toàn bộ pSEO theo ngành/mục tiêu

**Mô tả:** Plan chốt filter client-side, URL không thay đổi khi lọc. `/templates?businessModel=ban-le&industry=thoi-trang` hay `/templates/nganh/thoi-trang` KHÔNG tồn tại. Google không crawl filtered state.

**Lý do quan trọng:**  
Đây là site lấy **SEO làm mục tiêu chính** (brainstorm: "kéo organic traffic + đẩy vào funnel"). Taxonomy 13 ngành × 3 goal × 2 model = 78 tổ hợp tiềm năng. Client filter bỏ lại SEO value này trên bàn. Người tìm "template chatbot spa chốt đơn" sẽ KHÔNG tìm thấy trang nào có keyword đó - vì page duy nhất tồn tại là `/templates` và `/templates/[slug]`.

Research report của chính dự án (Section 5) khuyến nghị **nuqs + searchParams RSC** cho 3+ dimensions với lý do: *"Shareable URLs, SEO-friendly (searchParams indexed by Google)"*. Plan bỏ qua luôn.

**Trade-off:**
- **Giữ client filter:** KISS hoàn toàn, zero dep mới - nhưng mất pSEO, mất shareability, mất click "Xem template chatbot spa" từ Google.
- **URL-synced via searchParams (không cần nuqs):** ~2h thêm, không thêm dep. `/templates?model=dich-vu&industry=spa` indexable với canonical `/templates`. Không cần static routes. Vẫn KISS hơn nuqs.
- **Static routes `/templates/[industry]/[goal]`:** pSEO mạnh nhất nhưng thêm 1-2 ngày, 78 routes tĩnh, over-engineering cho v1.

**Đề xuất:** Đưa vào validation interview. Nếu SEO là ưu tiên → ít nhất URL-sync searchParams (không nuqs). Nếu muốn KISS tuyệt đối và chấp nhận bỏ pSEO → giữ nguyên và ghi nhận khoản nợ.

**Phân loại:** Nên hỏi user quyết - vì đây là trade-off chiến lược đã locked (client filter v1) nhưng research nội bộ chính dự án mâu thuẫn với quyết định đó.

---

### [HIGH] F2 - Schema chỉ cho phép 1 industry/1 goal → chặn nội dung thực tế

**Mô tả:** Frontmatter schema: `industry: string` (1 giá trị), `goal: enum` (1 giá trị). Một template như "Chào hàng combo Tết - spa + mỹ phẩm" hoặc "Remarketing đa mục tiêu" sẽ buộc phải chọn 1 trong 2 ngành, 1 trong 3 goal → mất khả năng khám phá từ chiều kia.

**Lý do quan trọng:**  
Thực tế nội dung marketing thường cross-category. Schema 1:1 buộc owner phải tạo bản duplicate hoặc chọn sai → degraded filter accuracy → user tìm theo ngành/mục tiêu sẽ miss content phù hợp.

**Ví dụ cụ thể:**  
- Template "Upsell sau mua hàng" phù hợp cả ban-le lẫn dich-vu  
- Template "Thu lead qua minigame" phù hợp cả thu-lead lẫn nuoi-duong

**Trade-off:**  
- `industry: string[]` + `goal: string[]` với refine `min(1).max(3)`: thêm ~1h sửa schema + filter logic. Client filter useMemo cần `some()` thay `===`. KISS vẫn giữ được.
- Giữ nguyên 1:1: KISS hoàn toàn nhưng nội dung thật sẽ bị squeeze.

**Đề xuất:** Fix thẳng - sửa schema thành `industry: z.array(z.string()).min(1).max(3)` và `goal: z.array(goalEnum).min(1).max(2)`. Filter logic: `selectedGoal === '' || template.goal.includes(selectedGoal)`. Đây không phải user decision, là design gap.

---

### [HIGH] F3 - Thiếu README/docs format frontmatter cho owner

**Mô tả:** Không có file `content/templates/README.md` hoặc `CONTRIBUTING.md` hướng dẫn cách thêm template mới. Plan giả định owner biết format MDX frontmatter, biết slug convention, biết đặt ảnh đâu.

**Lý do quan trọng:**  
Plan nói "owner thêm hàng tá template". Nếu owner không có guide cụ thể → frontmatter sai → build fail → frustration → không thêm template. Đây là rào cản thực tế nhất với mục tiêu "kho hàng tá template".

Build fail với Velite validate frontmatter sai là tốt (early error) nhưng KHÔNG thay thế được documentation cho non-dev owner.

**Đề xuất:** Fix thẳng - thêm vào Phase 1 hoặc 2: tạo `content/templates/README.md` (max 60 dòng) với: ví dụ frontmatter đầy đủ, danh sách giá trị hợp lệ cho mỗi field, convention đặt ảnh cover, convention slug (kebab-case tiếng Việt không dấu), lệnh verify nhanh. Chi phí: 30 phút.

---

### [MEDIUM] F4 - related-templates có thể rỗng hoàn toàn khi dataset nhỏ

**Mô tả:** Phase 3 chốt related logic: cùng industry trước, fallback goal, tối đa 3. Với 5 template seed (Phase 2), mỗi industry chỉ có 1-2 template. Fallback goal cũng có thể chỉ trả về 1 bài.

**Lý do:** Plan có note "ẩn section nếu vẫn 0" - điều này che giấu vấn đề thay vì giải quyết. Khi section liên quan thường xuyên vắng hoặc chỉ có 1 item, UX cảm giác site thưa thớt.

**Đề xuất:** Fallback thêm bước 3: nếu < 3 bài sau 2 bước → fill thêm từ `featured: true`. Ẩn section chỉ khi total = 0 (không phải < 3). Chi phí thấp, logic queries.ts.

---

### [MEDIUM] F5 - HowTo JSON-LD hardcode step extraction từ headings là fragile

**Mô tả:** Phase 4, Step 4: `buildHowTo(template)` - "step từ headings nếu khả thi hoặc mô tả". Việc parse h2/h3 headings từ compiled MDX body để sinh `HowToStep` là unreliable: không phải template nào cũng viết theo cấu trúc step, heading đôi khi là section title không phải step.

**Lý do:** Google có thể reject HowTo schema nếu step không có `text` hợp lệ hoặc schema cấu trúc sai → Google phạt, không cộng. Plan đã note fallback TechArticle/Article - điều này đúng nhưng logic switch cần rõ ràng hơn.

**Đề xuất:** Fix thẳng - dùng `TechArticle` làm default; chỉ emit `HowTo` nếu frontmatter có field tường minh `schemaType: 'howto'` do owner set. Không auto-detect từ headings. Đơn giản hơn, an toàn hơn. Thêm `schemaType: 'howto' | 'article'` vào frontmatter schema (optional, default 'article').

---

### [MEDIUM] F6 - Phase 4 robots.ts disallow `/booking` là sai chiến lược

**Mô tả:** Research report (robots.ts sample) disallow `/booking`. Plan Phase 4 copy nguyên: "disallow `/admin`, `/api`". Cần kiểm tra: `/booking` có đang bị disallow không? Nếu có → Google không index trang booking → mất organic traffic cho funnel chính.

**Lý do:** `/booking` là conversion endpoint của site. Không nên disallow. Chỉ disallow `/admin` (no-index admin panel) và `/api` (JSON endpoints).

**Đề xuất:** Fix thẳng - xem lại robots config, chỉ disallow `/admin` và `/api`. Giữ `/booking` allow. Chi phí: 5 phút.

---

### [MEDIUM] F7 - OG image listing `/templates` là "tĩnh-ish" → thiếu giá trị SEO social

**Mô tả:** `app/templates/opengraph-image.tsx` cho trang listing được note là "tĩnh-ish". Không có thông tin nào về số template, featured content, hay category highlights. Khi ai share link `/templates` trên Facebook/Zalo → OG card generic, không persuasive.

**Đề xuất:** OG listing nên hiển thị: tổng số template ("19 Template Chatbot AI"), featured category, tagline. Chi phí thấp (đọc count từ getTemplates() ở build time). Không cần là dynamic.

---

### [LOW] F8 - `featured: bool default false` trong schema - YAGNI?

**Mô tả:** Phase 1 schema có `featured: bool default false`. Phase 2 card có "featured ribbon". Phase 3 related fallback đến featured.

**Lý do:** Với ~hàng tá template, featured chỉ có nghĩa nếu có sorting hay highlight rõ ràng. Ribbon trên card là UI noise nếu 3/5 template đều featured. Related fallback theo featured có logic nhưng sẽ tạo bias.

**Đánh giá:** Giữ lại vì đã dùng cho sort priority (featured→publishedAt desc trong queries.ts) và related fallback. Nhưng bỏ "featured ribbon" trên card nếu không có thiết kế rõ - ribbon mà không nổi bật thì vô nghĩa.

**Đề xuất:** Flag thẳng - bỏ ribbon UI trong Phase 2 card, giữ `featured` field cho sort/related logic. Tiết kiệm 1 UI element.

---

### [LOW] F9 - `attachments` field và ảnh cover trong `public/` → repo bloat theo thời gian

**Mô tả:** Ảnh cover + file đính kèm commit vào `public/templates/<slug>/`. Với hàng tá template, mỗi template có 1 ảnh cover (~100-500KB) + 1-2 file đính kèm → repo git nặng dần, clone chậm.

**Đây là user decision đã chốt** (brainstorm: "public/ - commit kèm"). Không đảo ngược.

**Flag thôi:** Khi repo > 50-100 template, cân nhắc Git LFS hoặc chuyển sang CDN/Drive cho attachments. Note vào plan.md như known debt.

---

### [LOW] F10 - Blog (Phase 5) thiếu canonical strategy cho tag filtered views

**Mô tả:** Phase 5 blog listing có "filter tag + search (client component nhỏ)". Nhưng không mention canonical cho `/blog?tag=x`. Nếu Blog cũng client-side filter như Templates → cùng vấn đề SEO như F1 nhưng ít nghiêm trọng hơn vì Blog tag không có taxonomy depth như Templates.

**Đề xuất:** Cùng quyết định với F1 - nếu Templates có URL-sync thì Blog cũng nên. Nếu giữ client filter → OK với Blog vì tag blog thường shallow.

---

### [LOW] F11 - Phase 5 reading-time: "tự tính từ body, không cần dep"

**Mô tả:** Plan đề xuất tự tính reading time mà không cần dep. Velite `body` sau khi compile là function string (compiled MDX), không phải plain text → không thể đơn giản `.split(' ').length / 200`.

**Đề xuất:** Fix thẳng - thêm computed field `readingTime` vào Velite schema Phase 5, tính từ raw body trước khi compile (Velite transform). Hoặc dùng `reading-time` package (nhỏ, 0 dep). Đừng tự viết từ compiled code.

---

## DRY Analysis: Templates ↔ Blog

Plan đã nhận diện DRY risk ở Phase 5. Cụ thể:

| Component | Templates | Blog | Tái dùng được? |
|---|---|---|---|
| `mdx-components.tsx` | Phase 1 | Phase 5 | ✅ Tái dùng 100% |
| `opengraph-image.tsx` | Phase 4 (per-slug) | Phase 5 | Partial - layout giống, data khác. Cần builder chung |
| `json-ld.ts` | Phase 4 | Phase 5 | ✅ builders độc lập, đúng pattern |
| Explorer pattern (state + grid) | Phase 2 | Phase 5 | Partial - plan note "tái dùng pattern" nhưng không extract component chung |
| CTA block | Phase 3 | Phase 5 | ✅ tái dùng `template-cta.tsx` |

**Risk:** `templates-explorer.tsx` và blog `post-list-explorer.tsx` sẽ rất giống nhau (state, useMemo, FilterBar, grid). Nếu không extract generic `<ContentExplorer>` thì 2 file 90% giống nhau = DRY violation.

**Đề xuất (Phase 5, không cần làm ngay):** Trước Phase 5, extract `src/components/content/content-explorer.tsx` generic với slot cho FilterBar + Card rendering. Tiết kiệm ~60 dòng duplicate.

---

## Top 3 Critical Findings

1. **F1 (HIGH) - Client-side filter bỏ qua pSEO hoàn toàn** - Mâu thuẫn trực tiếp với mục tiêu organic traffic. Research của chính dự án khuyến nghị ngược lại. Cần user quyết định có chấp nhận đánh đổi này không.

2. **F2 (HIGH) - Schema 1:1 cho industry/goal** - Hạn chế nội dung thực tế, dễ fix, không cần user decision. Sửa thành array trước khi implement.

3. **F3 (HIGH) - Thiếu doc format frontmatter cho owner** - Rào cản thực tế nhất với mục tiêu "hàng tá template". Fix trong Phase 1/2.

---

## Câu hỏi cho Validation Interview với User

**Q1 (từ F1 - QUAN TRỌNG NHẤT):**  
"Mục tiêu SEO organic có quan trọng hơn độ đơn giản của filter không? Hiện tại filter client-side nghĩa là Google không thấy view `/templates?industry=spa` hay `/templates?goal=chot-don`. Bạn có muốn ít nhất sync filter vào URL (không cần thêm dep, ~2h thêm) để các view có thể share + có tiềm năng được index không?"

**Q2 (từ F2):**  
"Một template có thể thuộc 2 ngành hoặc 2 mục tiêu không? Ví dụ template 'Chào hàng combo Tết' phù hợp cả spa lẫn mỹ phẩm, cả thu-lead lẫn chốt đơn. Nếu có → nên đổi schema thành array (industries[], goals[]) ngay bây giờ trước khi có nhiều content."

**Q3 (từ F3):**  
"Người thêm template là bạn hay có người khác? Nếu bạn tự thêm thì có cần README hướng dẫn không, hay chỉ cần 1 file mẫu để copy?"

**Q4 (từ F5/F7 - SEO schema):**  
"Các template có cấu trúc bước-bước (step 1, step 2...) rõ ràng không, hay là dạng hướng dẫn tổng quát? Câu trả lời ảnh hưởng đến việc dùng HowTo hay Article schema cho rich results."

---

## Unresolved Questions (còn lại sau review)

- ISR (`revalidate = 3600`) trong research report vs SSG thuần trong plan - plan không đề cập ISR. Nếu dùng SSG thuần (không ISR), mỗi lần edit template phải deploy lại - user đã chấp nhận điều này, nhưng cần confirm ISR có được xài không để tránh conflict.
- `public/fonts/*` cho OG image - repo hiện có sẵn font file local chưa? Không verify được từ đây. Phase 4 có ghi risk nhưng không có step kiểm tra tồn tại trước khi build.

---

**Status:** DONE  
**Summary:** 11 findings (3 HIGH, 4 MEDIUM, 4 LOW). Critical gap là client filter bỏ qua pSEO (F1), schema 1:1 quá hẹp cho content thực (F2), thiếu doc cho owner (F3). F6 (robots disallow /booking) là bug nhỏ cần fix thẳng.  
**Concerns:** F1 là strategic decision có thể đảo ngược user lock - không tự đảo ngược, chỉ flag để hỏi user.
