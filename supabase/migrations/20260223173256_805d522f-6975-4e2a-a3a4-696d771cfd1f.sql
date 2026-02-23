-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Set replica identity full for filter support
ALTER TABLE public.orders REPLICA IDENTITY FULL;