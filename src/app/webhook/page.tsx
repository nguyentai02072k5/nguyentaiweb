// Trang điều khiển cho subdomain webhook.nguyenvantai.com.
// Nhúng (iframe) bảng điều khiển của zalo-worker (chạy 24/7 trên Railway/Render).
// Worker mới là nơi thực thi zca-js — Vercel serverless không chạy được.

import type { Metadata } from 'next';
import { WebhookFrame } from './webhook-frame';

export const metadata: Metadata = {
  title: 'Zalo Webhook · Bảng điều khiển',
  robots: { index: false, follow: false },
};

const WORKER_URL = process.env.NEXT_PUBLIC_ZALO_WORKER_URL;

export default function WebhookPage() {
  if (!WORKER_URL) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1220',
          color: '#e6edf6',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 560, lineHeight: 1.6 }}>
          <h1 style={{ fontSize: 20 }}>⚙️ Chưa cấu hình Zalo Worker</h1>
          <p style={{ color: '#9fb0c9', fontSize: 14 }}>
            Trang này nhúng bảng điều khiển của <code>zalo-worker</code> (chạy zca-js 24/7).
            Hãy deploy worker trong thư mục <code>zalo-worker/</code> lên Railway/Render, rồi đặt biến
            môi trường trên Vercel:
          </p>
          <pre
            style={{
              background: '#131c2e',
              border: '1px solid #233048',
              borderRadius: 10,
              padding: 14,
              fontSize: 13,
              overflowX: 'auto',
            }}
          >
            NEXT_PUBLIC_ZALO_WORKER_URL=https://zalo-worker.up.railway.app
          </pre>
          <p style={{ color: '#6b7a93', fontSize: 13 }}>
            Xem hướng dẫn chi tiết tại <code>zalo-worker/README.md</code>.
          </p>
        </div>
      </main>
    );
  }

  return <WebhookFrame src={WORKER_URL} />;
}
