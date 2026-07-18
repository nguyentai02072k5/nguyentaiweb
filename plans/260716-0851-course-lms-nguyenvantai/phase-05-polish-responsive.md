---
phase: 5
title: "Polish responsive"
status: pending
priority: P3
dependencies: [1, 2, 3, 4]
---

# Phase 5: Polish responsive

## Overview

Hoàn thiện trải nghiệm: animation Framer Motion (chuyển bài, drawer, progress), trạng thái loading/empty/error, a11y (keyboard, focus, reduced-motion), kiểm thử responsive thực tế Mobile + PC, tối ưu Core Web Vitals cơ bản.

## Requirements

- Functional: mọi trạng thái (loading video, chưa có khoá, lỗi mint URL, session hết hạn) có UI rõ ràng, không màn trắng.
- Non-functional: WCAG cơ bản (focus visible, contrast, aria cho player/drawer), `prefers-reduced-motion` tôn trọng, không layout shift lớn.

## Architecture

- **Animation**: `src/lib/motion` chỉ có `hero-variants.ts` + `timeline-variants.ts` (landing-specific) — KHÔNG có helper reduced-motion/drawer/progress dùng chung. Dùng `useReducedMotion` trực tiếp của framer-motion (đã có `framer-motion@12`) + thêm `src/lib/motion/course-variants.ts` MỚI cho: fade/slide đổi bài, drawer mobile (spring nhẹ), progress bar width. (RT-AD6)
- **Loading (RT2-15)**: repo CHƯA có `loading.tsx`/`Suspense` (grep = 0). Route `loading.tsx` chỉ phủ server-render (nhanh với dynamic gated page), KHÔNG phủ wait video. Mint đã server-side (RT2-13) → `<video src>` có sẵn HTML đầu → **KHÔNG cần `loading.tsx` classroom**; chỉ skeleton in-component khi *refresh*. `loading.tsx` cho catalog chỉ thêm nếu đo được delay; ghi rõ pattern MỚI, verify không đụng rewrite/SSG (P1 task 0).
- **States** (`<Toaster/>` đã mount ở `course/layout.tsx` từ P3 — RT-10; P5 chỉ gọi `toast()`):
  - Player: skeleton chỉ khi *refresh* URL (load đầu đã có `initialVideoUrl`); `toast.error` khi mint lỗi + nút thử lại.
  - Catalog/account: empty state ("Chưa có khoá"/"Bạn chưa học khoá nào" + CTA).
  - Session hết hạn giữa chừng: bắt 401 từ API → toast + điều hướng login giữ `next`.
- **A11y**: aria CẤU TRÚC (`aria-current` bài đang học, `aria-label` drawer/nút Hoàn thành/nav, focus-trap Sheet) ĐÃ build ở P3 (RT2-5) — P5 chỉ verify keyboard-flow tổng thể + bổ sung reduced-motion, KHÔNG retrofit aria sau memo. Video có `controls` + track chú thích nếu có.
- **Responsive QA**: test breakpoints 360/390/768/1024/1440. Mobile: video sticky không che nội dung; nút trong tầm ngón cái; PC: sidebar cuộn độc lập (`sticky`/`overflow-auto`) khi bài dài.
- **Perf**: `preload="metadata"` video; cover ảnh khoá dùng `next/image` sizes hợp lý; tránh re-render sidebar khi đổi bài (memo).

## Related Code Files

- Modify: `src/components/course/*` (thêm animation, states, a11y), `src/app/course/*` (loading.tsx/error.tsx nếu cần)
- Create: `src/app/course/loading.tsx`, `src/app/course/[khoa]/hoc/[bai]/loading.tsx`, `src/lib/motion/course-variants.ts`, empty-state components nếu chưa có
- Reference: `src/components/ui/skeleton.tsx` (có sẵn), `src/components/ui/sonner.tsx` + `sheet.tsx` (sheet tạo ở P3), framer-motion `useReducedMotion`. LƯU Ý: `src/lib/motion` hiện chỉ có variants landing — không phải nền tảng dùng lại cho course.

## Implementation Steps

1. Skeleton + loading.tsx cho catalog và player.
2. Error handling player (mint fail / session hết hạn) + toast retry.
3. Empty states catalog + `/course/tai-khoan`.
4. Animation chuyển bài + drawer + progress (reduced-motion guard).
5. Pass a11y: focus, aria, keyboard cho drawer/sidebar/nút.
6. QA responsive các breakpoint + sửa layout shift/overflow.
7. Perf nhẹ: memo sidebar, `next/image`, preload metadata.

## Success Criteria

- [ ] Không màn trắng ở mọi state (loading/empty/error đều có UI).
- [ ] Session hết hạn giữa chừng → toast + về login giữ `next`, không crash.
- [ ] Keyboard-only dùng được drawer + chuyển bài + đánh dấu hoàn thành; focus visible.
- [ ] `prefers-reduced-motion` tắt animation lớn.
- [ ] Responsive OK 360→1440 (không overflow ngang, video sticky mobile không che nút).
- [ ] Lighthouse mobile: không CLS lớn, LCP hợp lý (cover/video preload đúng).
- [ ] Lint + build xanh.

## Risk Assessment

- **Sticky video mobile che nội dung/nút**: test kỹ chiều cao; dùng `scroll-margin`/padding bù.
- **Focus trap drawer** xung đột player: đảm bảo đóng drawer trả focus về nút mở.
- **Over-animation** gây jank mobile yếu: giữ animation nhẹ, guard reduced-motion.
- **Skeleton lệch layout thật** → CLS: match kích thước khối video 16:9 cố định (`aspect-video`).
