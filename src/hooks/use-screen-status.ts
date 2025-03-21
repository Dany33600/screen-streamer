
import { useState, useEffect } from 'react';
import { Screen, Content } from '@/types';
import { screenServerService } from '@/services/screenServerReal';
import { useAppStore } from '@/store';
import { toast } from '@/hooks/use-toast';

export function useScreenStatus(screen: Screen) {
  const [isOnline, setIsOnline] = useState(screen.status === 'online');
  const contents = useAppStore((state) => state.contents);
  const updateScreen = useAppStore((state) => state.updateScreen);
  
  const content = screen.contentId 
    ? contents.find(c => c.id === screen.contentId) 
    : undefined;
    
  // Fonction pour vérifier l'état du serveur
  const checkServerStatus = async () => {
    try {
      // Vérifier si le serveur est en cours d'exécution
      const isRunning = screenServerService.isServerRunning(screen.id);
      
      // Si notre état local diffère de l'état réel du serveur, le mettre à jour
      if (isRunning !== isOnline) {
        console.log(`État du serveur pour l'écran ${screen.name} (${screen.id}) changé: ${isRunning ? 'en ligne' : 'hors ligne'}`);
        setIsOnline(isRunning);
        updateScreen(screen.id, { status: isRunning ? 'online' : 'offline' });
      }
      
      // Si le serveur est censé être en cours d'exécution, vérifier qu'il répond bien
      if (isRunning) {
        const isResponding = await screenServerService.checkServerStatus(screen.port);
        if (!isResponding) {
          console.log(`Le serveur pour l'écran ${screen.name} ne répond pas, tentative de redémarrage...`);
          // Si le serveur ne répond pas mais est censé être en ligne, essayer de le redémarrer
          if (content) {
            screenServerService.startServer(screen.id, screen.port, content);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'état du serveur:", error);
    }
  };
  
  // Fonction pour démarrer le serveur
  const startServer = () => {
    if (!content) {
      toast({
        title: "Attention",
        description: "Aucun contenu assigné à cet écran. Veuillez assigner du contenu avant de démarrer le serveur.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log(`Démarrage du serveur pour l'écran ${screen.name} sur le port ${screen.port}...`);
    const success = screenServerService.startServer(screen.id, screen.port, content);
    
    if (success) {
      setIsOnline(true);
      updateScreen(screen.id, { status: 'online' });
      
      toast({
        title: "Serveur démarré",
        description: `L'écran "${screen.name}" est maintenant en ligne sur http://${screen.ipAddress}:${screen.port}`,
        variant: "default",
      });
    }
    
    return success;
  };
  
  // Fonction pour arrêter le serveur
  const stopServer = () => {
    console.log(`Arrêt du serveur pour l'écran ${screen.name}...`);
    const success = screenServerService.stopServer(screen.id);
    
    if (success) {
      setIsOnline(false);
      updateScreen(screen.id, { status: 'offline' });
      
      toast({
        title: "Serveur arrêté",
        description: `L'écran "${screen.name}" est maintenant hors ligne`,
        variant: "default",
      });
    }
    
    return success;
  };
  
  // Fonction pour mettre à jour le serveur avec un nouveau contenu
  const updateServer = () => {
    if (!content) {
      toast({
        title: "Attention",
        description: "Aucun contenu assigné à cet écran. Veuillez assigner du contenu avant de mettre à jour le serveur.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log(`Mise à jour du serveur pour l'écran ${screen.name} avec le contenu ${content.name}...`);
    const success = screenServerService.updateServer(screen.id, screen.port, content);
    
    if (success) {
      setIsOnline(true);
      updateScreen(screen.id, { status: 'online' });
      
      toast({
        title: "Serveur mis à jour",
        description: `L'écran "${screen.name}" a été mis à jour avec le nouveau contenu`,
        variant: "default",
      });
    }
    
    return success;
  };
  
  // Vérifier l'état du serveur au chargement du composant
  useEffect(() => {
    checkServerStatus();
    
    // Vérifier périodiquement l'état du serveur (toutes les 10 secondes)
    const intervalId = setInterval(checkServerStatus, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [screen.id]);
  
  return {
    isOnline,
    startServer,
    stopServer,
    updateServer,
    checkServerStatus
  };
}
