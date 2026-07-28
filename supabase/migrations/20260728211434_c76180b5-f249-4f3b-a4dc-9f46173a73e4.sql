DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id <> (SELECT id FROM auth.users WHERE lower(email) = 'mrprintwalaktr@gmail.com');