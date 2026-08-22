-- 1. Coupons: restrict public SELECT to active, non-expired coupons
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- 2. Storage: enforce folder ownership on inserts
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-gallery'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- 3. Lock down SECURITY DEFINER functions that should not be callable via the API
REVOKE ALL ON FUNCTION public.add_loyalty_points(uuid, integer, text, text, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.award_order_loyalty_points() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.award_signup_bonus() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_order_design_files() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_public_profile() FROM PUBLIC, anon, authenticated;

-- Admin-only functions: signed-out users must not be able to call them
REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_all_customers() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_abandoned_cart_customers() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reorder_products(uuid[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.increment_coupon_usage(uuid, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_customers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_abandoned_cart_customers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_products(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(uuid, uuid) TO authenticated;

-- Keep public-facing helpers callable
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_referrer_by_code(text) TO anon, authenticated;