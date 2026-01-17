-- Add return policy settings columns to store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS whatsapp_support_number text DEFAULT '+916207142994',
ADD COLUMN IF NOT EXISTS return_policy_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS return_window_hours integer DEFAULT 48;