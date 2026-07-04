import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Play,
  Clock,
  Target,
  Activity,
  Heart,
  Scale,
  Zap,
  User,
  Award,
  BookmarkPlus,
  BookmarkCheck,
  ClipboardList,
  Trash2
} from 'lucide-react';
import { exerciseCategories, type ExerciseDifficulty } from '@/data/exerciseCategories';
import { exerciseTranslations } from '@/data/exerciseTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

type Phase = 'acute' | 'intermediate' | 'advanced';

const MY_PLAN_KEY = 'ergocare-my-plan';

const loadMyPlan = (): string[] => {
  try {
    const raw = localStorage.getItem(MY_PLAN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

const ExercisesPage = () => {
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>('acute');
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const [isCategoryDemoOpen, setIsCategoryDemoOpen] = useState(false);
  const [openImageUrl, setOpenImageUrl] = useState<string | null>(null);
  const [openImageAlt, setOpenImageAlt] = useState<string>('');
  const [myPlan, setMyPlan] = useState<string[]>(loadMyPlan);
  const [planOpen, setPlanOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(MY_PLAN_KEY, JSON.stringify(myPlan));
    } catch {
      // storage full or unavailable; the in-memory plan still works for this visit
    }
  }, [myPlan]);

  const togglePlan = (exerciseId: string, name: string) => {
    setMyPlan((prev) => {
      if (prev.includes(exerciseId)) {
        toast(tr('Removed from your plan', 'Imeondolewa kwenye mpango wako'), { description: name });
        return prev.filter((id) => id !== exerciseId);
      }
      toast.success(tr('Added to your plan', 'Imeongezwa kwenye mpango wako'), { description: name });
      return [...prev, exerciseId];
    });
  };

  const allExercises = exerciseCategories.flatMap((c) => c.exercises);
  const planExercises = myPlan
    .map((id) => allExercises.find((e) => e.id === id))
    .filter((e): e is (typeof allExercises)[number] => !!e);

  const bodyPartLabels: Record<string, string> = {
    'adductors': 'ndani ya mapaja',
    'ankles': 'vifundo vya miguu',
    'arm': 'mkono',
    'arms': 'mikono',
    'calves': 'ndama',
    'cardio': 'moyo na mapafu',
    'core': 'kiini',
    'diaphragm': 'diaframu',
    'feet': 'miguu',
    'full-body': 'mwili mzima',
    'glutes': 'makalio',
    'hamstrings': 'misuli ya nyuma ya paja',
    'hip': 'nyonga',
    'hips': 'nyonga',
    'knee': 'goti',
    'knees': 'magoti',
    'legs': 'miguu',
    'lower-back': 'mgongo wa chini',
    'neck': 'shingo',
    'pelvis': 'nyonga',
    'quadriceps': 'misuli ya paja',
    'shoulder': 'bega',
    'shoulders': 'mabega',
    'thigh': 'paja',
    'trunk': 'kiwiliwili',
    'upper-back': 'mgongo wa juu'
  };

  const difficultyLabels: Record<ExerciseDifficulty, string> = {
    Beginner: 'Mwanzo',
    Intermediate: 'Kati',
    Advanced: 'Juu'
  };

  const getBodyPartLabel = (part: string) => {
    if (language !== 'sw') return part.replace('-', ' ');
    return bodyPartLabels[part] ?? part.replace('-', ' ');
  };

  const getExerciseCopy = (exercise: (typeof exerciseCategories)[number]['exercises'][number]) => {
    if (language !== 'sw') return exercise;
    const sw = exerciseTranslations.sw[exercise.id];
    if (!sw) return exercise;
    return {
      ...exercise,
      name: sw.name ?? exercise.name,
      description: sw.description ?? exercise.description,
      duration: sw.duration ?? exercise.duration,
      category: sw.category ?? exercise.category,
      instructions: sw.instructions ?? exercise.instructions,
      fittPrinciple: {
        frequency: sw.fittPrinciple?.frequency ?? exercise.fittPrinciple.frequency,
        intensity: sw.fittPrinciple?.intensity ?? exercise.fittPrinciple.intensity,
        time: sw.fittPrinciple?.time ?? exercise.fittPrinciple.time,
        type: sw.fittPrinciple?.type ?? exercise.fittPrinciple.type
      }
    };
  };

  const phaseInfo = {
    acute: {
      name: 'Early / Acute Phase',
      description: 'Focus on gentle mobility and pain management',
      frequency: 'Daily short sessions',
      badge: 'Beginner',
      color: 'text-blue-500'
    },
    intermediate: {
      name: 'Intermediate / Building Phase',
      description: 'Introduce strength, balance, and light endurance work',
      frequency: '2-3 times per week',
      badge: 'Intermediate',
      color: 'text-yellow-500'
    },
    advanced: {
      name: 'Advanced / Maintenance Phase',
      description: 'Increase complexity, focusing on functional movement and long-term independence',
      frequency: '3-4 times per week',
      badge: 'Advanced',
      color: 'text-green-500'
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, any> = {
      'pain-mobility': Activity,
      'post-surgery': Heart,
      'neurological': Zap,
      'geriatric': User,
      'sports-injury': Award,
      'chronic-conditions': Heart,
      'wellness-prevention': Target
    };
    return icons[categoryId] || Activity;
  };

  const getYouTubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/v=([a-zA-Z0-9_-]+)/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    const id = match?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  };

  const myPlanButton = (
    <Button variant="outline" onClick={() => setPlanOpen(true)} className="gap-2 flex-shrink-0">
      <ClipboardList className="h-4 w-4" />
      {tr('My Plan', 'Mpango Wangu')}
      {myPlan.length > 0 && (
        <Badge variant="secondary" className="ml-0.5 px-1.5">{myPlan.length}</Badge>
      )}
    </Button>
  );

  const planDialog = (
    <Dialog open={planOpen} onOpenChange={setPlanOpen}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tr('My Exercise Plan', 'Mpango Wangu wa Mazoezi')}</DialogTitle>
          <DialogDescription>
            {tr('Exercises you saved for your routine. Saved on this device.', 'Mazoezi uliyohifadhi kwa ratiba yako. Yamehifadhiwa kwenye kifaa hiki.')}
          </DialogDescription>
        </DialogHeader>
        {planExercises.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
            <ClipboardList className="h-8 w-8 opacity-40" />
            <p className="text-sm">
              {tr('No exercises saved yet. Use "Add to My Plan" on any exercise.', 'Hakuna mazoezi yaliyohifadhiwa bado. Tumia "Ongeza kwenye Mpango Wangu" kwenye zoezi lolote.')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {planExercises.map((exercise) => {
              const copy = getExerciseCopy(exercise);
              return (
                <div key={exercise.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{copy.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'sw' ? (difficultyLabels[exercise.difficulty] ?? exercise.difficulty) : exercise.difficulty}, {copy.duration}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePlan(exercise.id, copy.name)}
                    className="flex-shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title={tr('Remove', 'Ondoa')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (selectedCategory) {
    const category = exerciseCategories.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    // Filter exercises by difficulty based on current phase
    const filteredExercises = category.exercises.filter(ex => {
      if (currentPhase === 'acute') return ex.difficulty === 'Beginner';
      if (currentPhase === 'intermediate') return ex.difficulty === 'Intermediate';
      return ex.difficulty === 'Advanced';
    });

    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <Dialog open={!!openImageUrl} onOpenChange={(open) => !open && setOpenImageUrl(null)}>
          <DialogContent className="max-w-4xl p-0 bg-white">
            {openImageUrl ? (
              <img
                src={openImageUrl}
                alt={openImageAlt}
                className="w-full h-auto object-contain"
              />
            ) : null}
          </DialogContent>
        </Dialog>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tr('Back to Categories', 'Rudi kwenye Makundi')}
            </Button>
            {myPlanButton}
          </div>

          {/* Phase Selection */}
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle>{tr('Select Your Training Phase', 'Chagua Awamu ya Mazoezi')}</CardTitle>
              <CardDescription>{tr('Choose the appropriate phase based on your recovery stage and physiotherapist guidance', 'Chagua awamu inayofaa kulingana na hatua ya uponyaji na ushauri wa physiotherapist')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {(Object.keys(phaseInfo) as Phase[]).map((phase) => (
                  <Card 
                    key={phase}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentPhase === phase ? 'border-primary ring-2 ring-primary' : 'border-border'
                    }`}
                    onClick={() => setCurrentPhase(phase)}
                  >
                    <CardContent className="p-4">
                      <Badge className="mb-2">{tr(phaseInfo[phase].badge, phaseInfo[phase].badge === 'Beginner' ? 'Mwanzo' : phaseInfo[phase].badge === 'Intermediate' ? 'Kati' : 'Juu')}</Badge>
                      <h3 className={`font-semibold mb-2 ${phaseInfo[phase].color}`}>
                        {tr(
                          phaseInfo[phase].name,
                          phase === 'acute' ? 'Awamu ya Mwanzo' : phase === 'intermediate' ? 'Awamu ya Kati' : 'Awamu ya Juu'
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {tr(
                          phaseInfo[phase].description,
                          phase === 'acute'
                            ? 'Lenga uhamaji laini na udhibiti wa maumivu'
                            : phase === 'intermediate'
                              ? 'Ongeza nguvu, mizani na uvumilivu wa mwanga'
                              : 'Ongeza ugumu, ukizingatia harakati na uhuru wa muda mrefu'
                        )}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {tr(
                          phaseInfo[phase].frequency,
                          phase === 'acute' ? 'Kila siku vipindi vifupi' : phase === 'intermediate' ? 'Mara 2-3 kwa wiki' : 'Mara 3-4 kwa wiki'
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>{tr('Important', 'Muhimu')}:</strong> {tr('Always include rest and recovery days between high-intensity sessions. Consult your physiotherapist before progressing to the next phase.', 'Kila mara weka siku za mapumziko na kupona kati ya vipindi vya nguvu. Wasiliana na physiotherapist kabla ya kuhamia awamu inayofuata.')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Header */}
          <div className="mb-6 grid lg:grid-cols-[minmax(0,1fr),320px] gap-6 items-start">
            <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {language === 'sw' ? (category.swName ?? category.name) : category.name}
            </h1>
            <p className="text-muted-foreground">
              {language === 'sw' ? (category.swDescription ?? category.description) : category.description}
            </p>
              {category.demoVideoUrl ? (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCategoryDemoOpen((prev) => !prev)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isCategoryDemoOpen
                      ? tr('Hide Category Demo', 'Ficha Demo ya Kundi')
                      : tr('Watch Category Demo', 'Tazama Demo ya Kundi')}
                  </Button>
                </div>
              ) : null}
            </div>
            {category.demoImageUrl ? (
              <div className="rounded-xl overflow-hidden border bg-white">
                <div className="h-56 w-full flex items-center justify-center bg-white">
                  <img
                    src={category.demoImageUrl}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            ) : null}
            {category.demoVideoUrl && isCategoryDemoOpen ? (
              <div className="rounded-xl overflow-hidden border bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(category.demoVideoUrl) ?? undefined}
                  title={`${category.name} demo`}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : null}
          </div>

          {/* Exercises Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredExercises.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">{tr('No exercises available for this phase. Please consult your physiotherapist.', 'Hakuna mazoezi kwa awamu hii. Tafadhali wasiliana na physiotherapist.')}</p>
              </div>
            ) : (
              filteredExercises.map((exercise) => {
                const exerciseCopy = getExerciseCopy(exercise);
                const demoUrl = exercise.demoVideoUrl || category.demoVideoUrl;
                const embedUrl = getYouTubeEmbedUrl(demoUrl);
                const isOpen = openVideoId === exercise.id;
                return (
                <Card key={exercise.id} className="shadow-card hover:shadow-soft transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{exerciseCopy.name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {language === 'sw' ? (difficultyLabels[exercise.difficulty] ?? exercise.difficulty) : exercise.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{exerciseCopy.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{exerciseCopy.duration}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {exercise.demoImageUrl ? (
                      <div className="mb-3 rounded-lg overflow-hidden border bg-white">
                        <div className="w-full h-72 sm:h-80 md:h-96 flex items-center justify-center bg-white">
                          <img
                            src={exercise.demoImageUrl}
                            alt={exerciseCopy.name}
                            loading="lazy"
                            className="w-full h-full object-contain cursor-zoom-in"
                            style={exercise.demoImagePosition ? { objectPosition: exercise.demoImagePosition } : undefined}
                            onClick={() => {
                              setOpenImageUrl(exercise.demoImageUrl ?? null);
                              setOpenImageAlt(exerciseCopy.name);
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                    <p className="text-muted-foreground text-xs mb-3">{exerciseCopy.description}</p>
                    
                    {/* FITT Principle */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        {tr('FITT Principle', 'Kanuni ya FITT')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-muted-foreground">{tr('Frequency', 'Mara')}: </span>
                          <p className="font-medium">{exerciseCopy.fittPrinciple.frequency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Intensity', 'Nguvu')}: </span>
                          <p className="font-medium">{exerciseCopy.fittPrinciple.intensity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Time', 'Muda')}: </span>
                          <p className="font-medium">{exerciseCopy.fittPrinciple.time}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Type', 'Aina')}: </span>
                          <p className="font-medium">{exerciseCopy.fittPrinciple.type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Body Parts */}
                    <div className="mb-3">
                      <p className="text-[11px] text-muted-foreground mb-1">{tr('Target Areas', 'Maeneo Lengwa')}: </p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.bodyPart.map((part) => (
                          <Badge key={part} variant="outline" className="text-[11px] capitalize">
                            {getBodyPartLabel(part)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2 mb-3">
                      <h4 className="font-medium text-sm">{tr('Instructions', 'Maelekezo')}:</h4>
                      <ol className="text-xs text-muted-foreground space-y-1 pl-4">
                        {exerciseCopy.instructions.map((instruction, index) => (
                          <li key={index} className="list-decimal">{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {embedUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setOpenVideoId(isOpen ? null : exercise.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {isOpen ? tr('Hide Demo', 'Ficha Demo') : tr('Watch Demo', 'Tazama Demo')}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                          <Play className="h-4 w-4 mr-1" />
                          {tr('Watch Demo', 'Tazama Demo')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={myPlan.includes(exercise.id) ? 'secondary' : 'default'}
                        className="flex-1"
                        onClick={() => togglePlan(exercise.id, exerciseCopy.name)}
                      >
                        {myPlan.includes(exercise.id) ? (
                          <><BookmarkCheck className="h-4 w-4 mr-1" />{tr('In My Plan', 'Kwenye Mpango Wangu')}</>
                        ) : (
                          <><BookmarkPlus className="h-4 w-4 mr-1" />{tr('Add to My Plan', 'Ongeza kwenye Mpango Wangu')}</>
                        )}
                      </Button>
                    </div>

                    {embedUrl && isOpen ? (
                      <div className="mt-4 rounded-lg overflow-hidden border bg-black">
                        <iframe
                          src={embedUrl}
                          title={`${exerciseCopy.name} demo`}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : null}

                    {/* Safety Disclaimer */}
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-[11px] text-muted-foreground">
                        <strong>{tr('Safety', 'Usalama')}:</strong> {tr('Stop if pain increases. This AI guidance is for physiotherapy support and education. It does not replace professional medical advice.', 'Acha ikiwa maumivu yanaongezeka. Mwongozo huu wa AI ni kwa msaada wa physiotherapy na elimu. Hauwezi kuchukua nafasi ya ushauri wa kitaalamu wa matibabu.')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )})
            )}
          </div>
        </div>
        {planDialog}
      </div>
    );
  }

  // Category Selection View
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-foreground mb-4">{tr('Exercise Program', 'Mpango wa Mazoezi')}</h1>
            <p className="text-muted-foreground">
              {tr('Select a category below to view exercises based on WHO and leading physiotherapy standards. Each category contains exercise videos and instructions tailored to your rehabilitation needs.', 'Chagua kundi hapa chini kuona mazoezi yanayotokana na viwango vya WHO na physiotherapy. Kila kundi lina video za mazoezi na maelekezo yanayoendana na mahitaji yako ya rehab.')}
            </p>
          </div>
          {myPlanButton}
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exerciseCategories.map((category) => {
            const Icon = getCategoryIcon(category.id);
            return (
              <Card 
                key={category.id}
                className="shadow-card hover:shadow-soft transition-all cursor-pointer hover:border-primary"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {language === 'sw' ? (category.swName ?? category.name) : category.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {language === 'sw' ? (category.swDescription ?? category.description) : category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.demoImageUrl ? (
                    <div className="mb-4 rounded-lg overflow-hidden border bg-white">
                      <div className="w-full h-48 flex items-center justify-center bg-white">
                        <img
                          src={category.demoImageUrl}
                          alt={category.name}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {category.exercises.length} {tr('Exercises', 'Mazoezi')}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      {tr('View Exercises', 'Tazama Mazoezi')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{tr('Medical Disclaimer', 'Kanusho la Matibabu')}</h3>
                <p className="text-sm text-muted-foreground">
                  {tr('This AI guidance is for physiotherapy support and education. It does not replace professional medical advice, diagnosis, or treatment. Always consult with your physiotherapist or healthcare provider before starting any new exercise program, especially if you have any medical conditions or concerns.', 'Mwongozo huu wa AI ni kwa msaada na elimu ya physiotherapy. Hauwezi kuchukua nafasi ya ushauri, uchunguzi, au matibabu ya kitaalamu. Daima wasiliana na physiotherapist au mtoa huduma wa afya kabla ya kuanza mpango mpya wa mazoezi, hasa ikiwa una hali za kiafya au wasiwasi.')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {planDialog}
    </div>
  );
};

export default ExercisesPage;
