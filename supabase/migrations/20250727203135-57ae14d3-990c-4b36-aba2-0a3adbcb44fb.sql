-- Phase 1: Database Schema Enhancement for Course Content Management

-- Create course_modules table to organize course content
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_slides table to store individual course slide images
CREATE TABLE public.course_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  imagen_url TEXT NOT NULL,
  contenido TEXT,
  orden INTEGER NOT NULL DEFAULT 1,
  duracion_estimada INTEGER DEFAULT 5, -- minutes
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table for detailed progress tracking
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL,
  slide_id UUID NOT NULL,
  completado BOOLEAN NOT NULL DEFAULT false,
  tiempo_inicio TIMESTAMP WITH TIME ZONE,
  tiempo_completado TIMESTAMP WITH TIME ZONE,
  tiempo_total_segundos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slide_id)
);

-- Enable Row Level Security on new tables
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_modules
CREATE POLICY "Everyone can view active course modules" 
ON public.course_modules 
FOR SELECT 
USING (activo = true);

CREATE POLICY "Instructors and admins can manage course modules" 
ON public.course_modules 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role));

-- RLS Policies for course_slides
CREATE POLICY "Everyone can view active course slides" 
ON public.course_slides 
FOR SELECT 
USING (activo = true);

CREATE POLICY "Instructors and admins can manage course slides" 
ON public.course_slides 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role));

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_progress 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" 
ON public.user_progress 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_course_modules_updated_at
BEFORE UPDATE ON public.course_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_slides_updated_at
BEFORE UPDATE ON public.course_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraints (optional for better data integrity)
-- Note: We don't add FK to auth.users as per Supabase best practices
ALTER TABLE public.course_modules 
ADD CONSTRAINT fk_course_modules_course_id 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.course_slides 
ADD CONSTRAINT fk_course_slides_module_id 
FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;

ALTER TABLE public.user_progress 
ADD CONSTRAINT fk_user_progress_enrollment_id 
FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;

ALTER TABLE public.user_progress 
ADD CONSTRAINT fk_user_progress_slide_id 
FOREIGN KEY (slide_id) REFERENCES public.course_slides(id) ON DELETE CASCADE;