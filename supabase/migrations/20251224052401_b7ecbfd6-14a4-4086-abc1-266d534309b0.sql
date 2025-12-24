-- Cart item uploads (for storing customer designs before checkout)
CREATE TABLE IF NOT EXISTS public.cart_item_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_item_id uuid NOT NULL REFERENCES public.cart_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  field_id text NOT NULL,
  label text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  file_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cart_item_id, field_id)
);

ALTER TABLE public.cart_item_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart uploads"
ON public.cart_item_uploads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart uploads"
ON public.cart_item_uploads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart uploads"
ON public.cart_item_uploads
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart uploads"
ON public.cart_item_uploads
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cart_item_uploads_cart_item_id ON public.cart_item_uploads(cart_item_id);
CREATE INDEX IF NOT EXISTS idx_cart_item_uploads_user_id ON public.cart_item_uploads(user_id);

-- Order item uploads (printing-ready canonical source)
CREATE TABLE IF NOT EXISTS public.order_item_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  field_id text NOT NULL,
  label text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  file_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_item_id, field_id)
);

ALTER TABLE public.order_item_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all order item uploads"
ON public.order_item_uploads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own order item uploads"
ON public.order_item_uploads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_uploads.order_item_id
      AND o.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own order item uploads"
ON public.order_item_uploads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_uploads.order_item_id
      AND o.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete order item uploads"
ON public.order_item_uploads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update order item uploads"
ON public.order_item_uploads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_order_item_uploads_order_item_id ON public.order_item_uploads(order_item_id);

-- Ensure orders status uses consistent values (no schema change, just note: handled in UI)
