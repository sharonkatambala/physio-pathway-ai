import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProgressPage = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('progress_entries').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching progress', error);
      } else {
        setEntries(data as any[]);
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Track your pain and completed exercises over time.</p>

            {loading ? (
              <div>Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-muted-foreground">No progress entries yet. Start logging after starting your exercise program.</div>
            ) : (
              <div className="space-y-4">
                {entries.map(e => (
                  <div key={e.id} className="p-4 border rounded">
                    <div className="text-sm text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
                    <div>Pain level: {e.pain_level ?? '—'}</div>
                    <div>Completed: {e.completed_exercises_count ?? 0}</div>
                    <div className="text-sm text-muted-foreground">{e.notes}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <Button className="bg-gradient-hero">Add Progress Entry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
