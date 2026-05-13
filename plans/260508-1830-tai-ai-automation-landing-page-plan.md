# Tai AI Automation Landing Page Plan

## Status
Planning only. No implementation yet.

## Goal
Build simple but polished NextJS landing page for "Tai AI Automation".
Main conversion: user reads page, books 20-minute 1-1 Meet demo, confirms slot, fills business info, submits.

## Skills Applied
- `ck:plan`: plan-only workflow.
- `ckm:design`: brand/layout/icon/design-system direction.
- `ckm:funnel`: LDP -> demo booking funnel.
- `ck:frontend-design`: responsive visual quality.
- `ck:frontend-development`: NextJS structure and implementation standards later.
- Note: `/ck:tech-graph` not available in current skills catalog. Plan will use a custom "tech graph" section with SVG/icon nodes.

## Brand Direction
- Brand: Tai AI Automation.
- Service: AI sales consulting automation, intelligent ChatbotAI, image recognition, sales closing support, marketing scheduler, ads management.
- Tone: premium, modern, technical, direct, business-focused.
- Main colors: deep navy, controlled violet, white, light blue surfaces.
- Avoid: generic purple gradient-only SaaS look, crowded cards, weak mobile layout.

## Page Structure
1. Hero
   - Brand name large and clear.
   - Promise: AI handles sales consultation, image recognition, and follow-up workflow.
   - CTA: "Dat lich Meet 1-1 xem demo".
   - Include owner photo area. Need user photo later.
   - Trust bullets: 20-minute demo, clear expectation setting, handover account/platform.

2. Problem / Insight
   - Manual inbox overload.
   - Customers ask repetitive questions.
   - Image-based buying intent is hard for normal chatbot.
   - Business needs automation but still needs clear limits.

3. Service Modules
   - ChatbotAI sales advisor.
   - Image recognition as core differentiator.
   - Product/business process knowledge base.
   - Multi-channel content scheduler.
   - Ads management support.
   - Reporting/dashboard overview.

4. Tech Graph Section
   - Visual graph with icons/nodes:
     Inbox -> Vision AI -> ChatbotAI -> Product Data -> CRM/Lead -> Scheduler -> Ads/Dashboard.
   - Use lucide or similar clean SVG icon system.
   - Purpose: make service architecture understandable fast.

5. Process / Collaboration Journey
   - Meet 1-1 demo.
   - Clarify expectations and chatbot capability boundary.
   - Collect business/shop/process info.
   - Propose solution and pricing.
   - Schedule presentation date.
   - Launch demo.
   - Handover 100% account, chatbot, platform.

6. Booking Section
   - Progressive flow, not overwhelming.
   - Step 1: choose date.
   - Step 2: choose suggested time slot.
   - Step 3: confirm.
   - Step 4: fill form.
   - Step 5: submit.

## Booking UX Rules
- Average Meet duration: 20 minutes.
- UX must not show too many slots.
- Show 3-5 recommended slots per selected day.
- Show next 4-7 available days, not a full calendar grid first.
- Disabled slot states must be obvious but not noisy.
- If someone books 14:00, block nearby slots until allowed next start time.
- Need confirm exact blocking rule before implementation:
  - Option A: block 2 hours, so 14:00 enables again from 16:00.
  - Option B: block 3 hours, so 14:00 enables again from 17:00.

## Supabase Architecture
- Table: `demo_bookings`
  - id
  - full_name
  - phone
  - email
  - business_name
  - business_type
  - expectation
  - meeting_start
  - meeting_end
  - status
  - created_at
- API route: availability by date.
- API route: create booking.
- Server-side Supabase client with service role key.
- Client never receives service role key.
- Conflict check before insert.
- RLS enabled; write via server route only.

## Form Fields
- Full name required.
- Phone required.
- Email optional.
- Business/shop name optional.
- Industry/service type optional.
- Biggest chatbot expectation optional.
- Optional later: website/fanpage URL.

## Visual Requirements
- Mobile-first layout.
- No horizontal scroll.
- Large touch targets, minimum 44-48px.
- Form inputs >=16px font to prevent mobile zoom.
- Hero must not use full `100vh`; next content should be hinted.
- Owner photo should be first viewport signal.
- Animations:
  - subtle reveal on scroll.
  - tech graph line pulse.
  - button hover/press feedback.
  - respect reduced motion.

## Implementation Phases
1. Confirm plan and blocking rule.
2. Scaffold NextJS app.
3. Create design tokens and global responsive layout.
4. Build landing sections.
5. Build tech graph/icon section.
6. Build booking UI only.
7. Add Supabase schema and API routes.
8. Validate mobile/desktop manually.
9. Run lint/build.

## Success Criteria
- Page feels premium and clear, not template-like.
- User understands service within first screen.
- CTA to book Meet appears early and near final booking section.
- Booking flow can submit to Supabase.
- Mobile version is not a compressed desktop page.
- Build passes before handoff.

## Open Questions
- Exact slot blocking rule: 2 hours or 3 hours after booked start?
- Do you have a real profile photo now, or should design reserve placeholder only?
- Preferred Meet platform: Google Meet, Zoom, Zalo call, or manual follow-up?
- Should booking create calendar invite automatically in v1, or later?
