import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, Target, ArrowRight } from 'lucide-react';
import { scoreAssessment, AssessmentForm, deriveAIMapping } from '@/lib/assessment';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

const AssessmentPage = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const { toast } = useToast();
	const navigate = useNavigate();
	const { t, language } = useLanguage();
	const { profile } = useAuth();
	const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
	const [formData, setFormData] = useState<AssessmentForm>({
		consent: true,
		// Demographics (pre-filled from profile)
		age: null,
		gender: null,
		height_cm: null,
		weight_kg: null,
		// Occupation (pre-filled from profile)
		occupation: null,
		working_hours_per_day: null,
		work_type: null,
		work_posture: null,
		duration_continuous_hours: null,
		// Step 0: Present Acute Symptoms
		presenting_problem: null,
		pain_onset: null,
		primary_sites: [],
		pain_intensity: null,
		pain_pattern: null,
		pain_worse_with_activity: false,
		pain_improve_with_rest: false,
		presence_numbness_tingling: false,
		// Step 2: Ergonomics
		workstation_type: null,
		repetitive_motion_freq: null,
		overhead_arm_work: false,
		prolonged_static_posture: false,
		vibrating_tools: false,
		microbreak_frequency: null,
		// Step 3: Functional Limitations
		daily_activities_comfort: null,
		activities_limited: [],
		posture_ability: null,
		recent_increase_workload: false,
		// Step 4: Medical History
		prior_msk_injury: false,
		prior_msk_injury_details: null,
		previous_surgeries: false,
		previous_surgeries_details: null,
		chronic_conditions: false,
		chronic_conditions_details: null,
		current_medications: false,
		current_medications_list: null,
		// Removed fields kept for schema compatibility
		mechanism: null,
		discomfort_types: [],
		aggravating_factors: [],
		relieving_factors: [],
		impact_on_daily: null,
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

	// Pre-populate profile fields (age, gender, occupation) saved during registration
	useEffect(() => {
		if (!profile) return;
		setFormData(prev => ({
			...prev,
			age: prev.age ?? profile.age ?? null,
			gender: prev.gender ?? profile.sex ?? null,
			occupation: prev.occupation ?? profile.occupation ?? null,
		}));
	}, [profile]);

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
					setFormData(prev => ({ ...prev, ...(data.data || {}), consent: true }));
				}
				if (typeof data?.step === 'number') setCurrentStep(data.step);
			} catch (e) {
				console.debug('Failed to load draft', e);
			}
		})();
	}, []);

	const [touched, setTouched] = useState<{ functional?: boolean }>({});

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
				if (msg.includes('could not find the table') || msg.includes('public.drafts') || msg.includes('schema cache')) {
					try {
						const draftBody: any = {
							patient_user_id: user.id,
							data: formData,
							language: language,
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
							return false;
						}
						return true;
					} catch (e) {
						toast({ title: tr('Save failed', 'Hifadhi imeshindikana'), description: tr('Could not save assessment to server.', 'Imeshindikana kuhifadhi tathmini kwenye seva.'), variant: 'destructive' });
						return false;
					}
				}
				toast({ title: tr('Save failed', 'Hifadhi imeshindikana'), description: String(error.message || error), variant: 'destructive' });
				return false;
			}
			return true;
		} catch (e: any) {
			toast({ title: tr('Save failed', 'Hifadhi imeshindikana'), description: tr('Unexpected error while saving.', 'Hitilafu isiyotarajiwa wakati wa kuhifadhi.'), variant: 'destructive' });
			return false;
		}
	};

	const steps = [
		{ id: 0, title: t('assess.step.presentAcute'), icon: FileText },
		{ id: 1, title: t('assess.step.painAssessment'), icon: FileText },
		{ id: 2, title: t('assess.step.ergonomics'), icon: Video },
		{ id: 3, title: t('assess.step.functional'), icon: Video },
		{ id: 4, title: t('assess.step.history'), icon: Video },
		{ id: 5, title: t('assess.step.reviewSubmit'), icon: Target },
	];

	const nextStep = () => {
		if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
	};

	const prevStep = () => {
		if (currentStep > 0) setCurrentStep(currentStep - 1);
	};

	// Debounced autosave
	useEffect(() => {
		const timer = setTimeout(() => {
			saveDraftToServer().catch(e => console.debug('Silent save failed', e));
		}, 800);
		return () => clearTimeout(timer);
	}, [formData]);

	return (
		<div className="min-h-screen bg-background flex flex-col relative">
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_top,_hsl(var(--primary))_0%,_transparent_55%)] opacity-10" />
			<Navigation />

			<div className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-3">
				<div className="grid gap-4 lg:grid-cols-[260px_1fr] items-stretch max-w-screen-2xl mx-auto">

					{/* Sidebar stepper */}
					<aside className="hidden lg:block">
						<Card className="shadow-card bg-card/80 backdrop-blur flex flex-col h-full">
							<CardHeader className="border-b border-border/60">
								<CardTitle className="text-lg">{t('assess.stepsTitle')}</CardTitle>
								<div className="text-sm text-muted-foreground">
									{t('assess.step')} {currentStep + 1} {t('assess.of')} {steps.length}
								</div>
							</CardHeader>
							<CardContent className="space-y-2 overflow-y-auto flex-1">
								{steps.map((step) => {
									const isActive = step.id === currentStep;
									const isComplete = step.id < currentStep;
									return (
										<button
											key={step.id}
											type="button"
											onClick={() => setCurrentStep(step.id)}
											className={[
												"w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-base transition-colors",
												isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground",
											].join(" ")}
											aria-current={isActive ? "step" : undefined}
										>
											<span className={[
												"inline-flex h-6 w-6 items-center justify-center rounded-full text-xs border flex-shrink-0",
												isComplete ? "bg-primary text-primary-foreground border-primary" :
												isActive ? "border-primary text-primary bg-primary/10" :
												"bg-background text-muted-foreground border-border",
											].join(" ")}>
												{step.id + 1}
											</span>
											<span className="truncate">{step.title}</span>
										</button>
									);
								})}
							</CardContent>
						</Card>
					</aside>

					{/* Main content */}
					<Card className="shadow-card w-full flex flex-col bg-card/90 backdrop-blur lg:border-l lg:border-border/60 lg:pl-6">
						<CardHeader className="border-b border-border/60 bg-card/95 backdrop-blur py-3">
							<div className="flex items-center justify-between w-full gap-4">
								<div className="flex-1 min-w-0 flex items-center gap-3">
									{(() => {
										const Icon = steps.find(s => s.id === currentStep)?.icon;
										return Icon ? <Icon className="h-5 w-5 text-primary flex-shrink-0" /> : null;
									})()}
									<div className="min-w-0">
										<CardTitle className="text-xl leading-tight truncate">
											{steps.find(s => s.id === currentStep)?.title}
										</CardTitle>
										<div className="text-sm text-muted-foreground mt-0.5">{t('assess.helper')}</div>
									</div>
								</div>
								<div className="flex-shrink-0 text-sm text-muted-foreground">
									{t('assess.step')} {currentStep + 1} {t('assess.of')} {steps.length}
								</div>
							</div>
							<div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
								<div
									className="bg-primary h-1.5 rounded-full transition-all duration-300"
									style={{ width: `${Math.round((currentStep / (steps.length - 1)) * 100)}%` }}
								/>
							</div>
							{/* Mobile step pills */}
							<div className="mt-2 flex gap-1.5 overflow-x-auto lg:hidden pb-0.5">
								{steps.map((step) => {
									const isActive = step.id === currentStep;
									return (
										<button
											key={step.id}
											type="button"
											onClick={() => setCurrentStep(step.id)}
											className={[
												"shrink-0 rounded-full border px-2.5 py-0.5 text-xs",
												isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground",
											].join(" ")}
										>
											{step.id + 1}
										</button>
									);
								})}
							</div>
						</CardHeader>

						<CardContent className="flex flex-col flex-1 text-base px-5 md:px-7 pt-4 pb-4 [&_input]:h-9 [&_input]:text-base [&_textarea]:min-h-[52px] [&_textarea]:text-base [&_textarea]:resize-y [&_[role=combobox]]:h-9 [&_[role=combobox]]:text-base [&_label]:text-base [&_label]:mb-0.5">
							<div className="flex-1 flex flex-col gap-4">

								{/* Step 0: Present Acute MSK Symptoms */}
								{currentStep === 0 && (
									<div className="space-y-3">
										<div>
											<Label>
												{tr(
													'Explain your problem (location, onset, type, aggravating/relieving factors)',
													'Eleza tatizo lako (eneo, lilipoanza, aina, kinachozidisha/kinachopunguza)'
												)}
											</Label>
											<Textarea
																								placeholder={tr(
													'e.g. lower back pain when sitting',
													'mf. maumivu ya mgongo ukikaa'
												)}
												value={formData.presenting_problem || ''}
												onChange={(e) => setFormData({ ...formData, presenting_problem: e.target.value })}
											/>
										</div>

										<div>
											<Label>{t('assess.prevTreatment')}</Label>
											<Textarea
																								placeholder={tr(
													'e.g. physiotherapy, home exercises',
													'mf. physiotherapy, mazoezi ya nyumbani'
												)}
												value={formData.previous_treatment || ''}
												onChange={(e) => setFormData({ ...formData, previous_treatment: e.target.value })}
											/>
										</div>

										<div>
											<Label>{tr('Your goal for the next treatment', 'Lengo lako la matibabu yajayo')}</Label>
											<Textarea
																								placeholder={tr(
													'e.g. move without pain',
													'mf. kusonga bila maumivu'
												)}
												value={formData.treatment_goals || ''}
												onChange={(e) => setFormData({ ...formData, treatment_goals: e.target.value })}
											/>
										</div>
									</div>
								)}

								{/* Step 1: Pain Assessment */}
								{currentStep === 1 && (
									<div className="space-y-3">
										<div>
											<Label>
												{tr(
													'Pain intensity (0 = none, 10 = worst possible)',
													'Kiwango cha maumivu (0 = hakuna, 10 = makali sana)'
												)}
											</Label>
											<Input
												type="number"
												min={0}
												max={10}
												placeholder={tr('e.g. 6', 'mf. 6')}
												value={formData.pain_intensity ?? ''}
												onChange={(e) => setFormData({ ...formData, pain_intensity: Number(e.target.value) || null })}
											/>
										</div>

										<div>
											<Label>{tr('Pain pattern', 'Muundo wa maumivu')}</Label>
											<Select
												value={formData.pain_pattern || ''}
												onValueChange={(v: any) => setFormData({ ...formData, pain_pattern: v })}
											>
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
								)}

								{/* Step 2: Ergonomic Exposure */}
								{currentStep === 2 && (
									<div className="space-y-3">
										<div>
											<Label>{tr('Describe your workstation / devices and how you work', 'Eleza kituo chako cha kazi / vifaa na jinsi unavyofanya kazi')}</Label>
											<Textarea
												value={formData.workstation_type || ''}
												onChange={(e) => setFormData({ ...formData, workstation_type: e.target.value })}
												rows={3}
												className="mt-1"
												placeholder={tr(
													'In your own words, e.g. "Laptop on the dining table about 6 hours a day, plus long motorbike rides" or "Standing at a market stall all day, carrying heavy loads"',
													'Kwa maneno yako, mf. "Kompyuta mpakato mezani karibu saa 6 kwa siku, pamoja na safari ndefu za pikipiki" au "Kusimama sokoni siku nzima, kubeba mizigo mizito"'
												)}
											/>
											<p className="mt-1 text-xs text-muted-foreground">
												{tr(
													'The more detail you give, the better the AI can tailor your exercise program.',
													'Kadri unavyotoa maelezo zaidi, ndivyo AI itakavyobinafsisha programu yako ya mazoezi vizuri zaidi.'
												)}
											</p>
										</div>

										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<Label>{tr('Frequency of repetitive motions', 'Mara kwa mara ya harakati za kurudia')}</Label>
												<Select
													value={formData.repetitive_motion_freq || ''}
													onValueChange={(v: any) => setFormData({ ...formData, repetitive_motion_freq: v })}
												>
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
													<Button
														variant={formData.overhead_arm_work ? 'default' : 'outline'}
														size="sm"
														onClick={() => setFormData({ ...formData, overhead_arm_work: !formData.overhead_arm_work })}
													>
														{formData.overhead_arm_work ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}
													</Button>
												</div>
											</div>
										</div>

										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<Label>{tr('Prolonged static postures (sitting/standing)', 'Mikao ya muda mrefu bila kubadilika (kukaa/kusimama)')}</Label>
												<div className="mt-2">
													<Button
														variant={formData.prolonged_static_posture ? 'default' : 'outline'}
														size="sm"
														onClick={() => setFormData({ ...formData, prolonged_static_posture: !formData.prolonged_static_posture })}
													>
														{formData.prolonged_static_posture ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}
													</Button>
												</div>
											</div>
											<div>
												<Label>{tr('Use of vibrating tools or machinery', 'Matumizi ya zana/mashine zenye mtikisiko')}</Label>
												<div className="mt-2">
													<Button
														variant={formData.vibrating_tools ? 'default' : 'outline'}
														size="sm"
														onClick={() => setFormData({ ...formData, vibrating_tools: !formData.vibrating_tools })}
													>
														{formData.vibrating_tools ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}
													</Button>
												</div>
											</div>
										</div>

										<div>
											<Label>{tr('Frequency of micro-breaks / stretching', 'Muda wa mapumziko mafupi / kunyoosha')}</Label>
											<Select
												value={formData.microbreak_frequency || ''}
												onValueChange={(v: any) => setFormData({ ...formData, microbreak_frequency: v })}
											>
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

								{/* Step 3: Functional Limitations */}
								{currentStep === 3 && (
									<div className="space-y-3">
										<div>
											<Label>
												{tr(
													'Can you perform normal daily activities comfortably?',
													'Je, unaweza kufanya shughuli za kawaida za kila siku kwa urahisi?'
												)}
											</Label>
											<Select
												value={formData.daily_activities_comfort || ''}
												onValueChange={(v: any) => setFormData({ ...formData, daily_activities_comfort: v })}
											>
												<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
												<SelectContent>
													<SelectItem value="yes">{tr('Yes, comfortably', 'Ndiyo, bila shida')}</SelectItem>
													<SelectItem value="mild">{tr('Some difficulty', 'Shida kidogo')}</SelectItem>
													<SelectItem value="no">{tr('No, difficult/unable', 'Hapana, ni vigumu / siwezi')}</SelectItem>
												</SelectContent>
											</Select>
											{touched.functional && !formData.daily_activities_comfort && (
												<div className="text-sm text-destructive mt-1">
													{tr(
														'Please select whether you can perform normal daily activities comfortably.',
														'Tafadhali chagua kama unaweza kufanya shughuli za kila siku kwa urahisi.'
													)}
												</div>
											)}
										</div>
									</div>
								)}

								{/* Step 4: Past Medical History */}
								{currentStep === 4 && (
									<div className="space-y-3">
										<div>
											<Label>{tr('History of prior musculoskeletal injuries?', 'Historia ya majeraha ya misuli/mifupa?')}</Label>
											<div className="mt-2">
												<Button
													variant={formData.prior_msk_injury ? 'default' : 'outline'}
													size="sm"
													onClick={() => setFormData({ ...formData, prior_msk_injury: !formData.prior_msk_injury })}
												>
													{formData.prior_msk_injury ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}
												</Button>
											</div>
										</div>
										{formData.prior_msk_injury && (
											<div>
												<Label>{tr('If yes, specify', 'Ikiwa ndiyo, eleza')}</Label>
												<Input
																										placeholder={tr(
														'e.g. shoulder injury, 2021',
														'mf. jeraha la bega, 2021'
													)}
													value={formData.prior_msk_injury_details || ''}
													onChange={(e) => setFormData({ ...formData, prior_msk_injury_details: e.target.value })}
												/>
											</div>
										)}

										<div>
											<Label>{tr('Previous surgeries in affected area?', 'Upasuaji wa awali katika eneo lililoathirika?')}</Label>
											<div className="mt-2">
												<Button
													variant={formData.previous_surgeries ? 'default' : 'outline'}
													size="sm"
													onClick={() => setFormData({ ...formData, previous_surgeries: !formData.previous_surgeries })}
												>
													{formData.previous_surgeries ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}
												</Button>
											</div>
										</div>
										{formData.previous_surgeries && (
											<div>
												<Label>{tr('If yes, specify', 'Ikiwa ndiyo, eleza')}</Label>
												<Input
																										placeholder={tr(
														'e.g. knee surgery, 2020',
														'mf. upasuaji wa goti, 2020'
													)}
													value={formData.previous_surgeries_details || ''}
													onChange={(e) => setFormData({ ...formData, previous_surgeries_details: e.target.value })}
												/>
											</div>
										)}

										<div>
											<Label>{tr('Chronic conditions affecting musculoskeletal health?', 'Magonjwa sugu yanayoathiri afya ya misuli/mifupa?')}</Label>
											<div className="mt-2">
												<Button
													variant={formData.chronic_conditions ? 'default' : 'outline'}
													size="sm"
													onClick={() => setFormData({ ...formData, chronic_conditions: !formData.chronic_conditions })}
												>
													{formData.chronic_conditions ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}
												</Button>
											</div>
										</div>

										<div>
											<Label>{tr('Current medications affecting muscles, joints, or pain perception?', 'Dawa unazotumia zinazoathiri misuli, viungo, au hisia za maumivu?')}</Label>
											<div className="mt-2">
												<Button
													variant={formData.current_medications ? 'default' : 'outline'}
													size="sm"
													onClick={() => setFormData({ ...formData, current_medications: !formData.current_medications })}
												>
													{formData.current_medications ? tr('Yes', 'Ndiyo') : tr('No', 'Hapana')}
												</Button>
											</div>
										</div>
									</div>
								)}

								{/* Step 5: Review & Submit */}
								{currentStep === 5 && (
									<div className="space-y-3">
										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<Label>{tr('How many days per week can you exercise?', 'Ni siku ngapi kwa wiki unaweza kufanya mazoezi?')}</Label>
												<Input
													type="number"
													min={0}
													max={7}
													value={formData.days_per_week ?? 3}
													onChange={(e) => setFormData({ ...formData, days_per_week: Number(e.target.value) })}
												/>
											</div>
											<div>
												<Label>{tr('Do you have equipment?', 'Je, una vifaa vya mazoezi?')}</Label>
												<Select
													value={formData.equipment || 'none'}
													onValueChange={(value) => setFormData({ ...formData, equipment: value })}
												>
													<SelectTrigger><SelectValue placeholder={tr('Select', 'Chagua')} /></SelectTrigger>
													<SelectContent>
														<SelectItem value="none">{tr('None', 'Hakuna')}</SelectItem>
														<SelectItem value="bands">{tr('Resistance bands', 'Bendi za upinzani')}</SelectItem>
														<SelectItem value="weights">{tr('Small weights', 'Uzito mdogo')}</SelectItem>
														<SelectItem value="gym">{tr('Gym access', 'Ufikiaji wa gym')}</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="text-sm text-muted-foreground">
											{tr(
												'After submitting, Ergocare will generate a personalized exercise plan. If your answers contain urgent symptoms, the system will flag your assessment for physiotherapist review instead of providing automated exercises.',
												'Baada ya kuwasilisha, Ergocare itaunda mpango wa mazoezi uliobinafsishwa. Ikiwa majibu yako yana dalili za dharura, mfumo utaonyesha tathmini yako kwa ukaguzi wa physiotherapist badala ya kutoa mazoezi kiotomatiki.'
											)}
										</div>
									</div>
								)}

							</div>

							{/* Navigation Buttons */}
							<div className="mt-4 -mx-5 md:-mx-7 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
								<div className="flex items-center justify-between px-5 md:px-7 py-3">
									<Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0}>
										{t('assess.previous')}
									</Button>

									<div className="text-sm text-muted-foreground hidden sm:block">
										{tr('Step', 'Hatua')} {currentStep + 1} {tr('of', 'ya')} {steps.length}
									</div>

									{currentStep < steps.length - 1 ? (
										<Button size="sm" onClick={nextStep} className="bg-gradient-hero">
											{t('assess.nextStep')}
											<ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									) : (
										<Button
											className="bg-gradient-hero"
											onClick={async () => {
												try {
													const { data: userData } = await supabase.auth.getUser();
													const user = userData?.user;
													if (!user) {
														toast({
															title: tr('Not logged in', 'Hujaingia'),
															description: tr('Please login to submit your assessment', 'Tafadhali ingia ili kuwasilisha tathmini yako'),
															variant: 'destructive'
														});
														return;
													}

													const score = scoreAssessment(formData as AssessmentForm);

													const insertBody = {
														patient_user_id: user.id,
														language: language,
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
															toast({
																title: tr('Dev fallback', 'Mbinu ya dharura (dev)'),
																description: tr('Assessments table missing - running AI generation locally without saving to database (dev only).', 'Jedwali la tathmini halipo - inaunda mpango wa AI ndani ya kifaa bila kuhifadhi kwenye hifadhidata (dev tu).'),
																variant: 'default'
															});
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
														toast({
															title: tr('Red flag detected', 'Dalili hatarishi zimegunduliwa'),
															description: tr('Your answers indicate urgent symptoms. A physiotherapist has been notified for review.', 'Majibu yako yanaonyesha dalili za dharura. Mtaalamu wa tiba amepewa taarifa kwa ukaguzi.'),
															variant: 'destructive'
														});
														return;
													}

													const aiMapping = deriveAIMapping(formData);
													const payload = {
														assessmentData: { healthData: formData, questionnaireAnswers: formData, ai_mapping: aiMapping, hasVideo: formData.hasVideo, language },
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

													try {
														const { error: recErr } = await supabase
															.from('recommendations')
															.insert({
																assessment_id: inserted.id,
																program: exerciseProgram,
																confidence: exerciseProgram?.isFallback ? 0.3 : 0.8,
																source: exerciseProgram?.isFallback ? 'fallback' : 'ai'
															})
															.select('id')
															.single();
														if (recErr) console.warn('Client insert recommendations failed:', recErr);
													} catch (ci) {
														console.warn('Client-side persist error:', ci);
													}

													toast({
														title: tr('Assessment submitted', 'Tathmini imewasilishwa'),
														description: tr('Exercise program created.', 'Mpango wa mazoezi umeundwa.')
													});
													navigate('/programs');
												} catch (err: any) {
													console.error(err);
													const message = String(err?.message || err);
													if (message.toLowerCase().includes('could not find the table') || message.toLowerCase().includes('schema cache')) {
														toast({
															title: tr('Submission error', 'Hitilafu ya kuwasilisha'),
															description: tr(
																'The assessments table was not found in your Supabase project. Please deploy the migrations or create the table in the Supabase dashboard. See README-ASSESSMENT.md for migration steps.',
																'Jedwali la tathmini halijapatikana kwenye mradi wako wa Supabase. Tafadhali tumia migrations au tengeneza jedwali hilo kwenye Supabase dashboard. Angalia README-ASSESSMENT.md kwa hatua.'
															),
															variant: 'destructive'
														});
													} else {
														toast({ title: tr('Submission error', 'Hitilafu ya kuwasilisha'), description: message, variant: 'destructive' });
													}
												}
											}}
										>
											{tr('Complete Assessment', 'Maliza Tathmini')}
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default AssessmentPage;
