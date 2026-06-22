-- Public platform stats function
-- Uses SECURITY DEFINER so it runs as the function owner (bypasses RLS),
-- allowing the public landing page to read aggregate counts without
-- exposing any individual rows.

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  patient_count      integer;
  physio_count       integer;
  assessment_count   integer;
  program_count      integer;
BEGIN
  SELECT COUNT(*) INTO patient_count
    FROM user_roles WHERE role = 'patient';

  SELECT COUNT(*) INTO physio_count
    FROM user_roles WHERE role = 'physiotherapist';

  SELECT COUNT(*) INTO assessment_count
    FROM assessments;

  SELECT COUNT(*) INTO program_count
    FROM exercise_programs;

  RETURN json_build_object(
    'patients',         patient_count,
    'physiotherapists', physio_count,
    'assessments',      assessment_count,
    'programs',         program_count
  );
END;
$$;

-- Allow both anonymous (public landing page) and authenticated users to call it.
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;
