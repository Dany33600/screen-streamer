
import { Content } from '@/types';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { htmlGenerator } from './htmlGenerator';

interface ServerInstance {
  id: string;
  isRunning: boolean;
  port: number;
  content?: Content;
  html?: string;
  serverUrl: string;
}

interface ServerData {
  content: Content;
  html: string;
}

class ScreenServerRealService {
  private servers: Map<string, ServerInstance> = new Map();
  private apiBaseUrl: string;
  
  constructor() {
    // Déterminer l'URL du serveur API dynamiquement
    const hostname = window.location.hostname; // Utiliser l'hôte actuel (IP ou domaine)
    this.apiBaseUrl = `http://${hostname}:5000/api`;
    
    console.log(`Service ScreenServerReal initialisé avec l'URL API: ${this.apiBaseUrl}`);
  }
  
  // Méthode pour stocker les données d'un serveur en localStorage
  private saveServerData(serverId: string, content: Content, html: string): void {
    try {
      const serverData: ServerData = { content, html };
      localStorage.setItem(`server_${serverId}`, JSON.stringify(serverData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données du serveur:', error);
    }
  }
  
  // Méthode pour récupérer les données d'un serveur depuis localStorage
  getServerDataById(serverId: string): ServerData | null {
    try {
      const data = localStorage.getItem(`server_${serverId}`);
      if (data) {
        return JSON.parse(data) as ServerData;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données du serveur:', error);
      return null;
    }
  }

  // Récupère le contenu HTML pour un écran spécifique
  getServerContent(screenId: string): Content | null {
    try {
      const server = this.servers.get(screenId);
      if (server && server.content) {
        return server.content;
      }
      
      // Si le serveur n'est pas trouvé en mémoire, essayez de le récupérer depuis le localStorage
      const serverId = screenId; // Utiliser l'ID de l'écran comme ID du serveur
      const serverData = this.getServerDataById(serverId);
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
  startServer(screenId: string, port: number, content?: Content): boolean {
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
        toast({
          title: "Erreur",
          description: "Aucun contenu n'est assigné à cet écran",
          variant: "destructive",
        });
        return false;
      }
      
      console.log(`Démarrage du serveur pour l'écran ${screenId} sur le port ${port}`);
      
      // Générer un identifiant unique pour ce serveur
      const serverId = uuidv4();
      
      // Créer une URL pour accéder au serveur depuis l'extérieur
      const hostname = window.location.hostname; // Obtenir l'IP du serveur actuel
      const serverUrl = `http://${hostname}:${port}`;
      
      // Générer le HTML pour l'affichage
      const html = htmlGenerator.generateHtml(content);
      
      // Sauvegarder les données du serveur en localStorage
      this.saveServerData(serverId, content, html);
      
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
      this.startHttpServer(port, content, html);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Démarre un serveur HTTP réel sur le port spécifié
   */
  private startHttpServer(port: number, content: Content, html: string): void {
    // Utiliser l'URL de l'API configurée dans le constructeur
    const apiUrl = `${this.apiBaseUrl}/start-server`;
    
    console.log(`Envoi de la requête à ${apiUrl} pour démarrer le serveur sur le port ${port}`);
    
    // Envoyer la requête pour démarrer le serveur
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        port,
        html
      }),
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
      console.log(`Serveur démarré avec succès sur le port ${port}:`, data);
    })
    .catch(error => {
      console.error(`Erreur lors du démarrage du serveur HTTP sur le port ${port}:`, error);
      toast({
        title: "Erreur serveur",
        description: `Impossible de démarrer le serveur sur le port ${port}. Vérifiez que le serveur API est en cours d'exécution (node src/server.js).`,
        variant: "destructive",
      });
    });
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
  updateServer(screenId: string, port: number, content?: Content): boolean {
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
      
      // Mettre à jour les données du serveur en localStorage
      this.saveServerData(server.id, content, html);
      
      // Envoyer une requête à notre backend pour mettre à jour le contenu
      const apiUrl = `${this.apiBaseUrl}/update-server`;
      
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          port,
          html
        }),
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
        console.log(`Contenu du serveur mis à jour avec succès sur le port ${port}:`, data);
      })
      .catch(error => {
        console.error(`Erreur lors de la mise à jour du serveur HTTP sur le port ${port}:`, error);
        return false;
      });
      
      return true;
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
      const hostname = window.location.hostname; // Obtenir l'IP du serveur actuel
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

// Exporter une instance unique du service
export const screenServerService = new ScreenServerRealService();
