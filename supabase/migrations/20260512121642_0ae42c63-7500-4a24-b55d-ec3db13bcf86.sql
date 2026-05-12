INSERT INTO public.festival_settings (theme_name, is_enabled, greeting_text, show_countdown, auto_enable_by_date, primary_color_override)
SELECT 'valentine', false, '💖 Happy Valentine''s Day! Celebrate love with our special offers.', false, false, '#ff69b4'
WHERE NOT EXISTS (
  SELECT 1 FROM public.festival_settings WHERE theme_name = 'valentine'
);