import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";  
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navigation from '@/components/Navigation';
import { User, FileText, Video, Target, ArrowRight, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { scoreAssessment, AssessmentForm, deriveAIMapping } from '@/lib/assessment';

const AssessmentPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const [generatedProgram, setGeneratedProgram] = useState<any | null>(null);
  const [formData, setFormData] = useState<AssessmentForm>({
    consent: false,
    // Section 1
    age: null,
    gender: null,
    height_cm: null,
    weight_kg: null,
    // Section 2
    occupation: null,
    working_hours_per_day: null,
    work_type: null,
    work_posture: null,
    duration_continuous_hours: null,
    // Section 3+ pain
    presenting_problem: null,
    pain_onset: null,
    primary_sites: [],
    pain_intensity: null,
    pain_pattern: null,
    pain_worse_with_activity: false,
    pain_improve_with_rest: false,
    presence_numbness_tingling: false,
    // Section 4
    workstation_type: null,
    repetitive_motion_freq: null,
    overhead_arm_work: false,
    prolonged_static_posture: false,
    vibrating_tools: false,
    microbreak_frequency: null,
    // Section 5
    daily_activities_comfort: null,
    activities_limited: [],
    posture_ability: null,
    recent_increase_workload: false,
    // Section 6
    prior_msk_injury: false,
    prior_msk_injury_details: null,
    previous_surgeries: false,
    previous_surgeries_details: null,
    chronic_conditions: false,
    chronic_conditions_details: null,
    current_medications: false,
    current_medications_list: null,
    // Section 7
    mechanism: null,
    discomfort_types: [],
    aggravating_factors: [],
    relieving_factors: [],
    impact_on_daily: null,
    // Existing simplified fields
    region: undefined,
    chronicity: undefined,
    pain_now: null,
    pain_week: null,
    pain_worse_with: null,
    limits_work: false,
    limits_sleep: false,
    limits_walk: false,
    limits_lift: false,
    numbness: false,
    bowel_bladder_loss: false,
    fever_weight_loss: false,
    recent_trauma: false,
    comorbidities: [],
    meds_anticoagulant: false,
    surgery_last_12m: false,
    previous_physio: false,
    goals: null,
    days_per_week: 3,
    equipment: 'none',
    hasVideo: false,
  });

  // Load draft from server on mount (if logged in)
  useEffect(() => {
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;
        const { data, error } = await (supabase as any).from('drafts').select().eq('user_id', user.id).single();
        if (error) return;
        if (data?.data) {
          setFormData(prev => ({...prev, ...(data.data || {})}));
          if (import.meta.env.DEV) setDraftLoaded(true);
        }
        if (typeof data?.step === 'number') setCurrentStep(data.step);
      } catch (e) {
        console.debug('Failed to load draft', e);
      }
    })();
  }, []);

  const [draftLoaded, setDraftLoaded] = useState(false);

  const [touched, setTouched] = useState<{ section6?: boolean }>({});

  // saveDraftToServer: mandatory server-only save. If save fails, show toast and return false.
  const saveDraftToServer = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        toast({ title: 'Not signed in', description: 'Please sign in to save your assessment to the server.', variant: 'destructive' });
        return false;
      }

      const body = { user_id: user.id, data: formData, step: currentStep, updated_at: new Date().toISOString() };
      const { error } = await (supabase as any).from('drafts').upsert(body);
      if (error) {
        const msg = String(error?.message || error || '').toLowerCase();
        // If drafts table missing, fallback to assessments with status=draft
        if (msg.includes('could not find the table') || msg.includes('public.drafts') || msg.includes('schema cache')) {
          try {
            const draftBody: any = {
              patient_user_id: user.id,
              data: formData,
              language: 'en',
              updated_at: new Date().toISOString(),
              region: formData.region || null,
              chronicity: formData.chronicity || null,
              pain_level: null,
              functional_score: null,
              red_flag: false,
              status: 'draft'
            };
            const { error: assError } = await (supabase as any).from('assessments').upsert(draftBody);
            if (assError) {
              toast({ title: 'Save failed', description: String(assError.message || assError), variant: 'destructive' });
              console.error('Fallback assessments upsert failed', assError);
              return false;
            }
            return true;
          } catch (e) {
            toast({ title: 'Save failed', description: 'Could not save assessment to server.', variant: 'destructive' });
            console.error('Fallback save exception', e);
            return false;
          }
        }
        toast({ title: 'Save failed', description: String(error.message || error), variant: 'destructive' });
        console.error('Draft save error', error);
        return false;
      }
      return true;
    } catch (e: any) {
      toast({ title: 'Save failed', description: 'Unexpected error while saving.', variant: 'destructive' });
      console.error('Draft save exception', e);
      return false;
    }
  };

  const steps = [
    { id: 0, title: 'Willingness', icon: User },
    { id: 1, title: "Section 1 — Demographics", icon: User },
    { id: 2, title: "Section 2 — Occupation", icon: FileText },
    { id: 3, title: "Section 3 — Present Acute Symptoms", icon: FileText },
    { id: 4, title: "Section 4 — Pain Assessment", icon: FileText },
    { id: 5, title: "Section 5 — Ergonomics", icon: Video },
  { id: 6, title: "Section 6 — Functional Limitations", icon: Video },
    { id: 7, title: "Section 7 — History", icon: Video },
    { id: 8, title: "Section 8 — Explanation", icon: Video },
    { id: 9, title: "Review & Submit", icon: Target }
  ];

  // Option lists reused in the page so we can render selected labels easily
  const PRIMARY_SITE_OPTIONS = [
    { key: 'neck_upper_back', label: 'Neck / upper back' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'elbow_forearm', label: 'Elbow / forearm' },
    { key: 'wrist_hand', label: 'Wrist / hand' },
    { key: 'mid_back', label: 'Mid-back' },
    { key: 'lower_back', label: 'Lower back' },
    { key: 'hip_pelvis', label: 'Hip / pelvis' },
    { key: 'knee', label: 'Knee' },
    { key: 'ankle_foot', label: 'Ankle / foot' },
    { key: 'general_body_fatigue', label: 'General body / fatigue' },
  ];

  const ACTIVITIES_OPTIONS = [
    { key: 'lifting', label: 'Lifting' },
    { key: 'reaching_overhead', label: 'Reaching / overhead work' },
    { key: 'sitting_standing', label: 'Sitting / standing' },
    { key: 'walking_stairs', label: 'Walking / climbing stairs' },
    { key: 'sleep', label: 'Sleep' },
    { key: 'exercise_hobbies', label: 'Exercise / hobbies' },
  ];

  const DISCOMFORT_OPTIONS = ['Sharp','Dull','Stiffness','Tingling','Weakness','Fatigue'];

  const nextStep = async () => {
    // require consent before proceeding beyond the willingness screen
    if (!formData.consent && currentStep !== 0) {
      // if consent missing, prevent advancing
      return;
    }
    if (currentStep === 0 && !formData.consent) {
      // do not proceed if user hasn't agreed on the willingness screen
      return;
    }
    // Validation for Functional Limitations (Section 6)
  if (currentStep === 6) {
      const missing: string[] = [];
      if (!formData.daily_activities_comfort) missing.push('daily_activities_comfort');
      if (!formData.posture_ability) missing.push('posture_ability');
      if (missing.length > 0) {
        setTouched(prev => ({...prev, section6: true}));
        toast({ title: 'Please complete Section 6', description: `Please answer required questions`, variant: 'destructive' });
        return;
      }
    }
    if (currentStep < steps.length - 1) {
      // save draft to server before advancing
      const ok = await saveDraftToServer();
      if (!ok) return; // abort navigation if save failed or not logged in
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Debounced autosave: silently save to server after user consents
  useEffect(() => {
    if (!formData.consent) return;
    const t = setTimeout(() => {
      // silent save
      saveDraftToServer().catch(e => console.debug('Silent save failed', e));
    }, 800);
    return () => clearTimeout(t);
  }, [formData]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sections are presented sequentially as subpages; only the active section heading is shown above */}

        {/* Step Content */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-start justify-between w-full">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {steps.find(s => s.id === currentStep)?.icon && 
                    (() => {
                      const Icon = steps.find(s => s.id === currentStep)!.icon;
                      return <Icon className="h-6 w-6 text-primary" />;
                    })()
                  }
                  {steps.find(s => s.id === currentStep)?.title}
                </CardTitle>
                <div className="text-sm text-muted-foreground">Complete the questions to get a personalised exercise recommendation. Your progress is saved locally.</div>
                <div className="w-full bg-muted rounded h-2 mt-3">
                  <div className="bg-primary h-2 rounded" style={{ width: `${Math.round(((currentStep) / (steps.length - 1)) * 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Patient information will be saved securely after you consent.</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Willingness */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <Label>Do you agree to provide information for this assessment and allow the use of AI recommendations?</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button variant={formData.consent ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, consent: true})}>I agree</Button>
                  <Button variant={!formData.consent ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, consent: false})}>I do not agree</Button>
                </div>
                <div className="text-sm text-muted-foreground mt-2">You can stop at any time. If you choose not to consent, the assessment will not be submitted to AI or your physiotherapist.</div>
              </div>
            )}

            {/* Section 1: Demographic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Age (years)</Label>
                    <Input type="number" value={formData.age ?? ''} onChange={(e) => setFormData({...formData, age: Number(e.target.value) || null})} />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={formData.gender || ''} onValueChange={(v) => setFormData({...formData, gender: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Height (cm)</Label>
                    <Input type="number" value={formData.height_cm ?? ''} onChange={(e) => setFormData({...formData, height_cm: Number(e.target.value) || null})} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input type="number" value={formData.weight_kg ?? ''} onChange={(e) => setFormData({...formData, weight_kg: Number(e.target.value) || null})} />
                  </div>
                  <div>
                    <Label>BMI</Label>
                    <Input disabled value={(formData.height_cm && formData.weight_kg) ? (Math.round((formData.weight_kg / ((formData.height_cm/100)**2)) * 10) / 10) : ''} />
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Occupational / Activity Profile */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Occupation / Job title</Label>
                  <Input value={formData.occupation || ''} onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Average working hours per day</Label>
                    <Input type="number" value={formData.working_hours_per_day ?? ''} onChange={(e) => setFormData({...formData, working_hours_per_day: Number(e.target.value) || null})} />
                  </div>
                  <div>
                    <Label>Work posture</Label>
                    <Input value={formData.work_posture || ''} onChange={(e) => setFormData({...formData, work_posture: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Duration of continuous sitting/standing without break (hours)</Label>
                  <Input type="number" value={formData.duration_continuous_hours ?? ''} onChange={(e) => setFormData({...formData, duration_continuous_hours: Number(e.target.value) || null})} />
                </div>
              </div>
            )}

            {/* Section 3: Present Acute MSK Symptoms */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Explain your problem (location, onset, type, aggravating/relieving factors)</Label>
                  <Textarea placeholder="E.g. started after lifting, pain when reaching overhead" value={formData.presenting_problem || ''} onChange={(e) => setFormData({...formData, presenting_problem: e.target.value})} />
                </div>

                <div>
                  <Label>Previous treatment</Label>
                  <Textarea placeholder="E.g. physiotherapy 2 months ago, manual therapy, home exercises" value={formData.previous_treatment || ''} onChange={(e) => setFormData({...formData, previous_treatment: e.target.value})} />
                </div>

                <div>
                  <Label>Goals for next treatment</Label>
                  <Textarea placeholder="E.g. return to lifting without pain, reduce night pain" value={formData.treatment_goals || ''} onChange={(e) => setFormData({...formData, treatment_goals: e.target.value})} />
                </div>
              </div>
            )}

            {/* Section 4: Pain Assessment (PAIN ASSESSMENT IN ONE PLACE) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Onset of pain/discomfort</Label>
                  <Select value={formData.pain_onset || ''} onValueChange={(v: any) => setFormData({...formData, pain_onset: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<1w">&lt;1 week</SelectItem>
                      <SelectItem value="1-3w">1–3 weeks</SelectItem>
                      <SelectItem value="3-6w">3–6 weeks</SelectItem>
                      <SelectItem value=">6w">&gt;6 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Primary site(s) of pain/discomfort</Label>
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button accessKey="p" aria-label="Select primary sites of pain (Alt+P)" variant="outline" className="w-full text-left">
                          {(formData.primary_sites || []).length > 0
                            ? (formData.primary_sites as string[]).map(k => PRIMARY_SITE_OPTIONS.find(o => o.key === k)?.label || k).slice(0,2).join(', ') + ((formData.primary_sites || []).length > 2 ? ` +${(formData.primary_sites || []).length - 2} more` : '')
                            : 'Select primary sites'
                          }
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Primary sites</DropdownMenuLabel>
                        {PRIMARY_SITE_OPTIONS.map((opt) => {
                          const checked = (formData.primary_sites || []).includes(opt.key);
                          return (
                            <DropdownMenuCheckboxItem
                              key={opt.key}
                              checked={checked}
                              onCheckedChange={(c) => {
                                const next = new Set(formData.primary_sites || []);
                                if (c) next.add(opt.key); else next.delete(opt.key);
                                setFormData({...formData, primary_sites: Array.from(next)});
                              }}
                            >
                              {opt.label}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pain intensity (0 = none, 10 = worst possible)</Label>
                    <Input type="number" min={0} max={10} placeholder="e.g. 6" value={formData.pain_intensity ?? ''} onChange={(e) => setFormData({...formData, pain_intensity: Number(e.target.value) || null})} />
                  </div>
                  <div>
                    <Label>Pain pattern</Label>
                    <Select value={formData.pain_pattern || ''} onValueChange={(v: any) => setFormData({...formData, pain_pattern: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="constant">Constant</SelectItem>
                        <SelectItem value="intermittent">Intermittent</SelectItem>
                        <SelectItem value="work_activity">Only during work or activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Does pain worsen with activity?</Label>
                    <div className="mt-2"><Button variant={formData.pain_worse_with_activity ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, pain_worse_with_activity: !formData.pain_worse_with_activity})}>{formData.pain_worse_with_activity ? 'Yes' : 'No'}</Button></div>
                  </div>
                  <div>
                    <Label>Does pain improve with rest?</Label>
                    <div className="mt-2"><Button variant={formData.pain_improve_with_rest ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, pain_improve_with_rest: !formData.pain_improve_with_rest})}>{formData.pain_improve_with_rest ? 'Yes' : 'No'}</Button></div>
                  </div>
                  <div>
                    <Label>Presence of numbness, tingling, swelling, or loss of motion</Label>
                    <div className="mt-2"><Button variant={(formData.presence_numbness_tingling || formData.numbness) ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, presence_numbness_tingling: !formData.presence_numbness_tingling})}>{(formData.presence_numbness_tingling || formData.numbness) ? 'Yes' : 'No'}</Button></div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Ergonomic Exposure */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <Label>Type of workstation/device used</Label>
                  <Select value={formData.workstation_type || ''} onValueChange={(v) => setFormData({...formData, workstation_type: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="standing">Standing desk</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Frequency of repetitive motions</Label>
                    <Select value={formData.repetitive_motion_freq || ''} onValueChange={(v: any) => setFormData({...formData, repetitive_motion_freq: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="sometimes">Sometimes</SelectItem>
                        <SelectItem value="often">Often</SelectItem>
                        <SelectItem value="constant">Constant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Overhead arm work</Label>
                    <div className="mt-2">
                      <Button variant={formData.overhead_arm_work ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, overhead_arm_work: !formData.overhead_arm_work})}>{formData.overhead_arm_work ? 'Yes' : 'No'}</Button>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Prolonged static postures (sitting/standing)</Label>
                    <div className="mt-2">
                      <Button variant={formData.prolonged_static_posture ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, prolonged_static_posture: !formData.prolonged_static_posture})}>{formData.prolonged_static_posture ? 'Yes' : 'No'}</Button>
                    </div>
                  </div>
                  <div>
                    <Label>Use of vibrating tools or machinery</Label>
                    <div className="mt-2">
                      <Button variant={formData.vibrating_tools ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, vibrating_tools: !formData.vibrating_tools})}>{formData.vibrating_tools ? 'Yes' : 'No'}</Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Frequency of micro-breaks / stretching</Label>
                  <Select value={formData.microbreak_frequency || ''} onValueChange={(v: any) => setFormData({...formData, microbreak_frequency: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30min">Every 30 min</SelectItem>
                      <SelectItem value="1hr">Every 1 hr</SelectItem>
                      <SelectItem value="rare">Rarely / never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Section 6: Functional Limitations */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <Label>24. Can you perform normal daily activities comfortably?</Label>
                  <Select value={formData.daily_activities_comfort || ''} onValueChange={(v: any) => setFormData({...formData, daily_activities_comfort: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="mild">Mild discomfort</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.section6 && !formData.daily_activities_comfort && (
                    <div className="text-sm text-destructive mt-1">Please select whether you can perform normal daily activities comfortably.</div>
                  )}
                </div>

                <div>
                  <Label>25. Activities limited by pain (select all that apply)</Label>
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button accessKey="a" aria-label="Select activities limited by pain (Alt+A)" variant="outline" className="w-full text-left">
                          {(formData.activities_limited || []).length > 0
                            ? (formData.activities_limited as string[]).map(k => ACTIVITIES_OPTIONS.find(o => o.key === k)?.label || k).slice(0,2).join(', ') + ((formData.activities_limited || []).length > 2 ? ` +${(formData.activities_limited || []).length - 2} more` : '')
                            : 'Select activities'
                          }
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Activities limited</DropdownMenuLabel>
                        {ACTIVITIES_OPTIONS.map((opt) => {
                          const checked = (formData.activities_limited || []).includes(opt.key);
                          return (
                            <DropdownMenuCheckboxItem
                              key={opt.key}
                              checked={checked}
                              onCheckedChange={(c) => {
                                const next = new Set(formData.activities_limited || []);
                                if (c) next.add(opt.key); else next.delete(opt.key);
                                setFormData({...formData, activities_limited: Array.from(next)});
                              }}
                            >
                              {opt.label}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* Show selected as badges for quick scanning */}
                  {(formData.activities_limited || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.activities_limited as string[]).map(k => (
                        <Badge key={k} variant="secondary" className="cursor-pointer" aria-label={`Remove ${ACTIVITIES_OPTIONS.find(o => o.key === k)?.label || k}`} onClick={() => {
                          const next = new Set(formData.activities_limited || []);
                          next.delete(k);
                          setFormData({...formData, activities_limited: Array.from(next)});
                        }}>{ACTIVITIES_OPTIONS.find(o => o.key === k)?.label || k}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>26. Ability to maintain posture</Label>
                  <Select value={formData.posture_ability || ''} onValueChange={(v: any) => setFormData({...formData, posture_ability: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upright_neutral">Upright neutral</SelectItem>
                      <SelectItem value="forward_head_rounded_shoulders">Forward head / rounded shoulders</SelectItem>
                      <SelectItem value="slouched_curved_lower_back">Slouched / curved lower back</SelectItem>
                      <SelectItem value="standing_asymmetrically">Standing asymmetrically</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.section6 && !formData.posture_ability && (
                    <div className="text-sm text-destructive mt-1">Please select your ability to maintain posture.</div>
                  )}
                </div>

                <div>
                  <Label>27. Recent increase in workload or repetitive activity?</Label>
                  <Select value={formData.recent_increase_workload ? 'yes' : formData.recent_increase_workload === false ? 'no' : ''} onValueChange={(v: any) => setFormData({...formData, recent_increase_workload: v === 'yes'})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Section 7: Past Medical History */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div>
                  <Label>History of prior musculoskeletal injuries?</Label>
                  <div className="mt-2"><Button variant={formData.prior_msk_injury ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, prior_msk_injury: !formData.prior_msk_injury})}>{formData.prior_msk_injury ? 'Yes' : 'No'}</Button></div>
                </div>
                <div>
                  <Label>If yes, specify</Label>
                  <Input value={formData.prior_msk_injury_details || ''} onChange={(e) => setFormData({...formData, prior_msk_injury_details: e.target.value})} />
                </div>
                <div>
                  <Label>Previous surgeries in affected area?</Label>
                  <div className="mt-2"><Button variant={formData.previous_surgeries ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, previous_surgeries: !formData.previous_surgeries})}>{formData.previous_surgeries ? 'Yes' : 'No'}</Button></div>
                </div>
                <div>
                  <Label>If yes, specify</Label>
                  <Input value={formData.previous_surgeries_details || ''} onChange={(e) => setFormData({...formData, previous_surgeries_details: e.target.value})} />
                </div>
                <div>
                  <Label>Chronic conditions affecting musculoskeletal health?</Label>
                  <div className="mt-2"><Button variant={formData.chronic_conditions ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, chronic_conditions: !formData.chronic_conditions})}>{formData.chronic_conditions ? 'Yes' : 'No'}</Button></div>
                </div>
                <div>
                  <Label>Current medications affecting muscles, joints, or pain perception?</Label>
                  <div className="mt-2"><Button variant={formData.current_medications ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, current_medications: !formData.current_medications})}>{formData.current_medications ? 'Yes' : 'No'}</Button></div>
                </div>
              </div>
            )}

            {/* Section 8: Explanation of Condition */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <div>
                  <Label>Describe how the pain started</Label>
                  <Textarea value={formData.mechanism || ''} onChange={(e) => setFormData({...formData, mechanism: e.target.value})} />
                </div>
                <div>
                  <Label>Type of discomfort experienced</Label>
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button accessKey="d" aria-label="Select discomfort types (Alt+D)" variant="outline" className="w-full text-left">Select discomfort types</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Discomfort</DropdownMenuLabel>
                        {DISCOMFORT_OPTIONS.map((opt) => {
                          const key = opt.toLowerCase();
                          const checked = (formData.discomfort_types || []).includes(key);
                          return (
                            <DropdownMenuCheckboxItem
                              key={key}
                              checked={checked}
                              onCheckedChange={(c) => {
                                const next = new Set(formData.discomfort_types || []);
                                if (c) next.add(key); else next.delete(key);
                                setFormData({...formData, discomfort_types: Array.from(next)});
                              }}
                            >
                              {opt}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {/* removable badges for discomfort */}
                  {(formData.discomfort_types || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.discomfort_types as string[]).map(k => (
                        <Badge key={k} variant="secondary" className="cursor-pointer" aria-label={`Remove ${k}`} onClick={() => {
                          const next = new Set(formData.discomfort_types || []);
                          next.delete(k);
                          setFormData({...formData, discomfort_types: Array.from(next)});
                        }}>{k}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Aggravating factors</Label>
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button accessKey="g" aria-label="Select aggravating factors (Alt+G)" variant="outline" className="w-full text-left">Select aggravating factors</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Aggravating</DropdownMenuLabel>
                        {['Sitting','Standing','Lifting','Bending','Repetitive movements','Other'].map((opt) => {
                          const key = opt.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                          const checked = (formData.aggravating_factors || []).includes(key);
                          return (
                            <DropdownMenuCheckboxItem
                              key={key}
                              checked={checked}
                              onCheckedChange={(c) => {
                                const next = new Set(formData.aggravating_factors || []);
                                if (c) next.add(key); else next.delete(key);
                                setFormData({...formData, aggravating_factors: Array.from(next)});
                              }}
                            >
                              {opt}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                        <DropdownMenuSeparator />
                        <div className="p-2"><Input placeholder="Other (specify)" value={formData.aggravating_factors_other || ''} onChange={(e) => setFormData({...formData, aggravating_factors_other: e.target.value})} /></div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div>
                  <Label>Relieving factors</Label>
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button accessKey="r" aria-label="Select relieving factors (Alt+R)" variant="outline" className="w-full text-left">Select relieving factors</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Relieving</DropdownMenuLabel>
                        {['Rest','Stretching','Heat/cold','Posture correction','Medication','Other'].map((opt) => {
                          const key = opt.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                          const checked = (formData.relieving_factors || []).includes(key);
                          return (
                            <DropdownMenuCheckboxItem
                              key={key}
                              checked={checked}
                              onCheckedChange={(c) => {
                                const next = new Set(formData.relieving_factors || []);
                                if (c) next.add(key); else next.delete(key);
                                setFormData({...formData, relieving_factors: Array.from(next)});
                              }}
                            >
                              {opt}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                        <DropdownMenuSeparator />
                        <div className="p-2"><Input placeholder="Other (specify)" value={formData.relieving_factors_other || ''} onChange={(e) => setFormData({...formData, relieving_factors_other: e.target.value})} /></div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div>
                  <Label>Impact on daily life or work</Label>
                  <Select value={formData.impact_on_daily || ''} onValueChange={(v: any) => setFormData({...formData, impact_on_daily: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 9: Preferences & Goals / Submit */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div>
                  <Label>What is your main goal?</Label>
                  <Textarea value={formData.goals || ''} onChange={(e) => setFormData({...formData, goals: e.target.value})} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>How many days per week can you exercise?</Label>
                    <Input type="number" min={0} max={7} value={formData.days_per_week ?? 3} onChange={(e) => setFormData({...formData, days_per_week: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Do you have equipment?</Label>
                    <Select value={formData.equipment || 'none'} onValueChange={(value) => setFormData({...formData, equipment: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="bands">Resistance bands</SelectItem>
                        <SelectItem value="weights">Small weights</SelectItem>
                        <SelectItem value="gym">Gym access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">After submitting, Ergocare will generate a personalized exercise plan. If your answers contain urgent symptoms, the system will flag your assessment for physiotherapist review instead of providing automated exercises.</div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep} className="bg-gradient-hero" disabled={currentStep === 0 && !formData.consent}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={async () => {
                  try {
                    const { data: userData } = await supabase.auth.getUser();
                    const user = userData?.user;
                    if (!user) {
                      toast({ title: 'Not logged in', description: 'Please login to submit your assessment', variant: 'destructive' });
                      return;
                    }

                    // compute scores
                    const score = scoreAssessment(formData as AssessmentForm);

                    const insertBody = {
                      patient_user_id: user.id,
                      language: 'en',
                      data: formData,
                      pain_level: score.pain_level,
                      functional_score: score.functional_score,
                      red_flag: score.red_flag,
                      region: score.region,
                      chronicity: score.chronicity
                    } as any;

                    let inserted: any = null;
                    try {
                      const res = await supabase
                        .from('assessments')
                        .insert(insertBody)
                        .select()
                        .single();
                      inserted = res.data;
                      if (res.error) throw res.error;
                    } catch (ie: any) {
                      // If we're in dev and table is missing, fall back to a dev-only flow (no DB writes)
                      const msg = String(ie?.message || ie || '').toLowerCase();
                      if (import.meta.env.DEV && (msg.includes('could not find the table') || msg.includes('schema cache') || msg.includes('relation "assessments"'))) {
                        toast({ title: 'Dev fallback', description: 'Assessments table missing — running AI generation locally without saving to database (dev only).', variant: 'default' });
                        inserted = { id: 'dev-local-' + Date.now().toString() };
                      } else {
                        throw ie;
                      }
                    }

                    if (score.red_flag) {
                      // flag for physio review: create recommendation record with source 'flagged' and do not call AI
                      await supabase.from('recommendations').insert({
                        assessment_id: inserted.id,
                        program: { flagged: true, reason: 'red_flag' },
                        confidence: 0,
                        source: 'flagged'
                      });

                      toast({ title: 'Red flag detected', description: 'Your answers indicate urgent symptoms. A physiotherapist has been notified for review.', variant: 'destructive' });
                      return;
                    }

                    // derive AI mapping (Section 8 mapping inputs)
                    const aiMapping = deriveAIMapping(formData);
                    // call Supabase Edge Function for AI recommendation
                    const payload = { assessmentData: { healthData: formData, questionnaireAnswers: formData, ai_mapping: aiMapping, hasVideo: formData.hasVideo } };
                    const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-exercise-program', { body: JSON.stringify(payload) });

                    if (fnError) throw fnError;

                    let exerciseProgram: any = null;
                    try {
                      if (typeof fnData === 'string') {
                        const parsed = JSON.parse(fnData);
                        exerciseProgram = parsed.exerciseProgram || parsed.exercise_program || parsed;
                      } else {
                        exerciseProgram = (fnData as any).exerciseProgram || (fnData as any).exercise_program || fnData;
                      }
                    } catch (e) {
                      exerciseProgram = fnData;
                    }

                    // Try to insert recommendation; if we're in dev fallback (no real assessment table) skip persisting recommendations
                    if (!(import.meta.env.DEV && String(inserted?.id || '').startsWith('dev-local-'))) {
                      const { error: recError } = await supabase.from('recommendations').insert({
                        assessment_id: inserted.id,
                        program: exerciseProgram,
                        confidence: 0.8,
                        source: 'ai'
                      });
                      if (recError) throw recError;
                    } else {
                      // dev mode: do not persist recommendation
                      console.info('Dev mode: recommendation not persisted to DB.');
                    }

                    toast({ title: 'Assessment submitted', description: 'Exercise program created.' });

                    // show program below
                    setGeneratedProgram(exerciseProgram);
                  } catch (err: any) {
                    console.error(err);
                    const message = String(err?.message || err);
                    // Detect common Supabase schema cache / missing table message and provide actionable guidance
                    if (message.toLowerCase().includes('could not find the table') || message.toLowerCase().includes('schema cache')) {
                      toast({
                        title: 'Submission error',
                        description: 'The assessments table was not found in your Supabase project. Please deploy the migrations or create the table in the Supabase dashboard. See README-ASSESSMENT.md for migration steps.',
                        variant: 'destructive'
                      });
                      console.error('Schema issue: ensure supabase migrations have been applied or the table exists in the project.');
                    } else {
                      toast({ title: 'Submission error', description: message, variant: 'destructive' });
                    }
                  }
                }} className="bg-gradient-hero">
                  Complete Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {generatedProgram && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Exercise Program</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(generatedProgram, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;