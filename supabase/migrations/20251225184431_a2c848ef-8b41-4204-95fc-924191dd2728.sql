-- Add image_urls column for multiple product images
ALTER TABLE public.products 
ADD COLUMN image_urls jsonb DEFAULT '[]'::jsonb;

-- Migrate existing single image_url to image_urls array
UPDATE public.products 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE image_urls = '[]'::jsonb OR image_urls IS NULL;