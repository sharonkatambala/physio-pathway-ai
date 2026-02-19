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
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Video, Target, ArrowRight } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { scoreAssessment, AssessmentForm, deriveAIMapping } from '@/lib/assessment';
import { useLanguage } from '@/contexts/LanguageContext';

const AssessmentPage = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const { toast } = useToast();
	const navigate = useNavigate();
	const { t, language } = useLanguage();
	const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
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
				}
				if (typeof data?.step === 'number') setCurrentStep(data.step);
			} catch (e) {
				console.debug('Failed to load draft', e);
			}
		})();
	}, []);

	const [touched, setTouched] = useState<{ section6?: boolean }>({});

	// saveDraftToServer: mandatory server-only save. If save fails, show toast and return false.
	const saveDraftToServer = async () => {
		try {
			const { data: userData } = await supabase.auth.getUser();
			const user = userData?.user;
			if (!user) {
				toast({ title: tr('Not signed in', 'Hujaingia'), description: tr('Please sign in to save your assessment to the server.', 'Tafadhali ingia ili kuhifadhi tathmini yako kwenye seva.'), variant: 'destructive' });
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
							toast({ title: tr('Save failed', 'Hifadhi imeshindikana'), description: String(assError.message || assError), variant: 'destructive' });
							console.error('Fallback assessments upsert failed', assError);
							return false;
						}
						return true;
					} catch (e) {
						toast({ title: tr('Save failed', 'Hifadhi imeshindikana'), description: tr('Could not save assessment to server.', 'Imeshindikana kuhifadhi tathmini kwenye seva.'), variant: 'destructive' });
						console.error('Fallback save exception', e);
						return false;
					}
				}
				toast({ title: tr('Save failed', 'Hifadhi imeshindikana'), description: String(error.message || error), variant: 'destructive' });
				console.error('Draft save error', error);
				return false;
			}
			return true;
		} catch (e: any) {
			toast({ title: tr('Save failed', 'Hifadhi imeshindikana'), description: tr('Unexpected error while saving.', 'Hitilafu isiyotarajiwa wakati wa kuhifadhi.'), variant: 'destructive' });
			console.error('Draft save exception', e);
			return false;
		}
	};

	const steps = [
		{ id: 0, title: t('assess.step.willingness'), icon: User },
		{ id: 1, title: t('assess.step.demographics'), icon: User },
		{ id: 2, title: t('assess.step.occupation'), icon: FileText },
		{ id: 3, title: t('assess.step.presentAcute'), icon: FileText },
		{ id: 4, title: t('assess.step.painAssessment'), icon: FileText },
		{ id: 5, title: t('assess.step.ergonomics'), icon: Video },
		{ id: 6, title: t('assess.step.functional'), icon: Video },
		{ id: 7, title: t('assess.step.history'), icon: Video },
		{ id: 8, title: t('assess.step.explanation'), icon: Video },
		{ id: 9, title: t('assess.step.reviewSubmit'), icon: Target }
	];

	// Option lists reused in the page so we can render selected labels easily
	const PRIMARY_SITE_OPTIONS = [
		{ key: 'neck_upper_back', label: t('assess.site.neckUpper') },
		{ key: 'shoulder', label: t('assess.site.shoulder') },
		{ key: 'elbow_forearm', label: t('assess.site.elbowForearm') },
		{ key: 'wrist_hand', label: t('assess.site.wristHand') },
		{ key: 'mid_back', label: t('assess.site.midBack') },
		{ key: 'lower_back', label: t('assess.site.lowerBack') },
		{ key: 'hip_pelvis', label: t('assess.site.hipPelvis') },
		{ key: 'knee', label: t('assess.site.knee') },
		{ key: 'ankle_foot', label: t('assess.site.ankleFoot') },
		{ key: 'general_body_fatigue', label: t('assess.site.generalFatigue') },
	];

	const ACTIVITIES_OPTIONS = [
		{ key: 'lifting', label: t('assess.activity.lifting') },
		{ key: 'reaching_overhead', label: t('assess.activity.reachingOverhead') },
		{ key: 'sitting_standing', label: t('assess.activity.sittingStanding') },
		{ key: 'walking_stairs', label: t('assess.activity.walkingStairs') },
		{ key: 'sleep', label: t('assess.activity.sleep') },
		{ key: 'exercise_hobbies', label: t('assess.activity.exerciseHobbies') },
	];

	const DISCOMFORT_OPTIONS = [
		t('assess.discomfort.sharp'),
		t('assess.discomfort.dull'),
		t('assess.discomfort.stiffness'),
		t('assess.discomfort.tingling'),
		t('assess.discomfort.weakness'),
		t('assess.discomfort.fatigue'),
	];

	const WORK_POSTURE_OPTIONS = [
		{ value: 'mostly_sitting', label: tr('Mostly sitting (desk/computer)', 'Kukaa muda mwingi (meza/kompyuta)') },
		{ value: 'mostly_standing', label: tr('Mostly standing', 'Kusimama muda mwingi') },
		{ value: 'sit_stand_mix', label: tr('Alternating sit/stand', 'Kubadilisha kukaa/kusimama') },
		{ value: 'bending_twisting', label: tr('Frequent bending/twisting', 'Kupinda/kuzungusha mara kwa mara') },
		{ value: 'manual_lifting', label: tr('Manual labor / lifting', 'Kazi nzito / kubeba mizigo') },
		{ value: 'driving', label: tr('Driving / operating machinery', 'Kuendesha / kuendesha mashine') },
		{ value: 'overhead_work', label: tr('Overhead work', 'Kazi juu ya kichwa') },
		{ value: 'other', label: tr('Other', 'Nyingine') },
	];

	const nextStep = async () => {
		// require consent before proceeding beyond the willingness screen
		if (!formData.consent && currentStep !== 0) {
			return;
		}
		if (currentStep === 0 && !formData.consent) {
			return;
		}
		// Validation for Functional Limitations (Section 6)
		if (currentStep === 6) {
			const missing: string[] = [];
			if (!formData.daily_activities_comfort) missing.push('daily_activities_comfort');
			if (!formData.posture_ability) missing.push('posture_ability');
			if (missing.length > 0) {
				setTouched(prev => ({...prev, section6: true}));
				toast({ title: tr('Please complete Section 6', 'Tafadhali kamilisha Sehemu ya 6'), description: tr('Please answer required questions', 'Tafadhali jibu maswali ya lazima'), variant: 'destructive' });
				return;
			}
		}
		if (currentStep < steps.length - 1) {
			const ok = await saveDraftToServer();
			if (!ok) return;
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
			saveDraftToServer().catch(e => console.debug('Silent save failed', e));
		}, 800);
		return () => clearTimeout(t);
	}, [formData]);

	return (
		<div className="min-h-screen bg-background flex flex-col relative">
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_top,_hsl(var(--primary))_0%,_transparent_55%)] opacity-10" />
			<Navigation />
			
			<div className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6">
				{/* Sections are presented sequentially as subpages; only the active section heading is shown above */}

				<div className="grid gap-6 lg:gap-8 lg:grid-cols-[280px_1fr] h-full max-w-screen-2xl mx-auto">
					{/* Stepper / quick access */}
					<aside className="hidden lg:block">
						<Card className="shadow-card sticky top-6 bg-card/80 backdrop-blur max-h-[calc(100vh-6.5rem)] flex flex-col">
							<CardHeader className="border-b border-border/60">
								<CardTitle className="text-base">{t('assess.stepsTitle')}</CardTitle>
								<div className="text-xs text-muted-foreground">{t('assess.step')} {currentStep + 1} {t('assess.of')} {steps.length}</div>
							</CardHeader>
							<CardContent className="space-y-2 overflow-y-auto">
								{steps.map((step) => {
									const isActive = step.id === currentStep;
									const isComplete = step.id < currentStep;
									const canJump = step.id <= currentStep;
									return (
										<button
											key={step.id}
											type="button"
											onClick={() => canJump && setCurrentStep(step.id)}
											disabled={!canJump}
											className={[
												"w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
												isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
												!canJump ? "cursor-not-allowed text-muted-foreground" : ""
											].join(" ")}
											aria-current={isActive ? "step" : undefined}
										>
											<span className={[
												"inline-flex h-6 w-6 items-center justify-center rounded-full text-xs border",
												isComplete ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border",
												isActive ? "border-primary" : ""
											].join(" ")}>{step.id + 1}</span>
											<span className="truncate">{step.title}</span>
										</button>
									);
								})}
							</CardContent>
						</Card>
					</aside>

					{/* Step Content */}
					<Card className="shadow-card w-full min-h-[calc(100vh-8rem)] flex flex-col bg-card/90 backdrop-blur lg:border-l lg:border-border/60 lg:pl-6">
						<CardHeader className="border-b border-border/60 bg-card/95 backdrop-blur">
							<div className="flex items-start justify-between w-full gap-6">
								<div className="flex-1 min-w-0">
									<div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
										{t('assess.step')} {currentStep + 1} {t('assess.of')} {steps.length}
									</div>
									<CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
										{steps.find(s => s.id === currentStep)?.icon && 
											(() => {
												const Icon = steps.find(s => s.id === currentStep)!.icon;
												return <Icon className="h-6 w-6 text-primary" />;
											})()
										}
										<span className="truncate">{steps.find(s => s.id === currentStep)?.title}</span>
									</CardTitle>
									<div className="text-sm text-muted-foreground mt-1">
										{t('assess.helper')}
									</div>
									<div className="w-full bg-muted rounded h-2 mt-4 overflow-hidden">
										<div className="bg-primary h-2 rounded" style={{ width: `${Math.round(((currentStep) / (steps.length - 1)) * 100)}%` }} />
									</div>
									<div className="mt-4 flex gap-2 overflow-x-auto lg:hidden pb-1">
										{steps.map((step) => {
											const isActive = step.id === currentStep;
											const canJump = step.id <= currentStep;
											return (
												<button
													key={step.id}
													type="button"
													onClick={() => canJump && setCurrentStep(step.id)}
													disabled={!canJump}
													className={[
														"shrink-0 rounded-full border px-3 py-1 text-xs",
														isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background",
														!canJump ? "text-muted-foreground" : ""
													].join(" ")}
												>
													{step.id + 1}
												</button>
											);
										})}
									</div>
								</div>
								<div className="hidden md:flex items-center gap-2" />
							</div>
						</CardHeader>
						<CardContent className="flex flex-col flex-1 text-[15px] px-6 md:px-8 pt-6 pb-10 [&_input]:h-11 [&_textarea]:min-h-[120px] [&_textarea]:text-base [&_[role=combobox]]:h-11">
							<div className="flex-1 flex flex-col gap-8">
						
								{/* Willingness */}
								{currentStep === 0 && (
									<div className="space-y-4">
										<Label>{t('assess.consentPrompt')}</Label>
								<div className="flex items-center gap-3 mt-2">
									<Button variant={formData.consent ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, consent: true})}>{t('assess.agree')}</Button>
									<Button variant={!formData.consent ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, consent: false})}>{t('assess.disagree')}</Button>
								</div>
							</div>
						)}

						{/* Section 1: Demographic Information */}
						{currentStep === 1 && (
							<div className="space-y-4">
								<div className="grid md:grid-cols-3 gap-4">
									<div>
										<Label>{t('assess.age')}</Label>
										<Input type="number" value={formData.age ?? ''} onChange={(e) => setFormData({...formData, age: Number(e.target.value) || null})} />
									</div>
									<div>
										<Label>{t('assess.gender')}</Label>
										<Select value={formData.gender || ''} onValueChange={(v) => setFormData({...formData, gender: v})}>
											<SelectTrigger><SelectValue placeholder={t('assess.select')} /></SelectTrigger>
											<SelectContent>
												<SelectItem value="male">{t('assess.sexMale')}</SelectItem>
												<SelectItem value="female">{t('assess.sexFemale')}</SelectItem>
												<SelectItem value="other">{t('assess.sexOther')}</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label>{t('assess.height')}</Label>
										<Input type="number" value={formData.height_cm ?? ''} onChange={(e) => setFormData({...formData, height_cm: Number(e.target.value) || null})} />
									</div>
								</div>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<Label>{t('assess.weight')}</Label>
										<Input type="number" value={formData.weight_kg ?? ''} onChange={(e) => setFormData({...formData, weight_kg: Number(e.target.value) || null})} />
									</div>
									<div>
										<Label>{t('assess.bmi')}</Label>
										<Input disabled value={(formData.height_cm && formData.weight_kg) ? (Math.round((formData.weight_kg / ((formData.height_cm/100)**2)) * 10) / 10) : ''} />
									</div>
								</div>
							</div>
						)}

						{/* Section 2: Occupational / Activity Profile */}
						{currentStep === 2 && (
							<div className="space-y-4">
								<div>
									<Label>{tr('Occupation / Job title', 'Kazi / Cheo')}</Label>
									<Input value={formData.occupation || ''} onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
								</div>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<Label>{tr('Average working hours per day', 'Wastani wa saa za kazi kwa siku')}</Label>
										<Input type="number" value={formData.working_hours_per_day ?? ''} onChange={(e) => setFormData({...formData, working_hours_per_day: Number(e.target.value) || null})} />
									</div>
									<div>
										<Label>{tr('Work posture', 'Mkao wa kazi')}</Label>
										<Select value={formData.work_posture || ''} onValueChange={(v: any) => setFormData({...formData, work_posture: v})}>
											<SelectTrigger>
												<SelectValue placeholder={t('assess.select')} />
											</SelectTrigger>
											<SelectContent>
												{WORK_POSTURE_OPTIONS.map((opt) => (
													<SelectItem key={opt.value} value={opt.value}>
														{opt.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								<div>
									<Label>{tr('Duration of continuous sitting/standing without break (hours)', 'Muda wa kukaa/kusimama bila mapumziko (saa)')}</Label>
									<Input type="number" value={formData.duration_continuous_hours ?? ''} onChange={(e) => setFormData({...formData, duration_continuous_hours: Number(e.target.value) || null})} />
								</div>
							</div>
						)}

						{/* Section 3: Present Acute MSK Symptoms */}
						{currentStep === 3 && (
							<div className="space-y-4">
								<div>
									<Label>{tr('Explain your problem (location, onset, type, aggravating/relieving factors)', 'Eleza tatizo lako (eneo, lilipoanza, aina, kinachozidisha/kinachopunguza)')}</Label>
									<Textarea placeholder={tr('E.g. started after lifting, pain when reaching overhead', 'Mfano: lilianza baada ya kuinua, maumivu ukifikia juu')} value={formData.presenting_problem || ''} onChange={(e) => setFormData({...formData, presenting_problem: e.target.value})} />
								</div>

								<div>
									<Label>{t('assess.prevTreatment')}</Label>
									<Textarea placeholder={tr('E.g. physiotherapy 2 months ago, manual therapy, home exercises', 'Mfano: physiotherapy miezi 2 iliyopita, tiba ya mikono, mazoezi ya nyumbani')} value={formData.previous_treatment || ''} onChange={(e) => setFormData({...formData, previous_treatment: e.target.value})} />
								</div>

								<div>
									<Label>{tr('Goals for next treatment', 'Malengo ya matibabu yajayo')}</Label>
									<Textarea placeholder={tr('E.g. return to lifting without pain, reduce night pain', 'Mfano: kurudi kuinua bila maumivu, kupunguza maumivu ya usiku')} value={formData.treatment_goals || ''} onChange={(e) => setFormData({...formData, treatment_goals: e.target.value})} />
								</div>
							</div>
						)}

						{/* Section 4: Pain Assessment (PAIN ASSESSMENT IN ONE PLACE) */}
						{currentStep === 4 && (
							<div className="space-y-4">
								<div>
									<Label>{tr('Onset of pain/discomfort', 'Mwanzo wa maumivu/usumbufu')}</Label>
									<Select value={formData.pain_onset || ''} onValueChange={(v: any) => setFormData({...formData, pain_onset: v})}>
									<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
										<SelectContent>
											<SelectItem value="<1w">{tr('<1 week (acute)', '< wiki 1 (ghafla)')}</SelectItem>
											<SelectItem value="1-3w">{tr('1-3 weeks (subacute)', 'wiki 1-3 (ya kati)')}</SelectItem>
											<SelectItem value="3-6w">{tr('3-6 weeks', 'wiki 3-6')}</SelectItem>
											<SelectItem value=">6w">{tr('>6 weeks (chronic)', '> wiki 6 (sugu)')}</SelectItem>
											<SelectItem value="unknown">{tr('Not sure / gradual', 'Sijui / taratibu')}</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label>{tr('Primary site(s) of pain/discomfort', 'Eneo kuu la maumivu/usumbufu')}</Label>
									<div className="mt-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button accessKey="p" aria-label={tr('Select primary sites of pain (Alt+P)', 'Chagua maeneo ya maumivu (Alt+P)')} variant="outline" className="w-full text-left">
													{(formData.primary_sites || []).length > 0
														? (formData.primary_sites as string[]).map(k => PRIMARY_SITE_OPTIONS.find(o => o.key === k)?.label || k).slice(0,2).join(', ') + ((formData.primary_sites || []).length > 2 ? ` +${(formData.primary_sites || []).length - 2} ${tr('more', 'zaidi')}` : '')
														: tr('Select primary sites', 'Chagua maeneo ya maumivu')
													}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>{tr('Primary sites', 'Maeneo ya msingi')}</DropdownMenuLabel>
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
									<Label>{tr('Pain intensity (0 = none, 10 = worst possible)', 'Kiwango cha maumivu (0 = hakuna, 10 = makali sana)')}</Label>
									<Input type="number" min={0} max={10} placeholder={tr('e.g. 6', 'mf. 6')} value={formData.pain_intensity ?? ''} onChange={(e) => setFormData({...formData, pain_intensity: Number(e.target.value) || null})} />
									</div>
								<div>
									<Label>{tr('Pain pattern', 'Muundo wa maumivu')}</Label>
									<Select value={formData.pain_pattern || ''} onValueChange={(v: any) => setFormData({...formData, pain_pattern: v})}>
										<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
										<SelectContent>
											<SelectItem value="constant">{tr('Constant (all day)', 'Ya kudumu (siku nzima)')}</SelectItem>
											<SelectItem value="intermittent">{tr('Intermittent', 'Hujirudia mara kwa mara')}</SelectItem>
											<SelectItem value="work_activity">{tr('Only during activity/work', 'Wakati wa shughuli/kazi tu')}</SelectItem>
											<SelectItem value="night_rest">{tr('Worse at night/rest', 'Huzidi usiku/ukipumzika')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
								</div>

								<div className="grid md:grid-cols-3 gap-4">
									<div>
									<Label>{tr('Does pain worsen with activity?', 'Maumivu huongezeka wakati wa shughuli?')}</Label>
										<div className="mt-2"><Button variant={formData.pain_worse_with_activity ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, pain_worse_with_activity: !formData.pain_worse_with_activity})}>{formData.pain_worse_with_activity ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button></div>
									</div>
									<div>
									<Label>{tr('Does pain improve with rest?', 'Maumivu hupungua ukipumzika?')}</Label>
										<div className="mt-2"><Button variant={formData.pain_improve_with_rest ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, pain_improve_with_rest: !formData.pain_improve_with_rest})}>{formData.pain_improve_with_rest ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button></div>
									</div>
									<div>
									<Label>{tr('Presence of numbness, tingling, swelling, or loss of motion', 'Kuwepo kwa ganzi, kufa ganzi/kuwasha, uvimbe, au upungufu wa mwendo')}</Label>
										<div className="mt-2"><Button variant={(formData.presence_numbness_tingling || formData.numbness) ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, presence_numbness_tingling: !formData.presence_numbness_tingling})}>{(formData.presence_numbness_tingling || formData.numbness) ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button></div>
									</div>
								</div>
							</div>
						)}

						{/* Section 5: Ergonomic Exposure */}
						{currentStep === 5 && (
							<div className="space-y-4">
								<div>
									<Label>{tr('Type of workstation/device used', 'Aina ya kituo/kifaa cha kazi')}</Label>
									<Select value={formData.workstation_type || ''} onValueChange={(v) => setFormData({...formData, workstation_type: v})}>
										<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
										<SelectContent>
											<SelectItem value="laptop">{tr('Laptop', 'Kompyuta mpakato')}</SelectItem>
											<SelectItem value="desktop">{tr('Desktop', 'Kompyuta mezani')}</SelectItem>
											<SelectItem value="tablet">{tr('Tablet', 'Tablet')}</SelectItem>
											<SelectItem value="mobile">{tr('Phone / mobile device', 'Simu / kifaa cha mkononi')}</SelectItem>
											<SelectItem value="standing">{tr('Standing desk', 'Meza ya kusimama')}</SelectItem>
											<SelectItem value="none">{tr('No fixed workstation / field work', 'Hakuna kituo maalum / kazi ya uwanjani')}</SelectItem>
											<SelectItem value="other">{tr('Other', 'Nyingine')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<Label>{tr('Frequency of repetitive motions', 'Mara kwa mara ya harakati za kurudia')}</Label>
										<Select value={formData.repetitive_motion_freq || ''} onValueChange={(v: any) => setFormData({...formData, repetitive_motion_freq: v})}>
											<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
											<SelectContent>
												<SelectItem value="rare">{tr('Rare', 'Mara chache')}</SelectItem>
												<SelectItem value="sometimes">{tr('Sometimes', 'Wakati mwingine')}</SelectItem>
												<SelectItem value="often">{tr('Often', 'Mara nyingi')}</SelectItem>
												<SelectItem value="constant">{tr('Constant', 'Kila wakati')}</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label>{tr('Overhead arm work', 'Kazi ya mikono juu ya kichwa')}</Label>
										<div className="mt-2">
											<Button variant={formData.overhead_arm_work ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, overhead_arm_work: !formData.overhead_arm_work})}>{formData.overhead_arm_work ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button>
										</div>
									</div>
								</div>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<Label>{tr('Prolonged static postures (sitting/standing)', 'Mikao ya muda mrefu bila kubadilika (kukaa/kusimama)')}</Label>
										<div className="mt-2">
											<Button variant={formData.prolonged_static_posture ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, prolonged_static_posture: !formData.prolonged_static_posture})}>{formData.prolonged_static_posture ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button>
										</div>
									</div>
									<div>
										<Label>{tr('Use of vibrating tools or machinery', 'Matumizi ya zana/mashine zenye mtikisiko')}</Label>
										<div className="mt-2">
											<Button variant={formData.vibrating_tools ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, vibrating_tools: !formData.vibrating_tools})}>{formData.vibrating_tools ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button>
										</div>
									</div>
								</div>
								<div>
									<Label>{tr('Frequency of micro-breaks / stretching', 'Muda wa mapumziko mafupi / kunyoosha')}</Label>
									<Select value={formData.microbreak_frequency || ''} onValueChange={(v: any) => setFormData({...formData, microbreak_frequency: v})}>
										<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
										<SelectContent>
											<SelectItem value="30min">{tr('Every 30 minutes', 'Kila dakika 30')}</SelectItem>
											<SelectItem value="1hr">{tr('Every 1 hour', 'Kila saa 1')}</SelectItem>
											<SelectItem value="rare">{tr('Rarely / never', 'Mara chache / kamwe')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						)}

						{/* Section 6: Functional Limitations */}
						{currentStep === 6 && (
							<div className="space-y-4">
								<div>
									<Label>{tr('24. Can you perform normal daily activities comfortably?', '24. Je, unaweza kufanya shughuli za kawaida za kila siku kwa urahisi?')}</Label>
									<Select value={formData.daily_activities_comfort || ''} onValueChange={(v: any) => setFormData({...formData, daily_activities_comfort: v})}>
										<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
										<SelectContent>
											<SelectItem value="yes">{tr('Yes, comfortably', 'Ndiyo, bila shida')}</SelectItem>
											<SelectItem value="mild">{tr('Some difficulty', 'Shida kidogo')}</SelectItem>
											<SelectItem value="no">{tr('No, difficult/unable', 'Hapana, ni vigumu / siwezi')}</SelectItem>
										</SelectContent>
									</Select>
									{touched.section6 && !formData.daily_activities_comfort && (
										<div className="text-sm text-destructive mt-1">{tr('Please select whether you can perform normal daily activities comfortably.', 'Tafadhali chagua kama unaweza kufanya shughuli za kila siku kwa urahisi.')}</div>
									)}
								</div>

								<div>
									<Label>{tr('25. Activities limited by pain (select all that apply)', '25. Shughuli zinazozuiliwa na maumivu (chagua zote zinazofaa)')}</Label>
									<div className="mt-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button accessKey="a" aria-label={tr('Select activities limited by pain (Alt+A)', 'Chagua shughuli zinazozuiliwa (Alt+A)')} variant="outline" className="w-full text-left">
													{(formData.activities_limited || []).length > 0
														? (formData.activities_limited as string[])
																.map(k => ACTIVITIES_OPTIONS.find(o => o.key === k)?.label || k)
																.join(', ')
														: tr('Select activities limited by pain', 'Chagua shughuli zinazozuiliwa na maumivu')}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>{tr('Activities limited', 'Shughuli zilizozuiliwa')}</DropdownMenuLabel>
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
								</div>

								<div>
									<Label>{tr('26. Ability to maintain posture', '26. Uwezo wa kudumisha mkao')}</Label>
									<Select value={formData.posture_ability || ''} onValueChange={(v: any) => setFormData({...formData, posture_ability: v})}>
										<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
										<SelectContent>
											<SelectItem value="upright_neutral">{tr('Upright neutral', 'Wima wa kawaida')}</SelectItem>
											<SelectItem value="forward_head_rounded_shoulders">{tr('Forward head / rounded shoulders', 'Kichwa mbele / mabega yamezunguka')}</SelectItem>
											<SelectItem value="slouched_curved_lower_back">{tr('Slouched / curved lower back', 'Kujikunja / mgongo wa chini umejikunja')}</SelectItem>
											<SelectItem value="standing_asymmetrically">{tr('Standing asymmetrically', 'Kusimama bila usawa')}</SelectItem>
										</SelectContent>
									</Select>
									{touched.section6 && !formData.posture_ability && (
										<div className="text-sm text-destructive mt-1">{tr('Please select your ability to maintain posture.', 'Tafadhali chagua uwezo wako wa kudumisha mkao.')}</div>
									)}
								</div>

								<div>
									<Label>{tr('27. Recent increase in workload or repetitive activity?', '27. Kuongezeka kwa kazi hivi karibuni au shughuli za kurudia?')}</Label>
									<Select value={formData.recent_increase_workload ? 'yes' : formData.recent_increase_workload === false ? 'no' : ''} onValueChange={(v: any) => setFormData({...formData, recent_increase_workload: v === 'yes'})}>
										<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
										<SelectContent>
											<SelectItem value="yes">{tr('Yes', 'Ndiyo')}</SelectItem>
											<SelectItem value="no">{tr('No', 'Hapana')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						)}

						{/* Section 7: Past Medical History */}
						{currentStep === 7 && (
							<div className="space-y-4">
								<div>
									<Label>{tr('History of prior musculoskeletal injuries?', 'Historia ya majeraha ya misuli/mifupa?')}</Label>
									<div className="mt-2"><Button variant={formData.prior_msk_injury ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, prior_msk_injury: !formData.prior_msk_injury})}>{formData.prior_msk_injury ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button></div>
								</div>
								<div>
									<Label>{tr('If yes, specify', 'Ikiwa ndiyo, eleza')}</Label>
									<Input value={formData.prior_msk_injury_details || ''} onChange={(e) => setFormData({...formData, prior_msk_injury_details: e.target.value})} />
								</div>
								<div>
									<Label>{tr('Previous surgeries in affected area?', 'Upasuaji wa awali katika eneo lililoathirika?')}</Label>
									<div className="mt-2"><Button variant={formData.previous_surgeries ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, previous_surgeries: !formData.previous_surgeries})}>{formData.previous_surgeries ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button></div>
								</div>
								<div>
									<Label>{tr('If yes, specify', 'Ikiwa ndiyo, eleza')}</Label>
									<Input value={formData.previous_surgeries_details || ''} onChange={(e) => setFormData({...formData, previous_surgeries_details: e.target.value})} />
								</div>
								<div>
									<Label>{tr('Chronic conditions affecting musculoskeletal health?', 'Magonjwa sugu yanayoathiri afya ya misuli/mifupa?')}</Label>
									<div className="mt-2"><Button variant={formData.chronic_conditions ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, chronic_conditions: !formData.chronic_conditions})}>{formData.chronic_conditions ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button></div>
								</div>
								<div>
									<Label>{tr('Current medications affecting muscles, joints, or pain perception?', 'Dawa unazotumia zinazoathiri misuli, viungo, au hisia za maumivu?')}</Label>
									<div className="mt-2"><Button variant={formData.current_medications ? 'default' : 'outline'} size="sm" onClick={() => setFormData({...formData, current_medications: !formData.current_medications})}>{formData.current_medications ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}</Button></div>
								</div>
							</div>
						)}

						{/* Section 8: Explanation of Condition */}
						{currentStep === 8 && (
							<div className="space-y-4">
								<div>
									<Label>{tr('Describe how the pain started', 'Eleza jinsi maumivu yalivyoanza')}</Label>
									<Textarea value={formData.mechanism || ''} onChange={(e) => setFormData({...formData, mechanism: e.target.value})} />
								</div>
								<div>
									<Label>{tr('Type of discomfort experienced', 'Aina ya usumbufu unaopata')}</Label>
									<div className="mt-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													accessKey="d"
													aria-label={tr('Select discomfort types (Alt+D)', 'Chagua aina za usumbufu (Alt+D)')}
													variant="outline"
													className="w-full text-left"
												>
													{(formData.discomfort_types || []).length > 0
														? (formData.discomfort_types as string[]).join(', ')
														: tr('Select discomfort types', 'Chagua aina za usumbufu')}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>{tr('Discomfort', 'Usumbufu')}</DropdownMenuLabel>
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
								</div>

								<div>
									<Label>{tr('Aggravating factors', 'Vichochezi vya maumivu')}</Label>
									<div className="mt-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													accessKey="g"
													aria-label={tr('Select aggravating factors (Alt+G)', 'Chagua vichochezi (Alt+G)')}
													variant="outline"
													className="w-full text-left"
												>
													{(formData.aggravating_factors || []).length > 0
														? (formData.aggravating_factors as string[]).join(', ')
														: tr('Select aggravating factors', 'Chagua vichochezi')}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>{tr('Aggravating', 'Vichochezi')}</DropdownMenuLabel>
												{[
													tr('Sitting', 'Kukaa'),
													tr('Standing', 'Kusimama'),
													tr('Lifting', 'Kuinua'),
													tr('Bending', 'Kuinama'),
													tr('Repetitive movements', 'Harakati za kurudia'),
													tr('Other', 'Nyingine')
												].map((opt) => {
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
												<div className="p-2"><Input placeholder={tr('Other (specify)', 'Nyingine (eleza)')} value={formData.aggravating_factors_other || ''} onChange={(e) => setFormData({...formData, aggravating_factors_other: e.target.value})} /></div>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>

								<div>
									<Label>{tr('Relieving factors', 'Vichochezi vya kupunguza maumivu')}</Label>
									<div className="mt-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													accessKey="r"
													aria-label={tr('Select relieving factors (Alt+R)', 'Chagua vinavyopunguza (Alt+R)')}
													variant="outline"
													className="w-full text-left"
												>
													{(formData.relieving_factors || []).length > 0
														? (formData.relieving_factors as string[]).join(', ')
														: tr('Select relieving factors', 'Chagua vinavyopunguza')}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>{tr('Relieving', 'Vinavyopunguza')}</DropdownMenuLabel>
												{[
													tr('Rest', 'Mapumziko'),
													tr('Stretching', 'Kunyoosha'),
													tr('Heat/cold', 'Joto/baridi'),
													tr('Posture correction', 'Kurekebisha mkao'),
													tr('Medication', 'Dawa'),
													tr('Other', 'Nyingine')
												].map((opt) => {
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
												<div className="p-2"><Input placeholder={tr('Other (specify)', 'Nyingine (eleza)')} value={formData.relieving_factors_other || ''} onChange={(e) => setFormData({...formData, relieving_factors_other: e.target.value})} /></div>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
								<div>
									<Label>{tr('Impact on daily life or work', 'Athari kwenye maisha ya kila siku au kazi')}</Label>
									<Select value={formData.impact_on_daily || ''} onValueChange={(v: any) => setFormData({...formData, impact_on_daily: v})}>
										<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
										<SelectContent>
											<SelectItem value="minimal">{tr('Minimal', 'Ndogo')}</SelectItem>
											<SelectItem value="moderate">{tr('Moderate', 'Wastani')}</SelectItem>
											<SelectItem value="severe">{tr('Severe', 'Kali')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						)}

						{/* Step 9: Preferences & Goals / Submit */}
						{currentStep === 9 && (
							<div className="space-y-6">
								<div>
									<Label>{tr('What is your main goal?', 'Lengo lako kuu ni lipi?')}</Label>
									<Textarea value={formData.goals || ''} onChange={(e) => setFormData({...formData, goals: e.target.value})} />
								</div>

								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<Label>{tr('How many days per week can you exercise?', 'Ni siku ngapi kwa wiki unaweza kufanya mazoezi?')}</Label>
										<Input type="number" min={0} max={7} value={formData.days_per_week ?? 3} onChange={(e) => setFormData({...formData, days_per_week: Number(e.target.value)})} />
									</div>
									<div>
										<Label>{tr('Do you have equipment?', 'Je, una vifaa vya mazoezi?')}</Label>
										<Select value={formData.equipment || 'none'} onValueChange={(value) => setFormData({...formData, equipment: value})}>
											<SelectTrigger>
											<SelectValue placeholder={tr('Select', 'Chagua')} />
											</SelectTrigger>
											<SelectContent>
											<SelectItem value="none">{tr('None', 'Hakuna')}</SelectItem>
											<SelectItem value="bands">{tr('Resistance bands', 'Bendi za upinzani')}</SelectItem>
											<SelectItem value="weights">{tr('Small weights', 'Uzito mdogo')}</SelectItem>
											<SelectItem value="gym">{tr('Gym access', 'Ufikiaji wa gym')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="text-sm text-muted-foreground">{tr('After submitting, Ergocare will generate a personalized exercise plan. If your answers contain urgent symptoms, the system will flag your assessment for physiotherapist review instead of providing automated exercises.', 'Baada ya kuwasilisha, Ergocare itaunda mpango wa mazoezi uliobinafsishwa. Ikiwa majibu yako yana dalili za dharura, mfumo utaonyesha tathmini yako kwa ukaguzi wa physiotherapist badala ya kutoa mazoezi kiotomatiki.')}</div>
							</div>
						)}

						</div>
						{/* Navigation Buttons */}
						<div className="mt-6 -mx-6 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
							<div className="flex items-center justify-between px-6 py-4">
								<Button 
									variant="outline" 
									onClick={prevStep} 
									disabled={currentStep === 0}
								>
									{t('assess.previous')}
								</Button>

								<div className="text-xs text-muted-foreground hidden sm:block">
									{tr('Step', 'Hatua')} {currentStep + 1} {tr('of', 'ya')} {steps.length}
								</div>
								
								{currentStep < steps.length - 1 ? (
									<Button onClick={nextStep} className="bg-gradient-hero" disabled={currentStep === 0 && !formData.consent}>
										{t('assess.nextStep')}
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								) : (
									<Button onClick={async () => {
									try {
										const { data: userData } = await supabase.auth.getUser();
										const user = userData?.user;
										if (!user) {
											toast({ title: tr('Not logged in', 'Hujaingia'), description: tr('Please login to submit your assessment', 'Tafadhali ingia ili kuwasilisha tathmini yako'), variant: 'destructive' });
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
											const msg = String(ie?.message || ie || '').toLowerCase();
											if (import.meta.env.DEV && (msg.includes('could not find the table') || msg.includes('schema cache') || msg.includes('relation "assessments"'))) {
												toast({ title: tr('Dev fallback', 'Mbinu ya dharura (dev)'), description: tr('Assessments table missing — running AI generation locally without saving to database (dev only).', 'Jedwali la tathmini halipo — inaunda mpango wa AI ndani ya kifaa bila kuhifadhi kwenye hifadhidata (dev tu).'), variant: 'default' });
												inserted = { id: 'dev-local-' + Date.now().toString() };
											} else {
												throw ie;
											}
										}

										if (score.red_flag) {
											await supabase.from('recommendations').insert({
												assessment_id: inserted.id,
												program: { flagged: true, reason: 'red_flag' },
												confidence: 0,
												source: 'flagged'
											});

											toast({ title: tr('Red flag detected', 'Dalili hatarishi zimegunduliwa'), description: tr('Your answers indicate urgent symptoms. A physiotherapist has been notified for review.', 'Majibu yako yanaonyesha dalili za dharura. Mtaalamu wa tiba amepewa taarifa kwa ukaguzi.'), variant: 'destructive' });
											return;
										}

                                        const aiMapping = deriveAIMapping(formData);
                                        const payload = {
                                            assessmentData: { healthData: formData, questionnaireAnswers: formData, ai_mapping: aiMapping, hasVideo: formData.hasVideo },
                                            assessmentId: inserted.id
                                        };
                                        const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-exercise-program', { body: payload });

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

                                        // Try client-side persistence as a fallback (in case Edge Function couldn't insert)
                                        try {
                                          const { data: rec, error: recErr } = await supabase
                                            .from('recommendations')
                                            .insert({
                                              assessment_id: inserted.id,
                                              program: exerciseProgram,
                                              confidence: (exerciseProgram?.isFallback ? 0.3 : 0.8),
                                              source: (exerciseProgram?.isFallback ? 'fallback' : 'ai')
                                            })
                                            .select('id')
                                            .single();
                                          if (recErr) console.warn('Client insert recommendations failed:', recErr);
                                        } catch (ci) {
                                          console.warn('Client-side persist error:', ci);
                                        }

                                        toast({ title: tr('Assessment submitted', 'Tathmini imewasilishwa'), description: tr('Exercise program created.', 'Mpango wa mazoezi umeundwa.') });

                                        // Navigate patient to My programs to view their plan
                                        navigate('/programs');
									} catch (err: any) {
										console.error(err);
										const message = String(err?.message || err);
										if (message.toLowerCase().includes('could not find the table') || message.toLowerCase().includes('schema cache')) {
											toast({
												title: tr('Submission error', 'Hitilafu ya kuwasilisha'),
												description: tr('The assessments table was not found in your Supabase project. Please deploy the migrations or create the table in the Supabase dashboard. See README-ASSESSMENT.md for migration steps.', 'Jedwali la tathmini halijapatikana kwenye mradi wako wa Supabase. Tafadhali tumia migrations au tengeneza jedwali hilo kwenye Supabase dashboard. Angalia README-ASSESSMENT.md kwa hatua.'),
												variant: 'destructive'
											});
											console.error('Schema issue: ensure supabase migrations have been applied or the table exists in the project.');
										} else {
											toast({ title: tr('Submission error', 'Hitilafu ya kuwasilisha'), description: message, variant: 'destructive' });
										}
									}
									}} className="bg-gradient-hero">
										{tr('Complete Assessment', 'Maliza Tathmini')}
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			</div>
			{generatedProgram && (
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<Card>
						<CardHeader>
							<CardTitle>{tr('Generated Exercise Program', 'Mpango wa mazoezi ulioundwa')}</CardTitle>
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
