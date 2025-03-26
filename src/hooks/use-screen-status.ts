
import { useState, useEffect } from 'react';
import { Screen } from '@/types';
import { screenServerService } from '@/services/screenServerReal';
import { useServerStatusCheck } from './use-server-status-check';
import { useServerOperations } from './use-server-operations';
import { useContentResolver } from './use-content-resolver';

export function useScreenStatus(screen: Screen) {
  const [isOnline, setIsOnline] = useState(screen.status === 'online');
  const { content } = useContentResolver(screen);
  const { isCheckingStatus, checkServerStatus } = useServerStatusCheck(screen);
  const { startServer, stopServer, updateServer } = useServerOperations(
    screen.id, 
    screen.port, 
    screen.ipAddress, 
    screen.name
  );
  
  // Vérifier l'état du serveur au chargement du composant
  useEffect(() => {
    console.log(`Vérification initiale de l'état du serveur pour l'écran ${screen.name}`);
    // Mettre à jour l'URL de l'API avec l'adresse IP correcte
    screenServerService.updateApiBaseUrl();
    
    const checkAndUpdateStatus = async () => {
      const updatedIsOnline = await checkServerStatus(isOnline, screen.contentId);
      if (updatedIsOnline !== undefined && updatedIsOnline !== isOnline) {
        setIsOnline(updatedIsOnline);
      }
    };
    
    checkAndUpdateStatus();
    
    // Vérifier périodiquement l'état du serveur (toutes les 10 secondes)
    const intervalId = setInterval(checkAndUpdateStatus, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [screen.id]);
  
  // Wrapper pour la fonction startServer qui met à jour l'état isOnline
  const handleStartServer = async (displayOptions?: any) => {
    const success = await startServer(content, displayOptions);
    if (success) {
      setIsOnline(true);
    }
    return success;
  };
  
  // Wrapper pour la fonction stopServer qui met à jour l'état isOnline
  const handleStopServer = () => {
    const success = stopServer();
    if (success) {
      setIsOnline(false);
    }
    return success;
  };
  
  // Wrapper pour la fonction updateServer
  const handleUpdateServer = async (displayOptions?: any) => {
    const success = await updateServer(content, displayOptions);
    if (success) {
      setIsOnline(true);
    }
    return success;
  };
  
  return {
    isOnline,
    startServer: handleStartServer,
    stopServer: handleStopServer,
    updateServer: handleUpdateServer,
    checkServerStatus: async () => {
      const updatedIsOnline = await checkServerStatus(isOnline, screen.contentId);
      if (updatedIsOnline !== undefined && updatedIsOnline !== isOnline) {
        setIsOnline(updatedIsOnline);
      }
    },
    content
  };
}
