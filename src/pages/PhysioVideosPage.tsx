import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Video, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const PhysioVideosPage = () => {
  const { user, role, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [patientId, setPatientId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [totalUploads, setTotalUploads] = useState(0);
  const [assignedUploads, setAssignedUploads] = useState(0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'physiotherapist') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  const upload = async () => {
    if (!file) return alert('Please choose a file');
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('physio-videos')
        .upload(fileName, file as File, { contentType: file.type });

      if (uploadError) throw uploadError;

      const url = supabase.storage.from('physio-videos').getPublicUrl(fileName).data.publicUrl;

      // insert metadata
      await supabase.from('physio_videos').insert({
        physio_user_id: (await supabase.auth.getUser()).data?.user?.id,
        patient_user_id: patientId || null,
        caption,
        storage_url: url,
        visibility: patientId ? 'assigned' : 'public'
      });

      alert('Uploaded and saved');
      await loadStats();
    } catch (e: any) {
      console.error(e);
      alert('Upload error: ' + (e.message || e));
    } finally {
      setUploading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('physio_videos')
      .select('id, patient_user_id')
      .eq('physio_user_id', user.id);

    if (error) return;
    const rows = data ?? [];
    setTotalUploads(rows.length);
    setAssignedUploads(rows.filter((row) => row.patient_user_id).length);
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Patient Video Review</h1>
            <p className="text-muted-foreground">
              Upload exercise videos, annotate feedback, and deliver actionable guidance.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload New Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input type="file" onChange={(e: any) => setFile(e.target.files?.[0] ?? null)} />
                </div>
                <div>
                  <Input placeholder="Patient user id (optional to assign)" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
                </div>
                <div>
                  <Input placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={upload} disabled={uploading} className="bg-gradient-hero">
                    <UploadCloud className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Badge variant="outline">MP4 or MOV, max 50MB</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Review Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Form alignment</span>
                  <ShieldCheck className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Pain warning cues</span>
                  <AlertTriangle className="h-4 w-4 text-accent" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Tempo and control</span>
                  <ShieldCheck className="h-4 w-4 text-success" />
                </div>
                <Button variant="outline" className="w-full mt-2">
                  Open Review Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Total uploads</span>
                  <Badge variant="outline">{totalUploads}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Assigned to patients</span>
                  <span className="font-semibold text-foreground">{assignedUploads}</span>
                </div>
                <Button variant="outline" className="w-full mt-2">
                  View Queue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysioVideosPage;
