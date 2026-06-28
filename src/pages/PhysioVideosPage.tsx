import { useCallback, useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { UploadCloud, Video, Loader2, ExternalLink, Users, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';

type Patient = { user_id: string; name: string };
type VideoRow = { id: string; caption: string | null; storage_url: string | null; patient_user_id: string | null; uploaded_at: string | null; visibility: string | null };

const PUBLIC = '__public__';

const PhysioVideosPage = () => {
  const { user, profile, role, loading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [target, setTarget] = useState<string>(PUBLIC);
  const [uploading, setUploading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);

  const loadPatients = useCallback(async () => {
    if (!profile?.id) return;
    const { data: links } = await supabase
      .from('physio_patient_assignments')
      .select('patient_id')
      .eq('physio_id', profile.id)
      .eq('status', 'active');
    const ids = (links ?? []).map((l: any) => l.patient_id);
    if (!ids.length) { setPatients([]); return; }
    const { data: profs } = await supabase.from('profiles').select('user_id, first_name, last_name').in('id', ids);
    setPatients((profs ?? []).map((p: any) => ({
      user_id: p.user_id,
      name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || tr('Patient', 'Mgonjwa'),
    })));
  }, [profile?.id]);

  const loadVideos = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('physio_videos')
      .select('id, caption, storage_url, patient_user_id, uploaded_at, visibility')
      .eq('physio_user_id', user.id)
      .order('uploaded_at', { ascending: false });
    setVideos((data as VideoRow[]) ?? []);
  }, [user]);

  useEffect(() => { loadPatients(); loadVideos(); }, [loadPatients, loadVideos]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">{tr('Loading...', 'Inapakia...')}</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;

  const patientName = (uid: string | null) => uid ? (patients.find((p) => p.user_id === uid)?.name ?? tr('A patient', 'Mgonjwa')) : null;

  const upload = async () => {
    if (!file) { toast({ title: tr('Choose a file first', 'Chagua faili kwanza'), variant: 'destructive' }); return; }
    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('physio-videos')
        .upload(fileName, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const url = supabase.storage.from('physio-videos').getPublicUrl(fileName).data.publicUrl;
      const assignedTo = target === PUBLIC ? null : target;
      const { error: insertError } = await supabase.from('physio_videos').insert({
        physio_user_id: user.id,
        patient_user_id: assignedTo,
        caption: caption || null,
        storage_url: url,
        visibility: assignedTo ? 'assigned' : 'public',
      });
      if (insertError) throw insertError;

      toast({ title: tr('Video uploaded', 'Video imepakiwa'), description: assignedTo ? `${tr('Shared with', 'Imeshirikiwa na')} ${patientName(assignedTo)}.` : tr('Shared with all your patients.', 'Imeshirikiwa na wagonjwa wako wote.') });
      setFile(null);
      setCaption('');
      setTarget(PUBLIC);
      await loadVideos();
    } catch (e: any) {
      toast({ title: tr('Upload failed', 'Upakiaji umeshindwa'), description: e?.message || tr('Unable to upload video.', 'Imeshindwa kupakia video.'), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{tr('Exercise Videos', 'Video za Mazoezi')}</h1>
            <p className="text-muted-foreground">{tr('Upload guidance videos and share them with a patient or everyone.', 'Pakia video za mwongozo na uzishiriki na mgonjwa au kila mtu.')}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Upload */}
          <Card className="shadow-card lg:col-span-1">
            <CardHeader><CardTitle>{tr('Upload a video', 'Pakia video')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">{tr('Video file', 'Faili la video')}</Label>
                <Input id="file" type="file" accept="video/*" onChange={(e: any) => setFile(e.target.files?.[0] ?? null)} />
                <p className="text-xs text-muted-foreground">{tr('MP4 or MOV recommended.', 'MP4 au MOV inapendekezwa.')}</p>
              </div>
              <div className="space-y-2">
                <Label>{tr('Share with', 'Shiriki na')}</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PUBLIC}>{tr('All my patients', 'Wagonjwa wangu wote')}</SelectItem>
                    {patients.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {patients.length === 0 && <p className="text-xs text-muted-foreground">{tr('No assigned patients yet - videos will be shared with everyone.', 'Hakuna wagonjwa waliopangwa bado - video zitashirikiwa na kila mtu.')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">{tr('Caption', 'Maelezo')}</Label>
                <Input id="caption" placeholder={tr('e.g. Knee mobility routine', 'mf. mazoezi ya goti')} value={caption} onChange={(e) => setCaption(e.target.value)} />
              </div>
              <Button onClick={upload} disabled={uploading || !file} className="w-full bg-gradient-hero shadow-soft">
                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                {uploading ? tr('Uploading...', 'Inapakia...') : tr('Upload video', 'Pakia video')}
              </Button>
            </CardContent>
          </Card>

          {/* Uploads list */}
          <Card className="shadow-card lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{tr('Your videos', 'Video zako')}</CardTitle>
              <Badge variant="outline">{videos.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {videos.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Video className="h-10 w-10 mx-auto mb-3 opacity-60" />
                  <p className="font-medium">{tr('No videos yet', 'Hakuna video bado')}</p>
                  <p className="text-sm">{tr('Upload your first guidance video to share with patients.', 'Pakia video yako ya kwanza ya mwongozo kushiriki na wagonjwa.')}</p>
                </div>
              ) : (
                videos.map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-3 p-4 border border-border/60 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{v.caption || tr('Untitled video', 'Video isiyo na jina')}</p>
                        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                          {v.patient_user_id
                            ? <><Users className="h-3 w-3" />{patientName(v.patient_user_id)}</>
                            : <><Globe className="h-3 w-3" />{tr('All patients', 'Wagonjwa wote')}</>}
                          {v.uploaded_at && <span>{new Date(v.uploaded_at).toLocaleDateString()}</span>}
                        </p>
                      </div>
                    </div>
                    {v.storage_url && (
                      <Button size="sm" variant="outline" asChild className="flex-shrink-0">
                        <a href={v.storage_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1.5" />{tr('Open', 'Fungua')}</a>
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhysioVideosPage;
