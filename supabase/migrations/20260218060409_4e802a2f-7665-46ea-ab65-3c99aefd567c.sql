
-- Create festival_settings table for dynamic festival theme management
CREATE TABLE public.festival_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_name text NOT NULL DEFAULT 'ramadan',
  is_enabled boolean NOT NULL DEFAULT false,
  start_date date,
  end_date date,
  greeting_text text DEFAULT '🌙 Ramadan Mubarak! May this holy month bring peace and blessings to you and your family.',
  banner_image_url text,
  show_countdown boolean NOT NULL DEFAULT true,
  auto_enable_by_date boolean NOT NULL DEFAULT false,
  primary_color_override text DEFAULT '#d4a017',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.festival_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view festival settings (for frontend rendering)
CREATE POLICY "Anyone can view festival settings"
  ON public.festival_settings
  FOR SELECT
  USING (true);

-- Only admins can manage festival settings
CREATE POLICY "Admins can manage festival settings"
  ON public.festival_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default Ramadan settings
INSERT INTO public.festival_settings (theme_name, is_enabled, greeting_text, show_countdown, auto_enable_by_date)
VALUES ('ramadan', false, '🌙 Ramadan Mubarak! May this holy month bring peace and blessings to you and your family.', true, false);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_festival_settings_updated_at
  BEFORE UPDATE ON public.festival_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
