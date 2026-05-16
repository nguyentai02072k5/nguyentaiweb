/**
 * /api/mcp — Model Context Protocol endpoint for booking automation.
 *
 * Exposes 3 tools that let an LLM chatbot browse availability and create
 * bookings on behalf of a user:
 *   - list_available_days(start_date?, count?)
 *   - list_slots_for_day(date)
 *   - create_booking(full_name, phone, meeting_start_iso, ...)
 *
 * Transport: Streamable HTTP (single endpoint, JSON-RPC 2.0).
 * Auth: `Authorization: Bearer <MCP_API_KEY>` header required on every request.
 *       Returns 401 when missing/invalid, 503 when MCP_API_KEY env not set.
 */

import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { timingSafeEqual } from 'node:crypto';
import { EXPECTATION_SLUGS } from '@/lib/booking/types';
import {
  listAvailableDays,
  listSlotsForDay,
  createBookingViaMcp,
} from '@/lib/mcp/booking-mcp-tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// MCP handler — registers the 3 booking tools
// ---------------------------------------------------------------------------

const mcpHandler = createMcpHandler(
  (server) => {
    server.tool(
      'list_available_days',
      'List the next N days (max 14) with the count of bookable 30-minute slots per day. Use this first to find which dates have availability.',
      {
        start_date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe('First day to list in YYYY-MM-DD (HCM local). Defaults to today.'),
        count: z
          .number()
          .int()
          .min(1)
          .max(14)
          .optional()
          .describe('Number of consecutive days to return. 1-14. Default 7.'),
      },
      async (args) => listAvailableDays(args),
    );

    server.tool(
      'list_slots_for_day',
      'List all 30-minute slots for one day, each marked available or not. Call after list_available_days to pick a concrete time. Returns ISO timestamps usable directly in create_booking.',
      {
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('Target day in YYYY-MM-DD (HCM local).'),
      },
      async (args) => listSlotsForDay(args),
    );

    server.tool(
      'create_booking',
      'Create a new consultation booking. Confirm details with the user before calling. The slot is re-checked server-side; returns slot-taken if someone else booked it first.',
      {
        full_name: z.string().min(2).max(100).describe('Customer full name.'),
        phone: z
          .string()
          .min(9)
          .max(20)
          .describe('VN phone number. Accepts +84, 84, or 0 prefix with spaces/dashes — server normalizes.'),
        meeting_start_iso: z
          .string()
          .datetime()
          .describe('Slot start time as ISO 8601 (use `iso` field from list_slots_for_day).'),
        email: z.string().email().optional().describe('Optional email address.'),
        expectations: z
          .array(z.enum(EXPECTATION_SLUGS))
          .optional()
          .describe('What the customer wants to discuss. Pick from the predefined slugs.'),
        expectation_other: z
          .string()
          .max(200)
          .optional()
          .describe('Free-form detail. Required only when `expectations` contains "other".'),
        source: z
          .string()
          .max(50)
          .optional()
          .describe('Optional source identifier (e.g. "telegram-bot"). Defaults to "mcp".'),
      },
      async (args) => createBookingViaMcp(args),
    );
  },
  {
    // Server metadata advertised during MCP initialize handshake
    serverInfo: {
      name: 'nguyenvantai-booking',
      version: '1.0.0',
    },
  },
  {
    // mcp-handler config — stateless mode keeps things simple on Vercel
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: false,
  },
);

// ---------------------------------------------------------------------------
// API key gate — wraps every method (GET/POST/DELETE)
// ---------------------------------------------------------------------------

function unauthorized(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ jsonrpc: '2.0', error: { code: -32001, message } }),
    { status, headers: { 'content-type': 'application/json' } },
  );
}

function checkApiKey(req: Request): Response | null {
  const expected = process.env.MCP_API_KEY;
  if (!expected || expected.length < 16) {
    return unauthorized('MCP not configured (MCP_API_KEY missing or too short)', 503);
  }
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return unauthorized('Missing Bearer token', 401);

  const provided = match[1].trim();
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return unauthorized('Invalid API key', 401);
  try {
    if (!timingSafeEqual(a, b)) return unauthorized('Invalid API key', 401);
  } catch {
    return unauthorized('Invalid API key', 401);
  }
  return null;
}

function withAuth(handler: (req: Request) => Promise<Response> | Response) {
  return async (req: Request): Promise<Response> => {
    const denied = checkApiKey(req);
    if (denied) return denied;
    return handler(req);
  };
}

export const GET = withAuth(mcpHandler);
export const POST = withAuth(mcpHandler);
export const DELETE = withAuth(mcpHandler);
