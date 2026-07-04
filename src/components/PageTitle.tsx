import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const BRAND = 'ErgoCare+';

// Route → page name. The document title becomes "<page> · ErgoCare+",
// so every tab, bookmark, and history entry says where the user is.
const TITLES: Record<string, { en: string; sw: string }> = {
  '/': { en: 'Home', sw: 'Nyumbani' },
  '/auth': { en: 'Sign In', sw: 'Ingia' },
  '/patient-dashboard': { en: 'Dashboard', sw: 'Dashibodi' },
  '/physiotherapist-dashboard': { en: 'Dashboard', sw: 'Dashibodi' },
  '/office-dashboard': { en: 'Dashboard', sw: 'Dashibodi' },
  '/assessment': { en: 'Assessment', sw: 'Tathmini' },
  '/exercises': { en: 'Exercises', sw: 'Mazoezi' },
  '/progress': { en: 'Progress', sw: 'Maendeleo' },
  '/programs': { en: 'My Programs', sw: 'Programu Zangu' },
  '/booking': { en: 'Book Session', sw: 'Weka Kikao' },
  '/messages': { en: 'Messages', sw: 'Ujumbe' },
  '/posture': { en: 'Posture Check', sw: 'Ukaguzi wa Mkao' },
  '/workstation': { en: 'Workstation Check', sw: 'Ukaguzi wa Eneo la Kazi' },
  '/settings': { en: 'Settings', sw: 'Mipangilio' },
  '/patient-videos': { en: 'Exercise Videos', sw: 'Video za Mazoezi' },
  '/physio-videos': { en: 'Exercise Videos', sw: 'Video za Mazoezi' },
  '/physio-patients': { en: 'Patients', sw: 'Wagonjwa' },
  '/physio-sessions': { en: 'Sessions', sw: 'Vikao' },
  '/physio-profile': { en: 'Profile', sw: 'Wasifu' },
  '/physio-settings': { en: 'Profile', sw: 'Wasifu' },
  '/admin/status': { en: 'Admin Status', sw: 'Hali ya Msimamizi' },
};

const PageTitle = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    let entry = TITLES[pathname];
    if (!entry && pathname.startsWith('/report/')) {
      entry = { en: 'Assessment Report', sw: 'Ripoti ya Tathmini' };
    }
    const page = entry ? (language === 'sw' ? entry.sw : entry.en) : null;
    // Home shows the brand; every other page shows just its own name.
    document.title = page && pathname !== '/' ? page : BRAND;
  }, [pathname, language]);

  return null;
};

export default PageTitle;
