-- Add weight and dimensions to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS length_cm numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS breadth_cm numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS height_cm numeric DEFAULT 5;

-- Add pickup pincode and Shiprocket settings to store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS pickup_pincode text DEFAULT '854105',
ADD COLUMN IF NOT EXISTS shiprocket_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS shiprocket_fallback_message text DEFAULT 'Delivery estimate unavailable for your location. Standard delivery: 5-7 working days.';

-- Add shiprocket related fields to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
ADD COLUMN IF NOT EXISTS shiprocket_shipment_id text,
ADD COLUMN IF NOT EXISTS shiprocket_courier_name text,
ADD COLUMN IF NOT EXISTS shiprocket_awb text;