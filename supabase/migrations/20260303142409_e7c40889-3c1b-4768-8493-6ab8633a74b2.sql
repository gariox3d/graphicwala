
-- Add admin reply and love reaction columns to reviews table
ALTER TABLE public.reviews 
ADD COLUMN admin_reply text DEFAULT NULL,
ADD COLUMN admin_reply_at timestamp with time zone DEFAULT NULL,
ADD COLUMN admin_loved boolean DEFAULT false;
