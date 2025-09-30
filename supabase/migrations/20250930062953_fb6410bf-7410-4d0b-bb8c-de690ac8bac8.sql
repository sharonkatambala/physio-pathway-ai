-- Create appointments table
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  physiotherapist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('video', 'phone', 'in-person')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
CREATE POLICY "Users can view their own appointments"
ON public.appointments
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = patient_id
  ) OR
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = physiotherapist_id
  )
);

CREATE POLICY "Patients can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = patient_id
  )
);

CREATE POLICY "Users can update their own appointments"
ON public.appointments
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = patient_id
  ) OR
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = physiotherapist_id
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();