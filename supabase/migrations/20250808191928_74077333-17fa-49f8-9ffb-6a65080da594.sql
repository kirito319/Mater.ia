-- Retry migration with safer role changes
-- 1) Create subscribers table (idempotent)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "select_own_subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "update_own_subscription" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "insert_subscription" ON public.subscribers
  FOR INSERT WITH CHECK (user_id = auth.uid() OR email = auth.email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Ensure unique index on user_ai_usage
CREATE UNIQUE INDEX IF NOT EXISTS user_ai_usage_user_month_unique
  ON public.user_ai_usage (user_id, month_year);

-- 3) Rename role value 'estudiante' -> 'user' and set default
DO $$
BEGIN
  -- Add 'user' enum value if not present
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'user'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'user';
  END IF;
END$$;

-- Update existing rows from 'estudiante' to 'user' if any
UPDATE public.user_roles SET role = 'user'::public.app_role WHERE role::text = 'estudiante';

-- Update column default to 'user'
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'user'::public.app_role;

-- 4) Update new user trigger to assign 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, nombre, apellido)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'nombre',
    NEW.raw_user_meta_data ->> 'apellido'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;