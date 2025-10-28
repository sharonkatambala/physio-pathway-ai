# Ergocare — Assessment & Recommendations

This document explains the assessment feature, migrations, function deployment, and local run steps.

## What's included
- New DB tables (migrations in `supabase/migrations/`): `assessments`, `recommendations`, `progress_entries`, `physio_videos`, `exercise_programs`.
- RLS policy migration: `20251021001000_assessment_policies.sql`.
- Supabase Edge Function: `generate-exercise-program` (calls AI gateway and returns structured JSON).
- Frontend: full questionnaire (`src/pages/AssessmentPage.tsx`), progress page (`src/pages/ProgressPage.tsx`), physio videos (`src/pages/PhysioVideosPage.tsx`), patient videos (`src/pages/PatientVideosPage.tsx`).
- Scoring utility: `src/lib/assessment.ts` with `scoreAssessment()`.
- Unit test for scoring: `tests/assessment.test.ts` (uses vitest).

## Setup and deployment
1. Install dependencies and run dev server:

```powershell
cd "E:\Ergocare code\physio-pathway-ai-main"
npm install
npm run dev
```

2. Supabase setup
- Create or use an existing Supabase project.
- Run migrations locally with supabase CLI or run SQL files in the SQL editor:
  - `supabase/migrations/20251021000000_add_assessment_tables.sql`
  - `supabase/migrations/20251021001000_assessment_policies.sql`
- Create a storage bucket named `physio-videos`.

3. Deploy the Edge Function
- Install and login with supabase CLI and deploy:

```powershell
supabase functions deploy generate-exercise-program --project <your-project-ref>
```

- Set environment variable `LOVABLE_API_KEY` in the Supabase Function settings.

4. Run tests (optional)

```powershell
npm run test
```

Note: tests require `vitest` to be installed. If not installed, add it to devDependencies.

## Notes / Next steps
- RLS policies are starter templates; review and adjust to your auth setup.
- The Edge Function currently expects the AI to return valid JSON. Ensure API key and gateway limits are configured.
- Improve UI messaging, add toasts for all user actions, and add more unit/integration tests.

If you want, I can now:
- Run `npm install` and `npm run dev` locally (I can't do that here because Node is not installed in this environment), or provide step-by-step commands.
- Polish UI and add toasts/loader improvements.
- Implement assignment approval flow for physios.
