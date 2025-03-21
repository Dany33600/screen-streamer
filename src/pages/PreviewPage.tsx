import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Content } from '@/types';
import { ArrowLeft, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { screenServerService } from '@/services/screenServerReal';
import { toast } from '@/hooks/use-toast';

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [screenId, setScreenId] = useState<string | null>(null);
  const [serverId, setServerId] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
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
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentScreenId = searchParams.get('screenId');
    const contentId = searchParams.get('content');
    const serverIdParam = searchParams.get('server');
    
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
    navigate(-1);
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
  
  useEffect(() => {
    if (content) {
      console.log("Preview content URL:", content.url);
    }
  }, [content]);
  
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Aucun contenu à afficher</h1>
          <p className="text-muted-foreground">
            Aucun contenu n'a été trouvé pour cette prévisualisation.
          </p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-medium">{content.name}</h1>
          <p className="text-sm text-muted-foreground">
            {screenId && screens.find(s => s.id === screenId)?.name}
            {serverId && <span className="ml-2 text-green-500">(Serveur actif)</span>}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[30ch]">
            URL: {content.url}
          </p>
        </div>
        
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
      </div>
      
      <div className="pt-20 px-4 pb-4 flex justify-center min-h-screen">
        {htmlContent ? (
          <div className="w-full h-[calc(100vh-8rem)] border rounded-md overflow-hidden">
            <iframe
              srcDoc={htmlContent}
              title={content.name}
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts allow-popups"
            />
          </div>
        ) : (
          <>
            {content.type === 'image' && (
              <div className="flex flex-col items-center">
                <img 
                  src={content.url} 
                  alt={content.name} 
                  className="max-w-full max-h-[calc(100vh-8rem)] object-contain"
                  onError={(e) => {
                    console.error("Error loading image:", content.url);
                    toast({
                      title: "Erreur de chargement",
                      description: `Impossible de charger l'image: ${content.url}`,
                      variant: "destructive",
                    });
                  }}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Si l'image ne s'affiche pas, vérifiez que l'URL est accessible: {content.url}
                </p>
              </div>
            )}
            
            {content.type === 'video' && (
              <div className="flex flex-col items-center">
                <video 
                  src={content.url} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-[calc(100vh-8rem)]"
                  onError={(e) => {
                    console.error("Error loading video:", content.url);
                    toast({
                      title: "Erreur de chargement",
                      description: `Impossible de charger la vidéo: ${content.url}`,
                      variant: "destructive",
                    });
                  }}
                >
                  Votre navigateur ne prend pas en charge la lecture vidéo.
                </video>
                <p className="mt-2 text-sm text-muted-foreground">
                  Si la vidéo ne s'affiche pas, vérifiez que l'URL est accessible: {content.url}
                </p>
              </div>
            )}
            
            {content.type === 'powerpoint' && (
              <div className="flex flex-col items-center w-full">
                <div className="w-full h-[calc(100vh-10rem)] border rounded-md overflow-hidden bg-neutral-900 text-white flex flex-col">
                  <div className="bg-neutral-800 p-4 text-center">
                    <h3 className="text-lg font-medium">{content.name}</h3>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-8">
                    <object 
                      data={content.url} 
                      type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      className="w-full h-full"
                      onError={(e) => {
                        console.error("Error loading PowerPoint:", content.url);
                        toast({
                          title: "Information",
                          description: "Prévisualisation PowerPoint non disponible. Veuillez télécharger ou ouvrir le fichier.",
                          variant: "default",
                        });
                      }}
                    >
                      <div className="text-center p-8">
                        <p className="mb-4">La prévisualisation directe de PowerPoint n'est pas disponible.</p>
                        <div className="flex gap-4 justify-center">
                          <Button onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </Button>
                          <Button onClick={handleOpenInNewTab}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ouvrir
                          </Button>
                        </div>
                      </div>
                    </object>
                  </div>
                  <div className="bg-neutral-800 p-4 flex justify-center space-x-4">
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                    <Button onClick={handleOpenInNewTab}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ouvrir
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  La prévisualisation directe des fichiers PowerPoint peut ne pas être disponible. Utilisez les boutons ci-dessus pour accéder au fichier.
                </p>
              </div>
            )}
            
            {content.type === 'pdf' && (
              <iframe 
                src={content.url} 
                title={content.name}
                className="w-full h-[calc(100vh-8rem)] border rounded-md"
              />
            )}
            
            {content.type === 'html' && (
              <iframe 
                src={content.url} 
                title={content.name}
                className="w-full h-[calc(100vh-8rem)] border rounded-md"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
