DROP FUNCTION IF EXISTS public.get_abandoned_cart_customers();

CREATE OR REPLACE FUNCTION public.get_abandoned_cart_customers()
 RETURNS TABLE(
   user_id uuid,
   full_name text,
   phone text,
   email text,
   cart_items_count bigint,
   last_upload_at timestamp with time zone,
   latest_product_id uuid,
   latest_product_name text,
   uploaded_products text
 )
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage'
AS $function$
  WITH abandoned_uploads AS (
    SELECT
      o.owner AS user_id,
      COUNT(*)::bigint AS cart_items_count,
      MAX(o.created_at) AS last_upload_at
    FROM storage.objects o
    WHERE o.bucket_id = 'customer-designs'
      AND NOT EXISTS (
        SELECT 1
        FROM public.orders ord
        WHERE ord.user_id = o.owner
          AND ord.payment_status = 'paid'
      )
    GROUP BY o.owner
  ),
  latest_cart_upload AS (
    SELECT DISTINCT ON (ciu.user_id)
      ciu.user_id,
      ciu.product_id AS latest_product_id,
      COALESCE(NULLIF(p.name, ''), 'Custom Product') AS latest_product_name
    FROM public.cart_item_uploads ciu
    LEFT JOIN public.products p ON p.id = ciu.product_id
    ORDER BY ciu.user_id, ciu.created_at DESC
  ),
  uploaded_product_list AS (
    SELECT
      ciu.user_id,
      string_agg(
        DISTINCT COALESCE(NULLIF(p.name, ''), 'Custom Product'),
        ', ' ORDER BY COALESCE(NULLIF(p.name, ''), 'Custom Product')
      ) AS uploaded_products
    FROM public.cart_item_uploads ciu
    LEFT JOIN public.products p ON p.id = ciu.product_id
    GROUP BY ciu.user_id
  )
  SELECT
    au.user_id,
    COALESCE(NULLIF(pr.full_name, ''), 'Unknown') AS full_name,
    COALESCE(NULLIF(pr.phone, ''), '') AS phone,
    COALESCE(auz.email, '') AS email,
    au.cart_items_count,
    au.last_upload_at,
    lcu.latest_product_id,
    lcu.latest_product_name,
    upl.uploaded_products
  FROM abandoned_uploads au
  LEFT JOIN public.profiles pr ON pr.user_id = au.user_id
  LEFT JOIN auth.users auz ON auz.id = au.user_id
  LEFT JOIN latest_cart_upload lcu ON lcu.user_id = au.user_id
  LEFT JOIN uploaded_product_list upl ON upl.user_id = au.user_id
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY au.last_upload_at DESC;
$function$;