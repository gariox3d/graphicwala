
-- Function to award signup bonus and handle referral on new profile creation
CREATE OR REPLACE FUNCTION public.award_signup_bonus()
RETURNS TRIGGER AS $$
DECLARE
  v_settings loyalty_settings%ROWTYPE;
  v_referrer_id uuid;
BEGIN
  SELECT * INTO v_settings FROM loyalty_settings WHERE id = 'default';
  IF NOT v_settings.enabled THEN RETURN NEW; END IF;

  -- Award signup bonus to new user
  IF v_settings.signup_bonus > 0 THEN
    PERFORM add_loyalty_points(NEW.user_id, v_settings.signup_bonus, 'earned', 'signup', NULL, 'Welcome signup bonus 🎉');
  END IF;

  -- Handle referral if referred_by is set
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by != '' THEN
    -- Get referrer user_id from code
    SELECT user_id INTO v_referrer_id FROM referral_codes WHERE code = NEW.referred_by;
    
    IF v_referrer_id IS NOT NULL AND v_referrer_id != NEW.user_id THEN
      -- Create referral reward record
      INSERT INTO referral_rewards (referrer_id, referee_id, referrer_reward, referee_reward, status)
      VALUES (v_referrer_id, NEW.user_id, 50, 50, 'completed');
      
      -- Award referral bonus to referrer
      PERFORM add_loyalty_points(v_referrer_id, 50, 'earned', 'referral', NEW.user_id::uuid, 'Referral bonus - friend signed up! 🎁');
      
      -- Award referral bonus to new user  
      PERFORM add_loyalty_points(NEW.user_id, 50, 'earned', 'referral', v_referrer_id::uuid, 'Referral welcome bonus ₹50! 🎁');
      
      -- Update referrer stats
      UPDATE referral_codes 
      SET total_referrals = total_referrals + 1, 
          total_earnings = total_earnings + 50
      WHERE user_id = v_referrer_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on profile creation (fires after handle_new_user creates the profile)
CREATE TRIGGER on_profile_created_award_bonus
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.award_signup_bonus();
