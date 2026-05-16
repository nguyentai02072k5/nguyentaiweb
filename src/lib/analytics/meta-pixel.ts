export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '1658487875083016';

export type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Contact'
  | 'Lead'
  | 'Schedule';

export type MetaEventParams = Record<string, string | number | boolean | null | undefined>;
export type MetaEventOptions = {
  eventID?: string;
};

declare global {
  interface Window {
    fbq?: (
      command: 'init' | 'track' | 'trackCustom',
      eventNameOrPixelId: string,
      params?: MetaEventParams,
      options?: MetaEventOptions,
    ) => void;
    _fbq?: Window['fbq'];
  }
}

function cleanParams(params?: MetaEventParams): MetaEventParams | undefined {
  if (!params) return undefined;

  const entries = Object.entries(params).filter(([, value]) => value !== undefined);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function trackMetaStandardEvent(
  eventName: MetaStandardEvent,
  params?: MetaEventParams,
  options?: MetaEventOptions,
): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', eventName, cleanParams(params), options);
}

export function trackMetaCustomEvent(
  eventName: string,
  params?: MetaEventParams,
  options?: MetaEventOptions,
): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('trackCustom', eventName, cleanParams(params), options);
}
