
import { Content } from '@/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { htmlGenerator } from './htmlGenerator';
import { useAppStore } from '@/store';

interface ServerInstance {
  id: string;
  isRunning: boolean;
  port: number;
  content?: Content;
  html?: string;
  serverUrl: string;
}

class ScreenServerRealService {
  private servers: Map<string, ServerInstance> = new Map();
  private apiBaseUrl: string;
  
  constructor() {
    // Use the API URL from the app store if available, or provide a fallback approach
    this.updateApiBaseUrl();
    
    console.log(`Service ScreenServerReal initialisé avec l'URL API: ${this.apiBaseUrl}`);
  }
  
  // Method to update the API base URL (can be called when the API URL changes)
  public updateApiBaseUrl(customApiUrl?: string): void {
    // Get the current state from the store
    const state = useAppStore.getState();
    const configuredApiUrl = state.apiUrl;
    const baseIpAddress = state.baseIpAddress;
    
    if (customApiUrl) {
      // Remove trailing slash if present
      this.apiBaseUrl = customApiUrl.endsWith('/') 
        ? customApiUrl.slice(0, -1) + '/api'
        : customApiUrl + '/api';
    } else if (configuredApiUrl) {
      // Use the API URL from the store, replacing localhost with the actual IP address
      const formattedApiUrl = configuredApiUrl.replace('localhost', baseIpAddress);
      
      this.apiBaseUrl = formattedApiUrl.endsWith('/') 
        ? formattedApiUrl.slice(0, -1) + '/api'
        : formattedApiUrl + '/api';
    } else {
      // Fallback: determine the API URL based on the current window location
      const hostname = baseIpAddress || window.location.hostname;
      const port = 5000; // Default API port
      this.apiBaseUrl = `http://${hostname}:${port}/api`;
    }
    
    console.log(`API Base URL updated to: ${this.apiBaseUrl}`);
  }
  
  // Méthode pour stocker les données d'un serveur sur le serveur
  private async saveServerData(serverId: string, content: Content, html: string): Promise<boolean> {
    try {
      const apiUrl = `${this.apiBaseUrl}/content`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: serverId,
          content: {
            content,
            html
          }
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données du serveur:', error);
      return false;
    }
  }
  
  // Méthode pour récupérer les données d'un serveur depuis le serveur
  async getServerDataById(serverId: string): Promise<{ content: Content; html: string } | null> {
    try {
      const apiUrl = `${this.apiBaseUrl}/content/${serverId}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.content) {
        return data.content;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données du serveur:', error);
      return null;
    }
  }

  // Récupère le contenu HTML pour un écran spécifique
  async getServerContent(screenId: string): Promise<Content | null> {
    try {
      const server = this.servers.get(screenId);
      if (server && server.content) {
        return server.content;
      }
      
      // Si le serveur n'est pas trouvé en mémoire, essayez de le récupérer depuis l'API
      const serverId = screenId; // Utiliser l'ID de l'écran comme ID du serveur
      const serverData = await this.getServerDataById(serverId);
      if (serverData) {
        return serverData.content;
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du contenu du serveur pour l'écran ${screenId}:`, error);
      return null;
    }
  }
  
  /**
   * Démarre un serveur web réel pour un écran spécifique
   */
  async startServer(screenId: string, port: number, content?: Content): Promise<boolean> {
    try {
      // Si un serveur existe déjà, on le réutilise
      if (this.servers.has(screenId)) {
        const existingServer = this.servers.get(screenId)!;
        if (existingServer.isRunning) {
          console.log(`Le serveur pour l'écran ${screenId} est déjà en cours d'exécution`);
          return true;
        } else {
          // Supprime l'ancien serveur avant d'en créer un nouveau
          this.stopServer(screenId);
        }
      }
      
      if (!content) {
        toast.error("Aucun contenu n'est assigné à cet écran");
        return false;
      }
      
      console.log(`Démarrage du serveur pour l'écran ${screenId} sur le port ${port}`);
      
      // Générer un identifiant unique pour ce serveur
      const serverId = screenId; // Utiliser l'ID de l'écran directement comme ID du serveur
      
      // Créer une URL pour accéder au serveur depuis l'extérieur
      const baseIpAddress = useAppStore.getState().baseIpAddress;
      const hostname = baseIpAddress || window.location.hostname; // Obtenir l'IP du serveur actuel
      const serverUrl = `http://${hostname}:${port}`;
      
      // Générer le HTML pour l'affichage
      const html = htmlGenerator.generateHtml(content);
      
      // Sauvegarder les données du serveur sur le serveur
      await this.saveServerData(serverId, content, html);
      
      // Enregistrer le serveur dans notre liste
      this.servers.set(screenId, { 
        id: serverId,
        isRunning: true, 
        port, 
        content,
        html,
        serverUrl,
      });
      
      // Démarrer un vrai serveur HTTP sur le port spécifié
      await this.startHttpServer(port, content, html);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Démarre un serveur HTTP réel sur le port spécifié
   */
  private async startHttpServer(port: number, content: Content, html: string): Promise<void> {
    // Utiliser l'URL de l'API configurée dans le constructeur
    const apiUrl = `${this.apiBaseUrl}/start-server`;
    
    console.log(`Envoi de la requête à ${apiUrl} pour démarrer le serveur sur le port ${port}`);
    
    try {
      // Envoyer la requête pour démarrer le serveur
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          port,
          html
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Serveur démarré avec succès sur le port ${port}:`, data);
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur HTTP sur le port ${port}:`, error);
      toast.error(`Impossible de démarrer le serveur sur le port ${port}. Vérifiez que le serveur API est en cours d'exécution (node src/server.js).`);
      throw error; // Propager l'erreur pour pouvoir la gérer au niveau supérieur
    }
  }
  
  /**
   * Arrête le serveur web
   */
  stopServer(screenId: string): boolean {
    try {
      if (!this.servers.has(screenId)) {
        console.log(`Aucun serveur trouvé pour l'écran ${screenId}`);
        return false;
      }
      
      const server = this.servers.get(screenId)!;
      console.log(`Arrêt du serveur pour l'écran ${screenId} sur le port ${server.port}`);
      
      // Arrêter le serveur HTTP
      this.stopHttpServer(server.port);
      
      // Supprimer le serveur de notre liste
      this.servers.delete(screenId);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Arrête un serveur HTTP réel
   */
  private stopHttpServer(port: number): void {
    // Envoyer une requête à notre backend pour arrêter le serveur
    const apiUrl = `${this.apiBaseUrl}/stop-server`;
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ port }),
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Erreur HTTP ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log(`Serveur arrêté avec succès sur le port ${port}:`, data);
    })
    .catch(error => {
      console.error(`Erreur lors de l'arrêt du serveur HTTP sur le port ${port}:`, error);
    });
  }
  
  /**
   * Met à jour le contenu d'un serveur web
   */
  async updateServer(screenId: string, port: number, content?: Content): Promise<boolean> {
    if (!content) {
      return false;
    }
    
    // Si le serveur existe déjà, mettre à jour son contenu
    if (this.servers.has(screenId)) {
      const server = this.servers.get(screenId)!;
      
      // Mettre à jour le contenu du serveur
      server.content = content;
      
      // Générer le nouveau HTML
      const html = htmlGenerator.generateHtml(content);
      server.html = html;
      
      // Mettre à jour les données du serveur sur le serveur
      await this.saveServerData(server.id, content, html);
      
      try {
        // Envoyer une requête à notre backend pour mettre à jour le contenu
        const apiUrl = `${this.apiBaseUrl}/update-server`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            port,
            html
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`Contenu du serveur mis à jour avec succès sur le port ${port}:`, data);
        return true;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du serveur HTTP sur le port ${port}:`, error);
        return false;
      }
    }
    
    // Sinon, démarrer un nouveau serveur
    return this.startServer(screenId, port, content);
  }
  
  /**
   * Vérifie si un serveur web est en cours d'exécution
   */
  isServerRunning(screenId: string): boolean {
    return this.servers.has(screenId) && this.servers.get(screenId)!.isRunning;
  }
  
  /**
   * Obtient l'URL d'un serveur web
   */
  getServerUrl(screenId: string): string | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance ? serverInstance.serverUrl : null;
  }
  
  /**
   * Vérifie l'état d'un serveur en envoyant une requête ping
   */
  checkServerStatus(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const baseIpAddress = useAppStore.getState().baseIpAddress;
      const hostname = baseIpAddress || window.location.hostname; // Obtenir l'IP du serveur actuel
      const serverUrl = `http://${hostname}:${port}/ping`;
      
      fetch(serverUrl, { 
        method: 'GET',
        // Utiliser mode: 'no-cors' pour éviter les erreurs CORS, mais noter que cela
        // ne nous permettra pas de lire le contenu de la réponse
        mode: 'no-cors',
        // Timeout court pour ne pas bloquer trop longtemps
        signal: AbortSignal.timeout(2000)
      })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
    });
  }
}

// Export a singleton instance of the service
export const screenServerService = new ScreenServerRealService();
