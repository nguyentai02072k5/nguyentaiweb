// Public Container ID. Env thắng khi có; fallback hardcode để production chạy
// không cần set env trên Vercel (GTM ID lộ trong HTML nên không phải secret).
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-5XRMF5RN';

export type DataLayerEvent = Record<string, unknown> & { event: string };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// Push 1 event vào dataLayer để GTM trigger bắt. An toàn khi SSR / GTM chưa load.
export function pushToDataLayer(payload: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}
