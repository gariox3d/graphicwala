CREATE OR REPLACE FUNCTION public.track_order(p_order_id text, p_phone text)
RETURNS TABLE (
  id uuid,
  customer_name text,
  status text,
  payment_status text,
  total_amount numeric,
  delivery_charge numeric,
  delivery_method text,
  estimated_delivery_date date,
  created_at timestamptz,
  updated_at timestamptz,
  items jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text;
  v_id uuid;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  IF length(v_phone) < 10 THEN
    RETURN;
  END IF;
  v_phone := right(v_phone, 10);

  BEGIN
    v_id := p_order_id::uuid;
  EXCEPTION WHEN others THEN
    RETURN;
  END;

  RETURN QUERY
  SELECT
    o.id,
    o.customer_name,
    o.status,
    o.payment_status,
    o.total_amount,
    o.delivery_charge,
    o.delivery_method,
    o.estimated_delivery_date,
    o.created_at,
    o.updated_at,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', oi.product_name, 'quantity', oi.quantity))
      FROM public.order_items oi
      WHERE oi.order_id = o.id
    ), '[]'::jsonb)
  FROM public.orders o
  WHERE o.id = v_id
    AND right(regexp_replace(coalesce(o.shipping_phone, ''), '\D', '', 'g'), 10) = v_phone
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.track_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;