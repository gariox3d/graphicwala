-- Grant Data API access for product_views tracking table
GRANT SELECT, INSERT ON public.product_views TO anon;
GRANT SELECT, INSERT ON public.product_views TO authenticated;
GRANT ALL ON public.product_views TO service_role;