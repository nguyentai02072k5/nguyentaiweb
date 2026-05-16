import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Admin · Đăng nhập',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const SAFE_NEXT_PATH = /^\/admin(?:\/.*)?$/;

type SearchParams = { next?: string };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { next: rawNext } = await searchParams;
  const next = rawNext && SAFE_NEXT_PATH.test(rawNext) ? rawNext : '/admin';

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-10">
      {/* Aurora background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 600px at 15% 10%, rgba(168,85,247,0.22), transparent 60%), radial-gradient(700px 500px at 85% 80%, rgba(99,102,241,0.18), transparent 65%), radial-gradient(600px 400px at 50% 100%, rgba(236,72,153,0.16), transparent 70%)',
        }}
      />

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border-default/70 bg-white/85 p-8 shadow-[0_24px_60px_rgba(99,102,241,0.12)] backdrop-blur-xl sm:p-10">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink text-white shadow-md">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-text-primary text-2xl font-semibold tracking-tight">
                Admin dashboard
              </h1>
              <p className="text-text-secondary mt-1 text-sm">
                admin.nguyenvantai.com — Quản lý lịch demo
              </p>
            </div>
          </div>

          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
