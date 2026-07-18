---
phase: 1
title: "Public course library landing"
status: done
priority: P1
dependencies: []
revisedAt: "2026-07-17"
---

# Phase 1: Public course library landing

> **PIVOT 2026-07-17 (đã chốt với chủ dự án qua design session).** Bản cũ (catalog grid + trang chi tiết `/course/[khoa]`) BỎ. Kiến trúc mới: `/course` là **landing thư viện đa khoá công khai** (SEO) → click khoá → login → vault `/course/learn/[video]` (P3). Theme **dark Teal riêng**, chrome-free. Không trang chi tiết công khai từng khoá ở P1.

## Overview

Subdomain `course.*` → `/course/*`. Trang `/course` = **landing thư viện Academy** (nhiều khoá: chatbot AI, làm web, host free, dùng AI, tự động hoá...), public + SSG + SEO/JSON-LD. Không auth, không video ở phase này. Login CTA trỏ `/course/dang-nhap` (auth thật ở P2). Theme dark Teal scoped, không đụng theme violet main site. Ship độc lập để chạy marketing.

Tham chiếu thị giác đã duyệt: `assets/course/landing-teal-mock.html` (landing) + `assets/course/classroom-teal-mock.html` (vault P3).

## Requirements

- **Functional**: 1 trang landing gồm — header (logo + nút Đăng nhập/Học miễn phí) · hero (value prop cả nền tảng + chip số liệu) · "Vì sao học" (value grid) · **danh sách khoá** (accordion, mỗi khoá = summary [tên/level/số bài/thời lượng] + vài bài teaser + khoá `free` badge "Xem thử" + còn lại 🔒) · chia sẻ (testimonials) · giảng viên · FAQ · CTA cuối · footer. **Mọi CTA login trỏ `/course/dang-nhap`** (stub tĩnh ở P1, wiring auth ở P2 — KHÔNG trỏ thẳng `/course/learn/*` gated = 404, RT-11).
- **Non-functional**: SSG (`dynamicParams = false` nếu có route param; landing tĩnh thuần), canonical + OG + JSON-LD (`ItemList`/`CollectionPage` chứa `Course` items), build fail nếu MDX sai schema. **Theme dark Teal scoped** (không light-toggle v1), chrome-free (không NavBar/SiteFooter/Chatwoot/ScrollToTop marketing), KHÔNG rò token teal ra global.

## Architecture

- **Proxy** (`src/proxy.ts`): thêm `COURSE_HOST_PREFIX = 'course.'`; rewrite `course.*` → `/course/*` **mirror y hệt khối `landing.*`** (public, KHÔNG auth, skip `/api`). Thêm chặn segment `/course` trên host KHÔNG phải `course.*` (đúng khối chặn `/landing` — chống trùng SEO). TUYỆT ĐỐI không gate ở proxy.
- **Root layout** (`src/app/layout.tsx`): thêm nhánh `isCourse = host.startsWith('course.')` **mirror `isLanding`** — render children standalone, KHÔNG chrome marketing, giữ GTM/Pixel/Analytics. Course không dùng `ThemeProvider` violet; theme teal do scope CSS + `/course/layout.tsx` lo.
- **Theme regime (đã chốt)**: course = **dark Teal, scoped**. Tạo `src/app/course/course-theme.css` định nghĩa token teal-dark trên 1 scope (vd class `.course-app` bọc toàn course) — KHÔNG ghi đè `:root` global. Fonts **Sora** (display) + **Plus Jakarta Sans** (body) qua `next/font/google` trong `src/app/course/layout.tsx`, gán biến vào wrapper. v1 dark-only.
  - Token chính (từ mock đã duyệt): `--page #040706`, `--surface #0a1512`, `--surface-2 #0f1d19`, `--surface-3 #142722`, `--ink #eafff8`, `--muted #82998f`, `--border rgba(45,212,191,.16)`, `--primary #2dd4bf` (teal), `--mint #34d399`, `--lime #bef264`. **Tiết chế**: teal chỉ dùng cho điểm nhấn (CTA/active/link), bỏ glow thừa, nền tối trung tính.
- **Content model (Velite)**: collection `courses` pattern `courses/**/*.mdx`. Schema frontmatter:
  ```ts
  title, description, level (enum: co-ban|nang-cao), order (number, sort tăng dần),
  instructor { name, title? }, featured (bool default false), publishedAt (isodate), updatedAt?,
  durationLabel? (string hiển thị vd "1h35"),
  modules: array({ title, lessons: array({ slug, title, duration?, videoKey: s.string().min(1), free? default false }) }),
  path, body (mdx)
  ```
  `videoKey` BẮT BUỘC `s.string().min(1)` (RT-8), placeholder key R2 test thật (vd `test/sample.mp4`), KHÔNG rỗng. `.transform` gắn `slug = path.replace(/^courses\//,'')`, `lessonCount`, `firstLessonHref = /course/learn/${slug}/${firstLessonSlug}`. Thêm `['courses', data.courses.length]` vào `checks` trong `prepare()`. **Walk `prepare()` throw nếu `lesson.slug` trùng trong 1 khoá** (phá anchor content-model V1 + progress map P4).
- **Queries** (`src/lib/content/course-queries.ts`): `getCourses()` (summary, bỏ body, sort order→publishedAt). Mirror `queries.ts` (`toSummary`).
- **Route**: `src/app/course/page.tsx` (landing, RSC, mirror bố cục `landing-teal-mock.html`). `src/app/course/dang-nhap/page.tsx` (stub tĩnh UI đăng nhập magic-link — chưa wiring, để CTA không 404).
- **Components** `src/components/course/`: `course-header.tsx`, `course-hero.tsx`, `value-grid.tsx`, `course-list.tsx` (accordion, shadcn Accordion hoặc `<details>`), `testimonials.tsx`, `instructor-card.tsx`, `course-faq.tsx`, `course-cta.tsx`, `course-footer.tsx`. Theo design contract dark-teal, KHÔNG raw hex ngoài token scope, KHÔNG `text-gray-*`.
- **SEO** (`src/lib/seo/course-json-ld.ts`): `buildCourseCollectionJsonLd` (`@type: CollectionPage` + `ItemList` các `Course`, provider Organization) + breadcrumb (reuse `buildBreadcrumb`).

## Related Code Files

- Modify: `src/proxy.ts` (nhánh `course.*` + chặn `/course`), `velite.config.ts` (collection `courses` + `prepare` check), `src/app/layout.tsx` (nhánh `isCourse`)
- Create: `content/courses/*.mdx` (~4–6 khoá placeholder), `src/app/course/layout.tsx`, `src/app/course/course-theme.css`, `src/app/course/page.tsx`, `src/app/course/dang-nhap/page.tsx`, `src/lib/content/course-queries.ts`, `src/components/course/*`, `src/lib/seo/course-json-ld.ts`
- Reference (không sửa): `src/app/landing/*` (khuôn standalone/scope), `src/app/templates/page.tsx`, `src/lib/content/queries.ts`, `src/lib/seo/json-ld.ts`, `assets/course/landing-teal-mock.html`, `assets/course/classroom-teal-mock.html`

## Implementation Steps

0. **PROTOTYPE GATING (RT2-12/RT-AD7)**: proxy rewrite `course.*` + route `/course` build ra HTML prerendered (`pnpm.cmd build` rồi request `course.localhost:3001/`). Tổ hợp rewrite + SSG chưa có tiền lệ (subdomain rewrite khác đều dynamic). Nếu fail → route-group/basePath.
1. Velite collection `courses` + schema + `prepare` check; viết 4–6 `content/courses/*.mdx` (module/lesson, `videoKey` R2 test). `pnpm.cmd build`/velite xác nhận compile + fail-hard.
2. Theme scope CSS teal-dark + fonts Sora/Plus Jakarta + `course/layout.tsx` chrome-free.
3. `course-queries.ts` → `getCourses()`.
4. Landing `course/page.tsx` + components theo mock; stub `dang-nhap`.
5. Proxy `course.*` + chặn `/course` host khác; root layout `isCourse`.
6. SEO JSON-LD.
7. Verify: `course.localhost:3001/` ra landing dark-teal; host thường `/course` → 404; lint/build xanh; JSON-LD hợp lệ.

## Success Criteria

- [x] `velite && next build` xanh; thêm 1 mdx sai schema → build đỏ (fail-hard chứng minh rồi xoá).
- [x] `course.localhost:3001` render landing thư viện (verify curl: "AI, Web"/"Các khoá học"/scope `course-app`). Visual sign-off của chủ dự án: pending.
- [x] Host chính gõ `/course` → 404 (verify curl); JSON-LD `CollectionPage`+`Course` hợp lệ (code review).
- [x] Theme teal KHÔNG rò global (main `/` → 200 giữ nguyên; review xác nhận scope `.course-app`, không `:root`).
- [x] CTA login trỏ `/course/dang-nhap` (stub tồn tại; review xác nhận không trỏ `/course/learn/*`).
- [x] Lint sạch (`pnpm.cmd lint` 0 error).

**Review**: code-reviewer 0 Critical/High/Medium, 4 Low (cosmetic hex-vs-token, Sora `latin-ext`). Không regression 3 file dùng chung (admin gate nguyên vẹn, không rò theme, không secret) — có bằng chứng.
**Follow-up nhỏ**: (1) eyeball dấu tiếng Việt trên heading Sora; (2) cân nhắc promote vài hex lặp (`#04120e` on-primary, soft-ink) thành token trong `course-theme.css`.

## Security Posture (P1 — surface công khai, tối thiểu)

- Proxy `course.*` **public no-gate** — không đụng admin HMAC, không redirect-gate. Chặn `/course` host khác = 404 (SEO dup + không lộ route nội bộ).
- Không secret trong content/MDX. `videoKey` là object key R2 (không phải credential) — an toàn để commit; credential R2 + signed URL = P3.
- Velite fail-hard chặn nội dung sai schema lọt build.
- Auth (magic-link), RLS `lesson_progress`, R2 signed URL, rate-limit mint = **P2/P3** (không thuộc P1).

## Risk Assessment

- **Rewrite phá SSG** (RT-AD7): bắt buộc bước verify #0/#7.
- **Theme teal rò ra global**: BẮT BUỘC scope (không ghi `:root`); verify main site không đổi màu.
- **Velite fail-hard lỗi intra-document** (RT-8): `videoKey: s.string().min(1)` + walk check `lesson.slug` trùng.
- **CTA 404** (RT-11): login CTA trỏ `/course/dang-nhap` (stub P1), KHÔNG trỏ `/course/learn/*`.
