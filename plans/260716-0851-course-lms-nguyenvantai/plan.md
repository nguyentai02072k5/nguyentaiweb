---
title: "Course LMS - course.nguyenvantai.com"
description: "Khu học tập (LMS) trên subdomain course.nguyenvantai.com: khoá + bài trong Velite MDX, tài khoản + tiến độ trong Supabase, video R2 signed URL, responsive Mobile + PC."
status: pending
priority: P2
branch: "feat/template-library-blog"
tags: [lms, course, supabase-auth, r2, velite, subdomain]
blockedBy: []
blocks: []
created: "2026-07-16T02:19:13.789Z"
createdBy: "ck:plan"
source: skill
---

# Course LMS - course.nguyenvantai.com

## Overview

Xây khu học tập miễn phí (đăng ký = xem hết) trên subdomain `course.nguyenvantai.com`. Kiến trúc hybrid tĩnh/động: cấu trúc khoá + bài viết bằng **Velite MDX** (git, SEO), tài khoản + tiến độ trong **Supabase** (Auth + 1 bảng `lesson_progress` có RLS), video trong **Cloudflare R2** phát qua **signed URL** ngắn hạn (gate sau login = lead magnet, chặn hotlink). UI layout "lớp học": PC 2 cột (sidebar + player), Mobile video sticky + drawer danh sách bài.

Thiết kế nguồn (đã duyệt): `plans/reports/brainstorm-course-lms-260716-0851-course-nguyenvantai-design-report.md`.

## Ràng buộc kiến trúc (bất biến — mọi phase phải giữ)

- **Proxy `course.*` làm ĐÚNG 3 việc RẺ, KHÔNG gate, KHÔNG round-trip authz**: (1) rewrite `course.*` → `/course/*`; (2) **refresh cookie** bằng `getSession()`/`getClaims()` (chỉ exchange refresh-token, KHÔNG `getUser()`) + forward cookie đã xoay — RSC không ghi được cookie nên đây là điểm refresh; (3) inject `x-pathname`. **BỎ QUA `/api` hoàn toàn** (return `NextResponse.next()` trước khi tạo client cho `/api/course/*`). TUYỆT ĐỐI KHÔNG redirect-gate ở proxy, KHÔNG đụng admin HMAC.
  > RT2-10: `getUser()` là HTTP call `/auth/v1/user` (revalidate) — chạy mỗi navigation/prefetch trên `course.*` = +150–400ms TTFB, thay HMAC local ~0ms. Proxy chỉ refresh (getSession), authz revalidate để 1 lần ở gate.
- **`getCurrentUser()` (chỉ ở gate/RSC/action) BẮT BUỘC `await supabase.auth.getUser()`** (revalidate JWT), CẤM `getSession()` cho authz. Đây là nơi DUY NHẤT gọi `getUser()`. (RT-1)
- **Course layout CHIA 2 tầng chrome (RT2-1)**: root `layout.tsx` thêm nhánh `isCourse = host.startsWith('course.')`. Route classroom (`hoc/*`) render **chrome-free** (không NavBar/SiteFooter/Chatwoot/ScrollToTop marketing) + topbar khu học riêng; catalog/detail public có thể GIỮ chrome marketing cho SEO/nav. Chốt theme regime (course dùng ThemeProvider nào) trước khi P1 ship.
- **Mọi truy cập Supabase qua HTTP client** (`@supabase/supabase-js`/`@supabase/ssr`, PostgREST) — KHÔNG mở raw Postgres. Nếu về sau thêm direct `pg`/`postgres`, BẮT BUỘC dùng Supabase pooler (PgBouncer/Supavisor, port 6543). Đây là lý do cảnh báo pooling của DRM hiện moot — ghi rõ để không ai regress. (RT2-pooling)
- **Tách 2 Supabase client**: `supabaseAdmin` (service-role, bypass RLS) chỉ cho admin/booking hiện có — TUYỆT ĐỐI không dùng cho `lesson_progress`. Progress đọc/ghi qua **client auth (anon key + session cookie)** để RLS thực thi "user chỉ thao tác row của mình".
- **Content build-time**: khoá/bài trong MDX, thêm/sửa = commit + `velite && next build`. `velite.config.ts` phải fail-hard nếu mdx sai schema (theo pattern `prepare()` đếm file hiện có).
- **Free = không có bảng enrollment**: đăng nhập ⇒ xem mọi khoá. Chỉ cần Auth + progress.
- **Bảo vệ video mức cơ bản**: signed URL TTL đủ phủ 1 bài (~4h, RT-7 — 5' quá ngắn phá seek), bucket R2 private, CORS chỉ allow origin `course.nguyenvantai.com`, mint API có `requireCourseUser()` + rate-limit. KHÔNG heartbeat / device-limit.
- Reuse pattern có sẵn: `@/lib/content/queries`, `MDXContent` (`@/lib/content/mdx-runtime`), `JsonLdScript`, shadcn/ui, Framer Motion, design tokens (`text-brand-*`, `font-display`).

## Phases

> **PIVOT 2026-07-17** (chốt qua design session): `/course` = **landing thư viện đa khoá công khai** (SEO) → login → vault `/course/learn/[video]` (P3). BỎ catalog grid + trang chi tiết công khai từng khoá. **Theme dark Teal scoped** (không đụng violet main site), chrome-free, font Sora + Plus Jakarta Sans. Mock đã duyệt: `assets/course/landing-teal-mock.html`, `assets/course/classroom-teal-mock.html`. Theme regime (RT2-1) → CHỐT: course standalone dark-teal như `landing.*`.

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Public course library landing](./phase-01-public-course-pages.md) | Done |
| 2 | [Supabase Auth](./phase-02-supabase-auth.md) | Done · magic-link login verified e2e (local) · Edge spike pending prod |
| 3 | [R2 gated player](./phase-03-r2-gated-player.md) | Pending |
| 4 | [Progress and account](./phase-04-progress-and-account.md) | Pending |
| 5 | [Polish responsive](./phase-05-polish-responsive.md) | Pending |

## Dependencies

- Phase 1 ship riêng được cho SEO/catalog, NHƯNG CTA "Học miễn phí" phải trỏ `/course/dang-nhap` (route `hoc/*` chỉ có ở P3) — nếu trỏ thẳng bài sẽ 404. (RT-11)
- Phase 2 (Auth) chặn Phase 3 (player cần session để gate + mint URL) và Phase 4 (progress cần user).
- Phase 3 chặn Phase 4 (đánh dấu hoàn thành gắn với player).
- Phase 5 phụ thuộc 1–4 (polish trên UI đã có).
- Thứ tự: 1 → 2 → 3 → 4 → 5.

## Acceptance (toàn plan)

1. Khách xem catalog + curriculum công khai (SEO/JSON-LD ok).
2. Đăng ký free bằng magic-link email (Supabase Auth); Google OAuth hoãn v1.1.
3. Chỉ khi login mới phát được video (R2 signed URL, hotlink hết hạn nhanh).
4. "Đánh dấu hoàn thành" lưu bền vào Supabase qua RLS; hiện lại đúng ở sidebar + `/course/tai-khoan`.
5. Mượt Mobile & PC (video sticky mobile, 2 cột PC, drawer danh sách bài).

## Câu hỏi còn treo

- DNS `course.nguyenvantai.com` đã trỏ Vercel chưa? (cần trước khi test P1 trên prod — không chặn code local `course.localhost`).
- ~~R2 bucket + credentials~~ → **Đã có bucket + key** (Validation S1). Chỉ cần cấu hình CORS + env.
- ~~Nội dung thật hay mẫu~~ → **Dựng 1 khoá mẫu placeholder** (Validation S1). Video test thật trên R2.
- ~~Supabase Auth provider~~ → **v1 chỉ magic-link** (Validation S1). Google hoãn v1.1.

## Validation Log

### Session 1 — 2026-07-16
**Câu hỏi:** 4 (đã trả lời) · Mode: prompt · Verification pass: SKIP (đã có Red Team evidence).

| # | Quyết định | Ảnh hưởng |
|---|-----------|-----------|
| V1 | Content model per-lesson = **1 body MDX chung + anchor theo `lesson.slug`** | Khớp mặc định P1 (RT-4) — không đổi |
| V2 | **Dựng 1 khoá mẫu placeholder** trước (video test trên R2) | Khớp P1 — không chặn tiến độ |
| V3 | **R2 đã có bucket + key** | P3 unblocked; bỏ hedge "tạo mới" |
| V4 | **v1 chỉ magic-link**, Google OAuth hoãn v1.1 | P2 thu hẹp: ẩn nút Google (code path để sẵn), bỏ Google khỏi nghiệm thu v1 |

Propagate: P2 (overview, functional, login page, dashboard config, steps 4/7, success criteria) → magic-link only. plan.md acceptance #2 cập nhật.

### Whole-Plan Consistency Sweep (Validation)
Re-read toàn plan sau propagate: mọi mention "Google" ở P2 đã gắn nhãn "v1.1/ẩn"; acceptance plan.md đồng bộ; content model + R2 + placeholder khớp phase files. **0 mâu thuẫn chưa giải quyết. Sẵn sàng /ck:cook.**

## Red Team Review

### Session — 2026-07-16
**Findings:** 15 (15 accepted, 0 rejected) — gộp từ 21 finding của 3 reviewer sau dedup + evidence filter.
**Severity breakdown:** 4 Critical, 8 High, 3 Medium. Tất cả có evidence `file:line`.

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| RT-1 | `getCurrentUser()` phải `auth.getUser()`, cấm `getSession()` | Critical | Accept | plan invariant, Phase 2 |
| RT-2 | `@supabase/ssr` refresh cookie không chạy từ RSC → proxy `course.*` phải refresh | Critical | Accept | plan invariant, Phase 2/3 |
| RT-3 | RSC layout không đọc `pathname` → proxy inject `x-pathname` | Critical | Accept | plan invariant, Phase 2/3 |
| RT-4 | Bài học thiếu field MDX content → chốt content model | Critical | Accept | Phase 1 |
| RT-5 | Route `hoc/*` phải `force-dynamic`, không SSG | High | Accept | Phase 3 |
| RT-6 | Mint API là trust boundary thật → `requireCourseUser()` + rate-limit + residual | High | Accept | Phase 3 |
| RT-7 | TTL 5' quá ngắn → nâng TTL + khôi phục `currentTime` | High | Accept | Phase 3 |
| RT-8 | Velite fail-hard không bắt `videoKey` lồng → `s.string().min(1)`; sửa Risk text | High | Accept | Phase 1 |
| RT-9 | shadcn `Sheet` chưa tồn tại → phải tạo | High | Accept | Phase 3 |
| RT-10 | `<Toaster/>` chưa mount → mount ở course layout | High | Accept | Phase 3 |
| RT-11 | CTA P1 trỏ route gated → 404; sửa target + claim ship-riêng | High | Accept | Phase 1, Dependencies |
| RT-12 | Open-redirect `next` prefix yếu → thuật toán loại `//` + `\` | High | Accept | Phase 2 |
| RT-13 | Thiếu `server-only`; anon key đã tồn tại; migration `0015_` | Medium | Accept | Phase 2/4 |
| RT-14 | `exchangeCodeForSession` chưa có nhánh lỗi | Medium | Accept | Phase 2 |
| RT-15 | Optimistic rollback contract + progress mồ côi `%>100` | Medium | Accept | Phase 4 |

Thêm: verify tương tác rewrite `course.*` + `dynamicParams=false` (SSG) trên stack này chưa có tiền lệ → thêm bước kiểm chứng ở Phase 1.

### Session 2 — 2026-07-16 (UI/UX + security-posture + stability/loading/bundle/deploy)
**Findings:** 15 (15 accepted) — gộp từ 22 finding NEW của 3 reviewer (không trùng RT-1..15).
**Severity:** 2 Critical, 8 High, 5 Medium. Tất cả có evidence `file:line`.

| # | Finding | Sev | Applied To |
|---|---------|-----|-----------|
| RT2-1 | Chrome marketing tràn vào classroom → root layout thêm nhánh `isCourse` | Critical | plan invariant, Phase 1/3 |
| RT2-10 | Proxy `getUser()` mỗi request = round-trip → dùng `getSession()`, skip `/api` | Critical | plan invariant, Phase 2 |
| RT2-2 | `Tabs` primitive chưa tồn tại | High | Phase 3 |
| RT2-3 | `Sheet` là edge-drawer, không phải Dialog-giữa | High | Phase 3 |
| RT2-4 | Thiếu design-token contract cho component course | High | Phase 1/3 |
| RT2-6 | `upsert` fail RLS — thiếu UPDATE policy / dùng `ignoreDuplicates` | High | Phase 4 |
| RT2-7 | Cookie session chưa spec `httpOnly/secure/sameSite` | High | Phase 2 |
| RT2-11 | `@supabase/ssr` Edge-runtime compat chưa verify | High | Phase 2 |
| RT2-12 | Rewrite+SSG không tiền lệ → prototype task ĐẦU P1 | High | Phase 1 |
| RT2-5 | aria cấu trúc (`aria-current`) đưa về P3, không để P5 | Medium | Phase 3/5 |
| RT2-8 | Rate-limit in-memory per-instance rỗng trên Vercel → residual trung thực/shared store | Medium | Phase 3 |
| RT2-9 | `signInWithOtp` chưa throttle + chưa chốt `shouldCreateUser` | Medium | Phase 2 |
| RT2-13 | Mint URL client on-mount = waterfall → mint server-side RSC | Medium | Phase 3 |
| RT2-14 | `next.config.ts` thiếu R2 `remotePatterns` cover + `serverExternalPackages` aws-sdk | Medium | Phase 1/3 |
| RT2-15 | Velite walk → check `lesson.slug` trùng; `loading.tsx` không phủ video-wait | Medium | Phase 1/3/5 |

+ Invariant pooling: mọi Supabase qua HTTP client; direct pg (nếu có) phải pooler 6543.

**Consistency Sweep (Pass 2):** re-read toàn plan sau propagate. Đồng bộ: proxy `getUser()→getSession()` (invariant + P2), mint `client-mount→server-side RSC` (P3 player + success), rate-limit residual trung thực (P3), aria cấu trúc dời P3 (P3+P5), migration upsert `ignoreDuplicates` (P4), design-contract + chrome-free lan P1↔P3. Không phát hiện mâu thuẫn tồn dư. **0 unresolved. Sẵn sàng /ck:cook.**

### Whole-Plan Consistency Sweep
Sau khi áp 15 finding (Pass 1), re-read toàn bộ `plan.md` + 5 phase. Decision delta đã lan đúng:
- TTL signed URL `5 phút → ~4h`: đồng bộ ở invariant (plan.md), phase-03 (Non-functional, Architecture, Success, Risk). ✔
- Migration `<ts>_ → 0015_init_lesson_progress.sql`: đồng bộ Architecture + Related Code Files. ✔
- `getAllProgress` trả `count → Set<lessonSlug>` (để intersect). ✔
- Proxy invariant "không auth" → "refresh cookie + inject `x-pathname`, KHÔNG gate". ✔
- Toaster mount ở P3 (`course/layout.tsx`); P5 chỉ gọi `toast()`. ✔
- `src/lib/motion` hạ cấp từ "reuse" → "chỉ có variants landing, thêm `course-variants.ts`". ✔

**Kết quả: 0 mâu thuẫn chưa giải quyết. Plan sẵn sàng implement.**
