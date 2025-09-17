-- Phase 1: Fix Admin Delete Function - Add DELETE policy for admins on enrollments table
CREATE POLICY "Admins can delete all enrollments" 
ON public.enrollments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Phase 3: Prevent Double Certificate Generation - Add unique constraint on certifications
ALTER TABLE public.certifications 
ADD CONSTRAINT unique_user_course_certification 
UNIQUE (user_id, course_id);

-- Add index for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user_course ON public.certifications(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_enrollment_slide ON public.user_progress(enrollment_id, slide_id);
CREATE INDEX IF NOT EXISTS idx_slide_attempts_enrollment_slide ON public.slide_attempts(enrollment_id, slide_id);