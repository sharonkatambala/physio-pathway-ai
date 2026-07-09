import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

/**
 * One-time consent gate shown before a patient's first telehealth (video or
 * phone) session. Tanzania has no finalized telehealth-consent regulation
 * yet, so this is a self-imposed safeguard rather than a legal requirement.
 */
const TelehealthConsentDialog = ({
  open,
  onClose,
  onConsented,
}: {
  open: boolean;
  onClose: () => void;
  onConsented: () => void;
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const [saving, setSaving] = useState(false);

  const handleAgree = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ telehealth_consent_at: new Date().toISOString() } as any)
      .eq('user_id', user.id);
    setSaving(false);
    if (error) return; // Fail open on save error; the join itself still proceeds.
    onConsented();
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tr('Before your first video/phone session', 'Kabla ya kikao chako cha kwanza cha video/simu')}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            <span className="block">
              {tr(
                'ErgoCare+ lets you receive physiotherapy consultations remotely, by video or phone call, instead of an in-person visit.',
                'ErgoCare+ inakuruhusu kupokea ushauri wa physiotherapy kwa njia ya video au simu, badala ya kutembelea ana kwa ana.'
              )}
            </span>
            <span className="block">
              {tr(
                'Remote consultations have limits: your physiotherapist cannot physically examine you, and some conditions are better assessed in person. If your symptoms are severe or worsening, seek in-person care.',
                'Ushauri wa mbali una mipaka: physiotherapist wako hawezi kukuchunguza kimwili, na baadhi ya hali huhitaji kutathminiwa ana kwa ana. Ikiwa dalili zako ni kali au zinazidi kuwa mbaya, tafuta huduma ana kwa ana.'
              )}
            </span>
            <span className="block">
              {tr(
                'By continuing, you agree to receive care this way and understand these limits.',
                'Kwa kuendelea, unakubali kupokea huduma kwa njia hii na kuelewa mipaka hii.'
              )}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>{tr('Cancel', 'Ghairi')}</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); handleAgree(); }} disabled={saving} className="bg-gradient-hero shadow-soft">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {tr('I agree, join call', 'Nakubali, jiunge na simu')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TelehealthConsentDialog;
