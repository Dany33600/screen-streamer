
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Content } from '@/types';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { screenServerService } from '@/services/screenServerMock';
import { toast } from '@/hooks/use-toast';

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [screenId, setScreenId] = useState<string | null>(null);
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  
  useEffect(() => {
    // Extraire les paramètres de l'URL
    const searchParams = new URLSearchParams(location.search);
    const currentScreenId = searchParams.get('screenId');
    const contentId = searchParams.get('content');
    
    if (currentScreenId) {
      setScreenId(currentScreenId);
      
      // Vérifier si le serveur est en cours d'exécution
      if (screenServerService.isServerRunning(currentScreenId)) {
        // Récupérer le contenu du serveur
        const serverContent = screenServerService.getServerContent(currentScreenId);
        if (serverContent) {
          setContent(serverContent);
        } else if (contentId) {
          const foundContent = contents.find(c => c.id === contentId);
          if (foundContent) {
            setContent(foundContent);
          }
        }
      } else {
        // Si le serveur n'est pas en cours d'exécution, récupérer le contenu à partir de l'ID
        if (contentId) {
          const foundContent = contents.find(c => c.id === contentId);
          if (foundContent) {
            setContent(foundContent);
            // Démarrer le serveur avec ce contenu
            const screen = screens.find(s => s.id === currentScreenId);
            if (screen) {
              screenServerService.startServer(currentScreenId, screen.port, foundContent);
            }
          }
        }
      }
    } else {
      // Si aucun screenId n'est fourni, essayer de récupérer le contenu directement
      if (contentId) {
        const foundContent = contents.find(c => c.id === contentId);
        if (foundContent) {
          setContent(foundContent);
        }
      }
    }
  }, [location.search, contents, screens]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleOpenInNewTab = () => {
    if (content) {
      window.open(content.url, '_blank');
    }
  };
  
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
          </p>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Ouvrir
        </Button>
      </div>
      
      <div className="pt-20 px-4 pb-4 flex justify-center min-h-screen">
        {content.type === 'image' && (
          <img 
            src={content.url} 
            alt={content.name} 
            className="max-w-full max-h-[calc(100vh-8rem)] object-contain"
          />
        )}
        
        {content.type === 'video' && (
          <video 
            src={content.url} 
            controls 
            autoPlay 
            className="max-w-full max-h-[calc(100vh-8rem)]"
          >
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </video>
        )}
        
        {(content.type === 'pdf' || content.type === 'powerpoint') && (
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
      </div>
    </div>
  );
};

export default PreviewPage;
