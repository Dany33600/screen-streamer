import { useState, useEffect } from 'react';
import { Screen, Content } from '@/types';
import { screenServerService } from '@/services/screenServerReal';
import { useAppStore } from '@/store';
import { toast } from '@/hooks/use-toast';

export function useScreenStatus(screen: Screen) {
  const [isOnline, setIsOnline] = useState(screen.status === 'online');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const contents = useAppStore((state) => state.contents);
  const updateScreen = useAppStore((state) => state.updateScreen);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  
  const content = screen.contentId 
    ? contents.find(c => c.id === screen.contentId) 
    : undefined;
    
  // Fonction pour vérifier l'état du serveur
  const checkServerStatus = async () => {
    if (isCheckingStatus) return; // Éviter les vérifications simultanées
    
    try {
      setIsCheckingStatus(true);
      console.log(`Vérification de l'état du serveur pour l'écran ${screen.name} (${screen.id})`);
      
      // S'assurer que le service utilise l'adresse IP actuelle
      screenServerService.updateApiBaseUrl();
      
      // Vérifier si le serveur est en cours d'exécution
      const isRunning = screenServerService.isServerRunning(screen.id);
      console.log(`État interne du serveur pour l'écran ${screen.name}: ${isRunning ? 'en ligne' : 'hors ligne'}`);
      
      // Si notre état local diffère de l'état réel du serveur, le mettre à jour
      if (isRunning !== isOnline) {
        console.log(`État du serveur pour l'écran ${screen.name} (${screen.id}) changé: ${isRunning ? 'en ligne' : 'hors ligne'}`);
        setIsOnline(isRunning);
        updateScreen(screen.id, { status: isRunning ? 'online' : 'offline' });
      }
      
      // Si le serveur est censé être en cours d'exécution, vérifier qu'il répond bien
      if (isRunning) {
        console.log(`Vérification que le serveur répond bien pour l'écran ${screen.name} sur le port ${screen.port}`);
        const isResponding = await screenServerService.checkServerStatus(screen.port);
        console.log(`Le serveur pour l'écran ${screen.name} répond-il ? ${isResponding ? 'Oui' : 'Non'}`);
        
        if (!isResponding) {
          console.log(`Le serveur pour l'écran ${screen.name} ne répond pas, tentative de redémarrage...`);
          // Si le serveur ne répond pas mais est censé être en ligne, essayer de le redémarrer
          if (content) {
            console.log(`Redémarrage du serveur pour l'écran ${screen.name} avec le contenu ${content.name}`);
            // Mettre à jour l'adresse IP de l'écran avec celle de la configuration
            if (screen.ipAddress !== baseIpAddress) {
              console.log(`Mise à jour de l'adresse IP de l'écran: ${screen.ipAddress} -> ${baseIpAddress}`);
              updateScreen(screen.id, { ipAddress: baseIpAddress });
            }
            const success = await screenServerService.startServer(screen.id, screen.port, content);
            console.log(`Redémarrage du serveur pour l'écran ${screen.name}: ${success ? 'Réussi' : 'Échoué'}`);
          } else {
            console.log(`Impossible de redémarrer le serveur pour l'écran ${screen.name}: aucun contenu assigné`);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'état du serveur:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  // Fonction pour démarrer le serveur
  const startServer = async (displayOptions?: any) => {
    if (!content) {
      toast({
        title: "Attention",
        description: "Aucun contenu assigné à cet écran. Veuillez assigner du contenu avant de démarrer le serveur.",
        variant: "destructive",
      });
      return false;
    }
    
    // Mettre à jour l'adresse IP de l'écran avec celle de la configuration
    if (screen.ipAddress !== baseIpAddress) {
      console.log(`Mise à jour de l'adresse IP de l'écran: ${screen.ipAddress} -> ${baseIpAddress}`);
      updateScreen(screen.id, { ipAddress: baseIpAddress });
    }
    
    console.log(`Démarrage du serveur pour l'écran ${screen.name} sur le port ${screen.port}...`);
    console.log(`Options d'affichage:`, displayOptions);
    
    // Mettre à jour l'URL de l'API pour utiliser l'adresse IP correcte
    screenServerService.updateApiBaseUrl();
    
    const success = await screenServerService.startServer(screen.id, screen.port, content, displayOptions);
    
    if (success) {
      setIsOnline(true);
      updateScreen(screen.id, { status: 'online' });
      
      toast({
        title: "Serveur démarré",
        description: `L'écran "${screen.name}" est maintenant en ligne sur http://${baseIpAddress}:${screen.port}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Erreur de démarrage",
        description: `Impossible de démarrer le serveur pour l'écran "${screen.name}". Vérifiez la console pour plus de détails.`,
        variant: "destructive",
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
    } else {
      toast({
        title: "Erreur d'arrêt",
        description: `Impossible d'arrêter le serveur pour l'écran "${screen.name}". Vérifiez la console pour plus de détails.`,
        variant: "destructive",
      });
    }
    
    return success;
  };
  
  // Fonction pour mettre à jour le serveur avec un nouveau contenu
  const updateServer = async (displayOptions?: any) => {
    if (!content) {
      toast({
        title: "Attention",
        description: "Aucun contenu assigné à cet écran. Veuillez assigner du contenu avant de mettre à jour le serveur.",
        variant: "destructive",
      });
      return false;
    }
    
    // Mettre à jour l'URL de l'API pour utiliser l'adresse IP correcte
    screenServerService.updateApiBaseUrl();
    
    // Mettre à jour l'adresse IP de l'écran avec celle de la configuration
    if (screen.ipAddress !== baseIpAddress) {
      console.log(`Mise à jour de l'adresse IP de l'écran: ${screen.ipAddress} -> ${baseIpAddress}`);
      updateScreen(screen.id, { ipAddress: baseIpAddress });
    }
    
    console.log(`Mise à jour du serveur pour l'écran ${screen.name} avec le contenu ${content.name}...`);
    console.log(`Options d'affichage:`, displayOptions);
    
    const success = await screenServerService.updateServer(screen.id, screen.port, content, displayOptions);
    
    if (success) {
      setIsOnline(true);
      updateScreen(screen.id, { status: 'online' });
      
      toast({
        title: "Serveur mis à jour",
        description: `L'écran "${screen.name}" a été mis à jour avec le nouveau contenu`,
        variant: "default",
      });
    } else {
      toast({
        title: "Erreur de mise à jour",
        description: `Impossible de mettre à jour le serveur pour l'écran "${screen.name}". Vérifiez la console pour plus de détails.`,
        variant: "destructive",
      });
    }
    
    return success;
  };
  
  // Vérifier l'état du serveur au chargement du composant
  useEffect(() => {
    console.log(`Vérification initiale de l'état du serveur pour l'écran ${screen.name}`);
    // Mettre à jour l'URL de l'API avec l'adresse IP correcte
    screenServerService.updateApiBaseUrl();
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
    checkServerStatus,
    // Exposer le contenu assigné
    content
  };
}
