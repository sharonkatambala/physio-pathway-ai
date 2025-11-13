import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PhysioVideosPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [patientId, setPatientId] = useState('');
  const [uploading, setUploading] = useState(false);

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
    } catch (e: any) {
      console.error(e);
      alert('Upload error: ' + (e.message || e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Physio Video</CardTitle>
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
              <div>
                <Button onClick={upload} disabled={uploading} className="bg-gradient-hero">{uploading ? 'Uploading...' : 'Upload'}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhysioVideosPage;
