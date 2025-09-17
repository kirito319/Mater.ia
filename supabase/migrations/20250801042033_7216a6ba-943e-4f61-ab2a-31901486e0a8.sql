-- Add draft status to courses table
ALTER TABLE public.courses 
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Update existing courses to published status
UPDATE public.courses 
SET status = 'published' 
WHERE activo = true;

-- Update RLS policy to only show published courses to non-admin users
DROP POLICY "Everyone can view active courses" ON public.courses;

CREATE POLICY "Everyone can view published active courses" 
ON public.courses 
FOR SELECT 
USING (activo = true AND status = 'published');

-- Admins and instructors can see all courses including drafts
CREATE POLICY "Admins and instructors can view all courses" 
ON public.courses 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role));