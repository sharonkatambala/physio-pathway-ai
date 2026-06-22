-- Allow physiotherapists to read the profile (name, etc.) of any patient who has
-- booked an appointment with them. Without this, the physiotherapist side shows
-- patients as a generic "Patient"/"User" because profile reads are blocked by RLS.
CREATE POLICY "Physios can view their patients' profiles"
  ON public.profiles
  FOR SELECT
  USING (
    id IN (
      SELECT patient_id
      FROM public.appointments
      WHERE physiotherapist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );
