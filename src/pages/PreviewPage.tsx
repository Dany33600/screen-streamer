
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Content, Screen } from '@/types';
import { ArrowLeft, ExternalLink, Download, RefreshCw, Server, Play, Pause, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { screenServerService } from '@/services/screenServerReal';
import { toast } from '@/hooks/use-toast';
import { htmlGenerator } from '@/services/htmlGenerator';
import { useScreenStatus } from '@/hooks/use-screen-status';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [screenId, setScreenId] = useState<string | null>(null);
  const [serverId, setServerId] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState<boolean>(false); // Inversé par défaut (maintenant détaillé)
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const apiUrl = useAppStore((state) => state.apiUrl);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  
  // Function to toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast({
          title: "Erreur",
          description: `Impossible de passer en plein écran: ${err.message}`,
          variant: "destructive",
        });
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const ensureFullUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (apiUrl) {
      const baseApiUrl = apiUrl.replace('localhost', baseIpAddress);
      const apiBaseWithoutPath = baseApiUrl.split('/api')[0];
      
      return url.startsWith('/') 
        ? `${apiBaseWithoutPath}${url}`
        : `${apiBaseWithoutPath}/${url}`;
    }
    
    return url;
  };
  
  const refreshAllServers = async () => {
    setIsRefreshing(true);
    
    try {
      // Mettre à jour l'API URL pour screenServerService
      screenServerService.updateApiBaseUrl();
      
      // Attendre un court moment pour que la mise à jour soit effectuée
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
      
      toast({
        title: "Rafraîchissement terminé",
        description: "L'état des écrans a été actualisé",
      });
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir l'état des écrans",
        variant: "destructive",
      });
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentScreenId = searchParams.get('screenId');
    const contentId = searchParams.get('content');
    const serverIdParam = searchParams.get('server');
    
    // Si on a un ID d'écran spécifique, on passe en mode détaillé
    if (currentScreenId) {
      setIsGridView(false);
      const screen = screens.find(s => s.id === currentScreenId);
      if (screen) {
        setSelectedScreen(screen);
      }
    } else {
      setIsGridView(true);
    }
    
    const fetchServerData = async (serverId: string) => {
      try {
        const serverData = await screenServerService.getServerDataById(serverId);
        if (serverData) {
          if (serverData.content) {
            serverData.content.url = ensureFullUrl(serverData.content.url);
          }
          setContent(serverData.content);
          setHtmlContent(serverData.html);
        } else if (currentScreenId && contentId) {
          handleFallbackContent(currentScreenId, contentId);
        }
      } catch (error) {
        console.error("Error fetching server data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données du serveur",
          variant: "destructive",
        });
        if (currentScreenId && contentId) {
          handleFallbackContent(currentScreenId, contentId);
        }
      }
    };
    
    if (serverIdParam) {
      setServerId(serverIdParam);
      fetchServerData(serverIdParam);
    } else if (currentScreenId) {
      setScreenId(currentScreenId);
      handleFallbackContent(currentScreenId, contentId);
    } else if (contentId) {
      const foundContent = contents.find(c => c.id === contentId);
      if (foundContent) {
        const contentWithFullUrl = { 
          ...foundContent, 
          url: ensureFullUrl(foundContent.url) 
        };
        setContent(contentWithFullUrl);
      }
    }
    
    // Rafraîchir automatiquement à l'ouverture de la page
    refreshAllServers();
    
    // Rafraîchir l'état des écrans toutes les 30 secondes
    const intervalId = setInterval(refreshAllServers, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [location.search, contents, screens, apiUrl, baseIpAddress]);
  
  const handleFallbackContent = async (currentScreenId: string, contentId: string | null) => {
    try {
      if (screenServerService.isServerRunning(currentScreenId)) {
        const serverContent = await screenServerService.getServerContent(currentScreenId);
        if (serverContent) {
          serverContent.url = ensureFullUrl(serverContent.url);
          setContent(serverContent);
        } else if (contentId) {
          const foundContent = contents.find(c => c.id === contentId);
          if (foundContent) {
            const contentWithFullUrl = { 
              ...foundContent, 
              url: ensureFullUrl(foundContent.url) 
            };
            setContent(contentWithFullUrl);
          }
        }
      } else {
        if (contentId) {
          const foundContent = contents.find(c => c.id === contentId);
          if (foundContent) {
            const contentWithFullUrl = { 
              ...foundContent, 
              url: ensureFullUrl(foundContent.url) 
            };
            setContent(contentWithFullUrl);
            const screen = screens.find(s => s.id === currentScreenId);
            if (screen) {
              await screenServerService.startServer(currentScreenId, screen.port, contentWithFullUrl);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in fallback content handling:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le contenu de prévisualisation",
        variant: "destructive",
      });
    }
  };
  
  const handleBack = () => {
    if (!isGridView) {
      // Retour à la vue en grille si on était en vue détaillée
      setIsGridView(true);
      setSelectedScreen(null);
      navigate('/preview', { replace: true });
    } else {
      // Sinon retour à la page précédente
      navigate(-1);
    }
  };
  
  const handleOpenInNewTab = () => {
    if (content) {
      window.open(content.url, '_blank');
    }
  };

  const handleDownload = () => {
    if (content) {
      const link = document.createElement('a');
      link.href = content.url;
      link.download = content.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleScreenSelect = (screen: Screen) => {
    setIsGridView(false);
    setSelectedScreen(screen);
    
    // Mettre à jour l'URL pour refléter l'écran sélectionné
    navigate(`/preview?screenId=${screen.id}`, { replace: true });
    
    // Trouver le contenu associé à cet écran
    if (screen.contentId) {
      const screenContent = contents.find(c => c.id === screen.contentId);
      if (screenContent) {
        const contentWithFullUrl = { 
          ...screenContent, 
          url: ensureFullUrl(screenContent.url) 
        };
        setContent(contentWithFullUrl);
      }
    }
  };

  // Function to switch view mode manually
  const handleViewModeChange = (mode: string) => {
    if (mode === 'grid') {
      setIsGridView(true);
      setSelectedScreen(null);
      navigate('/preview', { replace: true });
    } else if (mode === 'detail' && screens.length > 0) {
      // Dans le cas de détaillé sans écran sélectionné, prendre le premier
      if (!selectedScreen) {
        const firstScreen = screens[0];
        setSelectedScreen(firstScreen);
        navigate(`/preview?screenId=${firstScreen.id}`, { replace: true });
      } else {
        setIsGridView(false);
        navigate(`/preview?screenId=${selectedScreen.id}`, { replace: true });
      }
    }
  };
  
  // Rendu de la vue en grille des écrans (maintenant surveillance caméra)
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
    
    // Calculer le nombre de colonnes en fonction du nombre d'écrans
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
              
              <div onClick={() => handleScreenSelect(screen)} className="cursor-pointer">
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
              </div>
              
              <CardFooter className="p-2 flex justify-between bg-slate-100">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-8" 
                  onClick={() => handleScreenSelect(screen)}
                >
                  <Maximize className="h-4 w-4 mr-1" />
                  <span className="text-xs">Détails</span>
                </Button>
                
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
  
  // Rendu d'un écran spécifique (maintenant vue détaillée)
  const renderDetailView = () => {
    // Si aucun écran n'est sélectionné et qu'il y a des écrans disponibles, on prend le premier
    if (!selectedScreen && screens.length > 0) {
      setSelectedScreen(screens[0]);
      return null;
    }
    
    if (!selectedScreen) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
          <Server className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Aucun écran sélectionné</h2>
          <p className="text-muted-foreground">Sélectionnez un écran à visualiser</p>
          
          {screens.length > 0 && (
            <Button 
              className="mt-4" 
              onClick={() => handleViewModeChange('grid')}
            >
              Voir tous les écrans
            </Button>
          )}
        </div>
      );
    }
    
    const screenStatusHook = useScreenStatus(selectedScreen);
    const isOnline = screenStatusHook.isOnline;
    const screenContent = screenStatusHook.content;
    
    // Version détaillée qui ressemble à la capture d'écran
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden border-2 rounded-lg">
          <CardHeader className="bg-slate-50 p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{selectedScreen.name}</CardTitle>
              <Badge variant={isOnline ? "success" : "secondary"}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedScreen.ipAddress}:{selectedScreen.port}
            </p>
          </CardHeader>
          
          <div className="w-full h-[480px] bg-slate-100 p-6 flex items-center justify-center">
            {htmlContent ? (
              <iframe
                srcDoc={htmlContent}
                title={screenContent?.name || selectedScreen.name}
                className="w-full h-full border-none bg-white rounded-md shadow-sm"
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            ) : screenContent ? (
              <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto">
                {screenContent.type === 'image' && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <img 
                      src={ensureFullUrl(screenContent.url)} 
                      alt={screenContent.name} 
                      className="max-w-full max-h-[400px] object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      {screenContent.name}
                    </p>
                  </div>
                )}
                
                {screenContent.type === 'video' && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <video 
                      src={ensureFullUrl(screenContent.url)} 
                      controls 
                      autoPlay 
                      className="max-w-full max-h-[400px]"
                      onError={(e) => {
                        console.error("Error loading video:", screenContent.url);
                      }}
                    >
                      Votre navigateur ne prend pas en charge la lecture vidéo.
                    </video>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      {screenContent.name}
                    </p>
                  </div>
                )}
                
                {(screenContent.type === 'powerpoint' || screenContent.type === 'pdf' || screenContent.type === 'html') && (
                  <iframe 
                    src={ensureFullUrl(screenContent.url)} 
                    title={screenContent.name}
                    className="w-full h-full border rounded-lg shadow-sm bg-white"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Server className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Aucun contenu assigné</h3>
                <p className="text-muted-foreground text-center">Assignez du contenu à cet écran pour le prévisualiser</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate(`/screens/edit/${selectedScreen.id}`)}
                >
                  Configurer l'écran
                </Button>
              </div>
            )}
          </div>
          
          <CardFooter className="p-4 bg-slate-50 flex justify-between">
            <div>
              {screenContent && (
                <div>
                  <p className="font-medium">{screenContent.name}</p>
                  <p className="text-sm text-muted-foreground">{screenContent.type}</p>
                </div>
              )}
              {!screenContent && (
                <p className="text-sm text-muted-foreground italic">Aucun contenu assigné</p>
              )}
            </div>
            
            {screenContent && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isGridView ? "Retour" : "Tous les écrans"}
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-medium">
            {isGridView 
              ? "Aperçu des écrans" 
              : selectedScreen?.name || "Détail de l'écran"}
          </h1>
          
          <Tabs 
            value={isGridView ? "grid" : "detail"}
            onValueChange={handleViewModeChange}
            className="mt-2"
          >
            <TabsList className="grid w-48 grid-cols-2">
              <TabsTrigger value="grid">Grille</TabsTrigger>
              <TabsTrigger 
                value="detail" 
                disabled={screens.length === 0}
              >
                Détaillé
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {!isGridView && selectedScreen && (
            <p className="text-sm text-muted-foreground mt-1">
              {selectedScreen.ipAddress}:{selectedScreen.port}
              {screenServerService.isServerRunning(selectedScreen.id) && (
                <Badge variant="success" className="ml-2">En ligne</Badge>
              )}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Plein écran */}
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
          
          {!isGridView && content && (
            <>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="pt-28 px-4 pb-4 flex justify-center min-h-screen">
        <div className="w-full max-w-7xl">
          {isGridView ? renderGridView() : renderDetailView()}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
