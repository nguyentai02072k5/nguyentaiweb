# Phase 05 — GA4 events + verification

## Context links
- Parent: [plan.md](plan.md) · Scout: [scout-01 §5-6](scout/scout-01-leads-routing-ga4-findings.md)
- Files: `src/lib/analytics/gtm.ts`, `src/components/analytics/*`, `src/app/landing/*`

## Overview
- Date: 2026-06-23 · Priority: P1 · Status: pending · Review: pending
- Mục tiêu: GA4 `page_view` + `generate_lead` cho landing (qua GTM chung), + Meta `Lead`; QA pixel + lead end-to-end.

## Key insights
- GTM (`GTM-5XRMF5RN`) + Meta Pixel inject ở root layout — landing host vẫn nhận (analytics nằm ngoài nhánh chrome → phase 02 giữ analytics cho mọi host).
- `page_view` đã auto theo `usePathname()` trong `google-tag-manager.tsx`. Landing root `/` (hiển thị) sẽ phát page_view.
- `generate_lead`: fire bằng `window.dataLayer.push({event:'generate_lead', ...})` sau submit thành công.

## Requirements
- FR: page_view khi mở landing. `generate_lead` (GA4) + `Lead` (Meta) khi submit OK.
- FR: event kèm tham số tối thiểu: `form_location:'landing'`, `industry`, `message_volume` (không gửi SĐT/PII).
- NFR: không double-fire; không chặn UX nếu analytics fail.

## Architecture
- Helper `src/app/landing/track-lead.ts`:
```ts
export function trackLead(p: {industry?:string; message_volume?:string}) {
  window.dataLayer?.push({ event:'generate_lead', form_location:'landing', ...p });
  // @ts-ignore
  window.fbq?.('track','Lead',{ content_category: p.industry });
}
```
- Gọi trong `lead-form.tsx` ngay sau response 201.
- Verify GTM container đã map trigger `generate_lead` → GA4 event (user cấu hình GTM dashboard nếu chưa).

## Related code files
- Tạo: `src/app/landing/track-lead.ts`
- Sửa: `src/app/landing/lead-form.tsx` (gọi trackLead)
- Không sửa: component analytics gốc.

## Implementation steps
1. Xác nhận analytics render trên landing host (view-source thấy GTM + fbq).
2. Viết `track-lead.ts`; gọi sau submit success.
3. (User/GTM) tạo trigger Custom Event `generate_lead` → tag GA4 event `generate_lead` nếu chưa có.
4. QA:
   - Pixel: so `mooly-landing.html` vs landing route (desktop + ≤640px) — không lệch.
   - Lead: submit thật → admin infor tab thấy record đủ field; payload industry+message_volume.
   - Webhook + automation: nhận message; Zalo flow trigger.
   - GA4 DebugView / GTM Preview: thấy page_view + generate_lead; Meta Pixel Helper thấy Lead.
   - Domain cũ (nguyenvantai.com, infor./form./admin.) không đổi.

## Todo
- [ ] Verify analytics có mặt trên landing
- [ ] track-lead.ts + gọi sau success
- [ ] GTM trigger/tag generate_lead (user)
- [ ] Pixel diff QA
- [ ] Lead/webhook/automation E2E
- [ ] GA4 DebugView + Meta Pixel Helper xác nhận
- [ ] Regression domain cũ

## Success criteria
- GA4 DebugView ghi `page_view` + `generate_lead` từ landing.
- Meta Pixel `Lead` fire 1 lần/submit.
- Pixel-match đạt; lead + webhook + automation đầy đủ; domain cũ nguyên vẹn.

## Risk assessment
- R: GTM chưa có tag cho generate_lead → event vào dataLayer nhưng không tới GA4. M: hướng dẫn user tạo tag (ngoài code).
- R: double page_view (root layout + landing). M: dùng đúng component sẵn có, không thêm GTM thứ 2.

## Security
- Event KHÔNG chứa SĐT/tên. Chỉ industry/message_volume (non-PII).

## Next steps
- Cập nhật `docs/project-changelog.md` sau khi ship (docs-manager).
- Backlog: rate-limit/honeypot form; A/B test copy (đã có bản review nội dung trước đó).
