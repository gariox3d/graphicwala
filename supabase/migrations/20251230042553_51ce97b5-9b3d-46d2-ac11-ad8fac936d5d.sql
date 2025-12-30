-- Create function to cleanup customer design files when order is completed
-- This uses the storage.objects table to delete files from the customer-designs bucket
CREATE OR REPLACE FUNCTION public.cleanup_order_design_files()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  file_path text;
  item_record RECORD;
  upload_record RECORD;
BEGIN
  -- Only trigger when status changes to 'completed' or 'shipped' (delivered)
  IF (NEW.status = 'completed' OR NEW.status = 'shipped') AND 
     (OLD.status IS DISTINCT FROM NEW.status) THEN
    
    -- Get all order items for this order
    FOR item_record IN 
      SELECT front_design_url, back_design_url, id
      FROM order_items 
      WHERE order_id = NEW.id
    LOOP
      -- Delete front design if exists
      IF item_record.front_design_url IS NOT NULL THEN
        file_path := substring(item_record.front_design_url from 'customer-designs/(.*)$');
        IF file_path IS NOT NULL THEN
          DELETE FROM storage.objects 
          WHERE bucket_id = 'customer-designs' 
          AND name = file_path;
        END IF;
      END IF;
      
      -- Delete back design if exists
      IF item_record.back_design_url IS NOT NULL THEN
        file_path := substring(item_record.back_design_url from 'customer-designs/(.*)$');
        IF file_path IS NOT NULL THEN
          DELETE FROM storage.objects 
          WHERE bucket_id = 'customer-designs' 
          AND name = file_path;
        END IF;
      END IF;
      
      -- Delete custom uploads from order_item_uploads
      FOR upload_record IN 
        SELECT file_url 
        FROM order_item_uploads 
        WHERE order_item_id = item_record.id
      LOOP
        file_path := substring(upload_record.file_url from 'customer-designs/(.*)$');
        IF file_path IS NOT NULL THEN
          DELETE FROM storage.objects 
          WHERE bucket_id = 'customer-designs' 
          AND name = file_path;
        END IF;
      END LOOP;
    END LOOP;
    
    -- Log the cleanup for debugging
    RAISE NOTICE 'Cleaned up design files for order %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run cleanup when order status changes
DROP TRIGGER IF EXISTS cleanup_designs_on_order_complete ON orders;
CREATE TRIGGER cleanup_designs_on_order_complete
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_order_design_files();