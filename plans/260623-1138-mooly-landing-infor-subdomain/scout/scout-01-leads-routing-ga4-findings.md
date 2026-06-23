# Scout findings — Leads pipeline · Routing · GA4 (verified)

Verified by reading source. Path:line cited. Dùng cho plan landing.nguyenvantai.com.

## 1. Routing — proxy.ts LÀ middleware đang chạy (KHÔNG phải next.config)
- `src/proxy.ts:27` `export async function proxy()` + `:20` `export const config.matcher` → Next 16 middleware convention (đang active).
- Rewrites theo host đã có: `admin.` `:60`, `infor.` `:38`, `form.` `:45`, `webhook.` `:52`. Tất cả giữ URL hiển thị (NextResponse.rewrite).
- `next.config.ts:1-19`: KHÔNG có rewrites/host config. Chỉ `images.remotePatterns` cho R2 `pub-c5d3e1873a534ee89daedcf9e6dc380b.r2.dev` `/template/**`.
- → Thêm subdomain landing = thêm 1 nhánh trong proxy.ts (additive).

## 2. Leads table (verified migrations 0008/0009/0011/0014)
Cột chính: `phone`(NN, UNIQUE per source_group, regex `^(\+84|0)\d{9,10}$`), `full_name`(null), `payload jsonb` default `{}`, `status`(default 'opened', CHECK opened/submitted/contacted/converted/spam/archived), `source`(default 'infor-link'), `source_group`(GENERATED STORED: `'mooly'` nếu source LIKE 'mooly%' else `'infor'`), `note`, `open_count`, `opened_at`, `submitted_at`, `user_agent`, `ip_hash`, `created_at`, `updated_at`.
- RLS enabled, ZERO policies → service-role only.
- RPC `submit_lead(p_phone,p_full_name?,p_payload?,p_user_agent?,p_ip_hash?,p_source?)` → upsert status 'submitted'.

## 3. Lead capture pipeline (reuse được)
- `src/app/api/infor/capture/route.ts`: POST → zod `leadCaptureSchema` (full_name+phone+**email BẮT BUỘC**) → `normalizeVnPhone` → `hashIp` → `supabaseAdmin.rpc('submit_lead', {p_source:'infor-landing', p_payload:{email}})` → webhook (`LEADS_WEBHOOK_URL||WEBHOOK_URL`, fire-and-forget `after()`) → `triggerLeadAutomation({phone,name,source:'infor'})`.
- Libs tái dùng: `@/lib/leads/capture-schema`, `@/lib/format/phone-vn` (normalizeVnPhone,maskVnPhone), `@/lib/security/ip-hash` (hashIp,getClientIp), `@/lib/automation/trigger-lead-automation`, `@/lib/supabase/server-client` (supabaseAdmin).
- → Landing form KHÔNG có email → cần endpoint mới (không sửa capture cũ).

## 4. Field config (admin display + webhook format)
- `src/lib/leads/lead-field-config.ts` `LEAD_FIELDS` (nhóm infor) — ĐÃ có key `industry`. → map ngành hàng vào `payload.industry` = admin tự hiển thị.
- `message_volume` CHƯA có → thêm 1 LeadField (additive) để admin/webhook render.
- `src/lib/admin/lead-view-model.ts:27-40` LeadView; flatten payload theo field config → answers[].

## 5. Root layout & chrome
- `src/app/layout.tsx:110-113` ép cứng `<NavBar/>{children}<SiteFooter/><ScrollToTopButton/>`.
- Fonts global `Space_Grotesk` `:25-30` + `Be_Vietnam_Pro` `:33-38` (next/font, subset vi, swap) — KHỚP file HTML.
- Analytics root `:102-119`: GTM (`GoogleTagManager`), Meta Pixel, Vercel Analytics/SpeedInsights.
- → Bỏ chrome cho landing: check `host.startsWith('landing.')` qua `headers()` trong root layout (host-scoped, domain cũ không ảnh hưởng).

## 6. GA4 / tracking
- `src/lib/analytics/gtm.ts:3` `GTM_ID = NEXT_PUBLIC_GTM_ID ?? 'GTM-5XRMF5RN'`. GA4 (G-WM1Y5HBCHJ) cấu hình TRONG GTM dashboard.
- `src/components/analytics/google-tag-manager.tsx` push `page_view` theo `usePathname()`.
- Meta Pixel: `src/lib/analytics/meta-pixel.ts:META_PIXEL_ID ?? '1658487875083016'`.
- → Landing dùng chung GTM; fire `generate_lead` (dataLayer.push) + Meta `Lead` khi submit.

## Câu hỏi đã chốt với user
- Cùng repo, route cô lập. URL = landing.nguyenvantai.com (root). Lead gom nhóm `infor`. Source `infor-landing-mooly`. Thêm payload industry+message_volume.
