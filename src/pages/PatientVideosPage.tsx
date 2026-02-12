import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PatientVideosPage = () => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('physio_videos').select('*').order('uploaded_at', { ascending: false });
      if (error) return console.error(error);
      setVideos(data || []);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Videos</CardTitle>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-muted-foreground">No videos assigned yet.</div>
            ) : (
              <div className="space-y-4">
                {videos.map(v => (
                  <div key={v.id} className="p-4 border rounded">
                    <div className="text-sm text-muted-foreground">{v.caption}</div>
                    {v.storage_url && (
                      <video controls className="w-full mt-2" src={v.storage_url} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientVideosPage;
