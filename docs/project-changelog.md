# Project Changelog

## 2026-06-23

### Added
- **Landing marketing Mooly** — subdomain mới `landing.nguyenvantai.com` (route nội bộ `/landing`, pixel-match từ `mooly-landing.html`). `proxy.ts` thêm nhánh `landing.*` → `/landing` + guard 404 khi host khác gõ `/landing` (chống trùng nội dung). Page standalone: `src/app/landing/{page,layout,landing-interactions}.tsx` — CSS + markup giữ **verbatim** (auto-gen `landing-styles.ts`/`landing-markup.ts`, scope `#mooly-lp`, inject qua `dangerouslySetInnerHTML`) để fidelity 100%; toàn bộ JS (8 khối: marquee, nav-scroll, mobile-menu, reveal, chat auto-scroll, 2 canvas sparks, FAQ, form) port sang 1 client component có cleanup + guard StrictMode. Font giữ `<link>` Google Fonts gốc (tên literal + weight 300). OG/twitter dùng logo Mooly.
- **API `POST /api/landing/lead`** — form landing (Họ tên + SĐT/Zalo + Ngành hàng + Lượng tin/ngày) ghi lead vào hệ thống infor: tái dùng RPC `submit_lead` + webhook + `triggerLeadAutomation`, source `'infor-mooly-lp'` (không prefix `mooly` → `source_group='infor'`). Payload thêm `industry` (reuse field infor có sẵn) + `message_volume` (`LANDING_FIELDS` mới trong `lead-field-config.ts`). Schema `landing-lead-schema.ts` (không email). GA4 `generate_lead` + Meta `Lead` khi submit thành công.

### Changed
- `src/app/layout.tsx` root layout host-conditional: subdomain `landing.*` render shell tối giản (bỏ NavBar/SiteFooter/ScrollToTop/Chatwoot/ThemeProvider, giữ GTM/Pixel/Analytics). Đánh đổi: dùng `headers()` nên trang khác chuyển render động (chấp nhận — ưu tiên không-conflict, SEO không trọng yếu).

## 2026-06-21

### Added
- **Auto-trigger flow từ lead** — nối `triggerLeadAutomation()` (helper `src/lib/automation/trigger-lead-automation.ts`, fire-and-forget qua `after()`) vào 4 điểm tạo lead: `/api/infor/capture`, `/api/infor/submit`, `/api/form/submit`, và `recordLeadOpen` (mở link). Gọi worker `POST /api/flow/trigger` với `source` ('infor'|'mooly') → worker tự tìm flow đang bật khớp nguồn và chạy. **Dedup 10 phút** ở worker (`hasRecentRun`) chống bắn trùng (open + submit). "Chạy thử" thủ công (có flowId) bỏ qua dedup.
- **Node "Kiểm tra form" (`check_form`)** — check lead theo SĐT (form đã submit chưa) rồi gửi tin tương ứng: `messageFilled` (đã điền) / `messageNotFilled` (chưa điền). Set biến `{{trang_thai}}`, `form_filled`, `lead_status` vào context; auto lấy `ten` từ `full_name` lead. Worker `getLeadByPhone(phone, source)` query bảng `leads` (lọc `source_group`). SĐT tự khôi phục từ run state sau khi n8n callback (delay payload thêm `phone` top-level cho n8n tiện dùng). Builder render 2 ô soạn tin + chọn nguồn.
- **Automation Flow Builder** — trang `admin.nguyenvantai.com/admin/automation`: thiết kế flow Zalo dạng **step-list kéo-thả** (HTML5 drag), không cần React Flow. Node: `send_friend_request`, `send_message` (editor format tag b/i/u/s + màu + biến `{{ten}}`/`{{sdt}}`/`{{link_meet}}` + preview), `delay_webhook`. Có nút "Nạp mẫu" (kịch bản kết bạn → chào → chờ giờ hẹn → bắn link Meet) và "Lưu & chạy thử".
- **Engine thực thi (worker)** — `flow-runner.js` + `flow-store.js`: chạy step tuần tự, lưu run state vào Supabase (`automation_runs`) để **resume**. Node hẹn giờ = **webhook chờ n8n**: worker POST `{runId, resumeToken, resumeUrl, context}` sang n8n; n8n giữ thời gian rồi callback `POST /api/flow/resume?runId&token` → chạy tiếp (né Render ngủ vì callback đánh thức). Endpoint mới: `/api/flow/trigger` (token), `/api/flow/resume` (dùng resume_token).
- Migration `0013_init_automation_flows.sql`: bảng `automation_flows` + `automation_runs` (RLS, service_role). Bổ sung 2 bảng vào `database-types.ts`.
- Server actions `src/lib/automation/flow-actions.ts` (list/get/create/save/delete + testTrigger gọi worker bằng `WORKER_API_TOKEN`). Nav admin thêm tab **Automation**. Worker thêm env `PUBLIC_BASE_URL` (dựng resumeUrl).
- **Zalo automation (MVP)** — subdomain `webhook.nguyenvantai.com` + worker Node độc lập `zalo-worker/` chạy [`zca-js`](https://github.com/RFS-ADRENO/zca-js). Vì zca-js cần process Node sống liên tục (giữ session + websocket), KHÔNG chạy được trên Vercel serverless/n8n Cloud → tách worker riêng (chạy local hoặc Railway/Render free tier, code y hệt).
- Worker tính năng: đăng nhập **QR** (SSE stream mã QR + tiến trình, quét ~5s); **lưu state** credential `{cookie, imei, userAgent}` mã hóa AES-256-GCM vào bảng Supabase `zalo_credentials` → restart tự login lại không cần QR; **gửi tin nhắn theo SĐT** (`findUser` → `sendMessage`) kèm tùy chọn **gửi lời mời kết bạn** (`sendFriendRequest`, sửa được nội dung).
- Parser `zalo-worker/src/html-to-styles.js`: convert format HTML-like `<b><red>…</red></b>` (b/i/u/s + màu red/orange/yellow/green + big/small, lồng nhau) → mảng `styles[]` của zca-js (zca-js không nhận tag HTML trực tiếp).
- Migration `0012_init_zalo_credentials.sql`: bảng `zalo_credentials` (RLS bật, chỉ service_role truy cập).
- Trang Next `src/app/webhook/page.tsx` nhúng (iframe) bảng điều khiển worker qua `NEXT_PUBLIC_ZALO_WORKER_URL`; `proxy.ts` thêm rewrite `webhook.*` → `/webhook`.
- Deploy config worker: `Dockerfile`, `railway.json`, `render.yaml`, `.env.example`, `README.md`.
- Cảnh báo: zca-js là API không chính thức, tài khoản Zalo có thể bị khóa — dùng tài khoản phụ, tần suất hợp lý. Phase 2 (chưa làm): hook lead-capture → auto gửi khi khách đăng ký SĐT, listener nhận reply, auto bắn link Meet gần giờ hẹn.
- Phiếu set-up chatbot `/infor/[phone]` thêm **chế độ upload tài liệu** (thay điền tay wizard). Lối tắt ở đầu Bước 1: "Đã có sẵn File mô tả doanh nghiệp & quy trình bán hàng? Bấm để upload" → chuyển sang form upload tối giản (xác nhận SĐT/Tên + đính kèm 1 file, mọi định dạng ≤2MB). Component `src/components/infor/infor-doc-upload.tsx`, switch mode trong `infor-lead-form.tsx`.
- API `POST /api/infor/upload` (multipart): upload file → bucket private `lead-docs`, tạo signed URL 1 năm, lưu payload `{business_doc_url, business_doc_name}` qua RPC `submit_lead` (`source='infor-upload'`) + webhook báo lead kèm link.
- Migration `0010_init_lead_docs_storage.sql`: bucket Supabase Storage `lead-docs` (private, `file_size_limit` 2MB).
- Display fields `business_doc_name`/`business_doc_url` (`LEAD_DOC_FIELDS`) để CMS + webhook hiển thị; admin `/admin/leads` render giá trị URL thành link "Mở file ↗".
- Form Mooly `form.nguyenvantai.com` thêm **lối tắt "đã có sẵn file"** giống infor: nút đầu form → chuyển sang mode upload tối giản (Tên + SĐT/Zalo + 1 file ≤2MB). Component `src/components/form/mooly-doc-upload.tsx`, switch mode trong `mooly-form.tsx`, API `POST /api/form/upload` (`source='mooly-form'`).
- Refactor DRY: tách logic upload tài liệu dùng chung `src/lib/leads/handle-lead-doc-upload.ts` (parse → upload bucket `lead-docs` → signed URL 1 năm → `submit_lead` → webhook); route infor + form chỉ còn truyền `source`.

### Changed
- **Tách lead theo nguồn ở Supabase**: migration `0011_leads_source_group_unique.sql` thêm cột sinh `source_group` ('mooly%'→'mooly', còn lại 'infor'), bỏ unique đơn trên `phone`, thay bằng unique `(phone, source_group)`; 2 RPC `record_lead_open`/`submit_lead` đổi conflict target sang `(phone, source_group)`. Trước đây cùng SĐT ở infor + form Mooly bị ghi đè chung 1 row → giờ mỗi nguồn 1 lead độc lập.
- CMS `/admin/leads`: thêm **tab nguồn "Infor / Form Mooly"** (kèm số đếm) tách 2 list riêng; đổi tab tự bỏ chọn + thu gọn. View-model build `answers` + cột export theo đúng field của từng nguồn (`INFOR_FIELD_COLUMNS` / `MOOLY_FIELD_COLUMNS`), thêm `sourceGroup` vào `LeadView`.
- Export CSV theo nguồn đang xem (cột & value khớp nguồn), tên file `leads-{infor|mooly}-YYYYMMDD.csv`.
- Link riêng theo SĐT cho form Mooly: route `/form/[phone]` (`form.nguyenvantai.com/<sđt>`). Mở link → `recordLeadOpen('mooly-form')` auto tạo lead 'opened' lên DB + CMS (nhóm mooly) kể cả khi chưa có tên; prefill sẵn SĐT + Tên (nếu hệ thống đã có) vào `MoolyForm`/`MoolyDocUpload`, khách chỉ điền thêm phần còn lại. `recordLeadOpen` thêm tham số `source` (mặc định 'infor-link').

## 2026-06-20

### Added
- Trang cảm ơn `infor.nguyenvantai.com/thanks` (`src/app/infor/thanks/page.tsx`) — port từ `thanks.html` sang React: card glass full-screen takeover, confetti + particle canvas, countdown 15' (sessionStorage), nút Zalo ripple, quà tặng chatbot AI. Style ở `infor-thanks.module.css`, hiệu ứng tách `use-thanks-effects.ts`. noindex.
- Nền aurora động dùng chung `infor-aurora-background.tsx` (blob trôi `animate-blob-*` + mesh) cho `/infor` và `/infor/[phone]`, thay lớp radial-gradient tĩnh.
- Website mới `form.nguyenvantai.com` (subdomain) — form khai thác thông tin Bot Mooly: 1 trang, contact (Tên + SĐT/Zalo) + 6 trường nội dung (Tên shop·ngành, Link web/fanpage, Sản phẩm·giá/catalog, Quy trình bán hàng, Chính sách, FAQs). Mỗi trường có tooltip (?) giải thích + placeholder mẫu, hoạt động trên mobile & desktop.
- UX: thanh tiến độ hoàn thành (Zeigarnik), tick "đã điền" từng ô, nền Aurora mesh + glass card, CTA gradient shine, trust signals (3–5 phút · bảo mật · có hướng dẫn), trạng thái success.
- Route `/form` (`src/app/form/page.tsx`) + components `src/components/form/mooly-form.tsx`, `mooly-field.tsx`; config `src/lib/leads/mooly-field-config.ts`; schema `mooly-schema.ts`.
- API `POST /api/form/submit` tái dùng RPC `submit_lead` (bảng `leads`, `source='mooly-form'`) + webhook Discord/n8n; admin CMS `/admin/leads` render thêm trường Mooly.

### Changed
- Landing `/infor`: capture form cơ bản thành công → điều hướng thẳng sang `/thanks` (bỏ wizard cấu hình + toast inline tại landing; wizard vẫn giữ ở route `/infor/[phone]`). Form cơ bản bọc trong BOX frame gradient aurora động cho nổi bật. Gỡ `infor-transition-toast.tsx` (dead code).
- `proxy.ts`: thêm rewrite host `form.*` → `/form` (public, không auth), cùng pattern với `infor.*`/`admin.*`.
- Form Mooly: FAQ chuyển từ textarea → **repeater cột Câu hỏi – Câu trả lời** (mỗi dòng 1 cặp, nút +/− thêm-xoá, placeholder xoay theo dòng, dễ điền & tracking). Lưu payload dạng mảng `{q,a}`.
- Trường "Quy trình bán hàng" thêm **note nhắc thu Leads**: với sản phẩm/dịch vụ, ghi rõ điều kiện để bot xin SĐT/Zalo của khách.
- Thanh progress tách thành component `mooly-progress.tsx`, hiển thị `x/total mục · %`, đổi sang trạng thái emerald + tick khi đạt 100% (chỉ đếm mục bắt buộc).
- Admin CMS + webhook dùng chung `formatLeadValue` cho field Mooly (FAQ repeater render thành các dòng `• Q — A`).

## 2026-06-19

### Added
- Bản HTML/CSS/JS thuần của landing `/infor` tại `public/infor-static/`, gồm hero, video demo, features, flow đăng ký cơ bản → modal → form cấu hình chi tiết.
- JS thuần render form config-driven, repeater, validation client-side, tracking `dataLayer`/Meta fallback, và giữ API payload tương thích `/api/infor/capture` + `/api/infor/submit`.
- File single-page export `infor.html` ở root project, self-contained với CSS/JS inline và form native tương thích GHL external tracking.

### Changed
- Chuyển form liên hệ trong `public/infor-static/` sang native HTML form theo chuẩn GHL external tracking: không bind submit bằng JS, có `input type="email"`, dùng `input type="submit"`, bỏ icon nằm trong input, và thêm script `external-tracking.js` với tracking id.
- Khôi phục `infor.html` về nền light Aurora cũ, thay background dark/Cloudinary bằng canvas hạt tím-hồng nhẹ phía sau nội dung; giữ form GHL native không bị JS can thiệp submit/click.
- Giảm độ đậm lớp nền tím-hồng và làm chậm tốc độ hạt background trong `infor.html` để hiệu ứng nền nhẹ hơn, ít cạnh tranh với nội dung.
- Gỡ lớp grid `linear-gradient` 1px trong background `infor.html` vì tạo vạch ngang full-frame; thay bằng radial tint mềm không có đường thẳng.

## 2026-06-10

### Added
- 2 bài blog dạng "landing" (từ HTML mockup → MDX): `tuong-lai-doanh-nghiep-ky-nguyen-ai` (McKinsey/Goldman, 4.400 tỷ USD · 300 triệu việc làm) + `kich-ban-2027-2029-dieu-phoi-hay-bi-bo-lai` (GEO/AEO · cú phân tách 3–10× · Spiral Dynamics).
- Bộ block MDX rich on-brand (Aurora token, an toàn dark): `StatGrid · KeyTakeaways · Callout · AdminNote · DataStat · Fork · CardGrid · Tiers · Steps · Checklist · PullQuote · CTACard` (`src/components/content/blog-mdx-*.tsx`, đăng ký trong `mdx-components.tsx`, dùng theo tên trong `.mdx` không cần import).
- Frontmatter `faqs` (tuỳ chọn) cho blog → section FAQ accordion (`PostFaq`) + `FAQPage` JSON-LD (`buildFaqPageJsonLd`) phục vụ AEO/rich result.

### Changed
- Thay 2 template demo ngành Thời trang & Mỹ phẩm bằng bộ chỉ dẫn chatbot đầy đủ (quy trình tư vấn, NLU, quy tắc khuyến mãi, bảng size dáng người Việt / bảng tư vấn theo loại da, mẫu câu, an toàn tư vấn da). Mỗi trang gói toàn bộ instruction trong 1 khối `text` để copy & dán một chạm vào system prompt chatbot.
- `MdxCodeBlock`: khung cố định `max-h-[36rem]`, chỉ cuộn DỌC (`overflow-y-auto overflow-x-hidden`), dòng dài tự xuống dòng (`whitespace-pre-wrap break-words`) thay vì tràn ngang; nút Copy luôn hiển thị, nội dung copy vẫn đúng (soft-wrap không thêm newline). Áp dụng mọi template + blog.
- Prose heading nổi bật hơn: `.prose h2` thêm thanh accent gradient aurora bên trái + hairline phân tách section; `.prose h3` thêm marker brand-violet. Áp dụng chung template + blog.
- CTA template (`SoftCta`): rút còn 1 nút gradient aurora động "Liên hệ qua Zalo" (heading "Cần hỗ trợ gì cho shop của anh/chị?"), bỏ nút "Đặt lịch tư vấn".

### Removed
- Bỏ hẳn CTA cuối bài blog (`SoftCta` + import khỏi `/blog/[slug]`); gỡ location `blog_cta` khỏi `CtaLocation`.
- Demo `mau-thoi-trang-thu-lead.mdx` (thay bằng `mau-thoi-trang-chot-don.mdx`). Template Mỹ phẩm giữ slug `mau-my-pham-chot-don` nhưng thay toàn bộ nội dung.

## 2026-06-09

### Added
- Kho Template Instruction (`/templates`): lọc client-side theo mô hình kinh doanh + ngành + search không dấu; trang chi tiết `/templates/[slug]` render MDX (prose + nút copy) + đính kèm + CTA mềm + template liên quan.
- pSEO routes `/templates/nganh/[industry]` (SSG, index được) cho từng ngành có template.
- Blog (`/blog` + `/blog/[slug]`): lọc theo 3 chủ đề cố định (Phát triển kinh doanh · Phát triển bản thân · Phân tích trên thế gian), reading-time, related theo chủ đề, CTA mềm.
- Content layer Velite (MDX trong `content/`, frontmatter validate build-time; build fail nếu phân loại sai). Taxonomy SSOT `src/lib/content/taxonomy.ts` + `blog-taxonomy.ts`.
- SEO đầy đủ: `generateMetadata` (canonical + openGraph + twitter), OG động (`next/og`, font Be Vietnam Pro local) cho templates/pSEO/blog, JSON-LD (TechArticle · CollectionPage+ItemList · BlogPosting · BreadcrumbList), `sitemap.ts`, `robots.ts`.
- Site URL SSOT `src/lib/seo/site.ts` (env `NEXT_PUBLIC_SITE_URL`). Nav thêm link Templates + Blog.

### Changed
- `metadataBase` + og:url + canonical homepage lấy từ `site.ts` (thay hardcode).
- `robots.txt` chặn `/admin`, `/api` và các trang dev-verify (`/brand`, `/logo`, `/components`, `/animations`).

### Dependencies
- Thêm `velite`, `@tailwindcss/typography`, `concurrently` (devDep). Build script: `velite && next build`.

### Notes
- Khi deploy: set env `NEXT_PUBLIC_SITE_URL=https://nguyenvantai.com` để canonical/OG/sitemap dùng đúng domain.

## 2026-05-16

### Added
- Added Meta Conversions API server-side booking conversion dispatch.
- Added `Lead` and `Schedule` server events after successful booking creation.
- Added browser/server deduplication with booking-derived `eventID`.
- Added hashed Meta user data matching fields for email, phone, first name, last name, external ID, `_fbp`, `_fbc`, IP, and user agent.
- Documented Meta CAPI environment variables in `.env.local.example`.
- Added optional `META_CAPI_TEST_EVENT_CODE` support for Meta Events Manager testing.
- Installed Meta Pixel `1658487875083016` via Next.js `Script`.
- Added client-side `PageView` tracking for initial load and route changes.
- Added CTA click custom event tracking.
- Added booking funnel events: booking section view, day select, slot select, mobile form view, submit attempt, submit errors.
- Added successful booking conversion tracking with Meta standard `Lead` and `Schedule` events.

### Privacy
- Meta CAPI token is read from `META_CAPI_ACCESS_TOKEN`; real token is not stored in source code.
- Pixel events do not send phone, email, name, or booking ID.
