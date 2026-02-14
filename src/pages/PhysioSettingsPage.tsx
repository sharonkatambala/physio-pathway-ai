import { useEffect, useState } from 'react';
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
import { Camera, Check, Edit3, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react';

const PhysioSettingsPage = () => {
  const { user, role, profile, loading } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    occupation: '',
    bio: ''
  });

  useEffect(() => {
    if (!profile) return;
    setAvatarUrl((profile as any)?.avatar_url ?? null);
    setForm({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      phone: profile.phone ?? '',
      occupation: profile.occupation ?? '',
      bio: (profile as any)?.bio ?? ''
    });
  }, [profile]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'physiotherapist') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  const uploadPhoto = async () => {
    if (!photoFile) return;
    try {
      setUploading(true);
      const ext = photoFile.name.split('.').pop();
      const fileName = `physio-${user.id}.${ext}`;
      const { error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, photoFile, { upsert: true });
      if (error) throw error;

      const avatarUrl = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName).data.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      setAvatarUrl(avatarUrl);
      toast({
        title: 'Profile photo updated',
        description: 'Your photo is now visible to patients.'
      });
      setPhotoFile(null);
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.message || 'Unable to upload photo.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name || null,
          last_name: form.last_name || null,
          phone: form.phone || null,
          occupation: form.occupation || null,
          bio: form.bio || null
        })
        .eq('user_id', user.id);
      if (error) throw error;
      toast({
        title: 'Profile saved',
        description: 'Your updates have been saved.'
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Unable to save profile.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const displayName = `${form.first_name} ${form.last_name}`.trim() || user.email;
  const displaySpecialty = form.occupation || 'Physiotherapist';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Physiotherapist Profile Settings</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditing((prev) => !prev)}>
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'View Profile' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-emerald-50/40 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <Avatar className="h-36 w-36 ring-4 ring-primary/15 shadow-sm">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="bg-white/70 text-muted-foreground border border-border/60">
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold">{displayName}</h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified Physiotherapist
                        </span>
                      </div>
                      <p className="text-sm text-primary font-medium">{displaySpecialty || 'Add your specialty'}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </span>
                        {form.phone ? (
                          <span className="inline-flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {form.phone}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border p-4 bg-muted/40">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">First name</div>
                    <div className="mt-2 text-base font-semibold">{form.first_name || 'Not set'}</div>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-muted/40">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Last name</div>
                    <div className="mt-2 text-base font-semibold">{form.last_name || 'Not set'}</div>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-muted/40">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Phone</div>
                    <div className="mt-2 text-base font-semibold">{form.phone || 'Not set'}</div>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-muted/40">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Specialty / Title</div>
                    <div className="mt-2 text-base font-semibold">{form.occupation || 'Not set'}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-5 bg-muted/40">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Short Bio</div>
                  <div className="mt-2 text-sm text-foreground">{form.bio || 'Tell patients about your experience, specialties, and availability.'}</div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-28 w-28">
                    <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                    <AvatarFallback className="bg-white/70 text-muted-foreground border border-border/60">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="font-semibold">{displayName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e: any) => setPhotoFile(e.target.files?.[0] ?? null)}
                      />
                      <Button size="sm" variant="outline" onClick={uploadPhoto} disabled={!photoFile || uploading}>
                        <Camera className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Specialty / Title</Label>
                    <Input
                      id="occupation"
                      value={form.occupation}
                      onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell patients about your experience, specialties, and availability."
                  />
                </div>

                <div className="flex justify-end">
                  <div className="flex items-center gap-3">
                    {saved && (
                      <span className="inline-flex items-center gap-1 text-sm text-primary">
                        <Check className="h-4 w-4" />
                        Saved
                      </span>
                    )}
                    <Button onClick={saveProfile} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhysioSettingsPage;
