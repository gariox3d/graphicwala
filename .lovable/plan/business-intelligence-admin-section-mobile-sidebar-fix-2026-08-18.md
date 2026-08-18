# Business Intelligence Admin Section + Mobile Sidebar Fix

## Goal
Add a new **Business Intelligence** section to the admin panel with advanced, non-duplicated insights, and fix the mobile admin sidebar scroll issue.

## Existing Analytics (do NOT duplicate)
- `/admin/analytics` already shows: revenue trend, daily orders, top selling products, order status pie, new customers, KPI cards, pickup earnings.
- `/admin/abandoned-carts` already lists abandoned carts.
- `trending_products` DB view already exists.

## New BI Insights to Add
1. **Sales & Profit Trend** — revenue line + estimated profit line (requires `cost_price`).
2. **Top Selling Products** — by quantity and revenue (existing Analytics shows qty; BI will add revenue ranking).
3. **Product Funnel** — Views → Cart Additions → Orders → Paid Purchases.
4. **Low-Conversion Products** — products with views/cart additions but low or zero paid sales.
5. **Abandoned Cart Value** — total potential revenue sitting in carts.
6. **Trending Products** — reuse existing `trending_products` view.
7. **7-Day Sales Forecast** — simple moving-average/linear forecast from last 14 days.
8. **Product-Wise Profit Analysis** — revenue, cost, estimated gross profit and margin per product.
9. **Customer Purchase Trends** — new vs. returning customers, order frequency, total customers.

## Supporting Changes

### Database Migration
- Add `cost_price numeric` (nullable) to `public.products`.
- Create `public.product_views` table:
  - `id uuid`, `product_id uuid`, `user_id uuid nullable`, `session_id text`, `created_at timestamptz`
  - RLS: anon + authenticated can INSERT; admin SELECT ALL.
- Grants and RLS as required.

### Product Form
- Add optional **Cost Price** input in `ProductForm.tsx`.

### Product Detail
- On mount, insert one lightweight row into `product_views` (throttled/debounced, once per product per session).

### New Page
- `src/pages/admin/AdminBusinessIntelligence.tsx`
- Lazy-loaded route `/admin/business-intelligence`.
- Loads data only when opened.
- Uses cards, charts, and tables; fast summary cards at top.

### Admin Layout
- Add sidebar link: **Business Intelligence** (icon: `Brain` or `BarChart3`).
- Fix mobile sidebar scrolling:
  - Use `h-[100dvh]` on mobile sidebar.
  - `min-h-0` on scrollable nav container.
  - `overscroll-y-contain` / `touch-pan-y`.
  - Bottom actions `shrink-0` so they never overlap.
  - No `overflow-x: hidden` that blocks vertical scroll.

## Files to Change
- `supabase/migrations/<new>.sql`
- `src/pages/admin/AdminBusinessIntelligence.tsx` (new)
- `src/pages/admin/ProductForm.tsx`
- `src/pages/ProductDetail.tsx`
- `src/App.tsx`
- `src/components/admin/AdminLayout.tsx`

## Notes
- `src/integrations/supabase/types.ts` is auto-generated and will not be hand-edited; code will use narrow local types + `as any` casts for the new columns/tables until types are regenerated.
- No existing admin design or features are removed.
