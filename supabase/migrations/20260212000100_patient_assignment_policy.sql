-- Allow patients to create physio-patient assignments when booking a session
-- This links the patient to the chosen physiotherapist.
CREATE POLICY "Patients can request assignments"
  ON public.physio_patient_assignments
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
