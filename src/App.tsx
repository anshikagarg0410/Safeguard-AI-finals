import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Welcome from "./pages/Welcome";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Welcome />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/app/*"
              element={
                <Protected>
                  <Index />
                </Protected>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
