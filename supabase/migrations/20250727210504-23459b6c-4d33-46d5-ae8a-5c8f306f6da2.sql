-- Phase 1: Database Schema Enhancements

-- Create enum for content types
CREATE TYPE public.content_type AS ENUM ('imagen', 'cuestionario');

-- Add new columns to course_slides table
ALTER TABLE public.course_slides 
ADD COLUMN tipo_contenido content_type DEFAULT 'imagen',
ADD COLUMN cuestionario_data jsonb,
ADD COLUMN puntuacion_minima integer DEFAULT 0;

-- Create slide_attempts table for tracking quiz attempts
CREATE TABLE public.slide_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  slide_id uuid NOT NULL,
  enrollment_id uuid NOT NULL,
  respuesta_seleccionada text NOT NULL,
  es_correcta boolean NOT NULL,
  puntuacion integer NOT NULL DEFAULT 0,
  tiempo_respuesta integer, -- seconds to answer
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on slide_attempts
ALTER TABLE public.slide_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for slide_attempts
CREATE POLICY "Users can view their own attempts" 
ON public.slide_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts" 
ON public.slide_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" 
ON public.slide_attempts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage buckets for course content
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('course-thumbnails', 'course-thumbnails', true),
  ('course-content', 'course-content', true),
  ('certificates', 'certificates', false);

-- Create storage policies for course thumbnails
CREATE POLICY "Anyone can view course thumbnails" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins can upload course thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update course thumbnails" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete course thumbnails" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

-- Create storage policies for course content
CREATE POLICY "Anyone can view course content" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-content');

CREATE POLICY "Admins can upload course content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-content' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update course content" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-content' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete course content" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-content' AND has_role(auth.uid(), 'admin'::app_role));

-- Create storage policies for certificates
CREATE POLICY "Users can view their own certificates" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage all certificates" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'certificates' AND has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for better performance
CREATE INDEX idx_slide_attempts_user_id ON public.slide_attempts(user_id);
CREATE INDEX idx_slide_attempts_slide_id ON public.slide_attempts(slide_id);
CREATE INDEX idx_slide_attempts_enrollment_id ON public.slide_attempts(enrollment_id);
CREATE INDEX idx_course_slides_tipo_contenido ON public.course_slides(tipo_contenido);