-- Add column to track if certificate has been marked as sent by admin
ALTER TABLE public.certifications 
ADD COLUMN marcado_como_enviado boolean NOT NULL DEFAULT false;