import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Camera, Loader2, Mail, Pencil, Phone, Save, ShieldCheck, Stethoscope, User } from 'lucide-react';

const PhysioProfilePage = () => {
  const { user, role, profile, loading } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', occupation: '', bio: '', license_number: '' });

  useEffect(() => {
    if (!profile) return;
    setAvatarUrl((profile as any)?.avatar_url ?? null);
    setForm({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      phone: profile.phone ?? '',
      occupation: profile.occupation ?? '',
      bio: (profile as any)?.bio ?? '',
      license_number: profile.license_number ?? '',
    });
  }, [profile]);

  const isVerified = !!profile?.verified_at;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{tr('Loading...', 'Inapakia...')}</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;

  const displayName = `${form.first_name} ${form.last_name}`.trim() || (user.email ?? '');
  const specialty = form.occupation || tr('Physiotherapist', 'Physiotherapist');

  const cancelEdit = () => {
    if (profile) {
      setForm({
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        phone: profile.phone ?? '',
        occupation: profile.occupation ?? '',
        bio: (profile as any)?.bio ?? '',
        license_number: profile.license_number ?? '',
      });
    }
    setEditing(false);
  };

  const onPickPhoto = () => fileInputRef.current?.click();

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photoFile = e.target.files?.[0];
    if (!photoFile) return;
    try {
      setUploading(true);
      const ext = photoFile.name.split('.').pop();
      const fileName = `physio-${user.id}.${ext}`;
      const { error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, photoFile, { upsert: true, contentType: photoFile.type });
      if (error) throw error;
      const url = supabase.storage.from('profile-photos').getPublicUrl(fileName).data.publicUrl;
      // cache-bust so the new image shows immediately
      const busted = `${url}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: url }).eq('user_id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(busted);
      toast({ title: tr('Photo updated', 'Picha imesasishwa'), description: tr('Patients will now see your new photo.', 'Wagonjwa wataona picha yako mpya.') });
    } catch (err: any) {
      toast({ title: tr('Upload failed', 'Upakiaji umeshindwa'), description: err?.message || tr('Unable to upload photo.', 'Imeshindwa kupakia picha.'), variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const licenseChanged = form.license_number.trim() !== (profile?.license_number ?? '');
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name || null,
          last_name: form.last_name || null,
          phone: form.phone || null,
          occupation: form.occupation || null,
          bio: form.bio || null,
          license_number: form.license_number || null,
          // Changing the license number after verification voids the old
          // check - it must be re-verified against the new number.
          ...(licenseChanged && isVerified ? { verified_at: null, verified_by: null } : {}),
        } as any)
        .eq('user_id', user.id);
      if (error) throw error;
      if (licenseChanged && isVerified) {
        toast({
          title: tr('License number updated', 'Nambari ya leseni imesasishwa'),
          description: tr('Your verified badge is paused until the new number is checked.', 'Alama yako ya uthibitisho imesimamishwa hadi nambari mpya ikaguliwe.'),
        });
      }
      toast({ title: tr('Profile saved', 'Wasifu umehifadhiwa'), description: tr('Your changes are live.', 'Mabadiliko yako yapo hewani.') });
      setEditing(false);
    } catch (err: any) {
      toast({ title: tr('Save failed', 'Kuhifadhi kumeshindwa'), description: err?.message || tr('Unable to save profile.', 'Imeshindwa kuhifadhi wasifu.'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tr('Profile', 'Wasifu')}</h1>
            <p className="text-muted-foreground">{tr('This is how patients see you when booking and messaging.', 'Hivi ndivyo wagonjwa wanavyokuona wakati wa kuweka miadi na kutuma ujumbe.')}</p>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)} className="bg-gradient-hero shadow-soft flex-shrink-0">
              <Pencil className="h-4 w-4 mr-2" />
              {tr('Edit profile', 'Hariri wasifu')}
            </Button>
          )}
        </div>

        {/* Live preview header */}
        <Card className="shadow-card overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative flex-shrink-0">
                <Avatar className="h-28 w-28 ring-4 ring-primary/15 shadow-sm">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-white/70 text-muted-foreground border border-border/60">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <button
                    type="button"
                    onClick={onPickPhoto}
                    disabled={uploading}
                    className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition disabled:opacity-60"
                    aria-label={tr('Change photo', 'Badilisha picha')}
                    title={tr('Change photo', 'Badilisha picha')}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold truncate">{displayName}</h2>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {tr('Verified Physiotherapist', 'Physiotherapist Aliyethibitishwa')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {tr('Verification pending', 'Uthibitisho unasubiri')}
                    </span>
                  )}
                </div>
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Stethoscope className="h-4 w-4" />
                  {specialty}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-0.5">
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" />{user.email}</span>
                  {form.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" />{form.phone}</span>}
                </div>
                {form.bio && <p className="text-sm text-foreground/80 pt-1 max-w-prose">{form.bio}</p>}
              </div>
            </div>
          </div>
        </Card>

        {/* Editable form - only shown when editing */}
        {editing && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{tr('Personal information', 'Taarifa binafsi')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{tr('First name', 'Jina la kwanza')}</Label>
                <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{tr('Last name', 'Jina la mwisho')}</Label>
                <Input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{tr('Phone', 'Simu')}</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">{tr('Specialty / Title', 'Utaalamu / Cheo')}</Label>
                <Input id="occupation" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder={tr('e.g. Sports Physiotherapist', 'mf. Physiotherapist wa Michezo')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="license_number">{tr('Professional license / registration number', 'Nambari ya leseni / usajili wa kitaaluma')}</Label>
                <Input id="license_number" value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} placeholder={tr('Your professional registration number', 'Nambari yako ya usajili wa kitaaluma')} />
                <p className="text-xs text-muted-foreground">
                  {isVerified
                    ? tr('Changing this will pause your verified badge until it is re-checked.', 'Kubadilisha hii kutasimamisha alama yako ya uthibitisho hadi ikaguliwe tena.')
                    : tr('Checked by ErgoCare+ before your profile shows a verified badge to patients.', 'Inakaguliwa na ErgoCare+ kabla wasifu wako kuonyesha alama ya uthibitisho kwa wagonjwa.')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{tr('Short bio', 'Wasifu mfupi')}</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="min-h-28"
                placeholder={tr('Short bio for patients', 'Wasifu mfupi kwa wagonjwa')}
              />
            </div>

            <div className="space-y-2">
              <Label>{tr('Email', 'Barua pepe')}</Label>
              <Input value={user.email ?? ''} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">{tr('Email is linked to your account and cannot be changed here.', 'Barua pepe imeunganishwa na akaunti yako na haiwezi kubadilishwa hapa.')}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                {tr('Cancel', 'Ghairi')}
              </Button>
              <Button onClick={saveProfile} disabled={saving} className="bg-gradient-hero shadow-soft">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? tr('Saving...', 'Inahifadhi...') : tr('Save changes', 'Hifadhi mabadiliko')}
              </Button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
};

export default PhysioProfilePage;
