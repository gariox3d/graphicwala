-- Lock down order creation to server-side verification only
-- 1) Clean up any unpaid/abandoned orders created by the earlier bug
DELETE FROM public.order_item_uploads ou
USING public.order_items oi, public.orders o
WHERE ou.order_item_id = oi.id
  AND oi.order_id = o.id
  AND (o.payment_status IS DISTINCT FROM 'paid');

DELETE FROM public.order_items oi
USING public.orders o
WHERE oi.order_id = o.id
  AND (o.payment_status IS DISTINCT FROM 'paid');

DELETE FROM public.orders o
WHERE (o.payment_status IS DISTINCT FROM 'paid');

-- 2) Ensure defaults are correct
ALTER TABLE public.orders
  ALTER COLUMN payment_status SET DEFAULT 'pending',
  ALTER COLUMN status SET DEFAULT 'pending';

-- 3) Enforce allowed payment_status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_payment_status_allowed'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_status_allowed
      CHECK (payment_status IN ('pending','paid','failed'));
  END IF;
END $$;

-- 4) Remove client-side INSERT/UPDATE ability for orders and related rows
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order item uploads" ON public.order_item_uploads;

-- 5) Replace SELECT policies so users only ever see PAID data
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own paid orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id AND payment_status = 'paid');

DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own paid order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
      AND o.payment_status = 'paid'
  )
);

DROP POLICY IF EXISTS "Users can view their own order item uploads" ON public.order_item_uploads;
CREATE POLICY "Users can view their own paid order item uploads"
ON public.order_item_uploads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_uploads.order_item_id
      AND o.user_id = auth.uid()
      AND o.payment_status = 'paid'
  )
);
