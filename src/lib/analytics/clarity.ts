// Microsoft Clarity project ID. Public (lộ trong HTML như mọi tag analytics) nên
// không phải secret, nhưng KHÔNG hardcode fallback vì mỗi project là 1 ID riêng —
// chưa set env -> component tự tắt, tránh gửi data vào nhầm project.
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? '';

// API runtime của Clarity (window.clarity). Khai báo các lệnh hay dùng.
type ClarityCommand = 'event' | 'set' | 'identify' | 'consent' | 'upgrade';

declare global {
  interface Window {
    clarity?: (command: ClarityCommand, ...args: unknown[]) => void;
  }
}

// Bắn 1 custom event (vd: 'cta_click', 'form_submit') -> lọc/segment session trong dashboard.
export function trackClarityEvent(name: string): void {
  if (typeof window === 'undefined' || !window.clarity) return;
  window.clarity('event', name);
}

// Gắn nhãn tuỳ biến cho session (vd: setClarityTag('plan', 'free')) -> filter recordings/heatmap.
export function setClarityTag(key: string, value: string | string[]): void {
  if (typeof window === 'undefined' || !window.clarity) return;
  window.clarity('set', key, value);
}
