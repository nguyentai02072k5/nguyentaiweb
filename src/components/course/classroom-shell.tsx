'use client';

/**
 * classroom-shell.tsx — Bố cục "lớp học" (RT2-1 chrome-free).
 *
 * PC (lg): grid 2 cột — sidebar sticky 320px | player + tabs + nav.
 * Mobile: video sticky top; sidebar → drawer (Sheet, cạnh trái). ☰ ở topbar mở.
 *
 * Client component vì quản lý state drawer. Nội dung MDX bài render SERVER-SIDE
 * ở page.tsx rồi truyền qua `children` (tab "Nội dung") — không đẩy MDX vào bundle.
 *
 * Điều hướng bài = route mới → shell remount (drawer tự đóng, state reset).
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseSidebar } from './course-sidebar';
import { ClassroomTopbar } from './classroom-topbar';
import { LessonPlayer } from './lesson-player';
import { LessonNav } from './lesson-nav';
import type { Course, FlatLesson } from '@/lib/content/course-lesson-queries';

type SidebarCourse = Pick<Course, 'title' | 'slug' | 'modules' | 'lessonCount'>;

interface ClassroomShellProps {
  course: SidebarCourse;
  lesson: FlatLesson;
  adjacent: { prev: FlatLesson | null; next: FlatLesson | null };
  initialVideoUrl: string | null;
  userEmail: string | null;
  /** Nội dung MDX bài (render server-side ở page.tsx). */
  children: React.ReactNode;
}

// Style override token teal cho ui primitive (Sheet/Tabs render inline trong .course-app).
const TAB_TRIGGER_CLASS =
  'text-[var(--muted)] data-[state=active]:bg-[var(--surface-3)] data-[state=active]:text-[var(--primary)]';

export function ClassroomShell({
  course,
  lesson,
  adjacent,
  initialVideoUrl,
  userEmail,
  children,
}: ClassroomShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100dvh' }}>
      <ClassroomTopbar
        courseTitle={course.title}
        userEmail={userEmail}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {/* Drawer mobile (< lg) */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          aria-describedby={undefined}
          className="lg:hidden bg-[var(--surface)] text-[var(--ink)] border-[var(--border)]"
          style={{ overflowY: 'auto' }}
        >
          <SheetTitle style={{ color: 'var(--ink)', marginBottom: 6 }}>
            Nội dung khoá
          </SheetTitle>
          <CourseSidebar
            course={course}
            currentLessonSlug={lesson.slug}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div
        className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-8"
        style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 16px 60px' }}
      >
        {/* Sidebar desktop */}
        <aside
          className="hidden lg:block"
          style={{ position: 'sticky', top: 76, alignSelf: 'start', maxHeight: 'calc(100dvh - 96px)', overflowY: 'auto' }}
        >
          <CourseSidebar course={course} currentLessonSlug={lesson.slug} />
        </aside>

        {/* Cột chính */}
        <section style={{ minWidth: 0 }}>
          {/* Player — sticky top trên mobile để cuộn nội dung vẫn thấy video */}
          <div
            className="course-player-sticky"
            style={{ position: 'relative' }}
          >
            <LessonPlayer
              key={lesson.slug}
              initialVideoUrl={initialVideoUrl}
              courseSlug={course.slug}
              lessonSlug={lesson.slug}
              title={lesson.title}
            />
          </div>

          {/* Nhãn module + tiêu đề bài */}
          <div style={{ marginTop: 16 }}>
            <span className="c-eyebrow">{lesson.moduleTitle}</span>
            <h1 style={{ fontSize: 'var(--fs-h2)', fontWeight: 800, marginTop: 6, lineHeight: 1.15 }}>
              {lesson.title}
            </h1>
          </div>

          {/* Tabs Nội dung / Tài liệu / Ghi chú (RT2-2, Radix a11y) */}
          <Tabs defaultValue="content" style={{ marginTop: 18 }}>
            <TabsList className="bg-[var(--surface-2)] border border-[var(--border)]">
              <TabsTrigger value="content" className={TAB_TRIGGER_CLASS}>
                Nội dung
              </TabsTrigger>
              <TabsTrigger value="resources" className={TAB_TRIGGER_CLASS}>
                Tài liệu
              </TabsTrigger>
              <TabsTrigger value="notes" className={TAB_TRIGGER_CLASS}>
                Ghi chú
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <div className="c-prose" style={{ maxWidth: 'none' }}>
                {children}
              </div>
            </TabsContent>
            <TabsContent value="resources">
              <p style={{ color: 'var(--muted)', fontSize: 'var(--fs-body)' }}>
                Tài liệu bài học sẽ được cập nhật.
              </p>
            </TabsContent>
            <TabsContent value="notes">
              <p style={{ color: 'var(--muted)', fontSize: 'var(--fs-body)' }}>
                Tính năng ghi chú cá nhân sẽ sớm có mặt.
              </p>
            </TabsContent>
          </Tabs>

          <LessonNav prev={adjacent.prev} next={adjacent.next} />
        </section>
      </div>

      {/* Player sticky chỉ trên mobile (< lg) */}
      <style>{`
        @media (max-width: 1023px) {
          .course-player-sticky {
            position: sticky !important;
            top: 60px;
            z-index: 30;
            margin: 0 -16px;
          }
          .course-player-sticky video,
          .course-player-sticky > div {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
