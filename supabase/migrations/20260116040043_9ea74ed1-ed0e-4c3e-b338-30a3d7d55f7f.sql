-- Add delivery settings columns to store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS delivery_time_text text DEFAULT '🚚 Estimated Delivery: 5–7 working days

Orders are dispatched after quality checks.
In rare cases, delivery may take slightly longer due to logistics or regional delays.',
ADD COLUMN IF NOT EXISTS delivery_disclaimer_enabled boolean DEFAULT true;