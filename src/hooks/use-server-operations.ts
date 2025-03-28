import { Content } from '@/types';
import { screenServerService } from '@/services/screenServerReal';
import { useAppStore } from '@/store';
import { toast } from '@/hooks/use-toast';

export function useServerOperations(screenId: string, port: number, ipAddress: string, screenName: string) {
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  const updateScreen = useAppStore((state) => state.updateScreen);
  
  // Get the correct IP to use based on configuration
  const apiIpToUse = useBaseIpForApi ? baseIpAddress : apiIpAddress;
  
  // Fonction pour démarrer le serveur
  const startServer = async (content?: Content, displayOptions?: any) => {
    if (!content) {
      toast({
        title: "Attention",
        description: "Aucun contenu assigné à cet écran. Veuillez assigner du contenu avant de démarrer le serveur.",
        variant: "destructive",
      });
      return false;
    }
    
    // Mettre à jour l'adresse IP de l'écran avec celle de la configuration
    if (ipAddress !== baseIpAddress) {
      console.log(`Mise à jour de l'adresse IP de l'écran: ${ipAddress} -> ${baseIpAddress}`);
      updateScreen(screenId, { ipAddress: baseIpAddress });
    }
    
    console.log(`Démarrage du serveur pour l'écran ${screenName} sur le port ${port}...`);
    console.log(`Options d'affichage:`, displayOptions);
    
    // Mettre à jour l'URL de l'API pour utiliser l'adresse IP correcte
    screenServerService.updateApiBaseUrl({
      baseIpAddress,
      apiIpAddress,
      apiPort,
      useBaseIpForApi
    });
    
    const success = await screenServerService.startServer(screenId, port, content, displayOptions);
    
    if (success) {
      updateScreen(screenId, { status: 'online' });
      
      toast({
        title: "Serveur démarré",
        description: `L'écran "${screenName}" est maintenant en ligne sur http://${baseIpAddress}:${port}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Erreur de démarrage",
        description: `Impossible de démarrer le serveur pour l'écran "${screenName}". Vérifiez la console pour plus de détails.`,
        variant: "destructive",
      });
    }
    
    return success;
  };
  
  // Fonction pour arrêter le serveur
  const stopServer = () => {
    console.log(`Arrêt du serveur pour l'écran ${screenName}...`);
    const success = screenServerService.stopServer(screenId);
    
    if (success) {
      updateScreen(screenId, { status: 'offline' });
      
      toast({
        title: "Serveur arrêté",
        description: `L'écran "${screenName}" est maintenant hors ligne`,
        variant: "default",
      });
    } else {
      toast({
        title: "Erreur d'arrêt",
        description: `Impossible d'arrêter le serveur pour l'écran "${screenName}". Vérifiez la console pour plus de détails.`,
        variant: "destructive",
      });
    }
    
    return success;
  };
  
  // Fonction pour mettre à jour le serveur avec un nouveau contenu
  const updateServer = async (content?: Content, displayOptions?: any) => {
    if (!content) {
      toast({
        title: "Attention",
        description: "Aucun contenu assigné à cet écran. Veuillez assigner du contenu avant de mettre à jour le serveur.",
        variant: "destructive",
      });
      return false;
    }
    
    // Mettre à jour l'URL de l'API pour utiliser l'adresse IP correcte
    screenServerService.updateApiBaseUrl({
      baseIpAddress,
      apiIpAddress,
      apiPort,
      useBaseIpForApi
    });
    
    // Mettre à jour l'adresse IP de l'écran avec celle de la configuration
    if (ipAddress !== baseIpAddress) {
      console.log(`Mise à jour de l'adresse IP de l'écran: ${ipAddress} -> ${baseIpAddress}`);
      updateScreen(screenId, { ipAddress: baseIpAddress });
    }
    
    console.log(`Mise à jour du serveur pour l'écran ${screenName} avec le contenu ${content.name}...`);
    console.log(`Options d'affichage:`, displayOptions);
    
    const success = await screenServerService.updateServer(screenId, port, content, displayOptions);
    
    if (success) {
      updateScreen(screenId, { status: 'online' });
      
      toast({
        title: "Serveur mis à jour",
        description: `L'écran "${screenName}" a été mis à jour avec le nouveau contenu`,
        variant: "default",
      });
    } else {
      toast({
        title: "Erreur de mise à jour",
        description: `Impossible de mettre à jour le serveur pour l'écran "${screenName}". Vérifiez la console pour plus de détails.`,
        variant: "destructive",
      });
    }
    
    return success;
  };
  
  return {
    startServer,
    stopServer,
    updateServer
  };
}
