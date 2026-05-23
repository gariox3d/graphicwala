# Video Invitations Feature Plan

Ek complete "Video Invites" system jisme aap admin se categories/videos manage karoge, customers form bhar ke prepay karenge, aur 24hr me WhatsApp pe video deliver hoga.

## 1. Database (Supabase)

### Table: `invite_categories`
Admin se manage hone wali categories (Wedding, Birthday, Engagement, Anniversary, Grih Pravesh, Janmotsav, etc.)
- `name`, `slug`, `description`, `icon_emoji`, `display_order`, `is_active`

### Table: `invite_videos`
Har category ke andar multiple sample videos
- `category_id`, `title`, `thumbnail_url`, `youtube_url` (Shorts link), `price`, `description`, `display_order`, `is_active`

### Table: `invite_orders`
Customer ke filled invite orders
- `user_id`, `video_id`, `category_id`
- `customer_name`, `whatsapp_number`, `email`
- `form_data` (JSONB — saari fields: bride/groom name, programmes array, RSVP, compliments, religion type, custom fields)
- `amount`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
- `delivery_status` (pending / sent), `delivered_at`, `admin_notes`
- `created_at`, `expected_delivery_at` (created + 24hr)

### RLS
- Categories/Videos: public SELECT (active only), admin ALL
- Orders: user can view own paid orders; admin ALL; client INSERT blocked (same as orders table — edge function handles after Razorpay verify)

## 2. Edge Function: `invite-razorpay`
Existing `razorpay` function ke pattern par naya function jo:
- Create Razorpay order for invite
- Verify signature
- Insert invite_order with payment_status='paid'
- Trigger admin email alert + customer confirmation (Resend)

## 3. Admin Panel

### `/admin/invites` — Main hub with 3 tabs:
1. **Categories** — Add/Edit/Delete/Reorder categories
2. **Videos** — Add/Edit/Delete videos (thumbnail upload to storage, YouTube Shorts link, price)
3. **Orders** — All invite orders with full form data view, payment status, "Mark as Delivered" button, WhatsApp quick-send link

Sidebar me "Video Invites" link add karenge (Video icon).

## 4. Customer-Facing Pages

### `/invites` — Listing page
- Hero banner: "Custom Video Invitations — Delivered in 24 hours"
- Category chips/tabs filter
- Grid of video cards: thumbnail (YouTube preview), play overlay, title, price, "Order This Invite" button
- Prominent yellow note: **"⚠️ Prepaid only. Video will be delivered to your WhatsApp within 24 hours of payment."**

### `/invites/:videoId` — Detail + Form page
- Left: video preview (YouTube embed) + price
- Right: dynamic form with sections:

  **Event Type:** radio (Hindu / Muslim / Other) — only changes labels & default programmes; same form structure

  **Couple/Person details** (conditional based on category):
  - Wedding/Engagement/Anniversary: Bride Name, Groom Name (or shows "Dulhan/Dulha" for Hindu, "Bride/Groom" for Muslim — wording adapts)
  - Birthday/Janmotsav: Name, Age (optional)
  - Grih Pravesh: Family Name
  - Generic fallback: Name field

  **Programmes** (dynamic list with + Add Programme button):
  Each programme row: Programme Name, Date, Time, Venue, Notes
  Default templates per religion (e.g., Hindu wedding: Haldi, Mehndi, Sangeet, Wedding, Reception; Muslim wedding: Mehndi, Nikah, Walima, Reception). User can add/remove freely.

  **RSVP:** name + phone (optional multiple)

  **With Best Compliments From:** text field (multi-line / family member names)

  **Contact (required):**
  - Your Name
  - WhatsApp Number (10-digit, validated, used for delivery)
  - Email (for confirmation)

  **Special Instructions:** textarea (optional)

- Bottom: Price summary + **"Pay & Place Order"** button → opens Razorpay → on success → redirect to confirmation page

### `/invites/confirmation/:orderId`
- "Order received! Your video will arrive on WhatsApp +91XXXX within 24 hours."
- Countdown timer
- WhatsApp support button

## 5. Homepage Integration
Featured "Video Invitations" section block (after Categories or near Featured Products) — 2-3 sample video thumbnails + "Explore All Invites" CTA → `/invites`.

## 6. Form Dynamic Logic (one form, all religions/events)
- `eventType` (radio) controls default programme template and label wording
- "Add Programme" button — programmes are an array in form state, each item independently editable/removable
- Validation: at least name + WhatsApp number + 1 programme
- Religion is just a template selector — same data shape stored in JSONB

## Technical Details

**New files:**
- `src/pages/Invites.tsx` (listing)
- `src/pages/InviteDetail.tsx` (form + payment)
- `src/pages/InviteConfirmation.tsx`
- `src/pages/admin/AdminInvites.tsx` (3-tab admin)
- `src/components/invites/InviteForm.tsx`
- `src/components/invites/ProgrammeBuilder.tsx`
- `src/components/invites/VideoCard.tsx`
- `src/components/invites/InvitesHomeSection.tsx`
- `supabase/functions/invite-razorpay/index.ts`

**Routes added to `App.tsx`:** `/invites`, `/invites/:id`, `/invites/confirmation/:orderId`, `/admin/invites`

**Razorpay:** reuse existing `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` secrets.

**Storage:** new `invite-thumbnails` bucket for admin-uploaded thumbnails (or use existing `ad-images`).

**Mobile-first:** All pages fully responsive — form stacks single column on mobile, video stays on top.

**Programme templates (default suggestions):**
```text
Hindu Wedding:    Haldi, Mehndi, Sangeet, Wedding, Reception
Muslim Wedding:   Mehndi, Nikah, Walima, Reception
Engagement:       Engagement Ceremony
Birthday:         Birthday Party
Grih Pravesh:     Pooja, Lunch
Anniversary:      Celebration
```
User can fully customize.

---

Approve karein to main pehle migration banata hoon, phir code likhta hoon.