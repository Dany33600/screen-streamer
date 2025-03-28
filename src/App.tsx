
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
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

const queryClient = new QueryClient();

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
  
  useEffect(() => {
    // Charger la configuration
    const loadConfiguration = async () => {
      console.log('App: Chargement de la configuration...');
      try {
        const config = await configService.loadConfig();
        console.log('App: Configuration chargée:', config);
        
        // Appliquer le PIN de configuration
        if (setConfigPin) {
          setConfigPin(config.configPin);
        }
        
        // Force onboarding si nécessaire
        if (config.forceOnboarding && setHasCompletedOnboarding) {
          setHasCompletedOnboarding(false);
        }
      } catch (error) {
        console.error('App: Erreur lors du chargement de la configuration:', error);
      }
    };
    
    loadConfiguration();
    
    // Charger le PIN depuis .env file si disponible
    const envPin = import.meta.env.VITE_CONFIG_PIN;
    if (envPin && setConfigPin) {
      setConfigPin(envPin);
    }
  }, [setConfigPin, setHasCompletedOnboarding]);

  // Show onboarding if it hasn't been completed
  if (!hasCompletedOnboarding) {
    return (
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Onboarding />
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
