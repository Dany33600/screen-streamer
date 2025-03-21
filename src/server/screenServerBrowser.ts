
import { Content } from '@/types';

interface ServerInstance {
  isRunning: boolean;
  port: number;
  content?: Content;
  url: string;
}

/**
 * Service pour simuler des serveurs d'écran dans un environnement navigateur
 * Cette version ne tente pas de créer de vrais serveurs HTTP
 */
class ScreenServerBrowserService {
  private servers: Map<string, ServerInstance> = new Map();
  
  /**
   * Simule le démarrage d'un serveur pour un écran spécifique
   */
  startServer(screenId: string, port: number, content?: Content): boolean {
    try {
      console.log(`[Browser] Simulation de démarrage du serveur pour l'écran ${screenId} sur le port ${port}`);
      
      // Vérifier si un serveur existe déjà
      if (this.servers.has(screenId)) {
        console.log(`[Browser] Le serveur pour l'écran ${screenId} est déjà simulé comme fonctionnant`);
        return true;
      }
      
      // Créer une URL pour l'aperçu (ne sera pas réellement accessible)
      const url = `http://localhost:${port}`;
      
      // Simuler le démarrage d'un serveur
      this.servers.set(screenId, { 
        isRunning: true, 
        port, 
        content,
        url
      });
      
      console.log(`[Browser] Serveur simulé pour l'écran ${screenId} démarré (URL: ${url})`);
      return true;
    } catch (error) {
      console.error(`[Browser] Erreur lors de la simulation du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Simule l'arrêt d'un serveur
   */
  stopServer(screenId: string): boolean {
    try {
      console.log(`[Browser] Simulation d'arrêt du serveur pour l'écran ${screenId}`);
      
      if (!this.servers.has(screenId)) {
        console.log(`[Browser] Aucun serveur simulé trouvé pour l'écran ${screenId}`);
        return false;
      }
      
      this.servers.delete(screenId);
      return true;
    } catch (error) {
      console.error(`[Browser] Erreur lors de la simulation de l'arrêt du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Simule la mise à jour d'un serveur
   */
  updateServer(screenId: string, port: number, content?: Content): boolean {
    this.stopServer(screenId);
    return this.startServer(screenId, port, content);
  }
  
  /**
   * Vérifie si un serveur simulé est considéré comme en cours d'exécution
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
    return serverInstance ? serverInstance.url : null;
  }
  
  /**
   * Obtient le contenu d'un serveur simulé
   */
  getServerContent(screenId: string): Content | undefined {
    const serverInstance = this.servers.get(screenId);
    return serverInstance ? serverInstance.content : undefined;
  }
}

// Exporter une instance unique du service
export const screenServerService = new ScreenServerBrowserService();
