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
