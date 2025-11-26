-- Create table for storing face descriptors for face login
CREATE TABLE public.face_descriptors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descriptor JSONB NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.face_descriptors ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own face descriptors" 
ON public.face_descriptors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own face descriptors" 
ON public.face_descriptors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own face descriptors" 
ON public.face_descriptors 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own face descriptors" 
ON public.face_descriptors 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow reading face descriptors for face login verification (by email lookup)
CREATE POLICY "Allow reading face descriptors for login verification"
ON public.face_descriptors
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_face_descriptors_user_id ON public.face_descriptors(user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_face_descriptors_updated_at
BEFORE UPDATE ON public.face_descriptors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();