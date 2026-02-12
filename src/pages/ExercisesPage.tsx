import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Navigation from '@/components/Navigation';
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
  Award
} from 'lucide-react';
import { exerciseCategories } from '@/data/exerciseCategories';
import { useLanguage } from '@/contexts/LanguageContext';

type Phase = 'acute' | 'intermediate' | 'advanced';

const ExercisesPage = () => {
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>('acute');
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const [isCategoryDemoOpen, setIsCategoryDemoOpen] = useState(false);
  const [openImageUrl, setOpenImageUrl] = useState<string | null>(null);
  const [openImageAlt, setOpenImageAlt] = useState<string>('');

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
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCategory(null)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tr('Back to Categories', 'Rudi kwenye Makundi')}
          </Button>

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
                const demoUrl = exercise.demoVideoUrl || category.demoVideoUrl;
                const embedUrl = getYouTubeEmbedUrl(demoUrl);
                const isOpen = openVideoId === exercise.id;
                return (
                <Card key={exercise.id} className="shadow-card hover:shadow-soft transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{exercise.difficulty}</Badge>
                          <Badge variant="outline" className="text-xs">{exercise.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{exercise.duration}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {exercise.demoImageUrl ? (
                      <div className="mb-3 rounded-lg overflow-hidden border bg-white">
                        <div className="w-full h-72 sm:h-80 md:h-96 flex items-center justify-center bg-white">
                          <img
                            src={exercise.demoImageUrl}
                            alt={exercise.name}
                            loading="lazy"
                            className="w-full h-full object-contain cursor-zoom-in"
                            style={exercise.demoImagePosition ? { objectPosition: exercise.demoImagePosition } : undefined}
                            onClick={() => {
                              setOpenImageUrl(exercise.demoImageUrl ?? null);
                              setOpenImageAlt(exercise.name);
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                    <p className="text-muted-foreground text-xs mb-3">{exercise.description}</p>
                    
                    {/* FITT Principle */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        {tr('FITT Principle', 'Kanuni ya FITT')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-muted-foreground">{tr('Frequency', 'Mara')}: </span>
                          <p className="font-medium">{exercise.fittPrinciple.frequency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Intensity', 'Nguvu')}: </span>
                          <p className="font-medium">{exercise.fittPrinciple.intensity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Time', 'Muda')}: </span>
                          <p className="font-medium">{exercise.fittPrinciple.time}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{tr('Type', 'Aina')}: </span>
                          <p className="font-medium">{exercise.fittPrinciple.type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Body Parts */}
                    <div className="mb-3">
                      <p className="text-[11px] text-muted-foreground mb-1">{tr('Target Areas', 'Maeneo Lengwa')}: </p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.bodyPart.map((part) => (
                          <Badge key={part} variant="outline" className="text-[11px] capitalize">
                            {part.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2 mb-3">
                      <h4 className="font-medium text-sm">{tr('Instructions', 'Maelekezo')}:</h4>
                      <ol className="text-xs text-muted-foreground space-y-1 pl-4">
                        {exercise.instructions.map((instruction, index) => (
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
                      <Button size="sm" className="flex-1">{tr('Add to My Plan', 'Ongeza kwenye Mpango Wangu')}</Button>
                    </div>

                    {embedUrl && isOpen ? (
                      <div className="mt-4 rounded-lg overflow-hidden border bg-black">
                        <iframe
                          src={embedUrl}
                          title={`${exercise.name} demo`}
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
      </div>
    );
  }

  // Category Selection View
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{tr('Exercise Program', 'Mpango wa Mazoezi')}</h1>
          <p className="text-muted-foreground">
            {tr('Select a category below to view exercises based on WHO and leading physiotherapy standards. Each category contains exercise videos and instructions tailored to your rehabilitation needs.', 'Chagua kundi hapa chini kuona mazoezi yanayotokana na viwango vya WHO na physiotherapy. Kila kundi lina video za mazoezi na maelekezo yanayoendana na mahitaji yako ya rehab.')}
          </p>
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
    </div>
  );
};

export default ExercisesPage;
