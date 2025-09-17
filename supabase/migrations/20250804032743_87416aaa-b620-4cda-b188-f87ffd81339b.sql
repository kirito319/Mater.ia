-- Phase 1: Database Schema Setup

-- Enhance profiles table with subscription fields
ALTER TABLE public.profiles 
ADD COLUMN subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro')),
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT;

-- Create user_ai_usage table for monthly tracking
CREATE TABLE public.user_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable Row Level Security
ALTER TABLE public.user_ai_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for user_ai_usage
CREATE POLICY "Users can view their own AI usage" 
ON public.user_ai_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage" 
ON public.user_ai_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI usage" 
ON public.user_ai_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI usage" 
ON public.user_ai_usage 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_user_ai_usage_updated_at
BEFORE UPDATE ON public.user_ai_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();