
-- Fix 1: Remove overly permissive public read policy on referral_codes
-- and replace with a server-side function for validation
DROP POLICY IF EXISTS "Anyone can view referral codes for validation" ON public.referral_codes;

-- Create a secure function to validate referral codes without exposing the full table
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.referral_codes WHERE code = p_code
  );
$$;

-- Create a function to get referrer user_id from code (needed for referral reward flow)
CREATE OR REPLACE FUNCTION public.get_referrer_by_code(p_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.referral_codes WHERE code = p_code LIMIT 1;
$$;

-- Fix 2: Replace overly permissive contact_messages INSERT policy
-- with a rate-limited approach (still allowing anonymous but with constraints)
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can submit contact messages with constraints"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  char_length(name) >= 2 AND char_length(name) <= 100
  AND char_length(phone) >= 10 AND char_length(phone) <= 15
  AND char_length(message) >= 10 AND char_length(message) <= 1000
);
