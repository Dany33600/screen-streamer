
import { useState } from 'react';
import { useAppStore } from '@/store';
import { screenServerService } from '@/services/screenServerReal';
import { toast } from 'sonner';
import { Screen, Content } from '@/types';

export function useScreenOperations() {
  const screens = useAppStore((state) => state.screens);
  const addScreen = useAppStore((state) => state.addScreen);
  const updateScreen = useAppStore((state) => state.updateScreen);
  const removeScreen = useAppStore((state) => state.removeScreen);
  const assignContentToScreen = useAppStore((state) => state.assignContentToScreen);
  const isLoadingScreens = useAppStore((state) => state.isLoadingScreens);
  const loadScreens = useAppStore((state) => state.loadScreens);
  const apiUrl = useAppStore((state) => state.apiUrl);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [selectedContentId, setSelectedContentId] = useState('none');

  const handleAddScreen = async (screenName: string) => {
    const screen = await addScreen(screenName);
    if (screen) {
      toast.success(`Écran "${screenName}" ajouté avec succès`);
      
      // Make sure to update the API URL after adding a screen
      screenServerService.updateApiBaseUrl({
        apiUrl,
        baseIpAddress
      });
      return screen;
    }
    return null;
  };
  
  const handleUpdateScreen = async (screenId: string, screenName: string) => {
    const screen = await updateScreen(screenId, { name: screenName });
    if (screen) {
      setCurrentScreen(null);
      toast.success('Écran mis à jour avec succès');
      return screen;
    }
    return null;
  };
  
  const handleDeleteScreen = async (id: string) => {
    // Arrêter le serveur d'écran s'il est en cours d'exécution
    screenServerService.stopServer(id);
    
    // Supprimer l'écran du serveur et du store
    const success = await removeScreen(id);
    if (success) {
      toast.success('Écran supprimé avec succès');
    }
    return success;
  };
  
  const handleAssignContent = async (
    screen: Screen,
    contentId: string,
    serverContents: Content[]
  ) => {
    if (!screen) return false;
    
    const previousContentId = screen.contentId;
    const newContentId = contentId === 'none' ? undefined : contentId;
    
    // Mettre à jour l'écran avec le nouveau contenu
    const updatedScreen = await assignContentToScreen(screen.id, newContentId);
    
    if (updatedScreen) {
      // Vérifier si le serveur est en cours d'exécution
      const isServerRunning = screenServerService.isServerRunning(screen.id);
      
      // Si le contenu a changé et que le serveur est en cours d'exécution, le redémarrer
      if (isServerRunning && previousContentId !== newContentId) {
        if (newContentId) {
          // Récupérer le nouveau contenu
          const content = serverContents.find(c => c.id === newContentId);
          
          if (content) {
            // Redémarrer le serveur avec le nouveau contenu
            console.log(`Redémarrage du serveur pour l'écran ${screen.name} avec le nouveau contenu ${content.name}`);
            const success = await screenServerService.updateServer(screen.id, screen.port, content);
            
            if (success) {
              toast.success('Serveur mis à jour', {
                description: `Le serveur pour l'écran "${screen.name}" a été mis à jour avec le nouveau contenu.`
              });
            } else {
              toast.error('Erreur de mise à jour', {
                description: `Impossible de mettre à jour le serveur pour l'écran "${screen.name}".`
              });
            }
          } else if (isServerRunning) {
            // Si aucun contenu n'est assigné mais que le serveur est en cours d'exécution, l'arrêter
            screenServerService.stopServer(screen.id);
            toast.info('Serveur arrêté', {
              description: `Le serveur pour l'écran "${screen.name}" a été arrêté car aucun contenu n'est assigné.`
            });
          }
        } else if (isServerRunning) {
          // Si le nouveau contentId est undefined et que le serveur est en cours d'exécution, l'arrêter
          screenServerService.stopServer(screen.id);
          toast.info('Serveur arrêté', {
            description: `Le serveur pour l'écran "${screen.name}" a été arrêté car aucun contenu n'est assigné.`
          });
        }
      }
      
      toast.success('Contenu assigné avec succès');
      return true;
    }
    
    return false;
  };
  
  const handleRetry = () => {
    setIsRetrying(true);
    const state = useAppStore.getState();
    screenServerService.updateApiBaseUrl({
      apiUrl: state.apiUrl,
      baseIpAddress: state.baseIpAddress
    });
    loadScreens().finally(() => setIsRetrying(false));
  };

  return {
    screens,
    isLoadingScreens,
    isRetrying,
    currentScreen,
    selectedContentId,
    handleAddScreen,
    handleUpdateScreen,
    handleDeleteScreen,
    handleAssignContent,
    handleRetry,
    setCurrentScreen,
    setSelectedContentId,
    loadScreens
  };
}
