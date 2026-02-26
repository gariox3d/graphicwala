
CREATE OR REPLACE FUNCTION public.get_abandoned_cart_customers()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  phone text,
  email text,
  cart_items_count bigint,
  last_upload_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ci.user_id,
    COALESCE(NULLIF(p.full_name, ''), 'Unknown') as full_name,
    COALESCE(NULLIF(p.phone, ''), '') as phone,
    COALESCE(a.email, '') as email,
    COUNT(DISTINCT ci.id) as cart_items_count,
    MAX(ciu.created_at) as last_upload_at
  FROM cart_items ci
  INNER JOIN cart_item_uploads ciu ON ciu.cart_item_id = ci.id
  LEFT JOIN profiles p ON p.user_id = ci.user_id
  LEFT JOIN auth.users a ON a.id = ci.user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = ci.user_id 
    AND o.payment_status = 'paid'
    AND o.created_at > ci.created_at
  )
  AND has_role(auth.uid(), 'admin'::app_role)
  GROUP BY ci.user_id, p.full_name, p.phone, a.email
  ORDER BY MAX(ciu.created_at) DESC;
$$;
