
-- Add bulk discount settings to store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS bulk_discount_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bulk_discount_min_qty integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS bulk_discount_percent numeric DEFAULT 10;

-- Update default row
UPDATE public.store_settings 
SET bulk_discount_enabled = false,
    bulk_discount_min_qty = 2,
    bulk_discount_percent = 10
WHERE id = 'default';

-- Create a view for trending products based on order frequency
CREATE OR REPLACE VIEW public.trending_products AS
SELECT 
  oi.product_id,
  COUNT(*) as order_count,
  SUM(oi.quantity) as total_sold
FROM public.order_items oi
JOIN public.orders o ON o.id = oi.order_id
WHERE o.payment_status = 'paid'
  AND o.created_at > now() - interval '90 days'
GROUP BY oi.product_id
ORDER BY total_sold DESC
LIMIT 10;

-- Allow anyone to read trending products view
GRANT SELECT ON public.trending_products TO anon, authenticated;
