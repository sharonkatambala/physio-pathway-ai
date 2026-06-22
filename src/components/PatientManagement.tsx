import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, User, MessageSquare, Calendar, Loader2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Patient {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  sex: string | null;
  occupation: string | null;
  phone: string | null;
  created_at: string;
}

type LastAssessment = { pain_level: number | null; created_at: string };

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assessments, setAssessments] = useState<Record<string, LastAssessment>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    try {
      if (!user || !profile?.id) { setPatients([]); return; }

      const { data: assignments, error: assignError } = await supabase
        .from('physio_patient_assignments')
        .select('patient_id')
        .eq('physio_id', profile.id)
        .eq('status', 'active');
      if (assignError) throw assignError;

      const patientIds = (assignments || []).map((a) => a.patient_id);
      if (patientIds.length === 0) { setPatients([]); return; }

      const { data: patientProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, age, sex, occupation, phone, created_at')
        .in('id', patientIds);
      if (profileError) throw profileError;

      const list = (patientProfiles as Patient[]) || [];
      setPatients(list);

      // Latest assessment per patient (physio is allowed to read assigned patients' assessments).
      const userIds = list.map((p) => p.user_id).filter(Boolean);
      if (userIds.length) {
        const { data: aData } = await supabase
          .from('assessments')
          .select('patient_user_id, pain_level, created_at')
          .in('patient_user_id', userIds)
          .order('created_at', { ascending: false });
        const map: Record<string, LastAssessment> = {};
        (aData ?? []).forEach((a: any) => {
          if (!map[a.patient_user_id]) map[a.patient_user_id] = { pain_level: a.pain_level, created_at: a.created_at };
        });
        setAssessments(map);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Couldn't load patients",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, profile?.id, toast]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q) ||
      p.occupation?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient Management
            </CardTitle>
            <Badge className="bg-primary text-white">{filteredPatients.length} Patients</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or occupation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPatients.map((patient) => {
          const last = assessments[patient.user_id];
          const meta = [
            patient.occupation,
            patient.age ? `Age ${patient.age}` : null,
            patient.sex,
          ].filter(Boolean).join(' • ');
          return (
            <Card key={patient.id} className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-lg truncate">
                        {`${patient.first_name ?? ''} ${patient.last_name ?? ''}`.trim() || 'Patient'}
                      </h4>
                      {meta && <p className="text-sm text-muted-foreground truncate">{meta}</p>}
                      {patient.phone && <p className="text-xs text-muted-foreground">{patient.phone}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => navigate('/messages?with=' + patient.id)}>
                      <MessageSquare className="h-4 w-4 mr-2" />Message
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/physio-sessions')}>
                      <Calendar className="h-4 w-4 mr-2" />Sessions
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm flex-wrap gap-2">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <Activity className="h-4 w-4" />
                    {last
                      ? `Last assessment: pain ${last.pain_level ?? '—'}/10 · ${new Date(last.created_at).toLocaleDateString()}`
                      : 'No assessment submitted yet'}
                  </span>
                  <span className="text-muted-foreground">
                    Joined {new Date(patient.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No patients yet</h3>
            <p className="text-muted-foreground">
              {patients.length === 0
                ? 'Patients appear here once they book a session with you.'
                : 'No patients match your search.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientManagement;
