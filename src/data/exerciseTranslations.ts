export type ExerciseTranslation = {
  name: string;
  description: string;
  duration: string;
  category: string;
  instructions: string[];
  fittPrinciple: {
    frequency: string;
    intensity: string;
    time: string;
    type: string;
  };
};

export const exerciseTranslations: {
  sw: Record<string, ExerciseTranslation>;
} = {
  sw: {
    'neck-stretches': {
      name: 'Kunyoosha Shingo',
      description: 'Kunyoosha shingo taratibu ili kuboresha uwezo wa mwendo na kupunguza mvutano.',
      duration: 'dakika 5',
      category: 'Uhamaji',
      instructions: [
        'Kaa kwa utulivu ukiwa na mgongo wima.',
        'Polepole elekeza kichwa upande wa kulia na ushikilie kwa sekunde 15.',
        'Rudi katikati na urudie upande wa kushoto.',
        'Tazama juu na chini taratibu, ukishikilia kila nafasi.',
        'Rudia mara 3 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa siku',
        intensity: 'Nyepesi - unapaswa kuhisi kunyoosha taratibu',
        time: 'sekunde 15-30 kwa kunyoosha',
        type: 'Kunyoosha tuli'
      }
    },
    'cat-cow-stretch': {
      name: 'Kunyoosha Paka na Ngombe',
      description: 'Boresha unyumbufu wa uti wa mgongo na punguza mkazo wa mgongo wa chini.',
      duration: 'dakika 4',
      category: 'Uhamaji',
      instructions: [
        'Anzia kwenye mikono na magoti.',
        'Pinda mgongo na tazama juu (nafasi ya Ngombe).',
        'Zungusha mgongo na uingize kidevu (nafasi ya Paka).',
        'Sogeza polepole na pumua kwa kina.',
        'Rudia mara 10-15.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa siku',
        intensity: 'Nyepesi hadi wastani',
        time: 'marudio 10-15',
        type: 'Uhamaji wa nguvu'
      }
    },
    'shoulder-pendulum-swings': {
      name: 'Mizunguko ya Pendulum ya Bega',
      description: 'Zoezi la uhamaji wa bega taratibu kwa kupunguza maumivu.',
      duration: 'dakika 3',
      category: 'Uhamaji',
      instructions: [
        'Inama mbele na uache mkono ulioathirika ulegee.',
        'Yumbisha mkono kwa miduara midogo taratibu.',
        'Ongeza ukubwa wa mduara polepole kadri unavyoweza.',
        'Badili mwelekeo baada ya sekunde 30.',
        'Hakikisha harakati ni polepole na kudhibitiwa.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa siku',
        intensity: 'Nyepesi sana - acha mvuto ufanye kazi',
        time: 'sekunde 30 kila upande',
        type: 'Mwendo wa pasivu'
      }
    },
    'pelvic-tilts': {
      name: 'Mikunjo ya Nyonga',
      description: 'Amsha misuli ya kiini na punguza ugumu wa kiuno cha chini.',
      duration: 'dakika 6-8',
      category: 'Uthabiti',
      instructions: [
        'Lala chali na magoti yamekunjwa, miguu gorofani.',
        'Bonyeza mgongo wa chini taratibu dhidi ya sakafu.',
        'Shikilia kwa sekunde 3-5, kisha legeza.',
        'Rudia mara 10-15.'
      ],
      fittPrinciple: {
        frequency: 'mara 1-2 kwa siku',
        intensity: 'Chini hadi wastani, RPE 3-4/10',
        time: 'dakika 6-8',
        type: 'Uanzishaji wa kiini'
      }
    },
    'neck-bends': {
      name: 'Kunamisha Shingo',
      description: 'Uhamaji wa shingo upande kwa upande ili kupunguza ugumu.',
      duration: 'dakika 4-6',
      category: 'Uhamaji',
      instructions: [
        'Kaa wima na mabega yakiwa yametulia.',
        'Polepole elekeza kichwa kuelekea bega.',
        'Shikilia kwa muda mfupi, kisha rudi katikati.',
        'Rudia upande mwingine.',
        'Kamilisha marudio 8-10 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa siku',
        intensity: 'Nyepesi',
        time: 'marudio 8-10 kila upande',
        type: 'Uhamaji na unyumbufu'
      }
    },
    'lower-trunk-rotation': {
      name: 'Mzunguko wa Sehemu ya Chini ya Kiuno',
      description: 'Boresha uhamaji wa kiuno cha chini na punguza ugumu.',
      duration: 'dakika 6-8',
      category: 'Uhamaji',
      instructions: [
        'Lala chali na magoti yamekunjwa na miguu gorofani.',
        'Acha magoti yote mawili yaanguke polepole upande mmoja.',
        'Weka mabega yakiwa yamelegea sakafuni.',
        'Rudi katikati na rudia upande mwingine.',
        'Kamilisha marudio 10-12 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa wiki',
        intensity: 'Nyepesi hadi wastani',
        time: 'marudio 10-12 kila upande',
        type: 'Uhamaji na udhibiti'
      }
    },
    'thoracic-extension': {
      name: 'Kunyoosha Kifua cha Juu',
      description: 'Fungua mgongo wa juu ili kuboresha mkao na uhamaji.',
      duration: 'dakika 6-8',
      category: 'Uhamaji',
      instructions: [
        'Kaa au piga magoti ukiweka mikono nyuma ya kichwa.',
        'Panua mgongo wa juu taratibu juu ya msaada.',
        'Shikilia kwa muda mfupi, kisha rudi kwenye hali ya kawaida.',
        'Epuka kupinda sana mgongo wa chini.',
        'Rudia mara 8-10.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa wiki',
        intensity: 'Nyepesi',
        time: 'marudio 8-10',
        type: 'Uhamaji na mkao'
      }
    },
    'knee-rom': {
      name: 'Uwezo wa Mwendo wa Goti',
      description: 'Uhamaji wa goti unaoendelea baada ya upasuaji.',
      duration: 'dakika 10',
      category: 'Urekebishaji',
      instructions: [
        'Lala chali na goti likiwa limeungwa mkono.',
        'Polepole pinda goti kadri inavyoweza bila maumivu.',
        'Shikilia kwa sekunde 5.',
        'Polepole nyosha goti.',
        'Rudia mara 10-15.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa siku',
        intensity: 'Nyepesi - ndani ya kiwango cha maumivu',
        time: 'marudio 10-15',
        type: 'Mwendo wa kusaidiwa'
      }
    },
    'hip-abduction': {
      name: 'Utenganishaji wa Nyonga',
      description: 'Imarisha misuli ya nyonga baada ya upasuaji.',
      duration: 'dakika 8',
      category: 'Kuimarisha Nguvu',
      instructions: [
        'Lala chali.',
        'Polepole sogeza mguu pembeni.',
        'Weka vidole vya mguu vikiwa vinatazama juu.',
        'Shikilia kwa sekunde 5.',
        'Rudisha polepole katikati.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa siku',
        intensity: 'Nyepesi hadi wastani',
        time: 'marudio 10, seti 3',
        type: 'Kuimarisha isometriki'
      }
    },
    'quad-sets': {
      name: 'Kukaza Quadriceps Ukikaa',
      description: 'Amsha misuli ya quadriceps ili kusaidia kupona kwa goti.',
      duration: 'dakika 6-8',
      category: 'Kuimarisha Nguvu',
      instructions: [
        'Kaa ukiwa umeunyosha mguu na umeungwa mkono.',
        'Kaza misuli ya paja ili kubonyeza goti chini.',
        'Shikilia kwa sekunde 5, kisha legeza.',
        'Rudia marudio 10-15 kila mguu.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa siku',
        intensity: 'Nyepesi',
        time: 'marudio 10-15',
        type: 'Kuimarisha isometriki'
      }
    },
    'towel-slides': {
      name: 'Kusogeza kwa Taulo',
      description: 'Boresha kukunjika kwa goti kwa kusogeza kwa kudhibiti.',
      duration: 'dakika 8-10',
      category: 'Urekebishaji',
      instructions: [
        'Lala chali ukiwa na taulo chini ya kisigino.',
        'Polepole vuta kisigino kuelekea nyonga.',
        'Simama kwa muda mfupi, kisha rudisha hadi mwanzo.',
        'Sogeza ndani ya kiwango chenye starehe.',
        'Kamilisha marudio 10-12.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Nyepesi',
        time: 'marudio 10-12',
        type: 'Mwendo wa kusaidiwa'
      }
    },
    'step-ups-post-surgery': {
      name: 'Kupanda Hatua kwa Msaada',
      description: 'Jenga nguvu ya utendaji kwa ngazi na shughuli za kila siku.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Panda hatua ya chini kwa kutumia mguu uliotibiwa.',
        'Sukuma kupitia kisigino ili kusimama wima.',
        'Shuka polepole kwa udhibiti.',
        'Tumia reli au ukuta kwa msaada.',
        'Kamilisha seti 2-3 za marudio 8-10.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 8-10',
        type: 'Nguvu ya utendaji'
      }
    },
    'assisted-lunge': {
      name: 'Lunge kwa Msaada',
      description: 'Rudisha udhibiti wa mwili wa chini kwa lunge yenye msaada.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Simama ukishika msaada thabiti.',
        'Chukua hatua mbele na shuka taratibu kwenye lunge.',
        'Weka goti la mbele likiwa juu ya vidole.',
        'Sukuma kurudi mwanzo na urudie.',
        'Kamilisha seti 2-3 za marudio 8-10 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 8-10',
        type: 'Nguvu ya utendaji'
      }
    },
    'seated-weight-shifts': {
      name: 'Kuhamisha Uzito Ukiwa Umekaa',
      description: 'Boresha mizani na udhibiti wa mkao ukiwa umekaa.',
      duration: 'dakika 6-8',
      category: 'Mizani',
      instructions: [
        'Kaa wima na miguu gorofani, mikono kwenye mapaja.',
        'Hamisha uzito polepole kwenda kulia bila kuinua nyonga.',
        'Rudi katikati, kisha hamisha kwenda kushoto.',
        'Kamilisha mizunguko 8-10 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 1-2 kwa siku',
        intensity: 'Chini, RPE 2-3/10',
        time: 'dakika 6-8',
        type: 'Mizani na udhibiti'
      }
    },
    'ankle-bends': {
      name: 'Kukunja Vifundo vya Miguu',
      description: 'Boresha uhamaji wa kifundo na hisia za mkao.',
      duration: 'dakika 5-7',
      category: 'Uhamaji',
      instructions: [
        'Kaa na miguu gorofani sakafuni.',
        'Inua vidole kuelekea dari, kisha shusha.',
        'Bonyeza vidole chini, kisha rudi katikati.',
        'Sogeza polepole na kwa usawa.',
        'Rudia mara 12-15.'
      ],
      fittPrinciple: {
        frequency: 'Kila siku',
        intensity: 'Nyepesi',
        time: 'marudio 12-15',
        type: 'Uhamaji na udhibiti'
      }
    },
    'sit-to-stand-neuro': {
      name: 'Kukaa na Kusimama kwa Msaada',
      description: 'Jenga nguvu ya utendaji na kuboresha uwezo wa kuhamia.',
      duration: 'dakika 8-10',
      category: 'Utendaji',
      instructions: [
        'Kaa kwenye ukingo wa kiti, miguu umbali wa nyonga.',
        'Inama mbele na simama kwa udhibiti, tumia msaada ikihitajika.',
        'Simama kwa muda mfupi, kisha kaa polepole.',
        'Kamilisha seti 2-3 za marudio 6-10.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa wiki',
        intensity: 'Chini hadi wastani, RPE 3-4/10',
        time: 'dakika 8-10',
        type: 'Nguvu ya utendaji'
      }
    },
    'toe-taps-neuro': {
      name: 'Kugonga Vidole vya Mguu',
      description: 'Boresha mizani, muda, na udhibiti wa mguu wa chini.',
      duration: 'dakika 6-8',
      category: 'Mizani',
      instructions: [
        'Simama karibu na msaada, mguu mmoja juu ya hatua ya chini.',
        'Gonga mguu huru juu na chini kwenye hatua.',
        'Weka mkao wima na harakati zikiwa na udhibiti.',
        'Kamilisha miguso 10-12 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Chini hadi wastani',
        time: 'miguso 10-12 kila upande',
        type: 'Mizani na uratibu'
      }
    },
    'tandem-walk-balance': {
      name: 'Kutembea Kisigino hadi Kidole',
      description: 'Changamoto mizani na uratibu kwa kutembea kisigino-kidole.',
      duration: 'dakika 6-8',
      category: 'Mizani',
      instructions: [
        'Simama karibu na uso thabiti kwa msaada.',
        'Tembea kisigino-kidole kwenye mstari wa moja kwa moja.',
        'Weka macho mbele na sogea polepole.',
        'Kamilisha mizunguko 2-3 ya hatua 8-12.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani, RPE 4-5/10',
        time: 'dakika 6-8',
        type: 'Mizani na mwendo'
      }
    },
    'gait-training': {
      name: 'Kutembea kwa Mafunzo ya Mwendo',
      description: 'Fanya mazoezi ya kutembea kwa mkao na udhibiti.',
      duration: 'dakika 8-10',
      category: 'Mwendo',
      instructions: [
        'Tembea kwa kasi ya starehe na hatua zilizo sawa.',
        'Lenga kuweka kisigino-kidole.',
        'Weka mabega yakiwa yametulia na kichwa juu.',
        'Kamilisha dakika 5-8 za kutembea kwa utulivu.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa wiki',
        intensity: 'Wastani',
        time: 'dakika 5-8',
        type: 'Mwendo na uvumilivu'
      }
    },
    'chair-based-strength': {
      name: 'Nguvu kwa Kutumia Kiti',
      description: 'Nguvu ya msingi na uhamaji kwa kutumia kiti thabiti.',
      duration: 'dakika 12-15',
      category: 'Kuimarisha Nguvu',
      instructions: [
        'Kaa wima kwenye kiti imara, miguu gorofani.',
        'Fanya mizunguko ya mikono kwa sekunde 20 kila upande.',
        'Fanya kunyosha goti ukiwa umekaa kwa marudio 10-12 kila mguu.',
        'Fanya march ukiwa umekaa kwa sekunde 30-45.',
        'Malizia kwa kuzungusha kiwiliwili taratibu.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-5 kwa wiki',
        intensity: 'Nyepesi',
        time: 'marudio 8-12',
        type: 'Upinzani na uhamaji'
      }
    },
    'toe-taps-geriatric': {
      name: 'Miguso ya Vidole Ukiwa Umekaa',
      description: 'Boresha mzunguko wa damu na uhamaji wa kifundo ukiwa umekaa.',
      duration: 'dakika 6-8',
      category: 'Uhamaji',
      instructions: [
        'Kaa wima na miguu gorofani sakafuni.',
        'Inua vidole huku visigino vikiwa chini.',
        'Shusha vidole na urudie kwa mdundo thabiti.',
        'Kamilisha miguso 15-20.'
      ],
      fittPrinciple: {
        frequency: 'Kila siku',
        intensity: 'Nyepesi',
        time: 'marudio 15-20',
        type: 'Uhamaji na mzunguko wa damu'
      }
    },
    'sit-to-stand-balance': {
      name: 'Kukaa-Kusimama + Kutembea Kisigino-Kidole',
      description: 'Jenga nguvu ya miguu na boresha mizani ya mwendo.',
      duration: 'dakika 10-12',
      category: 'Mizani',
      instructions: [
        'Simama kutoka kwenye kiti kwa udhibiti, kisha kaa tena.',
        'Kamilisha seti 2 za kukaa-kusimama mara 8-10.',
        'Kisha tembea kisigino-kidole kwenye mstari wa moja kwa moja kwa hatua 6-8.',
        'Geuka na urudie mizunguko 3-4.',
        'Tumia ukuta au reli kwa msaada ikihitajika.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa wiki',
        intensity: 'Nyepesi hadi wastani',
        time: 'seti 2 + mizunguko 3-4',
        type: 'Nguvu ya utendaji na mizani'
      }
    },
    'supported-lunge-geriatric': {
      name: 'Lunge kwa Msaada',
      description: 'Boresha nguvu ya mguu kwa lunge zenye msaada.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Shika msaada thabiti.',
        'Chukua hatua mbele na shuka taratibu kwenye lunge.',
        'Weka goti la mbele juu ya vidole.',
        'Sukuma kurudi mwanzo na urudie.',
        'Kamilisha seti 2 za marudio 6-8 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Nyepesi hadi wastani',
        time: 'seti 2 za marudio 6-8',
        type: 'Nguvu ya utendaji'
      }
    },
    'single-leg-stance': {
      name: 'Kusimama kwa Mguu Mmoja na Kufikia',
      description: 'Changamoto mizani na uthabiti ili kupunguza hatari ya kuanguka.',
      duration: 'dakika 8-10',
      category: 'Mizani',
      instructions: [
        'Simama karibu na uso thabiti kwa usalama.',
        'Inua mguu mmoja na shikilia mizani kwa sekunde 10-20.',
        'Fikia mbele kwa mkono wa kinyume huku ukidumisha mizani.',
        'Badilisha miguu na urudie.',
        'Kamilisha mizunguko 3-4 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'sekunde 10-20 kwa kila mshiko',
        type: 'Mizani na hisia za mwili'
      }
    },
    'dumbbell-curl-geriatric': {
      name: 'Kukunja Dumbbell',
      description: 'Dumisha nguvu ya mwili wa juu kwa kazi za kila siku.',
      duration: 'dakika 6-8',
      category: 'Nguvu',
      instructions: [
        'Simama au kaa wima ukishika dumbbell nyepesi.',
        'Kunja uzito kuelekea mabega.',
        'Shusha polepole kwa udhibiti.',
        'Kamilisha seti 2-3 za marudio 8-12.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 8-12',
        type: 'Kudumisha nguvu'
      }
    },
    'ankle-balance-holds': {
      name: 'Kushikilia Mizani kwa Mguu Mmoja',
      description: 'Rudisha uthabiti wa kifundo na goti baada ya jeraha.',
      duration: 'dakika 6-8',
      category: 'Mizani',
      instructions: [
        'Simama karibu na msaada na inua mguu mmoja.',
        'Shikilia mizani kwa sekunde 20-30.',
        'Badilisha miguu na urudie.',
        'Kamilisha mizunguko 3-4 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-5 kwa wiki',
        intensity: 'Chini hadi wastani, RPE 3-4/10',
        time: 'dakika 6-8',
        type: 'Mizani na uthabiti'
      }
    },
    'ankle-alphabet': {
      name: 'Herufi za Kifundo',
      description: 'Boresha uhamaji wa kifundo na udhibiti wa neuromuscular.',
      duration: 'dakika 5-6',
      category: 'Uhamaji',
      instructions: [
        'Kaa na mguu mmoja ukiwa umenyoshwa, mguu ukiwa juu ya sakafu.',
        'Chora herufi angani kwa kidole gumba cha mguu.',
        'Sogeza polepole ndani ya viwango vya starehe.',
        'Kamilisha herufi 1-2 kwa kila mguu.'
      ],
      fittPrinciple: {
        frequency: 'Kila siku',
        intensity: 'Nyepesi',
        time: 'herufi 1-2 kwa kila mguu',
        type: 'Uhamaji hai'
      }
    },
    'calf-raises': {
      name: 'Kuinua Visigino',
      description: 'Rudisha nguvu ya misuli ya ndama na udhibiti wa kifundo.',
      duration: 'dakika 6-8',
      category: 'Nguvu',
      instructions: [
        'Simama na miguu umbali wa nyonga, shika msaada ikihitajika.',
        'Inuka kwenye vidole taratibu.',
        'Shusha kwa udhibiti.',
        'Kamilisha seti 2-3 za marudio 10-15.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa wiki',
        intensity: 'Nyepesi hadi wastani',
        time: 'seti 2-3 za marudio 10-15',
        type: 'Nguvu na uvumilivu'
      }
    },
    'controlled-step-ups': {
      name: 'Kupanda Hatua kwa Udhibiti',
      description: 'Jenga nguvu na udhibiti wa mguu wa chini kwa hatua ya chini.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Panda hatua ya chini kwa kutumia mguu ulioumia.',
        'Sukuma kupitia kisigino ili kusimama wima.',
        'Shuka polepole kwa udhibiti.',
        'Kamilisha seti 2-3 za marudio 8-12 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani, RPE 4-5/10',
        time: 'dakika 8-10',
        type: 'Nguvu na udhibiti'
      }
    },
    'banded-ankle-strength': {
      name: 'Mizunguko ya Kifundo',
      description: 'Boresha uhamaji na udhibiti wa kifundo kwa mizunguko.',
      duration: 'dakika 8-10',
      category: 'Uhamaji',
      instructions: [
        'Kaa na mguu mmoja umenyoshwa, mguu ukiwa juu ya sakafu.',
        'Chora miduara polepole kwa vidole.',
        'Kamilisha miduara 10 kwa mwelekeo wa saa na 10 kinyume.',
        'Rudia kwa mguu mwingine.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-5 kwa wiki',
        intensity: 'Nyepesi',
        time: 'mduara 10 kila upande',
        type: 'Uhamaji na udhibiti'
      }
    },
    'lateral-band-walks': {
      name: 'Lunge za Pembeni',
      description: 'Imarisha nyonga na boresha uthabiti wa upande.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Simama wima na miguu pamoja.',
        'Chukua hatua pembeni na pinda goti la mguu unaosogea.',
        'Weka mguu mwingine ukiwa wima na kifua juu.',
        'Sukuma kurudi mwanzo na urudie.',
        'Kamilisha seti 2-3 za marudio 8-10 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 8-10',
        type: 'Nguvu na uthabiti'
      }
    },
    'lateral-step-down': {
      name: 'Kushuka Hatua Pembeni',
      description: 'Jenga upya udhibiti wa mguu wa chini na nguvu ya kuzuia.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Simama juu ya hatua ya chini mguu mmoja ukiwa hewani.',
        'Shusha kisigino cha mguu unaoninginia kuelekea sakafuni kwa udhibiti.',
        'Rudi mwanzo bila kuruka.',
        'Kamilisha seti 2-3 za marudio 8-10 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani, RPE 5-6/10',
        time: 'dakika 8-10',
        type: 'Nguvu na udhibiti'
      }
    },
    'single-leg-squat-box': {
      name: 'Squat ya Mguu Mmoja hadi Kiti',
      description: 'Endeleza udhibiti na nguvu ya mguu wa chini kwa usalama.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Simama mbele ya boksi au kiti.',
        'Shuka kwenye squat ya mguu mmoja hadi uguse boksi.',
        'Simama tena kwa udhibiti.',
        'Kamilisha seti 2-3 za marudio 6-10 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani hadi juu',
        time: 'seti 2-3 za marudio 6-10',
        type: 'Nguvu na udhibiti'
      }
    },
    'skater-hops': {
      name: 'Kuruka kama Skater',
      description: 'Fanya mazoezi ya nguvu ya upande na udhibiti wa kutua kwa kurudi michezoni.',
      duration: 'dakika 6-8',
      category: 'Plaiometriki',
      instructions: [
        'Ruka pembeni kutoka mguu mmoja hadi mwingine.',
        'Tua kwa upole, goti likiwa juu ya vidole.',
        'Simama kwa muda mfupi kurejesha mizani.',
        'Kamilisha seti 2-3 za miruko 8-12 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2 kwa wiki',
        intensity: 'Juu, RPE 6-7/10',
        time: 'seti 2-3 za miruko 8-12',
        type: 'Plaiometriki na wepesi'
      }
    },
    'interval-walk': {
      name: 'Kutembea kwa Vipindi',
      description: 'Vipindi vya kutembea kwa athari ndogo kwa uvumilivu na afya ya viungo.',
      duration: 'dakika 10-15',
      category: 'Uvumilivu',
      instructions: [
        'Tembea kwa kasi ya starehe kwa dakika 2-3.',
        'Punguza kasi kwa dakika 1.',
        'Rudia kwa mizunguko 3-4.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-5 kwa wiki',
        intensity: 'Chini, RPE 2-3/10',
        time: 'dakika 10-15',
        type: 'Uvumilivu wa aerobic'
      }
    },
    'seated-march': {
      name: 'Kutembea Mahali',
      description: 'Kutembea kwa athari ndogo ili kuboresha mzunguko wa damu na uvumilivu.',
      duration: 'dakika 6-8',
      category: 'Uhamaji',
      instructions: [
        'Simama wima na inua goti moja baada ya nyingine.',
        'Yumba mikono kwa kawaida kwa ajili ya mizani.',
        'Weka harakati zikiwa na udhibiti na thabiti.',
        'Endelea kwa sekunde 45-60 kwa kila mzunguko.'
      ],
      fittPrinciple: {
        frequency: 'Kila siku',
        intensity: 'Chini',
        time: 'mizunguko 2-3',
        type: 'Uhamaji na mzunguko wa damu'
      }
    },
    'breathing-reset': {
      name: 'Kupumua na Kurekebisha Mkao',
      description: 'Punguza mvutano na boresha mkao kwa kupumua kwa diaphragm.',
      duration: 'dakika 5-7',
      category: 'Urejeshaji',
      instructions: [
        'Kaa au lala kwa starehe ukiwa na mgongo wa kawaida.',
        'Vuta pumzi kupitia pua, ukipanua tumbo.',
        'Toa pumzi polepole na ulegeze mabega.',
        'Rudia kwa pumzi 6-8 polepole.'
      ],
      fittPrinciple: {
        frequency: 'Kila siku',
        intensity: 'Nyepesi sana',
        time: 'pumzi 6-8',
        type: 'Kupumua na kutuliza'
      }
    },
    'supported-squat': {
      name: 'Squat Ndogo kwa Msaada',
      description: 'Imarisha miguu kwa msaada ili kulinda viungo.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Shika uso thabiti kwa mizani.',
        'Pinda magoti kwa kina kinachostahimili.',
        'Simama tena kwa udhibiti.',
        'Kamilisha seti 2-3 za marudio 10-12.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Chini hadi wastani, RPE 3-4/10',
        time: 'dakika 8-10',
        type: 'Nguvu na msaada wa viungo'
      }
    },
    'band-row': {
      name: 'Kuvuta Bendi ya Upinzani',
      description: 'Imarisha mgongo wa juu ili kusaidia mkao na shughuli za kila siku.',
      duration: 'dakika 8-10',
      category: 'Kuimarisha Nguvu',
      instructions: [
        'Funga bendi ya upinzani kwenye urefu wa kifua.',
        'Vuta viwiko nyuma, ukikaza mabega nyuma.',
        'Rudi polepole kwa udhibiti.',
        'Kamilisha seti 2-3 za marudio 10-12.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 10-12',
        type: 'Nguvu na mkao'
      }
    },
    'bridge-holds': {
      name: 'Kushikilia Daraja la Glute',
      description: 'Boresha nguvu ya misuli ya nyuma na punguza msongo wa mgongo wa chini.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Lala chali na magoti yamekunjwa.',
        'Inua nyonga ili kutengeneza mstari kutoka magoti hadi mabega.',
        'Shikilia kwa sekunde 5-10.',
        'Kamilisha seti 2-3 za marudio 8-10.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 8-10',
        type: 'Nguvu na uthabiti'
      }
    },
    'interval-walk-advanced': {
      name: 'Kutembea kwa Vipindi Vinavyoendelea',
      description: 'Jenga uvumilivu kwa vipindi virefu na kasi iliyodhibitiwa.',
      duration: 'dakika 15-20',
      category: 'Uvumilivu',
      instructions: [
        'Tembea kwa kasi thabiti kwa dakika 3-4.',
        'Pumzika kwa dakika 1 kwa kasi rahisi.',
        'Rudia kwa mizunguko 3-4.',
        'Malizia kwa kupunguza kasi kwa dakika 2.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-4 kwa wiki',
        intensity: 'Wastani, RPE 4-5/10',
        time: 'dakika 15-20',
        type: 'Uvumilivu wa aerobic'
      }
    },
    'step-ups-low': {
      name: 'Kupanda Hatua ya Chini',
      description: 'Nguvu ya miguu ya utendaji kwa athari ndogo.',
      duration: 'dakika 10-12',
      category: 'Nguvu',
      instructions: [
        'Panda hatua ya chini na simama wima.',
        'Shuka polepole kwa udhibiti.',
        'Badilisha miguu kila marudio.',
        'Kamilisha seti 2-3 za marudio 10-12.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 10-12',
        type: 'Nguvu ya utendaji'
      }
    },
    'balance-reach': {
      name: 'Kufikia kwa Mizani Ukiwa Umesimama',
      description: 'Boresha mizani na uratibu kwa mifumo ya kufikia taratibu.',
      duration: 'dakika 8-10',
      category: 'Mizani',
      instructions: [
        'Simama karibu na msaada na hamisha uzito kwa mguu mmoja.',
        'Fikia mbele kwa mkono wa kinyume, kisha rudi.',
        'Rudia upande na juu kidogo.',
        'Kamilisha mizunguko 2-3 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'mizunguko 2-3 kila upande',
        type: 'Mizani na uratibu'
      }
    },
    'dynamic-mobility-flow': {
      name: 'Mtiririko wa Uhamaji wa Mwili',
      description: 'Mlolongo wa uhamaji wa mwili mzima ili kudumisha upana wa viungo.',
      duration: 'dakika 8-12',
      category: 'Uhamaji',
      instructions: [
        'Anza na mizunguko ya mikono na kuzungusha shingo taratibu.',
        'Ongeza mizunguko ya nyonga na mizunguko ya kiwiliwili.',
        'Malizia kwa kuyumbisha miguu na mizunguko ya vifundo.',
        'Sogeza kwa mwendelezo na kwa starehe.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-5 kwa wiki',
        intensity: 'Chini, RPE 2-3/10',
        time: 'dakika 8-12',
        type: 'Uhamaji na urejeshaji'
      }
    },
    'daily-walk': {
      name: 'Kutembea kwa Kasi',
      description: 'Shughuli ya aerobic yenye athari ndogo kwa afya ya jumla.',
      duration: 'dakika 10-20',
      category: 'Uvumilivu',
      instructions: [
        'Tembea kwa kasi ya starehe lakini yenye kusudi.',
        'Dumisha mkao wima na mabega yaliyotulia.',
        'Pumua kwa uthabiti.',
        'Punguza kasi kwa dakika 2 ili kupoza mwili.'
      ],
      fittPrinciple: {
        frequency: 'Siku nyingi',
        intensity: 'Chini hadi wastani, RPE 3-4/10',
        time: 'dakika 10-20',
        type: 'Uvumilivu wa aerobic'
      }
    },
    'gentle-stretch-series': {
      name: 'Mfululizo wa Kunyoosha Taratibu',
      description: 'Punguza mvutano wa misuli kwa ratiba fupi ya kunyoosha kila siku.',
      duration: 'dakika 8-10',
      category: 'Unyumbufu',
      instructions: [
        'Shikilia kila kunyoosha kwa sekunde 15-30.',
        'Lenga ndama, hamstring, nyonga, na kifua.',
        'Epuka kuruka-ruka au maumivu.',
        'Rudia kila kunyoosha mara 1-2.'
      ],
      fittPrinciple: {
        frequency: 'Kila siku',
        intensity: 'Nyepesi',
        time: 'sekunde 15-30 kwa kunyoosha',
        type: 'Unyumbufu'
      }
    },
    'core-breathing': {
      name: 'Kupumua na Kuimarisha Kiini',
      description: 'Boresha mkao na uthabiti wa kiini kwa udhibiti wa pumzi.',
      duration: 'dakika 6-8',
      category: 'Uthabiti',
      instructions: [
        'Kaa au lala kwa starehe ukiwa na mgongo wa kawaida.',
        'Vuta pumzi ndani ya tumbo na mbavu, panua taratibu.',
        'Toa pumzi na kaza kiini kwa upole.',
        'Rudia kwa pumzi 6-8.'
      ],
      fittPrinciple: {
        frequency: 'mara 3-5 kwa wiki',
        intensity: 'Chini, RPE 2-3/10',
        time: 'dakika 6-8',
        type: 'Kupumua na uthabiti'
      }
    },
    'resistance-band-row': {
      name: 'Kuvuta Bendi ya Upinzani',
      description: 'Imarisha mgongo wa juu kwa mkao na afya ya mabega.',
      duration: 'dakika 8-10',
      category: 'Kuimarisha Nguvu',
      instructions: [
        'Funga bendi kwenye urefu wa kifua.',
        'Vuta viwiko nyuma, ukikaza mabega nyuma.',
        'Rudi polepole kwa udhibiti.',
        'Kamilisha seti 2-3 za marudio 10-12.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 10-12',
        type: 'Nguvu na mkao'
      }
    },
    'split-stance-hold': {
      name: 'Kushikilia Mizani kwa Msimamo wa Miguu Miwili',
      description: 'Boresha mizani na uthabiti wa mwili wa chini.',
      duration: 'dakika 6-8',
      category: 'Mizani',
      instructions: [
        'Simama katika msimamo wa miguu miwili, mguu mmoja mbele.',
        'Shikilia mizani kwa sekunde 20-30.',
        'Badilisha upande na urudie.',
        'Kamilisha mizunguko 2-3 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Chini hadi wastani',
        time: 'sekunde 20-30 kwa kila mshiko',
        type: 'Mizani na uthabiti'
      }
    },
    'bridge-march': {
      name: 'March ya Daraja',
      description: 'Jenga uthabiti wa nyonga na uvumilivu wa nyuma.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Anza kwenye nafasi ya daraja la glute.',
        'Inua goti moja kuelekea kifua bila kushusha nyonga.',
        'Shusha mguu na badilisha upande.',
        'Kamilisha seti 2-3 za marudio ya march 8-10 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani, RPE 5-6/10',
        time: 'dakika 8-10',
        type: 'Nguvu na uvumilivu'
      }
    },
    'step-up-knee-drive': {
      name: 'Kupanda Hatua na Kusukuma Goti',
      description: 'Endeleza nguvu ya mwili wa chini na uratibu.',
      duration: 'dakika 8-10',
      category: 'Nguvu',
      instructions: [
        'Panda hatua ya chini kwa mguu mmoja.',
        'Sukuma goti la upande mwingine juu huku ukidumisha mizani.',
        'Shuka polepole na badilisha upande.',
        'Kamilisha seti 2-3 za marudio 8-10 kila upande.'
      ],
      fittPrinciple: {
        frequency: 'mara 2-3 kwa wiki',
        intensity: 'Wastani',
        time: 'seti 2-3 za marudio 8-10',
        type: 'Nguvu na uratibu'
      }
    },
    'jump-rope-basic': {
      name: 'Kuruka Kamba (Msingi)',
      description: 'Boresha afya ya moyo kwa seti fupi za kuruka kamba.',
      duration: 'dakika 5-7',
      category: 'Uvumilivu',
      instructions: [
        'Ruka kwa upole juu ya sehemu za mbele za miguu.',
        'Weka viwiko karibu na pande zako.',
        'Fanya seti za sekunde 20-30 zikiwa na mapumziko ya sekunde 30.',
        'Rudia kwa mizunguko 3-4.'
      ],
      fittPrinciple: {
        frequency: 'mara 2 kwa wiki',
        intensity: 'Wastani hadi juu',
        time: 'mizunguko 3-4 ya sekunde 20-30',
        type: 'Uvumilivu wa aerobic'
      }
    },
  }
};
