
-- 1. Update referral bonus trigger to give points instead of ₹50
CREATE OR REPLACE FUNCTION public.award_signup_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_settings loyalty_settings%ROWTYPE;
  v_referrer_id uuid;
  v_referral_bonus integer := 100; -- 100 points as referral bonus
BEGIN
  SELECT * INTO v_settings FROM loyalty_settings WHERE id = 'default';
  IF NOT v_settings.enabled THEN RETURN NEW; END IF;

  -- Award signup bonus to new user
  IF v_settings.signup_bonus > 0 THEN
    PERFORM add_loyalty_points(NEW.user_id, v_settings.signup_bonus, 'earned', 'signup', NULL, 'Welcome signup bonus 🎉');
  END IF;

  -- Handle referral if referred_by is set
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by != '' THEN
    SELECT user_id INTO v_referrer_id FROM referral_codes WHERE code = NEW.referred_by;
    
    IF v_referrer_id IS NOT NULL AND v_referrer_id != NEW.user_id THEN
      -- Create referral reward record (store points, not rupees)
      INSERT INTO referral_rewards (referrer_id, referee_id, referrer_reward, referee_reward, status)
      VALUES (v_referrer_id, NEW.user_id, v_referral_bonus, v_referral_bonus, 'completed');
      
      -- Award referral points to referrer
      PERFORM add_loyalty_points(v_referrer_id, v_referral_bonus, 'earned', 'referral', NEW.user_id::uuid, 'Referral bonus - friend signed up! 🎁');
      
      -- Award referral points to new user  
      PERFORM add_loyalty_points(NEW.user_id, v_referral_bonus, 'earned', 'referral', v_referrer_id::uuid, 'Referral welcome bonus! 🎁');
      
      -- Update referrer stats (total_earnings in points now)
      UPDATE referral_codes 
      SET total_referrals = total_referrals + 1, 
          total_earnings = total_earnings + v_referral_bonus
      WHERE user_id = v_referrer_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Create admin function to delete a user (profile + related data)
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can call this
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete related data
  DELETE FROM cart_item_uploads WHERE user_id = p_user_id;
  DELETE FROM cart_items WHERE user_id = p_user_id;
  DELETE FROM wishlists WHERE user_id = p_user_id;
  DELETE FROM loyalty_points WHERE user_id = p_user_id;
  DELETE FROM loyalty_balances WHERE user_id = p_user_id;
  DELETE FROM referral_rewards WHERE referrer_id = p_user_id OR referee_id = p_user_id;
  DELETE FROM referral_codes WHERE user_id = p_user_id;
  DELETE FROM reviews WHERE user_id = p_user_id;
  DELETE FROM coupon_usage WHERE user_id = p_user_id;
  DELETE FROM customer_gallery WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE user_id = p_user_id;
  DELETE FROM user_roles WHERE user_id = p_user_id;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- 3. Create store pickup earnings table
CREATE TABLE public.store_pickup_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text,
  items_description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE public.store_pickup_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pickup earnings"
ON public.store_pickup_earnings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
