import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const requiredTables = ['assessments', 'recommendations', 'progress_entries', 'physio_videos', 'exercise_programs'];

const DbStatusPage = () => {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      setLoading(true);
      setError(null);
      try {
        const results: Record<string, boolean> = {};
        for (const t of requiredTables) {
          try {
            // try a harmless select with limit 0 — if the table doesn't exist this will error
            // @ts-ignore - dynamic table name
            const res = await supabase.from(t).select('id').limit(0);
            results[t] = !res.error;
          } catch (e) {
            results[t] = false;
          }
        }
        setStatus(results);
      } catch (e: any) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>DB Status — Required Tables</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div>Checking tables...</div>}
            {error && <div className="text-destructive">Error checking DB: {error}</div>}
            {!loading && !error && (
              <div className="space-y-2">
                {requiredTables.map(t => (
                  <div key={t} className={`p-3 rounded-md ${status[t] ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{t}</div>
                      <div>{status[t] ? 'Present' : 'Missing'}</div>
                    </div>
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">If tables are missing, run the migrations in <code>supabase/migrations/</code> or paste the SQL provided in the README-ASSESSMENT.md into the Supabase SQL editor.</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DbStatusPage;
