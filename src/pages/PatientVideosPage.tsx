import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

type VideoRow = {
  id: string;
  caption: string | null;
  storage_url: string | null;
  uploaded_at: string | null;
  visibility: string | null;
};

const PatientVideosPage = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('physio_videos')
        .select('id, caption, storage_url, uploaded_at, visibility')
        .order('uploaded_at', { ascending: false });
      if (error) console.error(error);
      setVideos((data as VideoRow[]) ?? []);
      setLoadingVideos(false);
    };
    fetchVideos();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">{tr('Loading...', 'Inapakia...')}</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tr('Exercise Videos', 'Video za Mazoezi')}</h1>
            <p className="text-sm text-muted-foreground">
              {tr('Guidance videos shared with you by your physiotherapist.', 'Video za mwongozo ulizoshirikiwa na physiotherapist wako.')}
            </p>
          </div>
        </div>

        {loadingVideos ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{tr('Loading videos...', 'Inapakia video...')}</span>
          </div>
        ) : videos.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Video className="h-7 w-7 text-primary" />
              </div>
              <p className="font-medium text-foreground">{tr('No videos yet', 'Hakuna video bado')}</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {tr('When your physiotherapist shares a guidance video, it will appear here.', 'Physiotherapist wako akishiriki video ya mwongozo, itaonekana hapa.')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {videos.map((v) => (
              <Card key={v.id} className="shadow-card overflow-hidden">
                {v.storage_url && (
                  <video controls preload="metadata" className="aspect-video w-full bg-black" src={v.storage_url} />
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{v.caption || tr('Untitled video', 'Video isiyo na jina')}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2 pb-4 text-xs text-muted-foreground">
                  {v.uploaded_at && <span>{new Date(v.uploaded_at).toLocaleDateString()}</span>}
                  {v.visibility === 'assigned' && (
                    <Badge variant="secondary" className="text-[11px]">{tr('For you', 'Kwa ajili yako')}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientVideosPage;
