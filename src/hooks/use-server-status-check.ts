
import { useState } from 'react';
import { Screen } from '@/types';
import { screenServerService } from '@/services/screenServerReal';
import { useAppStore } from '@/store';

export function useServerStatusCheck(screen: Screen) {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const updateScreen = useAppStore((state) => state.updateScreen);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiUrl = useAppStore((state) => state.apiUrl);
  
  // Fonction pour vérifier l'état du serveur
  const checkServerStatus = async (isCurrentlyOnline: boolean, contentId?: string) => {
    if (isCheckingStatus) return; // Éviter les vérifications simultanées
    
    try {
      setIsCheckingStatus(true);
      console.log(`Vérification de l'état du serveur pour l'écran ${screen.name} (${screen.id})`);
      
      // S'assurer que le service utilise l'adresse IP actuelle
      screenServerService.updateApiBaseUrl({
        apiUrl,
        baseIpAddress
      });
      
      // Vérifier si le serveur est en cours d'exécution
      const isRunning = screenServerService.isServerRunning(screen.id);
      console.log(`État interne du serveur pour l'écran ${screen.name}: ${isRunning ? 'en ligne' : 'hors ligne'}`);
      
      // Si notre état local diffère de l'état réel du serveur, le mettre à jour
      if (isRunning !== isCurrentlyOnline) {
        console.log(`État du serveur pour l'écran ${screen.name} (${screen.id}) changé: ${isRunning ? 'en ligne' : 'hors ligne'}`);
        updateScreen(screen.id, { status: isRunning ? 'online' : 'offline' });
        return isRunning;
      }
      
      // Si le serveur est censé être en cours d'exécution, vérifier qu'il répond bien
      if (isRunning) {
        console.log(`Vérification que le serveur répond bien pour l'écran ${screen.name} sur le port ${screen.port}`);
        const isResponding = await screenServerService.checkServerStatus(screen.port);
        console.log(`Le serveur pour l'écran ${screen.name} répond-il ? ${isResponding ? 'Oui' : 'Non'}`);
        
        if (!isResponding && contentId) {
          console.log(`Le serveur pour l'écran ${screen.name} ne répond pas, tentative de redémarrage...`);
          
          // Mettre à jour l'adresse IP de l'écran avec celle de la configuration
          if (screen.ipAddress !== baseIpAddress) {
            console.log(`Mise à jour de l'adresse IP de l'écran: ${screen.ipAddress} -> ${baseIpAddress}`);
            updateScreen(screen.id, { ipAddress: baseIpAddress });
          }
        }
      }
      
      return isCurrentlyOnline;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'état du serveur:", error);
      return isCurrentlyOnline;
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  return {
    isCheckingStatus,
    checkServerStatus
  };
}
