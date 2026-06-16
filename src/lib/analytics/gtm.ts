export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? '';

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
