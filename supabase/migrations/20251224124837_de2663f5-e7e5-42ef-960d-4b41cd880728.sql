-- Create store_settings table for global settings
CREATE TABLE public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  default_delivery_charge NUMERIC DEFAULT 50,
  store_pickup_enabled BOOLEAN DEFAULT true,
  pickup_address TEXT DEFAULT 'Graphic Wala Shop, Main Road, Your City',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read store settings
CREATE POLICY "Anyone can view store settings"
ON public.store_settings FOR SELECT USING (true);

-- Only admins can update store settings
CREATE POLICY "Admins can update store settings"
ON public.store_settings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can insert store settings
CREATE POLICY "Admins can insert store settings"
ON public.store_settings FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default settings
INSERT INTO public.store_settings (id, default_delivery_charge, store_pickup_enabled, pickup_address)
VALUES ('default', 50, true, 'Graphic Wala Shop, Main Road');

-- Add delivery_charge column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT NULL;

-- Add delivery_method and delivery_charge to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'home_delivery';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 0;

-- Create trigger for updated_at on store_settings
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();