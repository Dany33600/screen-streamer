
import { Content } from '@/types';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { htmlGenerator } from './htmlGenerator';

interface ServerInstance {
  id: string;
  isRunning: boolean;
  port: number;
  content?: Content;
  serverUrl: string;
}

class ScreenServerRealService {
  private servers: Map<string, ServerInstance> = new Map();
  
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
      // Cette URL pointe vers le port spécifique de cet écran
      const serverUrl = `http://${window.location.hostname}:${port}`;
      
      // Enregistrer le serveur dans notre liste
      this.servers.set(screenId, { 
        id: serverId,
        isRunning: true, 
        port, 
        content,
        serverUrl,
      });
      
      // Démarrer un vrai serveur HTTP sur le port spécifié
      this.startHttpServer(port, content);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Démarre un serveur HTTP réel sur le port spécifié
   */
  private startHttpServer(port: number, content: Content): void {
    // Générer le HTML pour l'affichage
    const html = htmlGenerator.generateHtml(content);
    
    // Dans un environnement navigateur, nous ne pouvons pas créer de serveur HTTP directement
    // Nous allons donc envoyer une requête à notre backend pour démarrer un serveur
    
    // URL de notre API backend qui gère les serveurs
    const backendUrl = "/api/start-server";
    
    // Envoyer la requête pour démarrer le serveur
    fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        port,
        content,
        html
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
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
        description: `Impossible de démarrer le serveur sur le port ${port}. Assurez-vous que le port est disponible.`,
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
    const backendUrl = "/api/stop-server";
    
    fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ port }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
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
      
      // Envoyer une requête à notre backend pour mettre à jour le contenu
      const backendUrl = "/api/update-server";
      
      fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          port,
          content,
          html
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
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
      const serverUrl = `http://${window.location.hostname}:${port}/ping`;
      
      fetch(serverUrl, { method: 'GET', mode: 'no-cors' })
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
