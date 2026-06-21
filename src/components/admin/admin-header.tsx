import Link from 'next/link';
import { LogOut, Sparkles, CalendarClock, Users, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminLogoutAction } from '@/app/admin/login/actions';

export function AdminHeader() {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border-default/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        style={{
          background:
            'radial-gradient(600px 200px at 0% 0%, rgba(168,85,247,0.10), transparent 60%), radial-gradient(500px 180px at 100% 100%, rgba(99,102,241,0.10), transparent 60%)',
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-indigo via-brand-violet to-brand-pink text-white shadow">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-text-primary font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Dashboard Đặt Lịch
            </h1>
            <p className="text-text-secondary mt-0.5 text-sm">
              Tổng quan các booking demo trên nguyenvantai.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 rounded-lg border border-border-default bg-white/70 p-1">
            <Link
              href="/admin"
              className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-white"
            >
              <CalendarClock className="h-4 w-4" aria-hidden />
              Booking
            </Link>
            <Link
              href="/admin/leads"
              className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-white"
            >
              <Users className="h-4 w-4" aria-hidden />
              Leads
            </Link>
            <Link
              href="/admin/automation"
              className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-white"
            >
              <Workflow className="h-4 w-4" aria-hidden />
              Automation
            </Link>
          </nav>

          <form action={adminLogoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="rounded-lg border-border-default bg-white/80 hover:bg-white"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Đăng xuất
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
