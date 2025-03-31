
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import ScreensPage from "./pages/ScreensPage";
import ContentPage from "./pages/ContentPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import ConfigPage from "./pages/ConfigPage";
import PreviewPage from "./pages/PreviewPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./components/onboarding/Onboarding";
import { configService } from "./services/config/configService";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Limitons le nombre de tentatives de requête
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route component to handle restricted access
const ProtectedConfigRoute = () => {
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  
  if (!isConfigMode) {
    return <Navigate to="/" replace />;
  }
  
  return <ConfigPage />;
};

const App = () => {
  const setConfigPin = useAppStore((state) => state.setConfigPin);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Charger le PIN depuis .env file si disponible
    const envPin = import.meta.env.VITE_CONFIG_PIN;
    if (envPin && setConfigPin) {
      setConfigPin(envPin);
    }
    
    // Skip checking for config file existence - onboarding will always show if not completed
    setIsLoading(false);
  }, [setConfigPin]);

  // Afficher un écran de chargement pendant la vérification
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Chargement de la configuration...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show onboarding if it hasn't been completed
  if (!hasCompletedOnboarding) {
    return (
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Routes>
              <Route path="*" element={<Onboarding />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/screens" element={<ScreensPage />} />
              <Route path="/content" element={<ContentPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/config" element={<ProtectedConfigRoute />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
