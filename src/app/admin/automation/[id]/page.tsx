import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getFlow } from '@/lib/automation/flow-actions';
import { FlowBuilder } from '@/components/admin/automation/flow-builder';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Sửa flow · Admin',
  robots: { index: false, follow: false },
};

export default async function FlowBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flow = await getFlow(id);
  if (!flow) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
      <Link href="/admin/automation" className="text-sm text-blue-600">← Danh sách flow</Link>
      <h1 className="mt-1 mb-4 text-xl font-semibold">Thiết kế flow</h1>
      <FlowBuilder initialFlow={flow} />
    </main>
  );
}
