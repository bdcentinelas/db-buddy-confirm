import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FleetPage from "./pages/FleetPage";
import DirigentesPage from "./pages/DirigentesPage.tsx";
import DirigenteRegisterPage from "./pages/DirigenteRegisterPage";
import DirigenteVehiclesPage from "./pages/DirigenteVehiclesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/dirigentes"
                element={
                  <ProtectedRoute>
                    <DirigentesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/fleet"
                element={
                  <ProtectedRoute>
                    <FleetPage />
                  </ProtectedRoute>
                }
              />
              {/* Dirigente Routes */}
              <Route
                path="/dirigente/register"
                element={
                  <ProtectedRoute allowedRoles={['dirigente']}>
                    <DirigenteRegisterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dirigente/vehicles"
                element={
                  <ProtectedRoute allowedRoles={['dirigente']}>
                    <DirigenteVehiclesPage />
                  </ProtectedRoute>
                }
              />
              {/* Redirect dirigentes to register page */}
              <Route
                path="/dirigente"
                element={
                  <ProtectedRoute allowedRoles={['dirigente']}>
                    <DirigenteRegisterPage />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
