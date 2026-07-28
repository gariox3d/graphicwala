CREATE OR REPLACE FUNCTION public.reorder_products(_product_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  IF COALESCE(array_length(_product_ids, 1), 0) <> (SELECT count(*) FROM public.products) THEN
    RAISE EXCEPTION 'The complete product list is required';
  END IF;

  IF (SELECT count(DISTINCT product_id) FROM unnest(_product_ids) AS product_id)
     <> COALESCE(array_length(_product_ids, 1), 0) THEN
    RAISE EXCEPTION 'Duplicate product IDs are not allowed';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(_product_ids) AS product_id
    LEFT JOIN public.products ON products.id = product_id
    WHERE products.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Unknown product ID';
  END IF;

  UPDATE public.products AS product
  SET display_order = ordered.position
  FROM unnest(_product_ids) WITH ORDINALITY AS ordered(product_id, position)
  WHERE product.id = ordered.product_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_products(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reorder_products(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_products(uuid[]) TO service_role;