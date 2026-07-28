
-- 1. Drop is_admin from profiles (rely solely on user_roles)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;

-- 2. coupon_usage: remove client insert policy; RPC handles insert
DROP POLICY IF EXISTS "Users can insert their own coupon usage" ON public.coupon_usage;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id_input uuid, order_id_input uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_code text;
  v_uid uuid := auth.uid();
  v_order_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT code INTO v_code FROM public.coupons WHERE id = coupon_id_input;
  IF v_code IS NULL THEN
    RAISE EXCEPTION 'Coupon not found';
  END IF;

  -- Find a matching paid order for this user & coupon
  SELECT o.id INTO v_order_id
  FROM public.orders o
  WHERE o.user_id = v_uid
    AND o.coupon_code = v_code
    AND o.payment_status IN ('paid','completed','success')
    AND (order_id_input IS NULL OR o.id = order_id_input)
  ORDER BY o.created_at DESC
  LIMIT 1;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'No matching paid order for this coupon';
  END IF;

  -- Record usage (idempotent per user+coupon+order)
  INSERT INTO public.coupon_usage (coupon_id, user_id, order_id)
  VALUES (coupon_id_input, v_uid, v_order_id)
  ON CONFLICT DO NOTHING;

  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id_input;
END;
$$;

-- 3. referral_rewards: remove client insert policy (trigger inserts as SECURITY DEFINER, bypasses RLS)
DROP POLICY IF EXISTS "System can insert referral rewards" ON public.referral_rewards;

-- 4. Restrict SECURITY DEFINER functions to appropriate roles.
-- Trigger-only helpers: revoke from anon & authenticated (still usable by triggers/service_role)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_signup_bonus() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_order_loyalty_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_order_design_files() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_product_slug() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_loyalty_points(uuid, integer, text, text, uuid, text) FROM PUBLIC, anon, authenticated;

-- Auth-only RPCs: revoke from anon
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_all_customers() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_abandoned_cart_customers() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(uuid, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.reorder_products(uuid[]) FROM PUBLIC, anon;

-- has_role is used inside policies (runs as definer regardless of caller grants); block direct calls
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- 5. Storage: remove broad SELECT policies on public buckets (public URLs still resolve via CDN).
DROP POLICY IF EXISTS "Anyone can view ad images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Public view invite thumbnails" ON storage.objects;
