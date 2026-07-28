
-- Revoke from PUBLIC on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_signup_bonus() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_order_loyalty_points() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_order_design_files() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_product_slug() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_loyalty_points(uuid, integer, text, text, uuid, text) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_all_customers() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_abandoned_cart_customers() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reorder_products(uuid[]) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_public_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_referrer_by_code(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_referral_code(text) FROM PUBLIC;

-- Grant execute back only to intended roles
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_customers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_abandoned_cart_customers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_products(uuid[]) TO authenticated;

-- Public-facing lookups (used by unauthenticated referral entry & stats counter)
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_referrer_by_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;

-- Drop the old single-arg increment_coupon_usage (superseded by 2-arg version)
DROP FUNCTION IF EXISTS public.increment_coupon_usage(uuid);
