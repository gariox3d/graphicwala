-- Add slug column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

-- Slugify function
CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(lower(regexp_replace(coalesce(_input,''), '[^a-zA-Z0-9\s-]', '', 'g')), '[\s-]+', '-', 'g'));
$$;

-- Ensure unique slug function
CREATE OR REPLACE FUNCTION public.ensure_product_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter int := 1;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND NEW.name IS DISTINCT FROM OLD.name AND (NEW.slug = OLD.slug OR NEW.slug IS NULL)) THEN
    base_slug := public.slugify(NEW.name);
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'product';
    END IF;
    new_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = new_slug AND id <> NEW.id) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := new_slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_product_slug ON public.products;
CREATE TRIGGER trg_ensure_product_slug
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.ensure_product_slug();

-- Backfill
DO $$
DECLARE
  r record;
  base_slug text;
  new_slug text;
  counter int;
BEGIN
  FOR r IN SELECT id, name FROM public.products WHERE slug IS NULL OR slug = '' ORDER BY created_at LOOP
    base_slug := public.slugify(r.name);
    IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'product'; END IF;
    new_slug := base_slug;
    counter := 1;
    WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = new_slug AND id <> r.id) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;
    UPDATE public.products SET slug = new_slug WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products(slug);