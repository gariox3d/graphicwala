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
SET search_path TO 'public', 'storage'
AS $$
  SELECT
    o.owner as user_id,
    COALESCE(NULLIF(p.full_name, ''), 'Unknown') as full_name,
    COALESCE(NULLIF(p.phone, ''), '') as phone,
    COALESCE(a.email, '') as email,
    COUNT(*)::bigint as cart_items_count,
    MAX(o.created_at) as last_upload_at
  FROM storage.objects o
  LEFT JOIN public.profiles p ON p.user_id = o.owner
  LEFT JOIN auth.users a ON a.id = o.owner
  WHERE o.bucket_id = 'customer-designs'
    AND has_role(auth.uid(), 'admin'::app_role)
    AND NOT EXISTS (
      SELECT 1
      FROM public.orders ord
      WHERE ord.user_id = o.owner
        AND ord.payment_status = 'paid'
    )
  GROUP BY o.owner, p.full_name, p.phone, a.email
  ORDER BY MAX(o.created_at) DESC;
$$;