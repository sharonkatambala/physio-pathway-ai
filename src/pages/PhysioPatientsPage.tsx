import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import PatientManagement from '@/components/PatientManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PhysioPatientsPage = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'physiotherapist') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Patient Panel</h1>
                <p className="text-muted-foreground">
                  Review active patients, monitor progress, and coordinate care plans.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Assign Care Team
            </Button>
            <Button className="bg-gradient-hero shadow-soft">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Patient
            </Button>
          </div>
        </div>

        <Card className="shadow-card border border-border/60">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Care Coverage</div>
              <div className="text-2xl font-semibold">82% of active patients are on track</div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-muted">6 awaiting plan review</span>
              <span className="px-3 py-1 rounded-full bg-muted">3 flagged assessments</span>
              <span className="px-3 py-1 rounded-full bg-muted">12 weekly check-ins</span>
            </div>
          </CardContent>
        </Card>

        <PatientManagement />
      </div>
    </div>
  );
};

export default PhysioPatientsPage;
