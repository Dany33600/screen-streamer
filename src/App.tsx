
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
  const [isLoading, setIsLoading] = useState(true);
  const [configExists, setConfigExists] = useState(false);
  
  useEffect(() => {
    // Vérifier si la configuration existe et la charger
    const loadConfiguration = async () => {
      console.log('App: Vérification et chargement de la configuration...');
      setIsLoading(true);
      try {
        // Vérifier si un fichier de configuration existe sur le serveur
        const configExistsOnServer = await configService.checkConfigExists();
        setConfigExists(configExistsOnServer);
        
        if (configExistsOnServer) {
          // Si la config existe, on la charge et on force l'affichage de l'application principale
          const config = await configService.loadConfig();
          console.log('App: Configuration chargée depuis le serveur:', config);
          
          // Appliquer le PIN de configuration
          if (setConfigPin) {
            setConfigPin(config.configPin);
          }
          
          // Forcer le bypass de l'onboarding si config existe
          setHasCompletedOnboarding(true);
        } else {
          console.log('App: Aucune configuration trouvée sur le serveur, affichage de l\'onboarding');
          // Si pas de config, forcer l'affichage de l'onboarding
          setHasCompletedOnboarding(false);
        }
      } catch (error) {
        console.error('App: Erreur lors de la vérification/chargement de la configuration:', error);
        toast.error('Erreur de configuration', {
          description: 'Impossible de vérifier si une configuration existe'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfiguration();
    
    // Charger le PIN depuis .env file si disponible
    const envPin = import.meta.env.VITE_CONFIG_PIN;
    if (envPin && setConfigPin) {
      setConfigPin(envPin);
    }
  }, [setConfigPin, setHasCompletedOnboarding]);

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

  // Show onboarding if no configuration exists or if it hasn't been completed
  if (!hasCompletedOnboarding || !configExists) {
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
