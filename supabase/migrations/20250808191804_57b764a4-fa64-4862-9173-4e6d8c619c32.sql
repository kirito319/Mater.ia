-- Fix role enum migration by dropping default before type change and re-applying
DO $$ BEGIN
  ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- Ensure new enum exists
DO $$ BEGIN
  CREATE TYPE public.app_role_new AS ENUM ('admin','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Convert column to new enum with mapping
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role_new
  USING (
    CASE
      WHEN role::text = 'admin' THEN 'admin'::public.app_role_new
      ELSE 'user'::public.app_role_new
    END
  );

-- Temporarily set default on new type
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'user'::public.app_role_new;

-- Drop old function (if exists) before replacing enum name
DO $$ BEGIN
  DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
EXCEPTION WHEN undefined_function THEN NULL; END $$;

-- Drop old enum if present and rename new
DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'app_role';
  IF FOUND THEN
    DROP TYPE public.app_role;
  END IF;
END $$;

ALTER TYPE public.app_role_new RENAME TO app_role;

-- Recreate has_role with new enum
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

-- Set final default on the renamed enum type
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'user'::public.app_role;