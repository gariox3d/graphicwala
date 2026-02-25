
-- Before/After showcase table for admin to show customer design vs final product
CREATE TABLE public.before_after_showcase (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT 'Happy Customer',
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  caption TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.before_after_showcase ENABLE ROW LEVEL SECURITY;

-- Anyone can view active showcases
CREATE POLICY "Anyone can view active showcases" ON public.before_after_showcase
  FOR SELECT USING (is_active = true);

-- Admins can manage showcases
CREATE POLICY "Admins can manage showcases" ON public.before_after_showcase
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
