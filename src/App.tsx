
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import AppearancePage from "./pages/AppearancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize theme on app startup
  useEffect(() => {
    const applyTheme = (themeId: string) => {
      const html = document.documentElement;
      
      // Remove existing theme classes
      html.classList.remove('dark');
      
      // Apply theme based on selection
      switch (themeId) {
        case 'dark':
        case 'occ-dark':
          html.classList.add('dark');
          break;
        case 'basic':
        case 'occ-basic':
        default:
          // Light theme is default, no additional classes needed
          break;
      }
    };

    // Load saved theme from localStorage on app startup
    const savedTheme = localStorage.getItem('app-theme') || 'basic';
    applyTheme(savedTheme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/appearance" element={<AppearancePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
