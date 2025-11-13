-- RLS policies for assessments, recommendations, progress_entries, physio_videos

-- Enable RLS
ALTER TABLE IF EXISTS assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS physio_videos ENABLE ROW LEVEL SECURITY;

-- Policy: patients can insert their own assessment
CREATE POLICY IF NOT EXISTS "patients_insert_own_assessment" ON assessments
  FOR INSERT USING (auth.role() = 'authenticated') WITH CHECK (patient_user_id = auth.uid());

-- Policy: patients can select their own assessments
CREATE POLICY IF NOT EXISTS "patients_select_own_assessment" ON assessments
  FOR SELECT USING (patient_user_id = auth.uid());

-- Policy: physios can select assessments for patients assigned to them (requires physio_patient_assignments)
CREATE POLICY IF NOT EXISTS "physio_select_assigned_assessments" ON assessments
  FOR SELECT USING (
    exists (
      select 1 from physio_patient_assignments ppa where ppa.patient_id = assessments.patient_user_id and ppa.physio_id = auth.uid()
    )
  );

-- Recommendations: allow inserts from server (service_role) or function, and allow select for owner patient or assigned physio
CREATE POLICY IF NOT EXISTS "recommendations_insert_service" ON recommendations
  FOR INSERT USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "recommendations_select_patient" ON recommendations
  FOR SELECT USING (
    exists (select 1 from assessments a where a.id = recommendations.assessment_id and a.patient_user_id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "recommendations_select_physio" ON recommendations
  FOR SELECT USING (
    exists (
      select 1 from assessments a join physio_patient_assignments ppa on ppa.patient_id = a.patient_user_id where a.id = recommendations.assessment_id and ppa.physio_id = auth.uid()
    )
  );

-- Progress entries: patients can insert/select their own
CREATE POLICY IF NOT EXISTS "progress_insert_own" ON progress_entries
  FOR INSERT USING (auth.role() = 'authenticated') WITH CHECK (patient_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "progress_select_own" ON progress_entries
  FOR SELECT USING (patient_user_id = auth.uid());

-- Physio videos: physios insert; patients select only if assigned
CREATE POLICY IF NOT EXISTS "physio_videos_insert_physio" ON physio_videos
  FOR INSERT USING (auth.role() = 'authenticated') WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "physio_videos_select_assigned" ON physio_videos
  FOR SELECT USING (
    (patient_user_id IS NULL AND visibility = 'public') OR
    (patient_user_id = auth.uid()) OR
    exists (select 1 from physio_patient_assignments ppa where ppa.patient_id = auth.uid() and ppa.physio_id = physio_videos.physio_user_id)
  );

-- Note: the auth.role() and auth.uid() functions are Supabase/Postgres helpers; adjust as needed for your setup.
