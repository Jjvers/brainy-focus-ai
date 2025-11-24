-- Create study_materials table for comprehensive material tracking
CREATE TABLE public.study_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  total_focus_score NUMERIC DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  target_hours INTEGER DEFAULT 10,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own materials"
ON public.study_materials
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own materials"
ON public.study_materials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials"
ON public.study_materials
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials"
ON public.study_materials
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_study_materials_updated_at
BEFORE UPDATE ON public.study_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_study_materials_user_id ON public.study_materials(user_id);
CREATE INDEX idx_study_materials_category ON public.study_materials(category);