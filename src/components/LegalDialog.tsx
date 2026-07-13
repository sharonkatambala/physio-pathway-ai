import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

export type LegalTopic = 'terms' | 'privacy' | 'hipaa' | 'cookies';

type Section = { heading: string; body: string };
type LegalCopy = { title: string; intro: string; sections: Section[] };

const CONTENT: Record<LegalTopic, { en: LegalCopy; sw: LegalCopy }> = {
  terms: {
    en: {
      title: 'Terms of Service',
      intro: 'By using ErgoCare+, you agree to these terms.',
      sections: [
        {
          heading: 'What ErgoCare+ provides',
          body: 'ErgoCare+ offers AI-assisted physiotherapy assessments, exercise programs, posture checks, and tools to connect with licensed physiotherapists. The AI guidance supports your care but does not replace professional medical advice, diagnosis, or treatment.',
        },
        {
          heading: 'Your responsibilities',
          body: 'Provide accurate information during assessments, follow exercise guidance within your comfort limits, and stop any exercise that increases pain. Always consult a healthcare professional for medical concerns.',
        },
        {
          heading: 'Accounts',
          body: 'You are responsible for keeping your login credentials secure. Sessions booked through the platform are subject to confirmation by the physiotherapist.',
        },
        {
          heading: 'Limitation of liability',
          body: 'ErgoCare+ is provided "as is". We are not liable for injuries resulting from exercises performed without professional supervision or against medical advice.',
        },
      ],
    },
    sw: {
      title: 'Masharti ya Huduma',
      intro: 'Kwa kutumia ErgoCare+, unakubali masharti haya.',
      sections: [
        {
          heading: 'ErgoCare+ inatoa nini',
          body: 'ErgoCare+ inatoa tathmini za physiotherapy zinazosaidiwa na AI, mipango ya mazoezi, ukaguzi wa mkao, na zana za kuungana na physiotherapist walioidhinishwa. Mwongozo wa AI unasaidia huduma yako lakini haubadilishi ushauri, uchunguzi, au matibabu ya kitaalamu.',
        },
        {
          heading: 'Wajibu wako',
          body: 'Toa taarifa sahihi wakati wa tathmini, fuata mwongozo wa mazoezi ndani ya uwezo wako, na acha zoezi lolote linaloongeza maumivu. Daima wasiliana na mtaalamu wa afya kwa masuala ya kiafya.',
        },
        {
          heading: 'Akaunti',
          body: 'Una wajibu wa kulinda taarifa zako za kuingia. Vikao vilivyowekwa kupitia jukwaa vinahitaji uthibitisho wa physiotherapist.',
        },
        {
          heading: 'Kikomo cha dhima',
          body: 'ErgoCare+ inatolewa "kama ilivyo". Hatuwajibiki kwa majeraha yanayotokana na mazoezi yaliyofanywa bila usimamizi wa kitaalamu au kinyume na ushauri wa daktari.',
        },
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      intro: 'How we handle your personal and health information.',
      sections: [
        {
          heading: 'What we collect',
          body: 'Account details (name, email, phone), assessment answers, progress entries, and appointment records. Posture check video is processed entirely on your device and is never uploaded.',
        },
        {
          heading: 'How we use it',
          body: 'Your data powers your personalized exercise programs, progress tracking, and communication with your physiotherapist. We do not sell your data to third parties.',
        },
        {
          heading: 'Who can see it',
          body: 'Only you and the physiotherapists you book with can access your health records. Access is enforced with row-level security in our database.',
        },
        {
          heading: 'Your rights',
          body: 'You can request a copy or deletion of your data at any time by contacting info@ergocare.com.',
        },
      ],
    },
    sw: {
      title: 'Sera ya Faragha',
      intro: 'Jinsi tunavyoshughulikia taarifa zako binafsi na za kiafya.',
      sections: [
        {
          heading: 'Tunakusanya nini',
          body: 'Taarifa za akaunti (jina, barua pepe, simu), majibu ya tathmini, rekodi za maendeleo, na kumbukumbu za miadi. Video ya ukaguzi wa mkao inachakatwa kwenye kifaa chako pekee na haipakiwi kamwe.',
        },
        {
          heading: 'Tunazitumiaje',
          body: 'Data yako inaendesha mipango yako binafsi ya mazoezi, ufuatiliaji wa maendeleo, na mawasiliano na physiotherapist wako. Hatuuzi data yako kwa wahusika wengine.',
        },
        {
          heading: 'Nani anaweza kuiona',
          body: 'Wewe pekee na physiotherapist unaowaweka miadi ndio wanaweza kufikia rekodi zako za afya. Ufikiaji unadhibitiwa kwa usalama wa ngazi ya safu kwenye hifadhidata yetu.',
        },
        {
          heading: 'Haki zako',
          body: 'Unaweza kuomba nakala au ufutaji wa data yako wakati wowote kwa kuwasiliana na info@ergocare.com.',
        },
      ],
    },
  },
  hipaa: {
    en: {
      title: 'Data Protection (Tanzania PDPA)',
      intro: 'How ErgoCare+ protects your health information under Tanzania\'s Personal Data Protection Act, 2022.',
      sections: [
        {
          heading: 'Protected health information',
          body: 'Assessment results, progress records, and session notes are treated as protected health information and stored with encryption in transit and at rest.',
        },
        {
          heading: 'Access controls',
          body: 'Database row-level security ensures each patient record is visible only to the patient and their assigned physiotherapists.',
        },
        {
          heading: 'On-device processing',
          body: 'Camera-based posture analysis runs locally in your browser. No video ever leaves your device.',
        },
        {
          heading: 'Your rights under the PDPA',
          body: 'Tanzania\'s Personal Data Protection Act, 2022 classifies health data as sensitive personal data. You may request access to, correction of, or deletion of your data at any time via info@ergocare.com, and complaints may be directed to the Personal Data Protection Commission (PDPC).',
        },
      ],
    },
    sw: {
      title: 'Ulinzi wa Data (PDPA Tanzania)',
      intro: 'Jinsi ErgoCare+ inavyolinda taarifa zako za afya chini ya Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania, 2022.',
      sections: [
        {
          heading: 'Taarifa za afya zinazolindwa',
          body: 'Matokeo ya tathmini, rekodi za maendeleo, na maelezo ya vikao yanachukuliwa kama taarifa za afya zinazolindwa na kuhifadhiwa kwa usimbaji fiche wakati wa usafirishaji na uhifadhi.',
        },
        {
          heading: 'Udhibiti wa ufikiaji',
          body: 'Usalama wa ngazi ya safu kwenye hifadhidata unahakikisha rekodi ya kila mgonjwa inaonekana kwa mgonjwa na physiotherapist wake pekee.',
        },
        {
          heading: 'Uchakataji kwenye kifaa',
          body: 'Uchambuzi wa mkao kwa kamera unafanyika ndani ya kivinjari chako. Hakuna video inayotoka kwenye kifaa chako.',
        },
        {
          heading: 'Haki zako chini ya PDPA',
          body: 'Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania, 2022 inaainisha data ya afya kama taarifa nyeti. Unaweza kuomba kupata, kusahihisha, au kufuta data yako wakati wowote kupitia info@ergocare.com, na malalamiko yanaweza kuwasilishwa kwa Tume ya Ulinzi wa Taarifa Binafsi (PDPC).',
        },
      ],
    },
  },
  cookies: {
    en: {
      title: 'Cookies',
      intro: 'How ErgoCare+ uses browser storage.',
      sections: [
        {
          heading: 'Essential storage only',
          body: 'We use browser storage to keep you signed in and to remember your settings (language, theme, text size). We do not use advertising or third-party tracking cookies.',
        },
        {
          heading: 'Managing storage',
          body: 'You can clear this data anytime from your browser settings. Note that clearing it will sign you out and reset your preferences.',
        },
      ],
    },
    sw: {
      title: 'Vidakuzi',
      intro: 'Jinsi ErgoCare+ inavyotumia hifadhi ya kivinjari.',
      sections: [
        {
          heading: 'Hifadhi muhimu pekee',
          body: 'Tunatumia hifadhi ya kivinjari kukuweka umeingia na kukumbuka mipangilio yako (lugha, mandhari, ukubwa wa maandishi). Hatutumii vidakuzi vya matangazo au ufuatiliaji wa wahusika wengine.',
        },
        {
          heading: 'Kudhibiti hifadhi',
          body: 'Unaweza kufuta data hii wakati wowote kupitia mipangilio ya kivinjari chako. Kumbuka kufuta kutakutoa kwenye akaunti na kurejesha mipangilio yako.',
        },
      ],
    },
  },
};

const LegalDialog = ({ topic, onClose }: { topic: LegalTopic | null; onClose: () => void }) => {
  const { language } = useLanguage();
  const copy = topic ? CONTENT[topic][language === 'sw' ? 'sw' : 'en'] : null;

  return (
    <Dialog open={!!topic} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        {copy && (
          <>
            <DialogHeader>
              <DialogTitle>{copy.title}</DialogTitle>
              <DialogDescription>{copy.intro}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {copy.sections.map((s) => (
                <div key={s.heading}>
                  <h4 className="mb-1 text-sm font-semibold text-foreground">{s.heading}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LegalDialog;
