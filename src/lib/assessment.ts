export type AssessmentForm = {
  consent: boolean;
  // Section 1: Demographics
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  // Section 2: Occupational / Activity
  occupation?: string | null;
  working_hours_per_day?: number | null;
  work_type?: string | null;
  work_posture?: string | null;
  duration_continuous_hours?: number | null;
  // Section 3: Present Acute MSK Symptoms & Pain
  presenting_problem?: string | null;
  pain_onset?: '<1w' | '1-3w' | '3-6w' | '>6w' | string | null;
  primary_sites?: string[];
  pain_intensity?: number | null; // 0-10
  pain_pattern?: 'constant' | 'intermittent' | 'work_activity' | string | null;
  pain_worse_with_activity?: boolean;
  pain_improve_with_rest?: boolean;
  presence_numbness_tingling?: boolean;
  // Section 4: Ergonomic Exposure
  workstation_type?: string | null;
  repetitive_motion_freq?: 'rare' | 'sometimes' | 'often' | 'constant' | null;
  overhead_arm_work?: boolean;
  prolonged_static_posture?: boolean;
  vibrating_tools?: boolean;
  microbreak_frequency?: '30min' | '1hr' | 'rare' | null;
  // Section 5: Functional Limitations
  daily_activities_comfort?: 'yes' | 'mild' | 'no' | null;
  activities_limited?: string[];
  posture_ability?: string | null;
  recent_increase_workload?: boolean;
  // Section 6: Past Medical History
  prior_msk_injury?: boolean;
  prior_msk_injury_details?: string | null;
  previous_surgeries?: boolean;
  previous_surgeries_details?: string | null;
  chronic_conditions?: boolean;
  chronic_conditions_details?: string | null;
  current_medications?: boolean;
  current_medications_list?: string | null;
  // Section 7: Explanation of Condition
  mechanism?: string | null;
  discomfort_types?: string[];
  aggravating_factors?: string[];
  aggravating_factors_other?: string | null;
  relieving_factors?: string[];
  relieving_factors_other?: string | null;
  impact_on_daily?: 'minimal' | 'moderate' | 'severe' | null;
  // Previous treatment and goals for next treatment
  previous_treatment?: string | null;
  treatment_goals?: string | null;
  // Existing/common fields kept for backward compatibility
  region?: string;
  chronicity?: string;
  pain_now?: number | null;
  pain_week?: number | null;
  pain_worse_with?: string | null;
  limits_work?: boolean;
  limits_sleep?: boolean;
  limits_walk?: boolean;
  limits_lift?: boolean;
  numbness?: boolean;
  bowel_bladder_loss?: boolean;
  fever_weight_loss?: boolean;
  recent_trauma?: boolean;
  comorbidities?: string[];
  meds_anticoagulant?: boolean;
  surgery_last_12m?: boolean;
  previous_physio?: boolean;
  goals?: string | null;
  days_per_week?: number | null;
  equipment?: string | null;
  hasVideo?: boolean;
  [key: string]: any;
}

export type AssessmentResult = {
  pain_level: number | null;
  functional_score: number;
  red_flag: boolean;
  chronicity?: string | null;
  region?: string | null;
  bmi?: number | null;
}

export function scoreAssessment(form: AssessmentForm): AssessmentResult {
  const pain_now = typeof form.pain_now === 'number' ? form.pain_now : (typeof form.pain_intensity === 'number' ? form.pain_intensity : null);
  const pain_week = typeof form.pain_week === 'number' ? form.pain_week : null;

  let pain_level: number | null = null;
  if (pain_now !== null && pain_week !== null) {
    pain_level = Math.round((pain_now + pain_week) / 2);
  } else if (pain_now !== null) {
    pain_level = pain_now;
  } else if (pain_week !== null) {
    pain_level = pain_week;
  }

  const functionalScore = [form.limits_work, form.limits_sleep, form.limits_walk, form.limits_lift]
    .filter(Boolean).length;

  const redFlag = Boolean(
    form.numbness || form.bowel_bladder_loss || form.fever_weight_loss || form.recent_trauma || form.presence_numbness_tingling
  );

  const bmi = (typeof form.height_cm === 'number' && form.height_cm > 0 && typeof form.weight_kg === 'number' && form.weight_kg > 0)
    ? Math.round((form.weight_kg / ((form.height_cm / 100) ** 2)) * 10) / 10
    : null;

  return {
    pain_level,
    functional_score: functionalScore,
    red_flag: redFlag,
    chronicity: form.chronicity || null,
    region: form.region || null,
    bmi: bmi,
  };
}

export type AIMapping = {
  acute_stage?: boolean;
  regions?: string[];
  ergonomic_causes?: string[];
  safe_self_exercises?: string[];
  red_flags?: string[];
}

export function deriveAIMapping(form: AssessmentForm): AIMapping {
  const mapping: AIMapping = {};

  // Acute stage: onset <6 weeks
  mapping.acute_stage = (form.pain_onset === '<1w' || form.pain_onset === '1-3w' || form.pain_onset === '3-6w') || false;

  mapping.regions = (form.primary_sites && form.primary_sites.length) ? form.primary_sites : (form.region ? [form.region] : []);

  const ergonomic: string[] = [];
  if (form.prolonged_static_posture) ergonomic.push('posture');
  if (form.repetitive_motion_freq && ['often','constant'].includes(form.repetitive_motion_freq)) ergonomic.push('repetition');
  if (form.overhead_arm_work) ergonomic.push('overhead');
  if (form.vibrating_tools) ergonomic.push('vibration');
  mapping.ergonomic_causes = ergonomic;

  // Simple safe exercise suggestions based on region and exposure (basic mapping)
  const exercises: string[] = [];
  if (mapping.regions?.includes('neck') || mapping.regions?.includes('upper_back')) {
    exercises.push('neck_mobility', 'scapular_retraction', 'posture_drills');
  }
  if (mapping.regions?.includes('shoulder')) {
    exercises.push('shoulder_range', 'rotator_cuff_strength', 'scapular_stabilisation');
  }
  if (mapping.regions?.includes('lower_back')) {
    exercises.push('lumbar_mobility', 'core_activation', 'hip_hinge_drills');
  }
  if (!mapping.regions || mapping.regions.length === 0) {
    exercises.push('general_mobility', 'posture_cues');
  }
  mapping.safe_self_exercises = exercises;

  const redFlags: string[] = [];
  if (form.presence_numbness_tingling || form.numbness) redFlags.push('neurological_symptoms');
  if (form.bowel_bladder_loss) redFlags.push('cauda_equina_signs');
  if (form.fever_weight_loss) redFlags.push('systemic_features');
  if (form.recent_trauma) redFlags.push('recent_major_trauma');
  mapping.red_flags = redFlags;

  return mapping;
}
