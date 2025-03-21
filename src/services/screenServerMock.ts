
import { Content } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ServerInstance {
  isRunning: boolean;
  port: number;
  content?: Content;
  serverUrl?: string;
}

class ScreenServerMockService {
  private servers: Map<string, ServerInstance> = new Map();
  
  /**
   * Démarre un serveur simulé pour un écran spécifique
   */
  startServer(screenId: string, port: number, content?: Content): boolean {
    try {
      // Si un serveur existe déjà, on retourne simplement true
      if (this.servers.has(screenId)) {
        console.log(`Le serveur pour l'écran ${screenId} est déjà en cours d'exécution`);
        return true;
      }
      
      if (!content) {
        toast({
          title: "Erreur",
          description: "Aucun contenu n'est assigné à cet écran",
          variant: "destructive",
        });
        return false;
      }
      
      console.log(`Démarrage du serveur pour l'écran ${screenId} sur le port ${port}`);
      
      // Créer une URL pour simuler un serveur local
      const serverUrl = `/preview?screenId=${screenId}&content=${content.id}`;
      
      // Simuler le démarrage d'un serveur
      this.servers.set(screenId, { 
        isRunning: true, 
        port, 
        content,
        serverUrl
      });
      
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Arrête le serveur simulé
   */
  stopServer(screenId: string): boolean {
    try {
      if (!this.servers.has(screenId)) {
        console.log(`Aucun serveur trouvé pour l'écran ${screenId}`);
        return false;
      }
      
      console.log(`Arrêt du serveur pour l'écran ${screenId}`);
      this.servers.delete(screenId);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Met à jour le serveur simulé
   */
  updateServer(screenId: string, port: number, content?: Content): boolean {
    this.stopServer(screenId);
    return this.startServer(screenId, port, content);
  }
  
  /**
   * Vérifie si un serveur simulé est en cours d'exécution
   */
  isServerRunning(screenId: string): boolean {
    return this.servers.has(screenId) && this.servers.get(screenId)!.isRunning;
  }
  
  /**
   * Obtient le port d'un serveur simulé
   */
  getServerPort(screenId: string): number | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance ? serverInstance.port : null;
  }
  
  /**
   * Obtient l'URL d'un serveur simulé
   */
  getServerUrl(screenId: string): string | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance && serverInstance.serverUrl ? serverInstance.serverUrl : null;
  }
  
  /**
   * Obtient le contenu d'un serveur simulé
   */
  getServerContent(screenId: string): Content | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance && serverInstance.content ? serverInstance.content : null;
  }
}

// Exporter une instance unique du service
export const screenServerService = new ScreenServerMockService();
