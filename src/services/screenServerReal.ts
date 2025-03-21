
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
  worker?: Worker;
}

class ScreenServerRealService {
  private servers: Map<string, ServerInstance> = new Map();
  private baseUrl: string = window.location.origin;
  
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
      
      // Créer une URL pour le serveur
      const serverUrl = `/preview?screenId=${screenId}&content=${content.id}&server=${serverId}`;
      
      // Créer un Web Worker pour gérer le serveur en arrière-plan
      const worker = this.createServerWorker(screenId, port, content);
      
      // Enregistrer le serveur
      this.servers.set(screenId, { 
        id: serverId,
        isRunning: true, 
        port, 
        content,
        serverUrl,
        worker
      });
      
      // Enregistrer l'URL et le contenu dans localStorage pour permettre à la page de prévisualisation d'y accéder
      this.saveServerData(serverId, content);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Crée un Web Worker qui simule un serveur web
   */
  private createServerWorker(screenId: string, port: number, content: Content): Worker {
    // Créer un blob qui contient le code du worker
    const workerCode = `
      // Worker pour simuler un serveur web
      let isRunning = true;
      let content = ${JSON.stringify(content)};
      
      self.onmessage = function(e) {
        if (e.data.action === 'stop') {
          isRunning = false;
          self.close();
        } else if (e.data.action === 'updateContent') {
          content = e.data.content;
        }
      };
      
      // Simuler un processus de serveur qui tourne en continu
      setInterval(() => {
        if (isRunning) {
          self.postMessage({ status: 'running', screenId: '${screenId}', port: ${port} });
        }
      }, 5000);
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    
    // Nettoyer l'URL après la création du Worker
    URL.revokeObjectURL(workerUrl);
    
    return worker;
  }
  
  /**
   * Sauvegarde les données du serveur dans localStorage
   */
  private saveServerData(serverId: string, content: Content): void {
    // Générer le HTML pour l'affichage
    const html = htmlGenerator.generateHtml(content);
    
    // Sauvegarder dans localStorage pour que la page de prévisualisation puisse y accéder
    localStorage.setItem(`server-${serverId}`, JSON.stringify({
      content,
      html
    }));
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
      
      console.log(`Arrêt du serveur pour l'écran ${screenId}`);
      
      const server = this.servers.get(screenId)!;
      
      // Arrêter le worker
      if (server.worker) {
        server.worker.postMessage({ action: 'stop' });
        server.worker.terminate();
      }
      
      // Supprimer les données du serveur du localStorage
      if (server.id) {
        localStorage.removeItem(`server-${server.id}`);
      }
      
      // Supprimer le serveur de la liste
      this.servers.delete(screenId);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Met à jour le serveur web
   */
  updateServer(screenId: string, port: number, content?: Content): boolean {
    if (!content) {
      return false;
    }
    
    // Si le serveur existe déjà, mettre à jour son contenu
    if (this.servers.has(screenId)) {
      const server = this.servers.get(screenId)!;
      
      // Mettre à jour le contenu
      server.content = content;
      
      // Mettre à jour le worker
      if (server.worker) {
        server.worker.postMessage({ action: 'updateContent', content });
      }
      
      // Mettre à jour les données du serveur dans localStorage
      this.saveServerData(server.id, content);
      
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
   * Obtient le port d'un serveur web
   */
  getServerPort(screenId: string): number | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance ? serverInstance.port : null;
  }
  
  /**
   * Obtient l'URL d'un serveur web
   */
  getServerUrl(screenId: string): string | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance && serverInstance.serverUrl ? serverInstance.serverUrl : null;
  }
  
  /**
   * Obtient le contenu d'un serveur web
   */
  getServerContent(screenId: string): Content | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance && serverInstance.content ? serverInstance.content : null;
  }
  
  /**
   * Récupère les données du serveur par son ID
   */
  getServerDataById(serverId: string): { content: Content; html: string } | null {
    const data = localStorage.getItem(`server-${serverId}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }
}

// Exporter une instance unique du service
export const screenServerService = new ScreenServerRealService();
