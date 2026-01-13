-- Add column to track sent status emails (prevents duplicates)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS status_emails_sent TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN public.orders.status_emails_sent IS 'Array of status names for which emails have been sent, prevents duplicate emails';