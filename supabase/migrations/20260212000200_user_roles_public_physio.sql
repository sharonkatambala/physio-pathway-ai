-- Allow authenticated users to discover physiotherapist accounts
CREATE POLICY "Users can view physiotherapist roles"
  ON public.user_roles
  FOR SELECT
  USING (role = 'physiotherapist');
