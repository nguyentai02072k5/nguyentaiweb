import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-base min-h-[100dvh]">
      {/* NavBar global đã có sẵn ở root layout — không cần thêm */}
      {children}
    </div>
  );
}
