# Red Team v2 - Scope · SEO · Completeness · Cook-Readiness Verdict

**Date:** 2026-06-09  
**Plan:** `plans/260609-1056-template-instruction-library-and-blog/`  
**Reviewer stance:** Adversarial round 2 - verify resolution + cook-readiness  
**Input:** F1–F11 (red-team v1) + plan.md + phase-01..05

---

## 1. Resolution Table - F1–F11

| # | Severity | Finding | Status | Evidence / Notes |
|---|----------|---------|--------|-----------------|
| F1 | HIGH | Client filter = no pSEO | **RESOLVED** | plan.md Key Decisions: "SEO surface = pSEO routes `/templates/nganh/[industry]` tĩnh, index được"; phase-02 step 6 + success criteria confirm SSG + generateStaticParams + metadata + canonical; phase-04 adds OG + JSON-LD ItemList + sitemap inclusion. User chốt đúng hướng. |
| F2 | HIGH | Schema 1:1 quá hẹp | **RESOLVED (user chốt giữ)** | plan.md "1 industry + 1 goal (user chốt giữ 1:1; cross-category → chọn 1 hoặc tách bài)" - đây là user decision, không đảo ngược. Ghi nhận debt cross-category. |
| F3 | HIGH | Thiếu README frontmatter cho owner | **RESOLVED** | phase-01 Architecture + Related Files: "`content/templates/README.md` - hướng dẫn frontmatter cho owner (F3)"; step 7 + success criteria checkbox. |
| F4 | MEDIUM | Related rỗng khi dataset nhỏ | **RESOLVED** | phase-03 step 6: "bù theo goal → bù featured, tối đa 3; ẩn section CHỈ khi 0 kết quả (không phải khi <3)". Khớp đề xuất v1. |
| F5 | MEDIUM | HowTo fragile (parse headings) | **RESOLVED** | plan.md: "TechArticle default, opt-in HowTo qua frontmatter `schemaType`"; phase-01 schema có `schemaType s.enum(['article','howto']).default('article')`; phase-04 "KHÔNG auto-parse heading". |
| F6 | MEDIUM | robots disallow /booking | **RESOLVED** | plan.md: "robots.ts chỉ disallow `/admin` + `/api`, KHÔNG chặn `/booking`"; phase-04 step 7 + success criteria checkbox explicit. |
| F7 | MEDIUM | OG listing generic | **RESOLVED** | phase-04 Related Files: `src/app/templates/opengraph-image.tsx` (OG trang kho - số template + highlight). Step 4 mô tả build OG listing. |
| F8 | LOW | featured ribbon YAGNI | **PARTIAL** | plan.md không loại ribbon. Phase-02 template-card.tsx vẫn list "featured ribbon". Đề xuất v1: bỏ ribbon, giữ field cho sort/related. Không critical - chỉ UI noise nhỏ. |
| F9 | LOW | repo bloat (attachments public/) | **RESOLVED (noted debt)** | Brainstorm xác nhận user chốt `public/` + risk note trong phase-02. Không đảo ngược. |
| F10 | LOW | Blog canonical cho tag filter | **RESOLVED** | phase-05 blog dùng client filter 1 chiều tag (không deep taxonomy) - chấp nhận, thấp hơn Templates nhiều. |
| F11 | LOW | reading-time từ compiled body | **RESOLVED** | plan.md: "tính từ raw content, không thêm dep nếu tránh được"; phase-05 explicit: "KHÔNG trên body compiled - F11; Velite transform hoặc package `reading-time`". |
| DRY | - | content-explorer/template-grid tách | **RESOLVED** | phase-02 tách `template-grid.tsx` riêng; phase-05 step 0: "Refactor DRY trước - rút `content-explorer.tsx` generic tránh fork ~90% code". |

**Summary:** 10/11 RESOLVED, 1 PARTIAL (F8 ribbon - low severity, không chặn cook).

---

## 2. Completeness Gaps (Cook-Readiness)

### 2a. Gaps được phát hiện

**[LOW] G1 - pSEO intro copy ngành: nguồn chưa rõ**  
Phase-02 step 6: pSEO page có "intro copy ngắn (lấy label từ taxonomy)". Nhưng `taxonomy.ts` chỉ có slug + label 1-2 từ (vd "Spa/Thẩm mỹ"). Intro copy thật cần 1-2 câu mô tả theo ngành để tránh thin content - chưa ai được giao viết. Nếu dùng label đơn thuần → "Template Spa/Thẩm mỹ" + grid template, Google có thể coi doorway page.  
**Đề xuất:** Thêm field `description` vào mỗi industry trong taxonomy.ts (1-2 câu, VN), dùng ở pSEO page intro. Chi phí: ~30 phút viết copy + thêm field.

**[LOW] G2 - /templates index page: không có nav link từ hero/footer**  
Phase-01 chỉ thêm nav link. Nhưng landing home (`/`) hiện tại không có link nào trỏ vào `/templates`. Nếu user vào landing nhưng không nhìn nav → không biết Templates tồn tại.  
**Đánh giá:** Chấp nhận cho v1 (nav link là đủ, internal link từ home có thể thêm sau). Không chặn cook.

**[LOW] G3 - Phase 4 font verify: không có step chủ động tải subset**  
Phase-04 step 1: "verify font local TRƯỚC… nhiều khả năng phải tải subset bỏ vào `public/fonts/`". Nhưng plan không có explicit step "tải Be Vietnam Pro subset + Space Grotesk subset" hay link download. Cook sẽ phải tự tìm font file, có thể mất thời gian hoặc tải sai format.  
**Đề xuất:** Thêm note: "tải subset VN từ Google Fonts (Download family → Latin + Vietnamese range), chỉ cần Regular + Medium; đặt vào `public/fonts/be-vietnam-pro.ttf` + `space-grotesk.ttf`".

**[MEDIUM] G4 - pSEO: không có acceptance criteria đo được cho "không thin content"**  
Phase-02 success criteria: "render đúng template ngành đó, H1 + intro". Nhưng không có tiêu chí tối thiểu cho intro copy (vd: "intro ≥ 50 words" hay "intro khác nhau theo ngành"). Với G1 chưa giải quyết, cook có thể pass criteria bằng 1 câu lấy label - không đủ để Google không coi thin.  
**Đề xuất:** Thêm criteria: "Intro copy mỗi ngành ≥ 1 câu mô tả context (không chỉ label ngành)".

### 2b. Phân tích dependency + file ownership

| Phase | Dependency | Ownership clash? |
|-------|------------|-----------------|
| P1→P2 | P2 cần `.velite/` data, queries, taxonomy, nav | Sạch - P1 hoàn toàn trước P2 |
| P2→P3 | P3 cần slug routes từ seed P2 | Sạch |
| P3→P4 | P4 nâng cấp generateMetadata các trang P2+P3 đã tạo | **Watch:** P4 modify `templates/page.tsx` + `[slug]/page.tsx` đã tạo ở P2/P3. Phải đọc file trước sửa. |
| P4→P5 | P5 cần json-ld.ts, og-fonts.ts, sitemap.ts từ P4 | Sạch - P5 mở rộng, không overwrite |
| P1→P5 | P5 cần Velite `posts` schema (P1 tạo khung) | Sạch |

Không có clash nghiêm trọng. P4 modify files P2/P3 là bình thường nếu 1 developer tuần tự.

### 2c. Scope creep còn sót

- `template-card.tsx` có "featured ribbon" (F8 PARTIAL) - UI element chưa có design cụ thể → có thể gây blocker nhỏ lúc implement. Giải pháp: bỏ ribbon, dùng field `featured` cho sort/related only.
- Phase-05 step 0 gọi DRY refactor `content-explorer.tsx` TRƯỚC khi implement blog - đây là đúng nhưng có thể scope-creep nếu refactor mất >1h. Plan gọi là "refactor" không specify độ phức tạp. Acceptable vì DRY rõ ràng.
- `post-list-explorer.tsx` vs `templates-explorer.tsx`: plan giải quyết bằng generic `content-explorer`. OK.

---

## 3. Cook-Readiness Verdict

### **COOK WITH CAVEATS**

Lý do:

**Sẵn sàng cook:**
- Tất cả user decisions được encode đúng vào plan (pSEO route, 1:1 schema, TechArticle default, robots, reading-time raw).
- F1 (finding quan trọng nhất) được resolve đúng hướng: pSEO routes tĩnh `/templates/nganh/[industry]` với SSG, metadata, canonical, JSON-LD ItemList, sitemap.
- Phase dependency thứ tự P1→P2→P3→P4→P5 logic, không có circular.
- Each phase có measurable success criteria (checkbox list) + risk assessment rõ.
- File list Create/Modify đầy đủ per phase, tránh ambiguity.
- DRY risk được address chủ động (template-grid.tsx tách; content-explorer.tsx plan trước P5).
- Build pipeline rõ (velite && next build, không webpack plugin, fallback gray-matter documented).

**Caveats trước khi cook:**

1. **(G1 + G4 - medium impact):** pSEO intro copy ngành chưa có nguồn. Cook cần biết: dùng label đơn thuần hay phải viết copy thật? Nên thêm field `description` vào taxonomy.ts với 1 câu VN mỗi ngành trước phase-02 step 6. Nếu không → pSEO pages thin content risk thật, sitemap nhận 13 routes nhưng Google deindex chúng.

2. **(G3 - low, có thể block P4):** Font file verify. Phase-04 step 1 đã note rõ "làm đầu tiên" - nhưng cook cần được nhắc: nếu không có font thô trong `public/fonts/`, OG image bị fail hoặc fallback font xấu (dấu tiếng Việt vỡ). Explicit action: tải BeVietnamPro-Regular.ttf + SpaceGrotesk-Medium.ttf, Latin+VN subset.

3. **(F8 ribbon - low):** `featured ribbon` trong phase-02 card chưa quyết bỏ. Nếu cook implement ribbon → UI element không có design spec → tự design → có thể lệch Aurora system. Nên confirm: bỏ ribbon, giữ field cho sort.

**Không phải blockers, chỉ là "cook cần biết trước".**

---

## Unresolved Questions

- Q1: Intro copy cho 13 ngành pSEO - viết thủ công hay generate? Ai viết? Cần trước Phase 2 bước 6.
- Q2: Font file local hiện có trong `public/fonts/` chưa? (Plan ghi "nhiều khả năng chưa có" - cần confirm ngay đầu Phase 4.)
- Q3: `featured ribbon` trên card - giữ hay bỏ? Nếu giữ, cần design spec (màu, vị trí, text). Nếu bỏ, update phase-02 card spec.

---

**Status:** DONE  
**Summary:** 10/11 findings RESOLVED. 3 caveats nhỏ (pSEO intro copy nguồn chưa rõ, font local chưa verify, featured ribbon chưa chốt bỏ). Plan đủ detail để bắt đầu cook P1–P3 ngay; P4 cần clarify font trước; P2 bước 6 cần intro copy strategy.  
**Concerns:** G1/G4 là risk thật nhất - pSEO routes thin content nếu chỉ dùng label taxonomy làm intro. Không chặn P1–P2 start nhưng phải resolve trước P2 step 6.
