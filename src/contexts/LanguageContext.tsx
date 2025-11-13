import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.assessment': 'Assessment',
    'nav.exercises': 'Exercises',
    'nav.progress': 'Progress',
    'nav.bookSession': 'Book Session',
    'nav.patients': 'Patients',
    'nav.sessions': 'Sessions',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    'nav.getStarted': 'Get Started',
    'nav.dashboard': 'Dashboard',
    
    // Hero
    'hero.tagline': 'AI-Powered Physiotherapy Platform',
    'hero.title': 'Your AI Physiotherapy Assistant',
    'hero.description': 'Advanced AI-powered physiotherapy platform connecting patients and physiotherapists. Get personalized assessments, exercise programs, and professional monitoring all in one place.',
    'hero.startAssessment': 'Start Free Assessment',
    'hero.hipaaCompliant': 'HIPAA Compliant',
    'hero.available': '24/7 Available',
    'hero.patients': '10k+ Patients',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.newAssessment': 'New Assessment',
    'dashboard.overview': 'Overview',
    'dashboard.exercises': 'Exercises',
    'dashboard.progress': 'Progress',
    'dashboard.monitoring': 'Monitoring',
    'dashboard.chatBook': 'Chat & Book',
    'dashboard.painLevel': 'Pain Level',
    'dashboard.exerciseStreak': 'Exercise Streak',
    'dashboard.weeklyProgress': 'Weekly Progress',
    'dashboard.nextSession': 'Next Session',
    'dashboard.todaysActions': "Today's Recommended Actions",
    
    // Assessment
    'assessment.title': 'ErgoCare+ Assessment',
    'assessment.healthInfo': 'Health Info',
    'assessment.video': 'Video (Optional)',
    'assessment.questionnaire': 'Questionnaire',
    'assessment.generating': 'ErgoCare+ is Creating Your Program',
    'assessment.generatingDesc': 'Generating your personalized exercise program based on WHO guidelines...',
    
    // Form labels
    'form.age': 'Age',
    'form.sex': 'Sex',
    'form.occupation': 'Occupation',
    'form.diagnosis': 'Previous Diagnosis (if any)',
    'form.problemDescription': 'Describe your problem',
    'form.previousTreatment': 'Previous Treatment (if any)',
    'form.patientGoals': 'What are your goals?',
    'form.pastMedicalHistory': 'Past Medical History',
    'form.continue': 'Continue to Assessment',
    'form.submit': 'Submit',
    'form.back': 'Back',
    'form.next': 'Next',
    
    // Footer
    'footer.contact': 'Contact Us',
    'footer.phone': 'Phone',
    'footer.email': 'Email',
    'footer.location': 'Location',
    'footer.quickLinks': 'Quick Links',
    'footer.about': 'About',
    'footer.services': 'Services',
    'footer.assessment': 'Assessment',
    'footer.contact2': 'Contact',
    'footer.rights': 'All rights reserved',
    
    // Contact
    'contact.title': 'Get in Touch',
    'contact.description': 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
    'contact.name': 'Your Name',
    'contact.email': 'Your Email',
    'contact.message': 'Your Message',
    'contact.send': 'Send Message',
    'contact.info': 'Contact Information',
    'contact.address': 'Address',
    
    // About Section
    'about.title': 'About ErgoCare+',
    'about.subtitle': 'Revolutionizing physiotherapy through artificial intelligence, connecting patients with expert care and personalized treatment plans.',
    'about.description1': 'Founded by a team of physiotherapy professionals and AI experts, ErgoCare+ bridges the gap between traditional physiotherapy and modern technology. Our platform provides comprehensive assessment tools, personalized exercise programs, and continuous monitoring to ensure optimal recovery outcomes.',
    'about.description2': 'With over 10,000 patients successfully treated and a network of certified physiotherapists, we\'re committed to making quality physiotherapy accessible to everyone, anywhere.',
    'about.patientsTreated': 'Patients Treated',
    'about.successRate': 'Success Rate',
    'about.mission': 'Our Mission',
    'about.evidenceBased': 'Evidence-Based Care',
    'about.evidenceDesc': 'All treatment plans are based on clinical research and best practices.',
    'about.patientCentered': 'Patient-Centered',
    'about.patientDesc': 'Every program is tailored to individual needs and goals.',
    'about.accessible': 'Accessible Care',
    'about.accessibleDesc': 'Making quality physiotherapy accessible to everyone.',
    
    // Services Section
    'services.title': 'Comprehensive Physiotherapy Services',
    'services.subtitle': 'From AI-powered assessments to professional consultations, we provide everything you need for your recovery journey.',
    'services.aiAssessment': 'AI Assessment',
    'services.aiAssessmentDesc': 'Advanced AI-powered assessment tools that analyze your condition and create personalized treatment plans.',
    'services.exercisePrograms': 'Exercise Programs',
    'services.exerciseProgramsDesc': 'Personalized exercise programs with demonstration videos based on FITT principles.',
    'services.professionalSessions': 'Professional Sessions',
    'services.professionalSessionsDesc': 'Book sessions with certified physiotherapists for hands-on treatment and guidance.',
    'services.progressMonitoring': 'Progress Monitoring',
    'services.progressMonitoringDesc': 'Comprehensive tracking of your recovery journey with detailed analytics and insights.',
    'services.patientPortal': 'Patient-Physiotherapist Portal',
    'services.patientPortalDesc': 'Seamless communication platform connecting patients with their physiotherapists.',
    'services.wearableIntegration': 'Wearable Integration',
    'services.wearableIntegrationDesc': 'Connect with wearable devices for continuous monitoring of movement and progress.',
    'services.getStarted': 'Get Started Today',
    
    // Features Section
    'features.title': 'Complete Physiotherapy Platform',
    'features.subtitle': 'Everything you need for effective physiotherapy care in one intelligent platform',
    'features.aiAssessmentTitle': 'AI Assessment',
    'features.aiAssessmentDesc': 'Advanced AI analyzes your symptoms, movement patterns, and medical history to provide accurate condition assessment.',
    'features.videoAnalysis': 'Video Analysis',
    'features.videoAnalysisDesc': 'Upload movement videos for AI-powered posture and movement analysis with personalized feedback.',
    'features.personalizedExercises': 'Personalized Exercises',
    'features.personalizedExercisesDesc': 'FITT-based exercise programs tailored to your condition, progress level, and daily limitations.',
    'features.progressTracking': 'Progress Tracking',
    'features.progressTrackingDesc': 'Monitor pain levels, mobility improvements, and exercise adherence with detailed analytics.',
    'features.aiSupport': '24/7 AI Support',
    'features.aiSupportDesc': 'Get instant answers to your questions and guidance from our AI physiotherapist anytime.',
    'features.bookPhysiotherapists': 'Book Real Physiotherapists',
    'features.bookPhysiotherapistsDesc': 'Schedule sessions with licensed physiotherapists when you need human expertise.',
    'features.realtimeMonitoring': 'Real-time Monitoring',
    'features.realtimeMonitoringDesc': 'Track your daily activities, exercise completion, and recovery metrics automatically.',
    'features.medicalSecurity': 'Medical Grade Security',
    'features.medicalSecurityDesc': 'HIPAA-compliant platform ensuring your health data is protected and confidential.',
    
    // Patient Dashboard
    'patient.welcomeBack': 'Welcome back',
    'patient.weekDay': 'Week 1, Day 3',
    'patient.goodProgress': 'Good Progress',
    'patient.newAssessment': 'New Assessment',
    'patient.painLevel': 'Pain Level',
    'patient.exerciseStreak': 'Exercise Streak',
    'patient.weeklyProgress': 'Weekly Progress',
    'patient.nextSession': 'Next Session',
    'patient.todaysActions': 'Today\'s Recommended Actions',
    'patient.completedStretches': 'Complete morning stretches (✓ Done)',
    'patient.coreExercises': 'Core strengthening exercises (15 min)',
    'patient.uploadVideo': 'Upload today\'s progress video',
    'patient.startNow': 'Start Now',
    'patient.upload': 'Upload',
    'patient.days': 'days',
    'patient.today': 'Today',
    
    // Not Found
    'notFound.title': '404',
    'notFound.message': 'Oops! Page not found',
    'notFound.returnHome': 'Return to Home',
  },
  sw: {
    // Navigation
    'nav.assessment': 'Tathmini',
    'nav.exercises': 'Mazoezi',
    'nav.progress': 'Maendeleo',
    'nav.bookSession': 'Weka Kikao',
    'nav.patients': 'Wagonjwa',
    'nav.sessions': 'Vikao',
    'nav.signIn': 'Ingia',
    'nav.signOut': 'Toka',
    'nav.getStarted': 'Anza',
    'nav.dashboard': 'Dashibodi',
    
    // Hero
    'hero.tagline': 'Jukwaa la Physiotherapy linalotumia AI',
    'hero.title': 'Msaidizi wako wa Physiotherapy wa AI',
    'hero.description': 'Jukwaa la juu la physiotherapy linalotumiwa na AI linalounganisha wagonjwa na physiotherapists. Pata tathmini maalum, programu za mazoezi, na ufuatiliaji wa kitaalamu mahali pamoja.',
    'hero.startAssessment': 'Anza Tathmini Bure',
    'hero.hipaaCompliant': 'Inafuata HIPAA',
    'hero.available': 'Inapatikana 24/7',
    'hero.patients': 'Wagonjwa 10k+',
    
    // Dashboard
    'dashboard.welcome': 'Karibu tena',
    'dashboard.newAssessment': 'Tathmini Mpya',
    'dashboard.overview': 'Muhtasari',
    'dashboard.exercises': 'Mazoezi',
    'dashboard.progress': 'Maendeleo',
    'dashboard.monitoring': 'Ufuatiliaji',
    'dashboard.chatBook': 'Ongea na Weka',
    'dashboard.painLevel': 'Kiwango cha Maumivu',
    'dashboard.exerciseStreak': 'Mfululizo wa Mazoezi',
    'dashboard.weeklyProgress': 'Maendeleo ya Juma',
    'dashboard.nextSession': 'Kikao Kinachofuata',
    'dashboard.todaysActions': 'Vitendo Vinavyopendekezwa Leo',
    
    // Assessment
    'assessment.title': 'Tathmini ya ErgoCare+',
    'assessment.healthInfo': 'Taarifa za Afya',
    'assessment.video': 'Video (Si Lazima)',
    'assessment.questionnaire': 'Dodoso',
    'assessment.generating': 'ErgoCare+ Inaunda Programu Yako',
    'assessment.generatingDesc': 'Inatengeneza programu yako ya mazoezi kulingana na miongozo ya WHO...',
    
    // Form labels
    'form.age': 'Umri',
    'form.sex': 'Jinsia',
    'form.occupation': 'Kazi',
    'form.diagnosis': 'Utambuzi wa Awali (ikiwa upo)',
    'form.problemDescription': 'Eleza tatizo lako',
    'form.previousTreatment': 'Matibabu ya Awali (ikiwa yapo)',
    'form.patientGoals': 'Malengo yako ni nini?',
    'form.pastMedicalHistory': 'Historia ya Matibabu ya Zamani',
    'form.continue': 'Endelea na Tathmini',
    'form.submit': 'Wasilisha',
    'form.back': 'Rudi',
    'form.next': 'Ifuatayo',
    
    // Footer
    'footer.contact': 'Wasiliana Nasi',
    'footer.phone': 'Simu',
    'footer.email': 'Barua Pepe',
    'footer.location': 'Mahali',
    'footer.quickLinks': 'Viungo vya Haraka',
    'footer.about': 'Kuhusu',
    'footer.services': 'Huduma',
    'footer.assessment': 'Tathmini',
    'footer.contact2': 'Wasiliana',
    'footer.rights': 'Haki zote zimehifadhiwa',
    
    // Contact
    'contact.title': 'Wasiliana Nasi',
    'contact.description': 'Una maswali? Tungependa kusikia kutoka kwako. Tutumie ujumbe na tutajibu haraka iwezekanavyo.',
    'contact.name': 'Jina Lako',
    'contact.email': 'Barua Pepe Yako',
    'contact.message': 'Ujumbe Wako',
    'contact.send': 'Tuma Ujumbe',
    'contact.info': 'Taarifa za Mawasiliano',
    'contact.address': 'Anwani',
    
    // About Section
    'about.title': 'Kuhusu ErgoCare+',
    'about.subtitle': 'Kubadilisha physiotherapy kwa kutumia akili bandia, kuunganisha wagonjwa na huduma ya kitaalamu na mipango ya matibabu maalum.',
    'about.description1': 'Ilianzishwa na timu ya wataalamu wa physiotherapy na AI, ErgoCare+ inaunganisha physiotherapy ya jadi na teknolojia ya kisasa. Jukwaa letu linatoa zana za tathmini kamili, programu za mazoezi maalum, na ufuatiliaji endelevu ili kuhakikisha matokeo bora ya uponyaji.',
    'about.description2': 'Na zaidi ya wagonjwa 10,000 waliopona kwa mafanikio na mtandao wa physiotherapists waliothibitishwa, tumejitolea kufanya physiotherapy ya ubora ipatikane kwa kila mtu, popote.',
    'about.patientsTreated': 'Wagonjwa Waliotibiwa',
    'about.successRate': 'Kiwango cha Mafanikio',
    'about.mission': 'Dhamira Yetu',
    'about.evidenceBased': 'Huduma Kulingana na Ushahidi',
    'about.evidenceDesc': 'Mipango yote ya matibabu inategemea utafiti wa kliniki na mbinu bora.',
    'about.patientCentered': 'Inazingatia Mgonjwa',
    'about.patientDesc': 'Kila programu inatengenezwa kulingana na mahitaji na malengo ya mtu binafsi.',
    'about.accessible': 'Huduma Inayopatikana',
    'about.accessibleDesc': 'Kufanya physiotherapy ya ubora ipatikane kwa kila mtu.',
    
    // Services Section
    'services.title': 'Huduma Kamili za Physiotherapy',
    'services.subtitle': 'Kutoka kwa tathmini zinazotumia AI hadi mashauriano ya kitaalamu, tunakupa kila kitu unachohitaji kwa safari yako ya uponyaji.',
    'services.aiAssessment': 'Tathmini ya AI',
    'services.aiAssessmentDesc': 'Zana za juu za tathmini zinazotumia AI ambazo zinachanganua hali yako na kuunda mipango maalum ya matibabu.',
    'services.exercisePrograms': 'Programu za Mazoezi',
    'services.exerciseProgramsDesc': 'Programu za mazoezi maalum zenye video za maonyesho kulingana na kanuni za FITT.',
    'services.professionalSessions': 'Vikao vya Kitaalamu',
    'services.professionalSessionsDesc': 'Weka vikao na physiotherapists waliothibitishwa kwa matibabu ya mikono na mwongozo.',
    'services.progressMonitoring': 'Ufuatiliaji wa Maendeleo',
    'services.progressMonitoringDesc': 'Ufuatiliaji kamili wa safari yako ya uponyaji na uchambuzi wa kina na maarifa.',
    'services.patientPortal': 'Kituo cha Mgonjwa-Physiotherapist',
    'services.patientPortalDesc': 'Jukwaa la mawasiliano linalopatana linalounganisha wagonjwa na physiotherapists wao.',
    'services.wearableIntegration': 'Ujumuishaji wa Vifaa vya Kuvaa',
    'services.wearableIntegrationDesc': 'Unganisha na vifaa vya kuvaa kwa ufuatiliaji endelevu wa mwendo na maendeleo.',
    'services.getStarted': 'Anza Leo',
    
    // Features Section
    'features.title': 'Jukwaa Kamili la Physiotherapy',
    'features.subtitle': 'Kila kitu unachohitaji kwa huduma bora ya physiotherapy katika jukwaa moja lenye akili',
    'features.aiAssessmentTitle': 'Tathmini ya AI',
    'features.aiAssessmentDesc': 'AI ya juu inachanganua dalili zako, mifumo ya harakati, na historia ya kimatibabu ili kutoa tathmini sahihi ya hali.',
    'features.videoAnalysis': 'Uchambuzi wa Video',
    'features.videoAnalysisDesc': 'Pakia video za mwendo kwa uchambuzi wa msimamo na harakati unaotumia AI pamoja na maoni maalum.',
    'features.personalizedExercises': 'Mazoezi Maalum',
    'features.personalizedExercisesDesc': 'Programu za mazoezi kulingana na FITT zinazoendana na hali yako, kiwango cha maendeleo, na mipaka ya kila siku.',
    'features.progressTracking': 'Ufuatiliaji wa Maendeleo',
    'features.progressTrackingDesc': 'Fuatilia viwango vya maumivu, maboresho ya uwezo wa kusogea, na kuzingatia mazoezi pamoja na uchambuzi wa kina.',
    'features.aiSupport': 'Msaada wa AI 24/7',
    'features.aiSupportDesc': 'Pata majibu ya haraka kwa maswali yako na mwongozo kutoka kwa physiotherapist wetu wa AI wakati wowote.',
    'features.bookPhysiotherapists': 'Weka Physiotherapists Halisi',
    'features.bookPhysiotherapistsDesc': 'Panga vikao na physiotherapists walioruhusiwa unapohitaji ujuzi wa binadamu.',
    'features.realtimeMonitoring': 'Ufuatiliaji wa Muda Halisi',
    'features.realtimeMonitoringDesc': 'Fuatilia shughuli zako za kila siku, ukamilishaji wa mazoezi, na vipimo vya uponyaji kiotomatiki.',
    'features.medicalSecurity': 'Usalama wa Kiwango cha Kimatibabu',
    'features.medicalSecurityDesc': 'Jukwaa linalofuata HIPAA linalohakikisha data yako ya afya inalindwa na ni ya siri.',
    
    // Patient Dashboard
    'patient.welcomeBack': 'Karibu tena',
    'patient.weekDay': 'Wiki 1, Siku 3',
    'patient.goodProgress': 'Maendeleo Mazuri',
    'patient.newAssessment': 'Tathmini Mpya',
    'patient.painLevel': 'Kiwango cha Maumivu',
    'patient.exerciseStreak': 'Mfululizo wa Mazoezi',
    'patient.weeklyProgress': 'Maendeleo ya Juma',
    'patient.nextSession': 'Kikao Kinachofuata',
    'patient.todaysActions': 'Vitendo Vinavyopendekezwa Leo',
    'patient.completedStretches': 'Maliza mazoezi ya asubuhi (✓ Imefanyika)',
    'patient.coreExercises': 'Mazoezi ya kuimarisha kiuno (dakika 15)',
    'patient.uploadVideo': 'Pakia video ya maendeleo ya leo',
    'patient.startNow': 'Anza Sasa',
    'patient.upload': 'Pakia',
    'patient.days': 'siku',
    'patient.today': 'Leo',
    
    // Not Found
    'notFound.title': '404',
    'notFound.message': 'Samahani! Ukurasa haupatikani',
    'notFound.returnHome': 'Rudi Nyumbani',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
