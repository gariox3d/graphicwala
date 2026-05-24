ALTER TABLE public.invite_categories
ADD COLUMN IF NOT EXISTS form_schema jsonb NOT NULL DEFAULT '{"hindu":[],"muslim":[],"other":[]}'::jsonb;