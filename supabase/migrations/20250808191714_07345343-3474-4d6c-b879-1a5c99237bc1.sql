-- Phase 1 & 2 hardening migration
-- 1) Create subscribers table to track Stripe status
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

-- Enable RLS and basic policies
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "select_own_subscription" ON public.subscribers
  FOR SELECT
  USING (user_id = auth.uid() OR email = auth.email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "update_own_subscription" ON public.subscribers
  FOR UPDATE
  USING (user_id = auth.uid() OR email = auth.email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "insert_subscription" ON public.subscribers
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR email = auth.email());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Ensure uniqueness for user_ai_usage per month (needed for UPSERT)
CREATE UNIQUE INDEX IF NOT EXISTS user_ai_usage_user_month_unique
ON public.user_ai_usage (user_id, month_year);

-- 3) Simplify roles: migrate to ['admin','user'] and default 'user'
-- Create new enum type
DO $$ BEGIN
  CREATE TYPE public.app_role_new AS ENUM ('admin','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Alter column to new type with mapping (non-admin -> user)
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role_new
  USING (
    CASE
      WHEN role::text = 'admin' THEN 'admin'::public.app_role_new
      ELSE 'user'::public.app_role_new
    END
  );

-- Set default to 'user' on the new type for now
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'user'::public.app_role_new;

-- Drop old function dependent on old type if exists
DO $$ BEGIN
  DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- Drop old enum and rename new
do $$ begin
  PERFORM 1 FROM pg_type WHERE typname = 'app_role';
  IF FOUND THEN
    DROP TYPE public.app_role;
  END IF;
end $$;

ALTER TYPE public.app_role_new RENAME TO app_role;

-- Recreate has_role function with the new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- Ensure default uses the (renamed) target type
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'user'::public.app_role;

-- 4) Update new user trigger to assign role 'user' (instead of 'estudiante')
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