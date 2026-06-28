import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Extract from "@/pages/Extract";
import ExtractionDetail from "@/pages/ExtractionDetail";
import Workspace from "@/pages/Workspace";
import Penfires from "@/pages/Penfires";
import SearchPage from "@/pages/SearchPage";
import Outcomes from "@/pages/Outcomes";
import Landing from "@/pages/Landing";
import MissionAlignment from "@/pages/MissionAlignment";
import MissionJourney from "@/pages/MissionJourney";
import EmergingSignals from "@/pages/EmergingSignals";
import SignalDetail from "@/pages/SignalDetail";
import ArtifactArchive from "@/pages/ArtifactArchive";
import ArtifactDetail from "@/pages/ArtifactDetail";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import CanonUpdateInput from "@/pages/CanonUpdateInput";
import CanonResult from "@/pages/CanonResult";
import CanonEvolution from "@/pages/CanonEvolution";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    } else if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/extract" element={<Extract />} />
          <Route path="/extraction/:id" element={<ExtractionDetail />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/penfires" element={<Penfires />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/outcomes" element={<Outcomes />} />
          <Route path="/mission" element={<MissionAlignment />} />
          <Route path="/journey" element={<MissionJourney />} />
          <Route path="/signals" element={<EmergingSignals />} />
          <Route path="/signal/:id" element={<SignalDetail />} />
          <Route path="/artifacts" element={<ArtifactArchive />} />
          <Route path="/artifact/:id" element={<ArtifactDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/canon-update/:id" element={<CanonUpdateInput />} />
          <Route path="/canon-result/:id" element={<CanonResult />} />
          <Route path="/canon-evolution" element={<CanonEvolution />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;