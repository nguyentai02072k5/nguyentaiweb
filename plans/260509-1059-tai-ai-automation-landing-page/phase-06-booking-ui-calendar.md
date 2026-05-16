# Phase 06 - Booking UI / Smart Calendar (CONVERSION CORE)

**Status:** Pending
**Priority:** P0 (heart of the page)
**Depends on:** Phase 01 (tokens), Phase 02 (copy), Phase 07 (backend) parallel

## Skills Active
- `form-cro` - Form optimization, friction reduction, field ordering
- `signup-flow-cro` - Multi-step flow patterns, progress indicators
- `ui-ux-pro-max` - Calendar UX (avoid overwhelm), step transitions
- `frontend-design` - Polished interactions, mobile-first calendar
- `frontend-development` - React Hook Form + Zod, Server Actions
- `react-best-practices` - Suspense for slot fetch, optimistic UI
- `marketing-psychology` - Reduce friction, anchoring (20 phút), commitment escalation
- `web-testing` - E2E test booking flow

## Objective
Build smart, low-friction multi-step booking UI:
- Step 1: Pick date (4-7 next available days)
- Step 2: Pick time slot (3-5 suggested per day)
- Step 3: Confirm summary
- Step 4: Fill info form (minimal)
- Step 5: Submit + thank-you screen

**Booking rules (Locked 2026-05-09 PM):**
- Slot grid interval: **30 phút** (vd: 9:00, 9:30, 10:00, 10:30...)
- Meeting duration: **20 phút**
- Block rule: **2 tiếng forward** sau mỗi booking (vd: book 10:00 → 10:30/11:00/11:30 disabled, 12:00 enable lại)
- Working hours: **24/7** - không giới hạn
- Meet platform: **Google Meet**
- Notify: lưu DB → auto **Zalo Notify** (không gửi email v1)

## Key Insights (User UX Lock)
- **DO NOT show full month grid** → quá nhiều choice = paralysis
- Show next **4-7 days** chips (24/7 nên all days available, skip days that are fully blocked)
- Per day: chỉ show **3-5 suggested slots** picked từ raw 30-min grid
- Curate logic: spread theo time-of-day → 1 morning (6-11), 1 midday (11-14), 1-2 afternoon (14-18), 1 evening (18-22), 1 night (22-6 nếu có demand) - pick available ones
- Disabled slots: ẩn hoặc greyed (đã block 2h sau booking khác)
- **Mobile-first design** - 90% user book qua mobile
- **Form fields minimal:** chỉ **Phone Zalo required** + Email/Name/Note optional (per user brief 2026-05-09)
- Progress indicator hiển thị step hiện tại / total
- Back button luôn available (giảm sunk cost feel)

## Step-by-Step UX Spec

### Step 0: Section Header (always visible above stepper)
- Title: `Đặt lịch Meet 1-1 - 20 phút`
- Sub: `Tôi sẽ demo trực tiếp Chatbot AI hoạt động.`
- Trust mini-bullets: `Miễn phí` · `Online` · `Không cần chuẩn bị`

### Step 1: Pick Date
**Layout (mobile-first, horizontal scrollable chips):**
```
< Chọn ngày phù hợp                    Bước 1/4 >
[Hôm nay  T7 09/05] [Mai T2 11/05] [T3 12/05] ... →
```

**Each chip:**
- Day-of-week label
- Date number large
- Sub label: "Còn 4 slot" / "Còn 1 slot" / "Hết slot"
- States: available (default) · selected (gradient bg) · disabled (grey)

**Logic:**
- Pull next 7 working days từ API `/api/availability/days`
- Skip Sunday (or per work-hours config)
- Today included nếu còn slot khả dụng (≥ now + buffer)

**Animations:**
- Horizontal scroll snap (CSS scroll-snap)
- Selected chip: scale 1.05 + gradient bg
- Tap haptic-like ripple (CSS-based)

### Step 2: Pick Time Slot
**Layout (after day picked):**
```
< Chọn giờ - T2 11/05                  Bước 2/4 >
[09:00 ☀️]  [10:30 ☀️]   ← morning
[14:00 🌤️]  [16:30 🌤️]  ← afternoon
[20:00 🌙]                ← evening
```

3-5 suggested slots với time-of-day hint icon:
- ☀️ Sáng (06:00-11:00)
- 🍱 Trưa (11:00-14:00)
- 🌤️ Chiều (14:00-18:00)
- 🌙 Tối (18:00-22:00)
- 🌌 Khuya (22:00-06:00) - chỉ show nếu có demand cụ thể, default skip

**Each slot button:**
- Time large (HH:mm)
- Tag dưới: "Còn trống" hoặc "Đã đặt"
- Disabled visual: opacity 0.4 + struck-through + cursor not-allowed
- Available state: white bg + brand border, hover scale + glow

**Slot Generation Logic (frontend display):**
- API `/api/availability/slots?date=YYYY-MM-DD` trả list of slots với available flag
- API đã apply **2h block rule forward** từ existing bookings
- Frontend chỉ render - không tính toán block

**Slot Curation (5 picks max):**
- Backend pick 5 slots representative spread across time-of-day
- Nếu user muốn xem thêm → button "Xem thêm giờ khác" expand full 30-min grid (24h × 2 = 48 raw slots filtered for availability)
- Default 5 picks → minimize choice paralysis

### Step 3: Confirm Summary
**Layout (centered card):**
```
✓ Tôi xác nhận đặt lịch:
  ┌─────────────────────────────┐
  │ 📅 T2, 11/05/2026          │
  │ 🕒 14:00 – 14:20 (20 phút)  │
  │ 💻 Google Meet (link gửi qua Zalo) │
  └─────────────────────────────┘

[← Đổi giờ khác]  [Tiếp tục →]
```

User must tap "Tiếp tục" to proceed (commitment escalation).

### Step 4: Fill Info Form (UPDATED 2026-05-09 PM - multi-select expectations)
**Layout (single column, mobile-optimized):**
```
< Thông tin liên hệ                          Bước 4/4 >

Số điện thoại Zalo *
[0xxx xxx xxx____________________]
↳ Tôi sẽ liên hệ Zalo xác nhận lịch

Email (tùy chọn)
[email@example.com_______________]
↳ Để gửi calendar invite Google Meet

Họ tên (tùy chọn)
[________________________________]

Anh/chị quan tâm điều gì? (chọn 1 hoặc nhiều)
[ ] 💬 Tư vấn tự động 24/7
       Trả lời sản phẩm, giá, ship, chính sách
[ ] 📸 Nhận diện hình ảnh khách gửi
       Bot hiểu hình → gợi ý đúng sản phẩm
[ ] 🛒 Chốt đơn + làm rõ nhu cầu
       Tự thu thập thông tin, tạo đơn
[ ] 📞 Xin SĐT/Zalo, chuyển tư vấn 1-1
       Lọc khách tiềm năng cho nhân viên
[ ] ✏️ Khác
   ↳ (textarea reveal khi check) ⤵
   [_______________________________
    _______________________________]
   (max 200 ký tự)

[ ] Tôi đồng ý nhận tin Zalo xác nhận lịch *

[Xác nhận đặt lịch →]   ← gradient CTA
```

**Field rules (locked):**
- **Required:** `phone_zalo` + `consent_zalo`
- **Optional:** `email`, `full_name`, `expectations[]`, `expectation_other`
- Min font 16px (prevent mobile zoom)
- Touch targets ≥ 48px (especially checkbox area - wrap full row clickable)
- Inline validation on blur
- Phone: format VN auto (`0xxx xxx xxx` hoặc `+84xxx xxx xxx`)
- Email validation lenient
- Disabled submit until phone valid + consent checked
- Show submit progress: `Đang lưu lịch...`

### ExpectationCheckboxGroup Component Spec

**Anatomy per item:**
```
┌─────────────────────────────────────┐
│ [✓]  💬 Tư vấn tự động 24/7        │  ← clickable full row
│      Trả lời sản phẩm, giá, ship... │  ← description text-secondary
└─────────────────────────────────────┘
```

- **Container row:**
  - Padding: 12px 16px
  - Radius: `md` (12px)
  - Border: 1px `border-default`
  - Bg: `surface-base`
  - Cursor: pointer (full row clickable, not just checkbox)
  - Touch target ≥ 48px
- **Checkbox:** shadcn Checkbox primitive (Radix), 20x20, brand-secondary when checked
- **Icon:** 20-24px emoji hoặc Lucide
- **Label:** font-semibold, text-primary
- **Description:** text-sm, text-secondary, 1 dòng max
- **States:**
  - Default: border-default, bg white
  - Hover: border-brand-secondary/50, bg-violet-50/50
  - Checked: border-brand-secondary, bg-violet-50, shadow-sm
  - Focus: ring-2 ring-brand-secondary/30
- **Khác item:** when checked, animate reveal `<textarea>` below với Framer `<AnimatePresence>` height auto
- **Animation:** stagger fade-up on first viewport entry

**Component file:** `src/components/booking/expectation-checkbox-group.tsx`
**Data file:** `src/content/expectation-options.ts`

```ts
// expectation-options.ts
export type ExpectationSlug = 'consult-24-7' | 'image-recognition' | 'close-order' | 'lead-capture' | 'other';

export const EXPECTATION_OPTIONS = [
  { slug: 'consult-24-7', icon: '💬', label: 'Tư vấn tự động 24/7', description: 'Trả lời sản phẩm, giá, ship, chính sách' },
  { slug: 'image-recognition', icon: '📸', label: 'Nhận diện hình ảnh khách gửi', description: 'Bot hiểu hình → gợi ý đúng sản phẩm' },
  { slug: 'close-order', icon: '🛒', label: 'Chốt đơn + làm rõ nhu cầu', description: 'Tự thu thập thông tin, tạo đơn' },
  { slug: 'lead-capture', icon: '📞', label: 'Xin SĐT/Zalo, chuyển tư vấn 1-1', description: 'Lọc khách tiềm năng cho nhân viên' },
  { slug: 'other', icon: '✏️', label: 'Khác', description: '(điền cụ thể bên dưới)' },
] as const;
```

**Form state:**
```ts
type BookingForm = {
  phone_zalo: string;        // required
  email?: string;
  full_name?: string;
  expectations: ExpectationSlug[];  // array, default []
  expectation_other?: string;       // chỉ dùng khi expectations includes 'other'
  consent_zalo: boolean;     // required true
};
```

**`form-cro` skill applied:**
- Ask least info: chỉ phone là phải
- Show optional rất rõ ("(tùy chọn)")
- One field per row mobile
- **Multi-select expectation thay text input** → giảm friction, educate khách về capabilities cùng lúc
- Phone helper text emphasize "Zalo" → user hiểu purpose
- Friendly errors: "Anh/chị cho em xin số Zalo để xác nhận nhé"
- Auto-trim whitespace, normalize phone format

### Mount point (LOCKED 2026-05-14)
- **Inline section** trên main `/` page, anchor `id="dat-lich"`
- **KHÔNG** tạo route `/booking` — nav + sticky CTA scroll smooth tới `#dat-lich`
- Submit success → `router.push('/thank-you')` (full-page, không state-based step 5)

### Step 5 = trang `/thank-you` (full route — LOCKED 2026-05-14)
**File:** `src/app/thank-you/page.tsx`
**URL:** `/thank-you?booking_id=...&phone_mask=...`
**Layout (full-width card centered):**
```
        🎉 [animated checkmark]

  Đã nhận lịch Meet của anh/chị!

  📅 T2, 11/05/2026 - 14:00 (20 phút)
  💻 Google Meet - link sẽ gửi qua Zalo

  💬 Tôi sẽ liên hệ Zalo xác nhận
     vào số 0xxx xxx xxx
     trong vòng 24 giờ.

     (v1.5 sẽ auto Zalo Notify — hiện owner check Supabase Studio)

  [Quay về trang chủ]   [Lưu vào lịch (.ics)]
```

- Animated checkmark (Framer Motion path draw)
- Confetti subtle (optional, perf-light particles)
- Save to calendar: download `.ics` file với Google Meet link (Phase 07 helper)
- Send notification: backend trigger **Zalo Notify** (Phase 07) → owner + customer
- Mask phone display: show last 4 digits cho privacy (`0xxx xxx 1234`)

## Component Architecture

### State Management
- React Hook Form for form state
- Local state for step navigation (`useState` or `useReducer`)
- TanStack Query (or SWR) for slot fetching
- URL hash sync optional (`#step=1` for back button UX)

### Component Tree
```
// src/app/page.tsx
<BookingSection>  // <section id="dat-lich">
  <BookingHeader />
  <BookingProgress current={step} total={4} />
  <AnimatePresence mode="wait">
    {step === 1 && <DatePicker onSelect={...} />}
    {step === 2 && <SlotPicker date={...} onSelect={...} />}
    {step === 3 && <BookingConfirm date={...} slot={...} onContinue={...} onBack={...} />}
    {step === 4 && <BookingForm onSubmit={async (data) => {
      const res = await fetch('/api/book', { method: 'POST', body: JSON.stringify(data) });
      const { booking_id } = await res.json();
      router.push(`/thank-you?booking_id=${booking_id}&phone_mask=${maskPhone(data.phone_zalo)}`);
    }} onBack={...} />}
  </AnimatePresence>
</BookingSection>

// src/app/thank-you/page.tsx — separate route, full-page
<ThankYouPage />
```

### Step Transition Animation
Use Framer Motion `AnimatePresence` với:
- Enter: fade + slide-in from right (16px)
- Exit: fade + slide-out to left
- Direction-aware: back button reverses direction

## Files to Create
- `src/app/thank-you/page.tsx` - thank-you full route (replaces in-flow Step 5)
- `src/app/thank-you/thank-you-content.tsx` - client component reading searchParams
- `src/components/sections/booking-section.tsx` - main wrapper (mount inline ở `/`, anchor `id="dat-lich"`)
- `src/components/booking/booking-header.tsx`
- `src/components/booking/booking-progress.tsx` - stepper
- `src/components/booking/date-picker.tsx`
- `src/components/booking/date-chip.tsx`
- `src/components/booking/slot-picker.tsx`
- `src/components/booking/slot-button.tsx`
- `src/components/booking/booking-confirm.tsx`
- `src/components/booking/booking-form.tsx`
- `src/components/booking/expectation-checkbox-group.tsx` - 4 options + Khác
- `src/components/booking/expectation-checkbox-item.tsx` - single row
- `src/components/booking/booking-thank-you.tsx`
- `src/components/booking/animated-checkmark.tsx`
- `src/lib/booking/state-machine.ts` - useReducer state
- `src/lib/booking/types.ts` - Booking, Slot, Day, ExpectationSlug types
- `src/lib/validators/booking-schema.ts` - Zod schema (includes expectations[] enum)
- `src/lib/api/availability-client.ts` - fetch wrapper
- `src/lib/format/phone-vn.ts` - VN phone formatter
- `src/content/expectation-options.ts` - option definitions

## Implementation Steps
1. Define types: `Slot`, `DayAvailability`, `BookingPayload`, `BookingState`
2. Zod schema cho form
3. Phone formatter (VN style: 0xxx xxx xxx)
4. Build `<BookingProgress />` stepper
5. Build `<DatePicker />` với horizontal scroll chips
6. Build `<SlotPicker />` với 3-5 slot buttons
7. Build `<BookingConfirm />` summary card
8. Build `<BookingForm />` với React Hook Form + Zod
9. Build `<BookingThankYou />` với animated checkmark
10. State machine: useReducer cho transitions (NEXT, BACK, SUBMIT, RESET)
11. Wire fetch availability từ Phase 07 API
12. Wire submit → POST /api/book
13. Optimistic UI: show pending state on submit, rollback on error
14. Animate step transitions với AnimatePresence
15. A11y: form labels, aria-live cho step changes, focus management
16. Test mobile (320px), tablet, desktop
17. Test edge cases: no slots, all booked, network error

## Todo
- [ ] Types + Zod schema
- [ ] Phone VN formatter
- [ ] BookingProgress stepper
- [ ] DatePicker horizontal chips
- [ ] DateChip với states
- [ ] SlotPicker layout
- [ ] SlotButton component
- [ ] BookingConfirm summary
- [ ] BookingForm với RHF + Zod
- [ ] AnimatedCheckmark SVG
- [ ] BookingThankYou
- [ ] useReducer state machine
- [ ] Wire availability API
- [ ] Wire submit API
- [ ] Optimistic UI states
- [ ] Step transition animations
- [ ] Focus management on step change
- [ ] aria-live announcements
- [ ] Mobile responsive test
- [ ] Edge case testing (no slots, errors)

## Success Criteria
- Submit booking end-to-end works (mock or real API)
- Mobile UX: scroll smooth, all touch targets ≥ 48px
- No layout shift on step transitions
- Form validation: real-time, friendly errors
- Loading states không bị "stuck" (always có spinner hoặc skeleton)
- A11y: keyboard nav forward/back through all steps
- Reduced motion: transitions skip, instant step change
- Vietnamese inputs render đúng, dấu OK
- Phone formatter handle paste, typing, country code

## `marketing-psychology` Applied
- **Anchoring:** "20 phút" repeated → low commitment
- **Commitment escalation:** 4 small steps > 1 big form
- **Loss aversion:** "Còn 1 slot" tag tạo subtle urgency (chỉ khi thật)
- **Authority:** Step 5 thank-you mention "tôi sẽ liên hệ" - personal touch
- **Friction reduction:** required fields tối thiểu (2)

## Risks
- **Timezone bugs** - Server lưu UTC, hiển thị Asia/Ho_Chi_Minh. Phải test daylight saving (VN không có DST nhưng vẫn cẩn trọng)
- **Race condition booking** - 2 user đặt cùng slot → backend handle (Phase 07 unique constraint)
- **Form abandonment** - long form scares user → keep required minimal, show progress
- **Calendar permission UX** - "Lưu vào lịch" cần explain, không tự động download surprise

## Resolved (2026-05-09 PM)
- ✅ Working hours: **24/7**
- ✅ Slot interval: **30 phút** (9:00, 9:30, 10:00, 10:30...)
- ✅ Block rule: **2h forward**
- ✅ Captcha: **không cần v1**
- ✅ Email confirmation: **không gửi v1** - chỉ Zalo Notify
- ✅ Zalo Notify: **enable v1** cho owner + customer
- ✅ Form: minimal (Phone Zalo required + Email/Name/Note optional + consent checkbox)

## Next
→ Phase 07 (Supabase backend) - provide API endpoints này consume + Zalo Notify integration
→ Phase 08 (Animations polish) - refine micro-interactions
