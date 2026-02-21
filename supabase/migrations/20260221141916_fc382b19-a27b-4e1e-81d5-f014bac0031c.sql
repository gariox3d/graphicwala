
-- Drop the old trigger and function that causes failures
DROP TRIGGER IF EXISTS cleanup_designs_on_status_change ON public.orders;

-- Recreate the function to gracefully handle the storage deletion error
CREATE OR REPLACE FUNCTION public.cleanup_order_design_files()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger when status changes to 'completed' or 'shipped'
  IF (NEW.status = 'completed' OR NEW.status = 'shipped') AND 
     (OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- Clear the design URLs from order_items (nullify them)
    UPDATE order_items 
    SET front_design_url = NULL, back_design_url = NULL
    WHERE order_id = NEW.id;
    
    -- Clear custom upload URLs
    DELETE FROM order_item_uploads 
    WHERE order_item_id IN (SELECT id FROM order_items WHERE order_id = NEW.id);
    
    RAISE NOTICE 'Cleared design references for order %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block the status update if cleanup fails
    RAISE WARNING 'Design cleanup failed for order %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER cleanup_designs_on_status_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_order_design_files();
