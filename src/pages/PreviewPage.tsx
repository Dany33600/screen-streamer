
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Content, Screen } from '@/types';
import { ArrowLeft, ExternalLink, Download, RefreshCw, Server, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { screenServerService } from '@/services/screenServerReal';
import { toast } from '@/hooks/use-toast';
import { htmlGenerator } from '@/services/htmlGenerator';
import { useScreenStatus } from '@/hooks/use-screen-status';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [screenId, setScreenId] = useState<string | null>(null);
  const [serverId, setServerId] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState<boolean>(true);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const apiUrl = useAppStore((state) => state.apiUrl);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  
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
  
  // Rendu de la vue en grille des écrans
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
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {screens.map((screen) => {
          // Trouver le contenu associé à cet écran
          const screenContent = screen.contentId 
            ? contents.find(c => c.id === screen.contentId)
            : undefined;
          
          const isRunning = screenServerService.isServerRunning(screen.id);
          
          return (
            <Card 
              key={screen.id} 
              className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                isRunning ? 'border-green-500 border-2' : 'border-gray-200'
              }`}
              onClick={() => handleScreenSelect(screen)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{screen.name}</CardTitle>
                  <Badge variant={isRunning ? "success" : "secondary"}>
                    {isRunning ? 'En ligne' : 'Hors ligne'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {screen.ipAddress}:{screen.port}
                </p>
              </CardHeader>
              
              <CardContent className="p-4 pt-2">
                <div className="h-40 flex items-center justify-center bg-slate-100 rounded-md overflow-hidden">
                  {screenContent ? (
                    screenContent.type === 'image' ? (
                      <img 
                        src={ensureFullUrl(screenContent.url)} 
                        alt={screenContent.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : screenContent.type === 'video' ? (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <Play className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Vidéo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="bg-slate-200 p-2 rounded-full mb-2">
                          <ExternalLink className="h-8 w-8 text-slate-500" />
                        </div>
                        <span className="text-sm text-muted-foreground truncate max-w-full px-2">
                          {screenContent.name}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-200 p-2 rounded-full mb-2">
                        <Server className="h-8 w-8 text-slate-400" />
                      </div>
                      <span className="text-sm text-muted-foreground">Aucun contenu</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                {screenContent ? (
                  <div className="w-full">
                    <p className="text-sm font-medium truncate">{screenContent.name}</p>
                    <p className="text-xs text-muted-foreground">{screenContent.type}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Aucun contenu assigné</p>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  // Rendu d'un écran spécifique
  const renderDetailView = () => {
    if (!selectedScreen) {
      return null;
    }
    
    const screenStatusHook = useScreenStatus(selectedScreen);
    const isOnline = screenStatusHook.isOnline;
    const screenContent = screenStatusHook.content;
    
    return (
      <div className="w-full h-[calc(100vh-8rem)] border rounded-md overflow-hidden bg-white">
        {htmlContent ? (
          <iframe
            srcDoc={htmlContent}
            title={screenContent?.name || selectedScreen.name}
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts allow-popups"
          />
        ) : screenContent ? (
          <div className="flex flex-col items-center justify-center h-full">
            {screenContent.type === 'image' && (
              <div className="flex flex-col items-center">
                <img 
                  src={ensureFullUrl(screenContent.url)} 
                  alt={screenContent.name} 
                  className="max-w-full max-h-[calc(100vh-12rem)] object-contain"
                  onError={(e) => {
                    console.error("Error loading image:", screenContent.url);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {screenContent.name}
                </p>
              </div>
            )}
            
            {screenContent.type === 'video' && (
              <div className="flex flex-col items-center">
                <video 
                  src={ensureFullUrl(screenContent.url)} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-[calc(100vh-12rem)]"
                  onError={(e) => {
                    console.error("Error loading video:", screenContent.url);
                  }}
                >
                  Votre navigateur ne prend pas en charge la lecture vidéo.
                </video>
                <p className="mt-2 text-sm text-muted-foreground">
                  {screenContent.name}
                </p>
              </div>
            )}
            
            {screenContent.type === 'powerpoint' && (
              <div className="flex flex-col items-center w-full">
                <div className="w-full h-[calc(100vh-12rem)] border rounded-md overflow-hidden bg-neutral-900 text-white flex flex-col">
                  <div className="bg-neutral-800 p-4 text-center">
                    <h3 className="text-lg font-medium">{screenContent.name}</h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-4">
                    <iframe
                      src={`data:text/html;charset=utf-8,${encodeURIComponent(
                        htmlGenerator.generateHtml(screenContent)
                      )}`}
                      title={screenContent.name}
                      className="w-full h-full border-none"
                      sandbox="allow-same-origin allow-scripts allow-popups"
                      onError={() => {
                        console.error("Erreur lors du chargement de l'iframe pour la présentation PowerPoint");
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {screenContent.type === 'pdf' && (
              <iframe 
                src={ensureFullUrl(screenContent.url)} 
                title={screenContent.name}
                className="w-full h-[calc(100vh-12rem)] border rounded-md"
              />
            )}
            
            {screenContent.type === 'html' && (
              <iframe 
                src={ensureFullUrl(screenContent.url)} 
                title={screenContent.name}
                className="w-full h-[calc(100vh-12rem)] border rounded-md"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Server className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun contenu assigné</h2>
            <p className="text-muted-foreground">Assignez du contenu à cet écran pour le prévisualiser</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate(`/screens/edit/${selectedScreen.id}`)}
            >
              Configurer l'écran
            </Button>
          </div>
        )}
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
          {!isGridView && selectedScreen && (
            <p className="text-sm text-muted-foreground">
              {selectedScreen.ipAddress}:{selectedScreen.port}
              {screenServerService.isServerRunning(selectedScreen.id) && (
                <Badge variant="success" className="ml-2">En ligne</Badge>
              )}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
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
      
      <div className="pt-20 px-4 pb-4 flex justify-center min-h-screen">
        <div className="w-full max-w-7xl">
          {isGridView ? renderGridView() : renderDetailView()}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
