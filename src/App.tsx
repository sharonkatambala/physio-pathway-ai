import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import AssessmentPage from "./pages/AssessmentPage";
import ExercisesPage from "./pages/ExercisesPage";
import DashboardPage from "./pages/DashboardPage";
import BookingPage from "./pages/BookingPage";
import PatientDashboard from "./pages/PatientDashboard";
import PhysiotherapistDashboard from "./pages/PhysiotherapistDashboard";
import ProgressPage from "./pages/ProgressPage";
import PhysioVideosPage from "./pages/PhysioVideosPage";
import PatientVideosPage from "./pages/PatientVideosPage";
import ProgramsPage from "./pages/ProgramsPage";
import AdminStatus from "./pages/AdminStatus";

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
  <Route path="/patient-videos" element={<PatientVideosPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/admin/status" element={<AdminStatus />} />
      <Route path="/booking" element={<BookingPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

export default App;
