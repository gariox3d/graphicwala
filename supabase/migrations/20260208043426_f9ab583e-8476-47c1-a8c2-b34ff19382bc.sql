
-- Create function to increment coupon usage count
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id_input UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons 
  SET used_count = used_count + 1 
  WHERE id = coupon_id_input;
END;
$$;

-- Allow insert on coupon_usage for authenticated users (for their own records)
CREATE POLICY "Users can insert their own coupon usage"
ON public.coupon_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);
