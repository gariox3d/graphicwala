
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE (
  total_orders BIGINT,
  total_customers BIGINT,
  total_products BIGINT,
  total_reviews BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    (SELECT COUNT(*) FROM orders WHERE payment_status = 'paid') as total_orders,
    (SELECT COUNT(DISTINCT user_id) FROM orders WHERE payment_status = 'paid') as total_customers,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    (SELECT COUNT(*) FROM reviews) as total_reviews;
$$;
