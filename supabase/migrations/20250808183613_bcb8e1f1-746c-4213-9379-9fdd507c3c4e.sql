-- 1) Create institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Trigger to keep updated_at in sync
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_institutions_updated_at'
  ) THEN
    CREATE TRIGGER update_institutions_updated_at
    BEFORE UPDATE ON public.institutions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies: Everyone can view active institutions; Admins manage all
DO $$ BEGIN
  -- Drop if exists to avoid duplicates
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'institutions' AND policyname = 'Everyone can view active institutions'
  ) THEN
    DROP POLICY "Everyone can view active institutions" ON public.institutions;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'institutions' AND policyname = 'Admins can manage institutions'
  ) THEN
    DROP POLICY "Admins can manage institutions" ON public.institutions;
  END IF;
END $$;

CREATE POLICY "Everyone can view active institutions" ON public.institutions
FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage institutions" ON public.institutions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 2) Add institution_id to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL;

-- Helpful index
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_profiles_institution_id'
  ) THEN
    CREATE INDEX idx_profiles_institution_id ON public.profiles(institution_id);
  END IF;
END $$;

-- 3) Migrate roles to only two types (user/admin) by updating existing assignments
-- Map instructor -> admin; estudiante -> user; keep admin as admin
UPDATE public.user_roles SET role = 'admin'::app_role WHERE role::text = 'instructor';
UPDATE public.user_roles SET role = 'user'::app_role WHERE role::text IN ('estudiante');

-- Ensure new users get 'user' by default - update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- 4) Update policies that referenced instructor -> admin only
-- course_forms
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'course_forms' AND policyname = 'Instructors and admins can manage course forms'
  ) THEN
    DROP POLICY "Instructors and admins can manage course forms" ON public.course_forms;
  END IF;
END $$;

CREATE POLICY "Admins can manage course forms" ON public.course_forms
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- course_modules
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'course_modules' AND policyname = 'Instructors and admins can manage course modules'
  ) THEN
    DROP POLICY "Instructors and admins can manage course modules" ON public.course_modules;
  END IF;
END $$;

CREATE POLICY "Admins can manage course modules" ON public.course_modules
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- course_slides
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'course_slides' AND policyname = 'Instructors and admins can manage course slides'
  ) THEN
    DROP POLICY "Instructors and admins can manage course slides" ON public.course_slides;
  END IF;
END $$;

CREATE POLICY "Admins can manage course slides" ON public.course_slides
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- courses (manage)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'courses' AND policyname = 'Instructors and admins can manage courses'
  ) THEN
    DROP POLICY "Instructors and admins can manage courses" ON public.courses;
  END IF;
END $$;

CREATE POLICY "Admins can manage courses" ON public.courses
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- courses (view all)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'courses' AND policyname = 'Admins and instructors can view all courses'
  ) THEN
    DROP POLICY "Admins and instructors can view all courses" ON public.courses;
  END IF;
END $$;

CREATE POLICY "Admins can view all courses" ON public.courses
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));