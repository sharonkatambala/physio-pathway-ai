/**
 * Workstation self-assessment engine - pure functions, no React/DOM.
 *
 * A lightweight ROSA (Rapid Office Strain Assessment) and OSHA computer
 * workstation checklist, turned into a quick self-check. Produces a 0-10 risk
 * score (higher = more strain) with an action level. ROSA's validated action
 * level is a final score above 5, so we flag "poor" above 5 and suggest seeing
 * a physiotherapist. Self-assessment is a screening guide, not an expert audit.
 */

export type WsSection = 'chair' | 'monitor' | 'peripherals' | 'habits';
export type WsZone = 'good' | 'fair' | 'poor';

export interface WsOption {
  en: string;
  sw: string;
  points: number; // 0 = ideal, higher = more strain
  tipEn?: string; // shown when this answer is not ideal
  tipSw?: string;
}

export interface WsQuestion {
  id: string;
  section: WsSection;
  en: string;
  sw: string;
  options: WsOption[];
}

export const WORKSTATION_QUESTIONS: WsQuestion[] = [
  // ---- Chair ----
  {
    id: 'seat_height',
    section: 'chair',
    en: 'Seat height: where are your knees and feet?',
    sw: 'Urefu wa kiti: magoti na miguu yako ikoje?',
    options: [
      { en: 'Knees about 90 degrees, feet flat on the floor', sw: 'Magoti karibu digrii 90, miguu sakafuni', points: 0 },
      { en: 'Slightly high or low, feet not fully flat', sw: 'Juu au chini kidogo, miguu si sawa kabisa', points: 1, tipEn: 'Adjust seat height so your feet rest flat and knees are near 90 degrees. Use a footrest if needed.', tipSw: 'Rekebisha urefu wa kiti ili miguu ikae sawa na magoti yawe karibu digrii 90. Tumia kiegemeo cha miguu ikihitajika.' },
      { en: 'Knees much higher or feet dangling', sw: 'Magoti juu sana au miguu inaning\'inia', points: 2, tipEn: 'Your seat height is off. Lower or raise the chair so your thighs are level and feet are supported.', tipSw: 'Urefu wa kiti si sahihi. Punguza au inua kiti ili mapaja yawe sawa na miguu ipate msaada.' },
    ],
  },
  {
    id: 'back_support',
    section: 'chair',
    en: 'Back support: does the chair support your lower back?',
    sw: 'Msaada wa mgongo: kiti kinasaidia mgongo wako wa chini?',
    options: [
      { en: 'Yes, lumbar supported and I sit back', sw: 'Ndio, mgongo wa chini unasaidiwa nami nakaa nyuma', points: 0 },
      { en: 'Some support but I often lean forward', sw: 'Msaada kidogo lakini mara nyingi naegemea mbele', points: 1, tipEn: 'Sit back into the chair and use the lumbar support. Pull your chair closer to the desk.', tipSw: 'Kaa nyuma kwenye kiti na tumia msaada wa mgongo. Sogeza kiti karibu na meza.' },
      { en: 'No back support / I slouch', sw: 'Hakuna msaada wa mgongo / naninama', points: 2, tipEn: 'Add lumbar support (a cushion works) and sit tall with your back against the chair.', tipSw: 'Ongeza msaada wa mgongo (mto unaweza) na ukae wima mgongo ukigusa kiti.' },
    ],
  },
  {
    id: 'armrests',
    section: 'chair',
    en: 'Arms: are your elbows supported with shoulders relaxed?',
    sw: 'Mikono: viwiko vyako vinasaidiwa huku mabega yamepumzika?',
    options: [
      { en: 'Yes, elbows near 90 degrees, shoulders relaxed', sw: 'Ndio, viwiko karibu digrii 90, mabega yamepumzika', points: 0 },
      { en: 'Armrests too high or too low', sw: 'Viegemeo vya mikono juu au chini sana', points: 1, tipEn: 'Set armrests so your shoulders are relaxed and elbows rest near 90 degrees.', tipSw: 'Weka viegemeo ili mabega yapumzike na viwiko vikae karibu digrii 90.' },
      { en: 'No armrests / shoulders shrug up', sw: 'Hakuna viegemeo / mabega yanapanda juu', points: 2, tipEn: 'Lower your keyboard or raise your chair so your shoulders can drop and relax.', tipSw: 'Shusha kibodi au inua kiti ili mabega yashuke na kupumzika.' },
    ],
  },
  // ---- Monitor ----
  {
    id: 'monitor_height',
    section: 'monitor',
    en: 'Monitor height: where is the top of your screen?',
    sw: 'Urefu wa skrini: sehemu ya juu ya skrini iko wapi?',
    options: [
      { en: 'Top of screen at or just below eye level', sw: 'Juu ya skrini usawa wa macho au chini kidogo', points: 0 },
      { en: 'A bit too low (I look down) or too high', sw: 'Chini kidogo (naangalia chini) au juu sana', points: 1, tipEn: 'Raise the monitor so the top is at eye level. A stand or books work. This protects your neck.', tipSw: 'Inua skrini ili juu yake iwe usawa wa macho. Kiegemeo au vitabu vinaweza. Hii inalinda shingo.' },
      { en: 'Laptop flat on the desk (looking down a lot)', sw: 'Laptop imelala mezani (naangalia chini sana)', points: 2, tipEn: 'A laptop on the desk forces neck strain. Raise it and use an external keyboard and mouse.', tipSw: 'Laptop mezani inalazimisha mkazo wa shingo. Iinue na utumie kibodi na kipanya vya nje.' },
    ],
  },
  {
    id: 'monitor_distance',
    section: 'monitor',
    en: 'Monitor distance: how far is the screen?',
    sw: 'Umbali wa skrini: skrini iko mbali kiasi gani?',
    options: [
      { en: 'About an arm\'s length away', sw: 'Karibu urefu wa mkono', points: 0 },
      { en: 'A little too close or too far', sw: 'Karibu sana au mbali kidogo', points: 1, tipEn: 'Place the screen about an arm\'s length away, directly in front of you.', tipSw: 'Weka skrini karibu urefu wa mkono, mbele yako moja kwa moja.' },
      { en: 'Very close, or off to the side', sw: 'Karibu sana, au pembeni', points: 2, tipEn: 'Move the screen directly in front of you at arm\'s length to avoid neck twisting and eye strain.', tipSw: 'Sogeza skrini mbele yako urefu wa mkono ili kuepuka kupinda shingo na mkazo wa macho.' },
    ],
  },
  {
    id: 'screen_breaks',
    section: 'monitor',
    en: 'Screen breaks: do you look away from the screen regularly?',
    sw: 'Mapumziko ya macho: unaachana na skrini mara kwa mara?',
    options: [
      { en: 'Yes, I follow the 20-20-20 rule', sw: 'Ndio, nafuata kanuni ya 20-20-20', points: 0 },
      { en: 'Sometimes', sw: 'Mara kwa mara', points: 1, tipEn: 'Every 20 minutes, look at something 20 feet away for 20 seconds to rest your eyes.', tipSw: 'Kila dakika 20, angalia kitu umbali wa futi 20 kwa sekunde 20 kupumzisha macho.' },
      { en: 'Rarely, I stare for hours', sw: 'Mara chache, naangalia kwa masaa', points: 2, tipEn: 'Long screen time strains eyes and neck. Use the 20-20-20 rule and take regular breaks.', tipSw: 'Muda mrefu wa skrini huchosha macho na shingo. Tumia kanuni ya 20-20-20 na pumzika mara kwa mara.' },
    ],
  },
  // ---- Keyboard / mouse ----
  {
    id: 'keyboard',
    section: 'peripherals',
    en: 'Keyboard: are your wrists straight while typing?',
    sw: 'Kibodi: vifundo vya mikono vyako vimenyooka unapoandika?',
    options: [
      { en: 'Yes, wrists straight, elbows near 90 degrees', sw: 'Ndio, vifundo vimenyooka, viwiko karibu digrii 90', points: 0 },
      { en: 'Wrists bent up or resting on a hard edge', sw: 'Vifundo vimepinda juu au vinakaa kwenye ukingo mgumu', points: 1, tipEn: 'Keep wrists straight and level with the forearm. A padded wrist rest helps.', tipSw: 'Weka vifundo vimenyooka sawa na mkono. Kiegemeo laini cha kifundo kinasaidia.' },
      { en: 'Wrists bent a lot / keyboard too high', sw: 'Vifundo vimepinda sana / kibodi juu sana', points: 2, tipEn: 'Lower the keyboard so your forearms are parallel to the floor and wrists stay straight.', tipSw: 'Shusha kibodi ili mikono iwe sambamba na sakafu na vifundo vinyooke.' },
    ],
  },
  {
    id: 'mouse',
    section: 'peripherals',
    en: 'Mouse: where is it relative to the keyboard?',
    sw: 'Kipanya: kiko wapi ikilinganishwa na kibodi?',
    options: [
      { en: 'Right next to the keyboard, same level', sw: 'Karibu na kibodi, usawa sawa', points: 0 },
      { en: 'A reach away or on a different level', sw: 'Mbali kidogo au usawa tofauti', points: 1, tipEn: 'Keep the mouse close to the keyboard at the same height so you do not reach.', tipSw: 'Weka kipanya karibu na kibodi usawa sawa ili usinyooshe mkono.' },
      { en: 'Far away / I stretch to reach it', sw: 'Mbali / nanyoosha mkono kukifikia', points: 2, tipEn: 'Reaching for the mouse strains the shoulder. Bring it beside the keyboard.', tipSw: 'Kunyoosha mkono kwa kipanya huchosha bega. Kilete karibu na kibodi.' },
    ],
  },
  // ---- Habits ----
  {
    id: 'sitting_time',
    section: 'habits',
    en: 'Sitting time: how long before you stand or move?',
    sw: 'Muda wa kukaa: muda gani kabla ya kusimama au kutembea?',
    options: [
      { en: 'I move at least every 30-45 minutes', sw: 'Natembea angalau kila dakika 30-45', points: 0 },
      { en: 'About every 1-2 hours', sw: 'Karibu kila saa 1-2', points: 1, tipEn: 'Stand or walk for a minute at least every 45 minutes. Reminders help build the habit.', tipSw: 'Simama au tembea kwa dakika moja angalau kila dakika 45. Vikumbusho husaidia kujenga tabia.' },
      { en: 'I sit for many hours without breaks', sw: 'Nakaa masaa mengi bila mapumziko', points: 2, tipEn: 'Long uninterrupted sitting raises strain. Set movement reminders and take micro-breaks.', tipSw: 'Kukaa muda mrefu bila mapumziko huongeza mkazo. Weka vikumbusho vya kutembea na pumzika kidogo.' },
    ],
  },
];

const SECTION_LABELS: Record<WsSection, { en: string; sw: string }> = {
  chair: { en: 'Chair', sw: 'Kiti' },
  monitor: { en: 'Monitor', sw: 'Skrini' },
  peripherals: { en: 'Keyboard & mouse', sw: 'Kibodi na kipanya' },
  habits: { en: 'Habits', sw: 'Tabia' },
};

export const sectionLabel = (s: WsSection, lang: 'en' | 'sw') => SECTION_LABELS[s][lang];

export interface WorkstationResult {
  risk: number; // 0-10 (higher = more strain)
  zone: WsZone;
  sectionScores: Record<WsSection, number>; // raw points per section
  tips: { en: string; sw: string }[];
  maxPoints: number;
  rawPoints: number;
}

/** answers: question id -> selected option index. Unanswered questions are treated as worst case. */
export function scoreWorkstation(answers: Record<string, number>): WorkstationResult {
  const sectionScores: Record<WsSection, number> = { chair: 0, monitor: 0, peripherals: 0, habits: 0 };
  const tips: { en: string; sw: string }[] = [];
  let rawPoints = 0;
  let maxPoints = 0;

  for (const q of WORKSTATION_QUESTIONS) {
    const worst = Math.max(...q.options.map((o) => o.points));
    maxPoints += worst;
    const idx = answers[q.id];
    const opt = idx != null ? q.options[idx] : undefined;
    const points = opt ? opt.points : worst; // unanswered = worst case
    rawPoints += points;
    sectionScores[q.section] += points;
    if (opt && opt.points > 0 && opt.tipEn) {
      tips.push({ en: opt.tipEn, sw: opt.tipSw ?? opt.tipEn });
    }
  }

  const risk = Math.round((rawPoints / maxPoints) * 10);
  const zone: WsZone = risk <= 2 ? 'good' : risk <= 5 ? 'fair' : 'poor';
  return { risk, zone, sectionScores, tips, maxPoints, rawPoints };
}

export const wsZoneColor = (zone: WsZone) =>
  zone === 'good' ? 'hsl(var(--success))' : zone === 'fair' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

export const wsZoneLabel = (zone: WsZone, lang: 'en' | 'sw') =>
  lang === 'sw'
    ? { good: 'Hatari ndogo', fair: 'Hatari ya wastani', poor: 'Hatari kubwa' }[zone]
    : { good: 'Low risk', fair: 'Moderate risk', poor: 'High risk' }[zone];

/** ROSA action level: a risk above 5 warrants ergonomic intervention / seeing a physio. */
export const wsHighRisk = (risk: number) => risk > 5;
