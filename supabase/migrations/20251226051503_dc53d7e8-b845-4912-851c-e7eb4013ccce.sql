-- Add delivery settings fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cutoff_time TIME DEFAULT '18:00:00',
ADD COLUMN IF NOT EXISTS enable_delivery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_days INTEGER DEFAULT 7;

-- Set default values for existing products
UPDATE public.products 
SET cutoff_time = '18:00:00', 
    enable_delivery = true,
    delivery_days = 7
WHERE cutoff_time IS NULL OR enable_delivery IS NULL;

-- Add delivery_days_used and estimated_delivery_date to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_days_used INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- Update existing orders to have delivery_days_used = 7
UPDATE public.orders SET delivery_days_used = 7 WHERE delivery_days_used IS NULL;