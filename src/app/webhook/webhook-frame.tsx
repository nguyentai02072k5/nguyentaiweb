'use client';

// Nhúng bảng điều khiển zalo-worker + xử lý cold-start của Render Free.
// Khi worker đang "ngủ", iframe mất ~30-50s để load → hiện overlay "đang đánh thức"
// cho tới khi iframe onLoad.

import { useState } from 'react';

export function WebhookFrame({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#0b1220' }}>
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            color: '#e6edf6',
            fontFamily: 'system-ui, sans-serif',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid #233048',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'wh-spin 0.9s linear infinite',
            }}
          />
          <div style={{ fontSize: 14 }}>Đang đánh thức worker…</div>
          <div style={{ fontSize: 12, color: '#6b7a93', maxWidth: 320, textAlign: 'center' }}>
            Render Free ngủ khi không dùng — lần đầu chờ ~30–50s. Sau đó tải bình thường.
          </div>
          <style>{`@keyframes wh-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <iframe
        src={src}
        title="Zalo Worker Control Panel"
        onLoad={() => setLoaded(true)}
        style={{
          border: 0,
          width: '100%',
          height: '100vh',
          display: 'block',
          position: 'relative',
          zIndex: 2,
          background: 'transparent',
        }}
      />
    </div>
  );
}
