import { Content } from '@/types';
import { toast } from 'sonner';
import { htmlGenerator } from './htmlGenerator';
import { useAppStore } from '@/store';
import { contentService } from './content/contentService';
import { serverManagementService } from './server/serverManagementService';
import { displayOptionsService } from './display/displayOptionsService';
import { ApiService } from './api/apiService';

interface ServerInstance {
  id: string;
  isRunning: boolean;
  port: number;
  content?: Content;
  html?: string;
  serverUrl: string;
  displayOptions?: {
    autoplay?: boolean;      // Pour les vidéos
    loop?: boolean;          // Pour les vidéos et présentations
    controls?: boolean;      // Pour les vidéos
    interval?: number;       // Pour les diaporamas (en ms)
    muted?: boolean;         // Pour les vidéos
    autoSlide?: number;      // Pour les présentations (en ms)
  };
}

class ScreenServerRealService extends ApiService {
  private servers: Map<string, ServerInstance> = new Map();
  
  constructor() {
    super();
    console.log(`Service ScreenServerReal initialisé avec l'URL API: ${this.apiBaseUrl}`);
  }

  async getServerContent(screenId: string): Promise<Content | null> {
    try {
      const server = this.servers.get(screenId);
      if (server && server.content) {
        console.log(`Contenu trouvé en mémoire pour l'écran ${screenId}`);
        return server.content;
      }
      
      console.log(`Contenu non trouvé en mémoire pour l'écran ${screenId}, tentative de récupération depuis l'API`);
      const serverId = screenId;
      const serverData = await contentService.getServerDataById(serverId);
      if (serverData) {
        console.log(`Contenu récupéré depuis l'API pour l'écran ${screenId}`);
        return serverData.content;
      }
      
      console.log(`Aucun contenu trouvé pour l'écran ${screenId}`);
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du contenu du serveur pour l'écran ${screenId}:`, error);
      return null;
    }
  }
  
  getServerInstance(screenId: string): ServerInstance | undefined {
    return this.servers.get(screenId);
  }
  
  async startServer(screenId: string, port: number, content?: Content, displayOptions?: any): Promise<boolean> {
    try {
      console.log(`Tentative de démarrage du serveur pour l'écran ${screenId} sur le port ${port}`);
      console.log(`Options d'affichage fournies:`, displayOptions);
      
      this.updateApiBaseUrl();
      
      if (!content) {
        console.error("Aucun contenu n'est assigné à cet écran");
        toast.error("Aucun contenu n'est assigné à cet écran");
        return false;
      }
      
      if (this.servers.has(screenId)) {
        const existingServer = this.servers.get(screenId)!;
        if (existingServer.isRunning) {
          console.log(`Le serveur pour l'écran ${screenId} est déjà en cours d'exécution`);
          return true;
        } else {
          this.stopServer(screenId);
        }
      }
      
      console.log(`Contenu à afficher:`, content);
      
      const isExternalUrl = content.url.startsWith('http://') || content.url.startsWith('https://');
      console.log(`URL externe détectée: ${isExternalUrl ? 'Oui' : 'Non'}`);
      
      const serverId = screenId;
      const state = useAppStore.getState();
      const baseIpAddress = state.baseIpAddress;
      console.log(`Utilisation de l'adresse IP configurée: ${baseIpAddress}`);
      
      const hostname = baseIpAddress || window.location.hostname;
      const serverUrl = `http://${hostname}:${port}`;
      
      console.log(`URL du serveur: ${serverUrl}`);
      
      const mergedDisplayOptions = displayOptionsService.getDisplayOptions(content, displayOptions);
      console.log(`Options d'affichage finales pour ${content.type}:`, mergedDisplayOptions);
      
      const html = htmlGenerator.generateHtml(content, mergedDisplayOptions);
      console.log(`HTML généré (premiers 100 caractères): ${html.substring(0, 100)}...`);
      
      const saveSuccess = await contentService.saveServerData(serverId, content, html, mergedDisplayOptions);
      if (!saveSuccess) {
        console.warn(`Impossible de sauvegarder les données du serveur, mais on continue quand même`);
      }
      
      this.servers.set(screenId, { 
        id: serverId,
        isRunning: true, 
        port, 
        content,
        html,
        serverUrl,
        displayOptions: mergedDisplayOptions
      });
      
      await serverManagementService.startHttpServer(port, content, html);
      
      console.log(`Serveur démarré avec succès pour l'écran ${screenId} sur le port ${port}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  stopServer(screenId: string): boolean {
    try {
      if (!this.servers.has(screenId)) {
        console.log(`Aucun serveur trouvé pour l'écran ${screenId}`);
        return false;
      }
      
      const server = this.servers.get(screenId)!;
      console.log(`Arrêt du serveur pour l'écran ${screenId} sur le port ${server.port}`);
      
      serverManagementService.stopHttpServer(server.port);
      
      this.servers.delete(screenId);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  async updateServer(screenId: string, port: number, content?: Content, displayOptions?: any): Promise<boolean> {
    if (!content) {
      return false;
    }
    
    this.updateApiBaseUrl();
    
    if (this.servers.has(screenId)) {
      const server = this.servers.get(screenId)!;
      
      const mergedDisplayOptions = displayOptionsService.getDisplayOptions(content, displayOptions);
      console.log(`Options d'affichage pour la mise à jour (${content.type}):`, mergedDisplayOptions);
      
      server.content = content;
      server.displayOptions = mergedDisplayOptions;
      
      const html = htmlGenerator.generateHtml(content, mergedDisplayOptions);
      server.html = html;
      
      await contentService.saveServerData(server.id, content, html, mergedDisplayOptions);
      
      try {
        const apiUrl = `${this.apiBaseUrl}/update-server`;
        
        console.log(`Envoi de la requête à ${apiUrl} pour mettre à jour le serveur sur le port ${port}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            port,
            html,
            contentType: content.type
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
    
    return this.startServer(screenId, port, content, displayOptions);
  }
  
  isServerRunning(screenId: string): boolean {
    return this.servers.has(screenId) && this.servers.get(screenId)!.isRunning;
  }
  
  getServerUrl(screenId: string): string | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance ? serverInstance.serverUrl : null;
  }
  
  async checkServerStatus(port: number): Promise<boolean> {
    const baseIpAddress = useAppStore.getState().baseIpAddress;
    return serverManagementService.checkServerStatus(port, baseIpAddress);
  }
}

export const screenServerService = new ScreenServerRealService();
