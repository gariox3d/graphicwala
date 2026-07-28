REVOKE ALL ON FUNCTION public.reorder_products(uuid[]) FROM anon;
REVOKE ALL ON FUNCTION public.reorder_products(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reorder_products(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_products(uuid[]) TO service_role;