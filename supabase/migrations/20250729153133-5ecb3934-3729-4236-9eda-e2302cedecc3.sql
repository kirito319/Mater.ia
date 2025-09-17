-- Add 'video' to the content_type enum
ALTER TYPE content_type ADD VALUE 'video';

-- Add video_url column to course_slides table
ALTER TABLE public.course_slides 
ADD COLUMN video_url text;

-- Create storage bucket for course videos (100MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('course-videos', 'course-videos', true, 104857600);

-- Create policies for course videos bucket
CREATE POLICY "Course videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-videos');

CREATE POLICY "Admins and instructors can upload course videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-videos' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role)));

CREATE POLICY "Admins and instructors can update course videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-videos' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role)));

CREATE POLICY "Admins and instructors can delete course videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-videos' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role)));