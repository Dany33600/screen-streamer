
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Content, Screen } from '@/types';
import { ArrowLeft, ExternalLink, RefreshCw, Server, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { screenServerService } from '@/services/screenServerReal';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const apiUrl = useAppStore((state) => state.apiUrl);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const refreshInterval = useAppStore((state) => state.refreshInterval);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error(`Impossible de passer en plein écran: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const refreshAllServers = async () => {
    setIsRefreshing(true);
    
    try {
      const state = useAppStore.getState();
      // Fix: Pass apiUrl as a single parameter object instead of two separate parameters
      screenServerService.updateApiBaseUrl({
        apiUrl: state.apiUrl,
        baseIpAddress: state.baseIpAddress
      });
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
      
      toast.success("Rafraîchissement terminé", {
        description: "L'état des écrans a été actualisé"
      });
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      toast.error("Erreur", {
        description: "Impossible de rafraîchir l'état des écrans"
      });
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    refreshAllServers();
    
    const intervalMs = refreshInterval * 60 * 1000;
    
    const intervalId = setInterval(refreshAllServers, intervalMs);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const renderGridView = () => {
    if (screens.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Server className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Aucun écran configuré</h2>
          <p className="text-muted-foreground">Créez des écrans pour les voir apparaître ici</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/screens')}
          >
            Configurer des écrans
          </Button>
        </div>
      );
    }
    
    const gridCols = screens.length <= 4 
      ? 'grid-cols-2' 
      : screens.length <= 9 
        ? 'grid-cols-3' 
        : 'grid-cols-4';

    return (
      <div className={`grid ${gridCols} gap-2 h-[calc(100vh-8rem)]`}>
        {screens.map((screen) => {
          const isRunning = screenServerService.isServerRunning(screen.id);
          const screenUrl = `http://${screen.ipAddress}:${screen.port}`;
          
          return (
            <Card 
              key={screen.id} 
              className={`overflow-hidden hover:shadow-md ${
                isRunning ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <CardHeader className="p-2 bg-slate-800 text-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm truncate">{screen.name}</CardTitle>
                  <Badge variant={isRunning ? "success" : "destructive"} className="text-xs">
                    {isRunning ? 'En ligne' : 'Hors ligne'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-0">
                  {screen.ipAddress}:{screen.port}
                </p>
              </CardHeader>
              
              <div className="relative w-full h-[calc(100%-80px)]">
                {isRunning ? (
                  <iframe 
                    src={screenUrl}
                    title={screen.name}
                    className="w-full h-full border-none"
                    sandbox="allow-same-origin allow-scripts"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-slate-100">
                    <Server className="h-12 w-12 text-slate-400 mb-2" />
                    <span className="text-sm text-muted-foreground">Écran hors ligne</span>
                  </div>
                )}
              </div>
              
              <CardFooter className="p-2 flex justify-between bg-slate-100">
                <div className="truncate">
                  {screen.contentId && (
                    <div className="text-xs text-muted-foreground truncate">
                      {contents.find(c => c.id === screen.contentId)?.name || "Contenu assigné"}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-8" 
                  onClick={() => window.open(screenUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span className="text-xs">Ouvrir</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-medium">Aperçu des écrans</h1>
          <p className="text-xs text-muted-foreground">Rafraîchissement toutes les {refreshInterval} minute{refreshInterval > 1 ? 's' : ''}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="mr-2 h-4 w-4" />
            ) : (
              <Maximize className="mr-2 h-4 w-4" />
            )}
            {isFullscreen ? "Quitter" : "Plein écran"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAllServers}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
        </div>
      </div>
      
      <div className="pt-28 px-4 pb-4 flex justify-center min-h-screen">
        <div className="w-full max-w-7xl">
          {renderGridView()}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
