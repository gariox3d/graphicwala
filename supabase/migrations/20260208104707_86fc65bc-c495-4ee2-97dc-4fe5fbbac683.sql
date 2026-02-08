
-- Wishlist table
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
ON public.wishlists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
ON public.wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist"
ON public.wishlists FOR DELETE
USING (auth.uid() = user_id);

-- Referral system tables
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral code"
ON public.referral_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
ON public.referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view referral codes for validation"
ON public.referral_codes FOR SELECT
USING (true);

CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  referrer_reward NUMERIC NOT NULL DEFAULT 50,
  referee_reward NUMERIC NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral rewards"
ON public.referral_rewards FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can insert referral rewards"
ON public.referral_rewards FOR INSERT
WITH CHECK (auth.uid() = referee_id);

CREATE POLICY "Admins can manage referral rewards"
ON public.referral_rewards FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add referred_by column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'GW' || upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.user_id, new_code)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code on profile creation
CREATE TRIGGER generate_referral_code_on_signup
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();
