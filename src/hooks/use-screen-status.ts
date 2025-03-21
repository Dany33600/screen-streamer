
import { useState, useEffect } from 'react';
import { Screen, Content } from '@/types';
import { screenServerService } from '@/services/screenServer';
import { useAppStore } from '@/store';

export function useScreenStatus(screen: Screen) {
  const [isOnline, setIsOnline] = useState(screen.status === 'online');
  const contents = useAppStore((state) => state.contents);
  const updateScreen = useAppStore((state) => state.updateScreen);
  
  const content = screen.contentId 
    ? contents.find(c => c.id === screen.contentId) 
    : undefined;
    
  // Fonction pour vérifier l'état du serveur
  const checkServerStatus = async () => {
    const isRunning = screenServerService.isServerRunning(screen.id);
    
    if (isRunning !== isOnline) {
      setIsOnline(isRunning);
      updateScreen(screen.id, { status: isRunning ? 'online' : 'offline' });
    }
  };
  
  // Fonction pour démarrer le serveur
  const startServer = () => {
    const success = screenServerService.startServer(screen.id, screen.port, content);
    if (success) {
      setIsOnline(true);
      updateScreen(screen.id, { status: 'online' });
    }
    return success;
  };
  
  // Fonction pour arrêter le serveur
  const stopServer = () => {
    const success = screenServerService.stopServer(screen.id);
    if (success) {
      setIsOnline(false);
      updateScreen(screen.id, { status: 'offline' });
    }
    return success;
  };
  
  // Fonction pour mettre à jour le serveur avec un nouveau contenu
  const updateServer = () => {
    const success = screenServerService.updateServer(screen.id, screen.port, content);
    if (success) {
      setIsOnline(true);
      updateScreen(screen.id, { status: 'online' });
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
