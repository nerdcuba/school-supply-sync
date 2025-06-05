
-- Add unique constraint to stripe_session_id in orders table
ALTER TABLE public.orders ADD CONSTRAINT orders_stripe_session_id_unique UNIQUE (stripe_session_id);
