
-- Add flash sale fields to products
ALTER TABLE public.products
ADD COLUMN sale_price numeric DEFAULT NULL,
ADD COLUMN sale_start timestamp with time zone DEFAULT NULL,
ADD COLUMN sale_end timestamp with time zone DEFAULT NULL;

-- Create customer gallery table
CREATE TABLE public.customer_gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  customer_name text NOT NULL DEFAULT 'Happy Customer',
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_gallery ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved gallery items
CREATE POLICY "Anyone can view approved gallery" ON public.customer_gallery
FOR SELECT USING (is_approved = true);

-- Users can submit their own photos
CREATE POLICY "Users can submit gallery photos" ON public.customer_gallery
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.customer_gallery
FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "Users can delete own gallery" ON public.customer_gallery
FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all
CREATE POLICY "Admins can manage gallery" ON public.customer_gallery
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for gallery
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-gallery', 'customer-gallery', true);

-- Storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery images" ON storage.objects
FOR SELECT USING (bucket_id = 'customer-gallery');

CREATE POLICY "Authenticated users can upload gallery images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'customer-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own gallery images" ON storage.objects
FOR DELETE USING (bucket_id = 'customer-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
