
-- Fix: Make view use invoker's permissions instead of definer
ALTER VIEW public.trending_products SET (security_invoker = on);
