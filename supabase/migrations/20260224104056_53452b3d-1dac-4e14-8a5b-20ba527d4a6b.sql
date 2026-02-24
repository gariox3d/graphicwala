
CREATE OR REPLACE FUNCTION public.get_public_stats()
 RETURNS TABLE(total_orders bigint, total_customers bigint, total_products bigint, total_reviews bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    (SELECT COUNT(*) FROM orders WHERE payment_status = 'paid') as total_orders,
    (SELECT COUNT(*) FROM (
      SELECT user_id FROM orders WHERE payment_status = 'paid'
      UNION
      SELECT user_id FROM reviews WHERE rating >= 4
    ) combined) as total_customers,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    (SELECT COUNT(*) FROM reviews) as total_reviews;
$function$;
