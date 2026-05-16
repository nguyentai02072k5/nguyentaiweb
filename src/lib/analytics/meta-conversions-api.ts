import 'server-only';

import { createHash } from 'node:crypto';
import { META_PIXEL_ID, type MetaStandardEvent } from '@/lib/analytics/meta-pixel';

const DEFAULT_GRAPH_API_VERSION = 'v24.0';

type UserData = {
  em?: string[];
  ph?: string[];
  fn?: string[];
  ln?: string[];
  external_id?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
};

type ConversionEvent = {
  event_name: MetaStandardEvent;
  event_time: number;
  event_id: string;
  action_source: 'website';
  event_source_url?: string;
  user_data: UserData;
  custom_data?: Record<string, string | number | boolean>;
};

type BookingConversionInput = {
  bookingId: string;
  email?: string;
  phone: string;
  fullName?: string;
  meetingStart: string;
  meetingEnd: string;
  headers: Headers;
  clientIp: string | null;
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(value?: string): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

function normalizePhoneForMeta(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  return digits.startsWith('0') ? `84${digits.slice(1)}` : digits;
}

function splitName(value?: string): { firstName?: string; lastName?: string } {
  const parts = value?.trim().toLowerCase().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function getCookie(headers: Headers, name: string): string | undefined {
  const cookie = headers.get('cookie');
  if (!cookie) return undefined;

  return cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function getEventSourceUrl(headers: Headers): string | undefined {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nguyenvantai.com';
  return headers.get('referer') ?? origin;
}

function buildUserData(input: BookingConversionInput): UserData {
  const email = normalizeEmail(input.email);
  const phone = normalizePhoneForMeta(input.phone);
  const { firstName, lastName } = splitName(input.fullName);

  return {
    ...(email ? { em: [sha256(email)] } : {}),
    ...(phone ? { ph: [sha256(phone)] } : {}),
    ...(firstName ? { fn: [sha256(firstName)] } : {}),
    ...(lastName ? { ln: [sha256(lastName)] } : {}),
    external_id: [sha256(input.bookingId)],
    ...(input.clientIp ? { client_ip_address: input.clientIp } : {}),
    ...(input.headers.get('user-agent')
      ? { client_user_agent: input.headers.get('user-agent') ?? undefined }
      : {}),
    ...(getCookie(input.headers, '_fbp') ? { fbp: getCookie(input.headers, '_fbp') } : {}),
    ...(getCookie(input.headers, '_fbc') ? { fbc: getCookie(input.headers, '_fbc') } : {}),
  };
}

function buildBookingEvents(input: BookingConversionInput): ConversionEvent[] {
  const eventTime = Math.floor(Date.now() / 1000);
  const eventSourceUrl = getEventSourceUrl(input.headers);
  const userData = buildUserData(input);
  const baseCustomData = {
    content_name: 'consultation_booking',
    content_category: 'booking',
    meeting_start: input.meetingStart,
    meeting_end: input.meetingEnd,
  };

  return [
    {
      event_name: 'Lead',
      event_time: eventTime,
      event_id: `${input.bookingId}:lead`,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      user_data: userData,
      custom_data: baseCustomData,
    },
    {
      event_name: 'Schedule',
      event_time: eventTime,
      event_id: `${input.bookingId}:schedule`,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      user_data: userData,
      custom_data: {
        ...baseCustomData,
        content_category: 'google_meet',
      },
    },
  ];
}

export async function sendMetaBookingConversion(input: BookingConversionInput): Promise<void> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[meta-capi] skipped: META_CAPI_ACCESS_TOKEN is not configured');
    }
    return;
  }

  const apiVersion = process.env.META_CAPI_API_VERSION ?? DEFAULT_GRAPH_API_VERSION;
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${META_PIXEL_ID}/events`);
  url.searchParams.set('access_token', accessToken);

  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
  const payload = {
    data: buildBookingEvents(input),
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`[meta-capi] HTTP ${res.status}`, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[meta-capi] dispatch failed', err);
  }
}
