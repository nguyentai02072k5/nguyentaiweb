# Phase 02 — Layout cô lập (bỏ chrome theo host, fonts, GTM)

## Context links
- Parent: [plan.md](plan.md) · Scout: [scout-01](scout/scout-01-leads-routing-ga4-findings.md)
- Files: `src/app/layout.tsx:90-123`, `src/app/landing/` (mới)

## Overview
- Date: 2026-06-23 · Priority: P0 · Status: pending · Review: pending
- Mục tiêu: landing KHÔNG có NavBar/SiteFooter của main, NHƯNG giữ GTM/Meta Pixel; fonts khớp HTML.

## Key insights
- Root layout ép cứng NavBar+SiteFooter+ScrollToTop (`:110-113`). Nested layout KHÔNG bỏ được chrome cha → phải xử ở root, host-scoped.
- Subdomain riêng → `headers().get('host')` đáng tin để phân nhánh (domain cũ không trúng).
- Fonts: CSS landing dùng tên LITERAL `'Be Vietnam Pro'`/`'Space Grotesk'`. next/font global sinh tên HASH → KHÔNG khớp literal → **phải giữ `<link>` Google Fonts gốc** (HTML dòng 10-12) trong landing để literal resolve. (Đơn giản + fidelity cao nhất; không phụ thuộc next/font.)
- ⚠️ next/font hiện thiếu weight **300** (`layout.tsx:28,36` chỉ 400-700); HTML Be Vietnam Pro dùng 300. → Giữ link gốc né hẳn vấn đề này.
- **Favicon** (HTML dòng 8, R2 LOGO) chưa nhắc phase nào → thêm vào metadata landing (`icons.icon`).
- **OG tags**: SET bằng **logo Mooly** (R2 dòng 8: `https://pub-c01be4db0ffa48e7bd267dfd32067311.r2.dev/LOGO%20MOOLY%20blank.png`). Metadata gồm `title` + `description` (từ HTML 6-7) + `icons.icon` (favicon) + `openGraph` + `twitter`.
  - ⚠️ Caveat: logo 512×512 (vuông), OG chuẩn 1200×630 → preview sẽ letterbox/crop. Chấp nhận; banner OG 1200×630 riêng = backlog.
- globals.css vẫn áp toàn cục → rủi ro đụng CSS landing → xử bằng scope `#mooly-lp` ở phase 03.

## Requirements
- FR: host `landing.*` → render `{children}` trần (không Nav/Footer/ScrollToTop), vẫn có GTM+Pixel.
- NFR: domain cũ render y nguyên. Không thêm font request mới.

## Architecture
Root layout (Server Component) đọc host:
```tsx
import { headers } from 'next/headers';
const isLanding = (await headers()).get('host')?.startsWith('landing.') ?? false;
...
<body>
  {/* analytics giữ nguyên cho mọi host */}
  {isLanding ? (
    children
  ) : (
    <ThemeProvider><NavBar/>{children}<SiteFooter/><ScrollToTopButton/></ThemeProvider>
  )}
</body>
```
- Lưu ý: nếu ThemeProvider cần cho tokens → cân nhắc giữ ThemeProvider bọc cả landing nhưng bỏ Nav/Footer. Verify landing không phụ thuộc theme class.
- Route group cô lập UI: `src/app/landing/page.tsx` + `src/app/landing/layout.tsx` (optional metadata riêng, noindex tùy chọn).

## Related code files
- Sửa (thêm điều kiện host): `src/app/layout.tsx`
- Tạo: `src/app/landing/page.tsx`, `src/app/landing/layout.tsx`

## Implementation steps
1. Root layout: thêm `isLanding` (host check). Bọc Nav/Footer trong nhánh non-landing.
2. Quyết định ThemeProvider: nếu landing tự chứa màu (file HTML có :root vars riêng) → có thể bỏ ThemeProvider cho landing. Verify.
3. Tạo `src/app/landing/layout.tsx`: trả `{children}` + export `metadata` (OG logo Mooly):
   ```ts
   const OG_LOGO = 'https://pub-c01be4db0ffa48e7bd267dfd32067311.r2.dev/LOGO%20MOOLY%20blank.png';
   export const metadata: Metadata = {
     title: 'Mooly — Trợ lý bán hàng AI đa kênh cho shop & doanh nghiệp', // HTML dòng 6
     description: '...', // HTML dòng 7 (copy nguyên)
     icons: { icon: OG_LOGO },
     openGraph: {
       type: 'website', siteName: 'Mooly', locale: 'vi_VN',
       title: 'Mooly — Trợ lý bán hàng AI đa kênh', description: '...',
       images: [{ url: OG_LOGO, width: 512, height: 512, alt: 'Mooly' }],
     },
     twitter: { card: 'summary', title: 'Mooly — Trợ lý bán hàng AI đa kênh', description: '...', images: [OG_LOGO] },
   };
   ```
   - `metadataBase` (root) không nối URL R2 tuyệt đối. `twitter.card='summary'` (ảnh vuông) hợp logo hơn `summary_large_image`.
4. Tạo `src/app/landing/page.tsx` placeholder (phase 03 fill).
5. Test: `landing.localhost` → không thấy Nav/Footer; `localhost` → vẫn thấy.

## Todo
- [ ] Host check trong root layout
- [ ] Tách Nav/Footer sang nhánh non-landing
- [ ] Verify ThemeProvider dependency
- [ ] Tạo landing/layout.tsx + metadata
- [ ] Placeholder page

## Success criteria
- Landing không render Nav/Footer/ScrollToTop. Domain cũ không đổi. GTM script vẫn có trên landing (view-source thấy GTM id).

## Risk assessment
- R: bỏ ThemeProvider làm vỡ token global dùng trong landing. M: landing dùng CSS riêng (phase 03), không phụ thuộc token → an toàn; verify trước.
- R: `headers()` khiến layout dynamic toàn site (mất static). M: chấp nhận (site này nhiều route động) hoặc giới hạn check trong landing segment.

## Security
- Không lộ secret. Metadata landing có thể `robots: noindex` nếu chưa muốn index (user quyết phase 05).

## Next steps
→ Phase 03 fill UI; Phase 05 fire GTM event.
