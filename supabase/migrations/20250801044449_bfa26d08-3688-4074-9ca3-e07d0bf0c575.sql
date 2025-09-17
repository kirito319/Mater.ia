-- Add learning_objectives column to courses table
ALTER TABLE public.courses 
ADD COLUMN learning_objectives JSONB DEFAULT '[]'::jsonb;

-- Update existing courses with default learning objectives
UPDATE public.courses 
SET learning_objectives = '["Dominar conceptos fundamentales", "Aplicar conocimientos prácticos", "Desarrollar habilidades técnicas", "Resolver problemas complejos", "Obtener certificación profesional"]'::jsonb 
WHERE learning_objectives = '[]'::jsonb OR learning_objectives IS NULL;