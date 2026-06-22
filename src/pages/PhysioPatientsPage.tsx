import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import PatientManagement from '@/components/PatientManagement';
import { Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PhysioPatientsPage = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">
              Patients who have booked with you. Message them, review sessions, and track assessments.
            </p>
          </div>
        </div>

        <PatientManagement />
      </div>
    </div>
  );
};

export default PhysioPatientsPage;
