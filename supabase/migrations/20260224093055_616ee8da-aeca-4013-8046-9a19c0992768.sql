
-- Custom ads/banners table
CREATE TABLE public.custom_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id TEXT NOT NULL, -- e.g. 'homepage_after_hero', 'homepage_mid', 'sidebar'
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  link_url TEXT, -- optional click destination
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  slot_width INTEGER NOT NULL DEFAULT 728, -- recommended width in px
  slot_height INTEGER NOT NULL DEFAULT 90, -- recommended height in px
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ads" ON public.custom_ads
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage ads" ON public.custom_ads
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_custom_ads_updated_at
  BEFORE UPDATE ON public.custom_ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);

CREATE POLICY "Anyone can view ad images" ON storage.objects
  FOR SELECT USING (bucket_id = 'ad-images');

CREATE POLICY "Admins can upload ad images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ad images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'ad-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ad images" ON storage.objects
  FOR DELETE USING (bucket_id = 'ad-images' AND has_role(auth.uid(), 'admin'::app_role));
