-- Phase 1: Create secure role-based access control system (Fixed - with policy updates)

-- 1. Create user_roles table using existing user_role enum
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 2. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Create physio-patient assignment table
CREATE TABLE public.physio_patient_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physio_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(physio_id, patient_id)
);

-- 6. Enable RLS on assignments
ALTER TABLE public.physio_patient_assignments ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies for assignments
CREATE POLICY "Physiotherapists can view their assignments"
  ON public.physio_patient_assignments
  FOR SELECT
  USING (
    physio_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
    OR patient_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can create assignments"
  ON public.physio_patient_assignments
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'physiotherapist')
    AND physio_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Physiotherapists can update their assignments"
  ON public.physio_patient_assignments
  FOR UPDATE
  USING (
    physio_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
  );

-- 8. Update handle_new_user trigger to use user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles (without role column)
  INSERT INTO public.profiles (user_id, first_name, last_name, phone, age, sex, occupation)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'age')::integer,
    NEW.raw_user_meta_data->>'sex',
    NEW.raw_user_meta_data->>'occupation'
  );
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  
  RETURN NEW;
END;
$$;

-- 9. Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_roles.user_id = profiles.user_id
);

-- 10. Drop and recreate conversations policies that reference profiles.role
DROP POLICY IF EXISTS "Patients can create conversations with physiotherapists" ON public.conversations;

CREATE POLICY "Patients can create conversations with physiotherapists"
  ON public.conversations
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'patient')
    AND auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = conversations.patient_id
    )
  );

-- 11. Update profiles RLS policies to allow physiotherapists to view assigned patients
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR id IN (
      SELECT patient_id 
      FROM public.physio_patient_assignments 
      WHERE physio_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
      AND status = 'active'
    )
  );

-- 12. Add DELETE policies for GDPR compliance
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
  ON public.appointments
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = appointments.patient_id
    )
    OR auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = appointments.physiotherapist_id
    )
  );

CREATE POLICY "Users can delete their own messages"
  ON public.messages
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles WHERE profiles.id = messages.sender_id
    )
  );

CREATE POLICY "Users can delete conversations they participate in"
  ON public.conversations
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT profiles.user_id FROM profiles 
      WHERE profiles.id = conversations.patient_id OR profiles.id = conversations.physiotherapist_id
    )
  );

-- 13. Add trigger for updated_at on assignments
CREATE TRIGGER update_physio_patient_assignments_updated_at
  BEFORE UPDATE ON public.physio_patient_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Remove role column from profiles (after all dependent policies are updated)
ALTER TABLE public.profiles DROP COLUMN role;