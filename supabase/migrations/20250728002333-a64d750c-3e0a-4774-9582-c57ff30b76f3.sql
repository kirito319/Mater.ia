-- Add policy to allow users to insert their own certifications when course is completed
-- This is needed for the system to automatically generate certificates
CREATE POLICY "Users can insert their own certifications"
ON public.certifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);