# Phase 01 — Subdomain routing (proxy.ts) + domain

## Context links
- Parent: [plan.md](plan.md) · Scout: [scout-01](scout/scout-01-leads-routing-ga4-findings.md)
- Files: `src/proxy.ts:16-55`, `next.config.ts`

## Overview
- Date: 2026-06-23 · Priority: P0 (block mọi phase) · Status: pending · Review: pending
- Mục tiêu: `landing.nguyenvantai.com` (root) phục vụ landing nội bộ `/landing`, giữ URL hiển thị root, KHÔNG đụng nhánh host cũ.

## Key insights
- proxy.ts đã rewrite host theo pattern `if (isXHost && !path.startsWith('/x') ...) rewrite`. Thêm `landing.` y hệt.
- URL = root → rewrite `'/' → '/landing'`, các path khác giữ nguyên prefix `/landing`.
- Loại trừ `/api` để form POST tới `/api/landing/lead` không bị rewrite nhầm.

## Requirements
- FR: host `landing.*` (+ `landing.localhost` cho dev) → nội bộ `/landing/*`, URL hiển thị không đổi.
- NFR: nhánh host cũ (admin/infor/form/webhook) bất biến; matcher giữ nguyên (đã loại `_next`, `og/`).

## Architecture
Thêm sau khối webhook (`proxy.ts:55`), TRƯỚC khối admin:
```ts
const LANDING_HOST_PREFIX = 'landing.';
const isLandingHost = host.startsWith(LANDING_HOST_PREFIX);
// landing.* → /landing/* (PUBLIC, không auth)
if (isLandingHost && !url.pathname.startsWith('/landing') && !url.pathname.startsWith('/api')) {
  url.pathname = url.pathname === '/' ? '/landing' : `/landing${url.pathname}`;
  return NextResponse.rewrite(url);
}
```

## Related code files
- Sửa (thêm): `src/proxy.ts`
- Không đụng: các nhánh host hiện có.

## Implementation steps
1. Khai báo `LANDING_HOST_PREFIX` + `isLandingHost` cạnh các prefix khác (`proxy.ts:16-18`, `:30-33`).
2. Thêm khối rewrite landing (mục Architecture) sau webhook block.
3. Comment giải thích: subdomain marketing landing, public, không auth.
4. Domain (user thao tác dashboard — ghi vào checklist):
   - Vercel → Project → Settings → Domains → add `landing.nguyenvantai.com`.
   - DNS: CNAME `landing` → `cname.vercel-dns.com` (theo hướng dẫn Vercel).
5. Dev test: `landing.localhost:3000` → thấy `/landing` (sau khi phase 03 có page).

## Todo
- [ ] Thêm prefix + isLandingHost
- [ ] Thêm rewrite block
- [ ] Add domain Vercel + DNS (user)
- [ ] Verify host rewrite (curl -H "Host: landing.nguyenvantai.com")

## Success criteria
- `curl -H "Host: landing.localhost" localhost:3000/` resolve route `/landing` (200 sau phase 03).
- `nguyenvantai.com/`, `infor.*`, `form.*`, `admin.*` không đổi hành vi.

## Risk assessment
- R: matcher bỏ sót → landing asset không rewrite. M: dùng đúng matcher hiện có (đã loại _next/og).
- R: `/landing` lộ trên domain chính. M: chấp nhận (nội bộ) hoặc phase 02 redirect non-landing-host → 404/main.

## Security
- Public route, không auth (giống infor/form). Không đặt secret trong landing.

## Next steps
→ Phase 02 (layout cô lập) dùng được route `/landing`.
