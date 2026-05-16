# MCP Booking Server

Endpoint at `https://nguyenvantai.com/api/mcp` lets MCP-compatible chatbots browse the booking calendar and create consultations on behalf of a user.

## Auth

All requests require a bearer token. Set `MCP_API_KEY` (32+ chars random) on Vercel and share the same value with the chatbot client config.

```
Authorization: Bearer <MCP_API_KEY>
```

Response codes:
- `503` — server has no `MCP_API_KEY` set (or shorter than 16 chars).
- `401` — missing / wrong token.

## Tools

### `list_available_days`

Returns the next N (1–14, default 7) HCM-local dates with the count of bookable 30-min slots per day.

Input:
- `start_date?: string` — `YYYY-MM-DD`, defaults to today HCM.
- `count?: number` — 1–14, default 7.

Output (JSON inside the text content):
```json
{
  "days": [
    { "date": "2026-05-17", "label": "T7 17/05", "day_of_week": 6, "available_count": 12, "is_today": false }
  ],
  "total_available": 84,
  "timezone": "Asia/Ho_Chi_Minh"
}
```

### `list_slots_for_day`

Returns all 30-min slots for one day with `available` flag + reason when not.

Input:
- `date: string` — `YYYY-MM-DD`.

Output:
```json
{
  "date": "2026-05-17",
  "timezone": "Asia/Ho_Chi_Minh",
  "slot_duration_minutes": 30,
  "slots": [
    { "iso": "2026-05-17T02:00:00.000Z", "time": "09:00", "period": "morning", "available": true },
    { "iso": "2026-05-17T02:30:00.000Z", "time": "09:30", "period": "morning", "available": false, "reason": "blocked-by-booking" }
  ]
}
```

Take the `iso` field directly into `create_booking`.

### `create_booking`

Creates a booking. Slot is re-checked atomically — returns `slot-taken` if another booking won the race.

Input:
- `full_name: string` (2–100)
- `phone: string` (VN; accepts `+84`, `84`, `0` prefix; server normalizes)
- `meeting_start_iso: string` (ISO 8601 from `list_slots_for_day`)
- `email?: string`
- `expectations?: string[]` (slugs from `src/lib/booking/types.ts:EXPECTATION_SLUGS`)
- `expectation_other?: string` (required iff `expectations` contains `"other"`)
- `source?: string` — defaults to `"mcp"`. Override per chatbot (e.g. `"telegram-bot"`).

Success output:
```json
{
  "success": true,
  "booking_id": "uuid",
  "meeting_start": "2026-05-17T02:00:00.000Z",
  "meeting_end": "2026-05-17T02:30:00.000Z",
  "meeting_start_label_vi": "09:00 ngày 17/5/2026",
  "meeting_end_label_vi": "09:30 ngày 17/5/2026",
  "phone_mask": "0901 xxx 4567"
}
```

Errors are returned as `isError: true` with `{error, message}` payload. Codes: `validation`, `slot-taken`, `server`, `config-load`, `bookings-load`, `blocks-load`.

## Client config examples

### Claude Desktop / `claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nguyenvantai-booking": {
      "transport": {
        "type": "http",
        "url": "https://nguyenvantai.com/api/mcp",
        "headers": { "Authorization": "Bearer YOUR_MCP_API_KEY" }
      }
    }
  }
}
```

### Cursor / Cline / generic MCP client

Most clients accept the same shape — `type: "streamable-http"` or `type: "http"` depending on version, plus the `Authorization` header.

## Differences vs `/api/book`

| Aspect | `/api/book` (browser) | `/api/mcp` (chatbot) |
|---|---|---|
| Auth | none (public form) | Bearer token |
| IP hash | yes | skipped (no real client IP) |
| Meta CAPI | yes | skipped (no browser context) |
| Webhook | yes | yes |
| Source label | `landing-page` | `mcp` (override via `source` arg) |
| Validation | Zod schema | inline + same `EXPECTATION_SLUGS` enum |
| Slot re-check | yes | yes (same engine) |

## Implementation notes

- File: `src/app/api/mcp/route.ts` — registers tools via `mcp-handler`, wraps GET/POST/DELETE with API-key gate.
- Tool logic: `src/lib/mcp/booking-mcp-tools.ts` — transport-free handlers.
- Shared fetch: `src/lib/booking/availability-fetch.ts` — single Supabase query, reused window helpers.
- Stateless: no MCP session storage; each request initializes a fresh server. Safe on Vercel serverless.
- Auth uses `timingSafeEqual` with UTF-8 byte length matching.
