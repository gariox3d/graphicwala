CREATE TABLE public.homepage_service_images (
  service_key text PRIMARY KEY,
  image_url text NOT NULL,
  storage_path text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT ON public.homepage_service_images TO anon, authenticated;
GRANT ALL ON public.homepage_service_images TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.homepage_service_images TO authenticated;

ALTER TABLE public.homepage_service_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Homepage service images are publicly readable"
ON public.homepage_service_images
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert homepage service images"
ON public.homepage_service_images
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update homepage service images"
ON public.homepage_service_images
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete homepage service images"
ON public.homepage_service_images
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_homepage_service_images_updated_at
BEFORE UPDATE ON public.homepage_service_images
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();