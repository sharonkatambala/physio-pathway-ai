import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ExercisesPage from "./pages/ExercisesPage";
import BookingPage from "./pages/BookingPage";
import ProgressPage from "./pages/ProgressPage";
import PhysioVideosPage from "./pages/PhysioVideosPage";
import PatientVideosPage from "./pages/PatientVideosPage";
import ProgramsPage from "./pages/ProgramsPage";
import AdminStatus from "./pages/AdminStatus";
import AssessmentPage from "./pages/AssessmentPage";
import AssessmentReportPage from "./pages/AssessmentReportPage";
import PatientDashboard from "./pages/PatientDashboard";
import PhysiotherapistDashboard from "./pages/PhysiotherapistDashboard";
import PhysioPatientsPage from "./pages/PhysioPatientsPage";
import PhysioSessionsPage from "./pages/PhysioSessionsPage";
import PhysioResourcesPage from "./pages/PhysioResourcesPage";

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/physiotherapist-dashboard" element={<PhysiotherapistDashboard />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route path="/exercises" element={<ExercisesPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/physio-videos" element={<PhysioVideosPage />} />
      <Route path="/physio-patients" element={<PhysioPatientsPage />} />
      <Route path="/physio-sessions" element={<PhysioSessionsPage />} />
      <Route path="/physio-resources" element={<PhysioResourcesPage />} />
      <Route path="/patient-videos" element={<PatientVideosPage />} />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/report/:reportId" element={<AssessmentReportPage />} />
      <Route path="/admin/status" element={<AdminStatus />} />
      <Route path="/booking" element={<BookingPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

export default App;
