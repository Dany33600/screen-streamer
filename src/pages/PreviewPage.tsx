
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Content } from '@/types';
import { screenServerService } from '@/server/screenServerBrowser';
import { htmlGenerator } from '@/services/htmlGenerator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const PreviewPage = () => {
  const [searchParams] = useSearchParams();
  const screenId = searchParams.get('screenId');
  const screens = useAppStore((state) => state.screens);
  const contents = useAppStore((state) => state.contents);
  const [content, setContent] = useState<Content | undefined>();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!screenId) {
      setError('Aucun identifiant d\'écran spécifié');
      return;
    }

    const screen = screens.find(s => s.id === screenId);
    if (!screen) {
      setError(`Écran avec l'ID ${screenId} non trouvé`);
      return;
    }

    // Essayer d'obtenir le contenu depuis le service
    let screenContent = screenServerService.getServerContent(screenId);
    
    // Si le service n'a pas de contenu, essayer de le trouver à partir du contentId de l'écran
    if (!screenContent && screen.contentId) {
      screenContent = contents.find(c => c.id === screen.contentId);
    }

    setContent(screenContent);
    
    try {
      const generatedHtml = htmlGenerator.generateHtml(screenContent);
      setHtmlContent(generatedHtml);
    } catch (err) {
      console.error('Erreur lors de la génération HTML:', err);
      setError('Erreur lors de la génération du contenu HTML');
    }
  }, [screenId, screens, contents]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-background p-2 border-b flex items-center justify-between">
        <div className="text-sm font-medium">Prévisualisation: {content?.name || 'Aucun contenu'}</div>
      </div>
      
      <div className="flex-1 bg-black">
        <iframe 
          srcDoc={htmlContent}
          className="w-full h-full border-0"
          title="Screen Preview"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default PreviewPage;
