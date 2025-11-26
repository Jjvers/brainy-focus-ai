-- Allow reading profile by email for face login verification
CREATE POLICY "Allow profile lookup by email for face login"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;