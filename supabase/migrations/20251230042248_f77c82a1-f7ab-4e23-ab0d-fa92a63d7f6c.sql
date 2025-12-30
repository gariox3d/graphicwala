-- Add announcement banner fields to store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS announcement_text text,
ADD COLUMN IF NOT EXISTS announcement_enabled boolean DEFAULT false;