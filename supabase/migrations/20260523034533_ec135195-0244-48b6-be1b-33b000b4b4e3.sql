
-- Categories
CREATE TABLE public.invite_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_emoji TEXT DEFAULT '🎉',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invite_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active invite categories"
  ON public.invite_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage invite categories"
  ON public.invite_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_invite_categories_updated
  BEFORE UPDATE ON public.invite_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Videos
CREATE TABLE public.invite_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.invite_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  youtube_url TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invite_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active invite videos"
  ON public.invite_videos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage invite videos"
  ON public.invite_videos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_invite_videos_updated
  BEFORE UPDATE ON public.invite_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_invite_videos_category ON public.invite_videos(category_id);

-- Orders
CREATE TABLE public.invite_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  video_id UUID REFERENCES public.invite_videos(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.invite_categories(id) ON DELETE SET NULL,
  video_title TEXT,
  customer_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  admin_notes TEXT,
  expected_delivery_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invite_orders ENABLE ROW LEVEL SECURITY;

-- Clients cannot insert; only edge function with service role can
CREATE POLICY "Users view own paid invite orders"
  ON public.invite_orders FOR SELECT
  USING (auth.uid() = user_id AND payment_status = 'paid');

CREATE POLICY "Admins view all invite orders"
  ON public.invite_orders FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update invite orders"
  ON public.invite_orders FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete invite orders"
  ON public.invite_orders FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_invite_orders_updated
  BEFORE UPDATE ON public.invite_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_invite_orders_user ON public.invite_orders(user_id);
CREATE INDEX idx_invite_orders_status ON public.invite_orders(payment_status, delivery_status);

-- Storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('invite-thumbnails', 'invite-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public view invite thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invite-thumbnails');

CREATE POLICY "Admins upload invite thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'invite-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update invite thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'invite-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete invite thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'invite-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed default categories
INSERT INTO public.invite_categories (name, slug, description, icon_emoji, display_order) VALUES
  ('Wedding', 'wedding', 'Hindu, Muslim & all wedding video invitations', '💍', 1),
  ('Engagement', 'engagement', 'Engagement ceremony video invitations', '💖', 2),
  ('Birthday', 'birthday', 'Birthday party video invitations', '🎂', 3),
  ('Anniversary', 'anniversary', 'Anniversary celebration video invitations', '💐', 4),
  ('Grih Pravesh', 'grih-pravesh', 'House warming video invitations', '🏡', 5),
  ('Janmotsav', 'janmotsav', 'Religious birth celebration video invitations', '🌸', 6);
