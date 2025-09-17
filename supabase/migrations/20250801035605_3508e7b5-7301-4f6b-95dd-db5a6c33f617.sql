-- Add columns to courses table for free courses and form requirements
ALTER TABLE courses ADD COLUMN is_free BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN requires_form BOOLEAN DEFAULT false;

-- Create course_forms table to store form templates
CREATE TABLE course_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_form_submissions table to store user responses
CREATE TABLE course_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  form_id UUID REFERENCES course_forms(id) NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the new tables
ALTER TABLE course_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_form_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_forms
CREATE POLICY "Everyone can view active course forms" 
ON course_forms 
FOR SELECT 
USING (active = true);

CREATE POLICY "Instructors and admins can manage course forms" 
ON course_forms 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'instructor'::app_role));

-- Create RLS policies for course_form_submissions
CREATE POLICY "Users can insert their own form submissions" 
ON course_form_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own form submissions" 
ON course_form_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all form submissions" 
ON course_form_submissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for course_forms updated_at
CREATE TRIGGER update_course_forms_updated_at
BEFORE UPDATE ON course_forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();