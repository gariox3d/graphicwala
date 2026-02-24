
-- Loyalty Points System
CREATE TABLE public.loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL DEFAULT 0,
  type text NOT NULL, -- 'earned', 'redeemed', 'expired'
  source text NOT NULL, -- 'order', 'referral', 'review', 'signup', 'redemption'
  reference_id uuid, -- order_id or review_id
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Summary table for quick balance lookup
CREATE TABLE public.loyalty_balances (
  user_id uuid PRIMARY KEY,
  total_earned integer NOT NULL DEFAULT 0,
  total_redeemed integer NOT NULL DEFAULT 0,
  current_balance integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, platinum
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Loyalty settings (admin configurable)
CREATE TABLE public.loyalty_settings (
  id text PRIMARY KEY DEFAULT 'default',
  enabled boolean NOT NULL DEFAULT true,
  points_per_rupee numeric NOT NULL DEFAULT 1, -- 1 point per ₹1 spent
  min_redeem_points integer NOT NULL DEFAULT 100,
  points_value_rupees numeric NOT NULL DEFAULT 0.10, -- 1 point = ₹0.10
  signup_bonus integer NOT NULL DEFAULT 50,
  review_bonus integer NOT NULL DEFAULT 20,
  silver_threshold integer NOT NULL DEFAULT 500,
  gold_threshold integer NOT NULL DEFAULT 2000,
  platinum_threshold integer NOT NULL DEFAULT 5000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.loyalty_settings (id) VALUES ('default');

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

-- Loyalty Points policies
CREATE POLICY "Users can view their own points" ON public.loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all points" ON public.loyalty_points FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Loyalty Balances policies
CREATE POLICY "Users can view their own balance" ON public.loyalty_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all balances" ON public.loyalty_balances FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Loyalty Settings policies
CREATE POLICY "Anyone can view loyalty settings" ON public.loyalty_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage loyalty settings" ON public.loyalty_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to add loyalty points and update balance
CREATE OR REPLACE FUNCTION public.add_loyalty_points(
  p_user_id uuid,
  p_points integer,
  p_type text,
  p_source text,
  p_reference_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings loyalty_settings%ROWTYPE;
  v_new_total integer;
  v_tier text;
BEGIN
  SELECT * INTO v_settings FROM loyalty_settings WHERE id = 'default';
  IF NOT v_settings.enabled THEN RETURN; END IF;

  -- Insert points record
  INSERT INTO loyalty_points (user_id, points, type, source, reference_id, description)
  VALUES (p_user_id, p_points, p_type, p_source, p_reference_id, p_description);

  -- Upsert balance
  INSERT INTO loyalty_balances (user_id, total_earned, total_redeemed, current_balance, updated_at)
  VALUES (
    p_user_id,
    CASE WHEN p_type = 'earned' THEN p_points ELSE 0 END,
    CASE WHEN p_type = 'redeemed' THEN p_points ELSE 0 END,
    CASE WHEN p_type = 'earned' THEN p_points ELSE -p_points END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_earned = loyalty_balances.total_earned + CASE WHEN p_type = 'earned' THEN p_points ELSE 0 END,
    total_redeemed = loyalty_balances.total_redeemed + CASE WHEN p_type = 'redeemed' THEN p_points ELSE 0 END,
    current_balance = loyalty_balances.current_balance + CASE WHEN p_type = 'earned' THEN p_points ELSE -p_points END,
    updated_at = now();

  -- Update tier
  SELECT current_balance INTO v_new_total FROM loyalty_balances WHERE user_id = p_user_id;
  
  IF v_new_total >= v_settings.platinum_threshold THEN v_tier := 'platinum';
  ELSIF v_new_total >= v_settings.gold_threshold THEN v_tier := 'gold';
  ELSIF v_new_total >= v_settings.silver_threshold THEN v_tier := 'silver';
  ELSE v_tier := 'bronze';
  END IF;

  UPDATE loyalty_balances SET tier = v_tier WHERE user_id = p_user_id;
END;
$$;

-- Trigger: auto-award points on paid order
CREATE OR REPLACE FUNCTION public.award_order_loyalty_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings loyalty_settings%ROWTYPE;
  v_points integer;
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid') THEN
    SELECT * INTO v_settings FROM loyalty_settings WHERE id = 'default';
    IF v_settings.enabled THEN
      v_points := floor(NEW.total_amount * v_settings.points_per_rupee);
      IF v_points > 0 THEN
        PERFORM add_loyalty_points(NEW.user_id, v_points, 'earned', 'order', NEW.id, 
          'Points earned on order ₹' || NEW.total_amount);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_award_loyalty_points
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.award_order_loyalty_points();

-- Update timestamp trigger for loyalty_settings
CREATE TRIGGER update_loyalty_settings_updated_at
BEFORE UPDATE ON public.loyalty_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
