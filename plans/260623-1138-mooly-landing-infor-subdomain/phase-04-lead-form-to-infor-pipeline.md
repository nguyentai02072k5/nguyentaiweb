# Phase 04 — Form → pipeline infor (endpoint mới, field config)

## Context links
- Parent: [plan.md](plan.md) · Scout: [scout-01 §3-4](scout/scout-01-leads-routing-ga4-findings.md)
- Files: `src/app/api/infor/capture/route.ts` (mẫu tái dùng), `src/lib/leads/*`, `src/app/api/landing/lead/route.ts` (mới)

## Overview
- Date: 2026-06-23 · Priority: P0 · Status: pending · Review: pending
- Mục tiêu: form landing submit → lead vào bảng `leads` nhóm `infor`, webhook + automation như cũ, thêm `industry` + `message_volume`.

## Key insights
- Capture cũ BẮT BUỘC email → không tái dùng trực tiếp. Tạo endpoint mới, tái dùng LIBS (không sửa route cũ).
- `source='infor-landing-mooly'` (không prefix `mooly`) → `source_group` GENERATED = `infor`.
- `industry` đã là field infor → map `payload.industry` = admin tự hiển thị. `message_volume` thêm config.

## Requirements
- FR: POST `/api/landing/lead` `{full_name, phone, industry?, message_volume?}` → `submit_lead` RPC.
- FR: webhook báo lead mới + `triggerLeadAutomation({phone,name,source:'infor'})`.
- FR: trả `{success, lead_id, phone_mask}` để client hiện success-state + bắn GA4.
- NFR: validate zod; normalize phone VN; hash IP; idempotent theo phone (upsert RPC sẵn có).

## Architecture
**Schema mới** `src/lib/leads/landing-lead-schema.ts`:
```ts
export const landingLeadSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().min(9).max(20).regex(/^[\d\s+\-().]+$/),
  industry: z.string().trim().max(60).optional(),
  message_volume: z.string().trim().max(40).optional(), // 1 trong 4 mức select
});
```
**Route** `src/app/api/landing/lead/route.ts` (copy pattern capture):
1. parse+zod → 2. `normalizeVnPhone` → 3. `hashIp(getClientIp(headers))`
4. `supabaseAdmin.rpc('submit_lead', { p_phone, p_full_name, p_payload: { industry, message_volume }, p_user_agent, p_ip_hash, p_source: 'infor-landing-mooly' })`
   - chỉ đưa key có giá trị vào payload (bỏ undefined).
5. webhook (reuse format, `after()`), 6. `triggerLeadAutomation`, 7. response 201.

**Field config (admin/webhook hiển thị message_volume):**
- `src/lib/leads/lead-field-config.ts`: thêm `{ key:'message_volume', label:'Lượng tin nhắn/ngày', type:'text', section:'overview'|phù hợp }` (additive, không đổi key cũ).
- Verify key `industry` tồn tại đúng tên; nếu khác → map theo key thật.

**Client** `lead-form.tsx`: thu `name/phone/industry/scale` → fetch POST JSON → on success: hiện `.fok` + gọi `trackLead()` (phase 05). Map `scale`→`message_volume`.

**Options PHẢI giữ ĐÚNG (copy từ HTML 974-986, KHÔNG có `value=` → lưu label tiếng Việt):**
- `industry` (7): `Thời trang` · `Mỹ phẩm` · `Mẹ & bé` · `Gia dụng` · `F&B` · `Công nghệ` · `Khác` (+ option rỗng "— Chọn —"). Giữ đúng dấu `&` (Mẹ & bé, F&B).
- `scale`→`message_volume` (4): `Dưới 50 tin/ngày` · `50 – 200 tin/ngày` · `200 – 500 tin/ngày` · `Trên 500 tin/ngày` (+ "— Chọn quy mô —").
- Placeholder: name `VD: Nguyễn Văn A` (964); phone `09xx xxx xxx` (969).
- Lưu `select.value` = textContent (vì option không set value). Giữ UX `.invalid` + success-state `.fok` y HTML (991-995).

## Related code files
- Tạo: `src/lib/leads/landing-lead-schema.ts`, `src/app/api/landing/lead/route.ts`
- Sửa (thêm 1 field): `src/lib/leads/lead-field-config.ts`
- Tạo/nối: `src/app/landing/lead-form.tsx`
- Tái dùng (không sửa): phone-vn, ip-hash, trigger-lead-automation, server-client, submit_lead RPC.

## Implementation steps
1. Viết `landing-lead-schema.ts`.
2. Viết route `/api/landing/lead` theo pattern capture (đổi payload+source, bỏ email).
3. Thêm `message_volume` vào `lead-field-config.ts`; confirm `industry` key.
4. `lead-form.tsx`: state + validate client (giữ UX `.invalid` như HTML) + fetch + success-state.
5. Test: submit → lead xuất hiện admin tab infor, payload có industry+message_volume; webhook + automation chạy.

## Todo
- [ ] landing-lead-schema.ts
- [ ] /api/landing/lead/route.ts
- [ ] message_volume field config + verify industry key
- [ ] lead-form.tsx nối API + success
- [ ] E2E submit verify (admin + webhook + automation)

## Success criteria
- Lead mới: `source='infor-landing-mooly'`, `source_group='infor'`, `status='submitted'`, payload `{industry, message_volume}`.
- Admin infor tab hiển thị đủ tên/SĐT/ngành/lượng tin. Webhook Discord/n8n nhận. Automation Zalo trigger.
- Trùng SĐT → upsert (không tạo trùng), giữ hành vi RPC.

## Risk assessment
- R: thiếu env webhook/automation ở landing host. M: cùng app → env dùng chung; verify `LEADS_WEBHOOK_URL`/`WEBHOOK_URL`.
- R: spam form public. M: ip_hash sẵn; cân nhắc rate-limit nhẹ/honeypot (optional, ghi backlog).
- R: đổi `lead-field-config` ảnh hưởng render cũ. M: chỉ THÊM entry, không sửa key hiện có.

## Security
- Service-role chỉ ở server route. Không trả PII thừa (chỉ phone_mask). Zod chặn payload rác.

## Next steps
→ Phase 05 fire `generate_lead` sau success + verify end-to-end.
