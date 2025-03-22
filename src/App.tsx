
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "@/store";
import Index from "./pages/Index";
import ScreensPage from "./pages/ScreensPage";
import ContentPage from "./pages/ContentPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import ConfigPage from "./pages/ConfigPage";
import PreviewPage from "./pages/PreviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const setConfigPin = useAppStore((state) => state.setConfigPin);
  
  useEffect(() => {
    // Load the PIN from .env file if available
    const envPin = import.meta.env.VITE_CONFIG_PIN;
    if (envPin) {
      setConfigPin(envPin);
    }
  }, [setConfigPin]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/screens" element={<ScreensPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
