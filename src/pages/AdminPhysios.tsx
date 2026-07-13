import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShieldCheck, ShieldOff, Loader2, Search, Stethoscope, User } from 'lucide-react';

type PhysioRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  occupation: string | null;
  license_number: string | null;
  verified_at: string | null;
  created_at: string | null;
};

const AdminPhysios = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<PhysioRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    // Am I an admin? RLS lets a user read only their own app_admins row.
    const { data: adminRow } = await supabase
      .from('app_admins' as any)
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    const admin = !!adminRow;
    setIsAdmin(admin);
    if (!admin) { setLoadingRows(false); return; }

    const { data, error } = await supabase.rpc('list_physiotherapists_admin' as any);
    if (error) {
      toast.error('Could not load physiotherapists', { description: error.message });
    } else {
      setRows((data as PhysioRow[]) ?? []);
    }
    setLoadingRows(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const setVerification = async (row: PhysioRow, verified: boolean) => {
    setSavingId(row.user_id);
    const { error } = await supabase.rpc('set_physio_verification' as any, {
      target_user_id: row.user_id,
      verified,
    });
    setSavingId(null);
    if (error) {
      toast.error('Update failed', { description: error.message });
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.user_id === row.user_id ? { ...r, verified_at: verified ? new Date().toISOString() : null } : r
      )
    );
    toast.success(verified ? 'Physiotherapist verified' : 'Verification removed');
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const name = (r: PhysioRow) => `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || (r.email ?? 'Physiotherapist');
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      name(r).toLowerCase().includes(q) ||
      (r.email ?? '').toLowerCase().includes(q) ||
      (r.license_number ?? '').toLowerCase().includes(q)
    );
  });
  const verifiedCount = rows.filter((r) => r.verified_at).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Physiotherapist Verification</h1>
            <p className="text-sm text-muted-foreground">
              Verify a physiotherapist after you have checked their professional registration number.
            </p>
          </div>
        </div>

        {isAdmin === false ? (
          <Card className="shadow-card">
            <CardContent className="py-14 text-center text-muted-foreground">
              <ShieldOff className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p className="font-medium text-foreground">Admins only</p>
              <p className="mt-1 text-sm">This page is restricted to platform administrators.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or license number"
                  className="pl-9"
                />
              </div>
              <Badge variant="secondary" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {verifiedCount} / {rows.length} verified
              </Badge>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Physiotherapists</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingRows ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <Stethoscope className="mx-auto mb-3 h-9 w-9 opacity-50" />
                    <p className="text-sm">{rows.length === 0 ? 'No physiotherapists have signed up yet.' : 'No matches for your search.'}</p>
                  </div>
                ) : (
                  filtered.map((r) => {
                    const verified = !!r.verified_at;
                    return (
                      <div key={r.user_id} className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <Avatar className="h-11 w-11 flex-shrink-0">
                            <AvatarFallback className="bg-muted text-muted-foreground"><User className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{name(r)}</p>
                              {verified ? (
                                <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                                  <ShieldCheck className="h-3 w-3" /> Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 border-warning/40 text-warning">
                                  Pending
                                </Badge>
                              )}
                            </div>
                            <p className="truncate text-sm text-muted-foreground">{r.email}</p>
                            <p className="mt-0.5 text-sm">
                              <span className="text-muted-foreground">License: </span>
                              <span className="font-medium text-foreground">{r.license_number || 'Not provided'}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                          {verified ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={savingId === r.user_id}
                              onClick={() => setVerification(r, false)}
                              className="text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                            >
                              {savingId === r.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldOff className="mr-1.5 h-4 w-4" />Unverify</>}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={savingId === r.user_id || !r.license_number}
                              onClick={() => setVerification(r, true)}
                              className="bg-gradient-hero shadow-soft"
                              title={!r.license_number ? 'This physiotherapist has not provided a license number yet.' : undefined}
                            >
                              {savingId === r.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="mr-1.5 h-4 w-4" />Verify</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPhysios;
