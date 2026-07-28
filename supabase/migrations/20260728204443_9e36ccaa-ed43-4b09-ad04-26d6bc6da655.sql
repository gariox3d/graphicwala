
CREATE TABLE public.password_reset_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_otps_email ON public.password_reset_otps(email, created_at DESC);

GRANT ALL ON public.password_reset_otps TO service_role;

ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: only service_role (edge functions) may access.
