ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS service_group text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS price_starting_from boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_order_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD CONSTRAINT products_service_group_check
  CHECK (service_group IS NULL OR service_group IN ('DESIGN','PRINT','CUSTOMIZE'));
ALTER TABLE public.products ADD CONSTRAINT products_short_description_length
  CHECK (short_description IS NULL OR char_length(short_description) <= 300);