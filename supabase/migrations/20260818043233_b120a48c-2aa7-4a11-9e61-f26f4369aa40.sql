-- Add optional cost price to products for profit analysis
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS cost_price numeric;

-- Create product views table for funnel analytics
CREATE TABLE IF NOT EXISTS public.product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for fast BI queries
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON public.product_views(created_at);
CREATE INDEX IF NOT EXISTS idx_product_views_product_created ON public.product_views(product_id, created_at);

-- Grants: anon/authenticated can insert views; admins manage all
GRANT INSERT ON public.product_views TO anon, authenticated;
GRANT SELECT, DELETE ON public.product_views TO authenticated;
GRANT ALL ON public.product_views TO service_role;

-- RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view (anonymous tracking)
CREATE POLICY "Anyone can record product views"
ON public.product_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read all views
CREATE POLICY "Admins can read product views"
ON public.product_views
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admins can delete old view data
CREATE POLICY "Admins can delete product views"
ON public.product_views
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Update trigger for product_views updated_at is not needed (no updated_at column)
