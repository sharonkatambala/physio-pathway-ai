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

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/physiotherapist-dashboard" element={<PhysiotherapistDashboard />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route path="/exercises" element={<ExercisesPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/booking" element={<BookingPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

export default App;
