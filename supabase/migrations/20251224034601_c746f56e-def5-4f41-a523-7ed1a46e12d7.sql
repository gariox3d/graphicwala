-- Add customization fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS customization_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS front_upload_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS back_upload_enabled boolean DEFAULT false;

-- Add new fields to orders table for enhanced customer details
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS landmark text,
ADD COLUMN IF NOT EXISTS order_notes text;

-- Add design upload URLs to order_items table
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS front_design_url text,
ADD COLUMN IF NOT EXISTS back_design_url text,
ADD COLUMN IF NOT EXISTS design_approval_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS admin_preview_url text;

-- Create storage bucket for customer design uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-designs', 'customer-designs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for customer-designs bucket
CREATE POLICY "Users can upload their own designs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'customer-designs' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view designs"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-designs');

CREATE POLICY "Users can update their own designs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'customer-designs'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own designs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'customer-designs'
  AND auth.uid() IS NOT NULL
);

-- Allow admins full access to customer designs
CREATE POLICY "Admins can manage all designs"
ON storage.objects FOR ALL
USING (
  bucket_id = 'customer-designs'
  AND has_role(auth.uid(), 'admin'::app_role)
);