---
phase: 4
title: "Progress and account"
status: pending
priority: P2
dependencies: [2, 3]
---

# Phase 4: Progress and account

## Overview

Bảng `lesson_progress` (RLS) + nút "Đánh dấu hoàn thành" trong player + hiển thị tiến độ ở sidebar + trang `/course/tai-khoan` (dashboard khoá đang học, %, nút "học tiếp"). Progress đọc/ghi qua client auth (RLS thực thi), KHÔNG dùng service-role.

## Requirements

- Functional: user đánh dấu bài xong → lưu bền; sidebar hiện checkmark + % khoá; `/course/tai-khoan` liệt kê mỗi khoá % hoàn thành + nút học tiếp (bài chưa xong đầu tiên).
- Non-functional: RLS đảm bảo user chỉ đọc/ghi row của mình; ghi idempotent (đánh dấu 2 lần không lỗi/không nhân đôi).

## Architecture

- **Migration** `supabase/migrations/0015_init_lesson_progress.sql` (RT-13: dir ĐÃ tồn tại với convention tuần tự `0001`–`0014` + CLI-linked `supabase/.temp/linked-project.json`; KHÔNG dùng timestamp, KHÔNG "tạo mới nếu chưa có"):
  ```sql
  create table lesson_progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    course_slug text not null,
    lesson_slug text not null,
    completed_at timestamptz not null default now(),
    primary key (user_id, course_slug, lesson_slug)
  );
  alter table lesson_progress enable row level security;
  create policy "own read"  on lesson_progress for select using (auth.uid() = user_id);
  create policy "own write" on lesson_progress for insert with check (auth.uid() = user_id);
  create policy "own delete" on lesson_progress for delete using (auth.uid() = user_id);
  ```
  **RLS + idempotent (RT2-6)**: `INSERT ... ON CONFLICT DO UPDATE` cần CẢ policy INSERT lẫn UPDATE — nếu thiếu UPDATE, upsert va PK sẽ bị RLS chặn → phá đúng tính idempotent. Vì cột non-PK duy nhất là `completed_at`, **KHÔNG cần DO UPDATE**: mark = `upsert(..., { onConflict:'user_id,course_slug,lesson_slug', ignoreDuplicates: true })` (DO NOTHING) → không cần UPDATE policy; unmark = `delete`. (Nếu về sau cần DO UPDATE thì PHẢI thêm `create policy "own update" ... for update using(...) with check(...)`.)
- **Data layer** `src/lib/course/progress.ts` (`import 'server-only'`; dùng `ssr-client` anon+session, KHÔNG `supabaseAdmin` — RT-13):
  - `getCourseProgress(courseSlug)` → Set<lessonSlug> đã xong.
  - `getAllProgress()` → map courseSlug → Set<lessonSlug> (KHÔNG chỉ count — cần slug để intersect, RT-15).
  - Toggle qua Server Action `toggleLessonComplete(courseSlug, lessonSlug)`: mark = `upsert(..., { ignoreDuplicates: true })` (DO NOTHING, không cần UPDATE policy — RT2-6), unmark = `delete`; **return `{ ok: boolean }`** để client rollback optimistic khi `!ok` (RLS từ chối/lỗi ném → button `try/catch` hoặc đọc `ok`). (RT-15)
- **% & orphan (RT-15)**: `done = progressSlugs ∩ mdxLessonSlugs` (giao với slug MDX hiện tại) — chống row mồ côi khi đổi/xoá slug làm `% > 100` hoặc "học tiếp" trỏ bài không tồn tại. `total` từ MDX.
- **UI**:
  - Nút "Đánh dấu hoàn thành" (`lesson-complete-button.tsx`, Client) gọi Server Action, optimistic update.
  - `course-sidebar.tsx` (phase 3) nối data: checkmark bài xong + progress bar % = done/total.
  - `/course/tai-khoan/page.tsx` (`force-dynamic`, gated qua `getCurrentUser`) + `account-course-card.tsx`: %, nút "Học tiếp" → bài chưa xong đầu tiên (theo `done ∩ mdx`; fallback bài 1 nếu xong hết).
- **% tính**: total lessons từ MDX (`course-queries`), done = giao progress ∩ MDX → không lưu total ở DB, không bị orphan.

## Related Code Files

- Create: `supabase/migrations/0015_init_lesson_progress.sql`, `src/lib/course/progress.ts`, `src/components/course/lesson-complete-button.tsx`, `src/app/course/tai-khoan/page.tsx`, `src/components/course/account-course-card.tsx`
- Modify: `src/components/course/course-sidebar.tsx` (nối progress), `src/app/course/[khoa]/hoc/[bai]/page.tsx` (truyền progress + nút), header course (link "Khoá của tôi")
- Reference: `src/lib/supabase/ssr-client.ts`, `src/lib/content/course-queries.ts`

## Implementation Steps

1. Viết migration `lesson_progress` + RLS; apply lên Supabase (dashboard SQL hoặc CLI).
2. `progress.ts` (get/getAll) + Server Action `toggleLessonComplete` (upsert/delete idempotent).
3. `lesson-complete-button` optimistic + ráp vào player page.
4. Nối progress vào `course-sidebar` (checkmark + % bar).
5. `/course/tai-khoan` + `account-course-card` (% + học tiếp).
6. Thêm link "Khoá của tôi" vào topbar khu học / header.
7. Verify RLS: user A không đọc được progress user B (test 2 tài khoản).

## Success Criteria

- [ ] Đánh dấu hoàn thành lưu bền qua reload; bỏ đánh dấu xoá đúng row; action lỗi → optimistic rollback (đọc `{ok}`). (RT-15)
- [ ] Sidebar hiện checkmark + % đúng; đổi/xoá slug bài không làm `% > 100` (done ∩ MDX). (RT-15)
- [ ] `/course/tai-khoan` liệt kê khoá + % + "học tiếp" trỏ bài chưa xong đầu tiên (còn tồn tại trong MDX).
- [ ] RLS chặn chéo: query của user A không trả row user B (verify thực tế 2 account).
- [ ] `progress.ts` có `import 'server-only'`; không có đường ghi progress qua `supabaseAdmin` (grep xác nhận). (RT-13)
- [ ] Migration đặt `0015_init_lesson_progress.sql` theo convention sẵn có. (RT-13)
- [ ] Đánh dấu 2 lần (idempotent) KHÔNG lỗi RLS — dùng `ignoreDuplicates`, không cần UPDATE policy. (RT2-6)
- [ ] Lint + build xanh.

## Risk Assessment

- **Dùng nhầm service-role** → mất tác dụng RLS. Mitigation: `progress.ts` chỉ import `ssr-client`; review + grep.
- **Optimistic lệch server (RT-15)**: action fail (RLS từ chối) mà UI vẫn tick. Mitigation: contract `{ ok }` rõ ràng + rollback khi `!ok`/throw.
- **Progress mồ côi (RT-15)**: đổi/xoá slug bài → row cũ đẩy `% > 100` / "học tiếp" trỏ bài chết. Mitigation: luôn `done ∩ mdxLessonSlugs`.
- **N+1 khi tính % nhiều khoá** ở `/course/tai-khoan`: 1 query `getAllProgress()` gộp rồi map local, không query/khoá.
- **Migration drift (RT-13)**: dir đã tồn tại (`0001`–`0014`) — đặt `0015_`, KHÔNG timestamp, KHÔNG tạo mới dir.
