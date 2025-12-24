-- Add upload_config JSON field to products for admin-controlled uploads
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS upload_config JSONB DEFAULT '[]'::jsonb;

-- Create RLS policy for admin to update order items (for design approval)
CREATE POLICY "Admins can update order items" 
ON public.order_items 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for admin to delete order items
CREATE POLICY "Admins can delete order items" 
ON public.order_items 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for admin to delete orders
CREATE POLICY "Admins can delete orders" 
ON public.orders 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));