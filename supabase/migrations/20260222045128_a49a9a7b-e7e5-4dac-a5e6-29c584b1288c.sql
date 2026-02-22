
CREATE OR REPLACE FUNCTION public.get_all_customers()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  phone text,
  email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.user_id,
    COALESCE(NULLIF(p.full_name, ''), o.customer_name) as full_name,
    COALESCE(NULLIF(p.phone, ''), o.shipping_phone) as phone,
    COALESCE(a.email, o.email) as email
  FROM profiles p
  LEFT JOIN auth.users a ON a.id = p.user_id
  LEFT JOIN LATERAL (
    SELECT DISTINCT ON (orders.user_id) 
      orders.customer_name, orders.shipping_phone, orders.email
    FROM orders 
    WHERE orders.user_id = p.user_id
    ORDER BY orders.user_id, orders.created_at DESC
  ) o ON true
  WHERE has_role(auth.uid(), 'admin'::app_role);
$$;
