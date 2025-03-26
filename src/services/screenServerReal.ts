
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
  // Options d'affichage selon le type de contenu
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

  // Récupère le contenu HTML pour un écran spécifique
  async getServerContent(screenId: string): Promise<Content | null> {
    try {
      const server = this.servers.get(screenId);
      if (server && server.content) {
        console.log(`Contenu trouvé en mémoire pour l'écran ${screenId}`);
        return server.content;
      }
      
      // Si le serveur n'est pas trouvé en mémoire, essayez de le récupérer depuis l'API
      console.log(`Contenu non trouvé en mémoire pour l'écran ${screenId}, tentative de récupération depuis l'API`);
      const serverId = screenId; // Utiliser l'ID de l'écran comme ID du serveur
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
  
  // Récupère une instance de serveur
  getServerInstance(screenId: string): ServerInstance | undefined {
    return this.servers.get(screenId);
  }
  
  /**
   * Démarre un serveur web réel pour un écran spécifique
   */
  async startServer(screenId: string, port: number, content?: Content, displayOptions?: any): Promise<boolean> {
    try {
      console.log(`Tentative de démarrage du serveur pour l'écran ${screenId} sur le port ${port}`);
      console.log(`Options d'affichage fournies:`, displayOptions);
      
      // Mettre à jour l'URL de l'API pour s'assurer qu'elle utilise l'adresse IP actuelle
      this.updateApiBaseUrl();
      
      // Vérifier si le contenu est assigné
      if (!content) {
        console.error("Aucun contenu n'est assigné à cet écran");
        toast.error("Aucun contenu n'est assigné à cet écran");
        return false;
      }
      
      // Si un serveur existe déjà, on le réutilise
      if (this.servers.has(screenId)) {
        const existingServer = this.servers.get(screenId)!;
        if (existingServer.isRunning) {
          console.log(`Le serveur pour l'écran ${screenId} est déjà en cours d'exécution`);
          return true;
        } else {
          // Supprime l'ancien serveur avant d'en créer un nouveau
          console.log(`Arrêt de l'ancien serveur pour l'écran ${screenId}`);
          this.stopServer(screenId);
        }
      }
      
      console.log(`Contenu à afficher:`, content);
      
      // Générer un identifiant unique pour ce serveur
      const serverId = screenId; // Utiliser l'ID de l'écran directement comme ID du serveur
      
      // Récupérer l'adresse IP configurée 
      const baseIpAddress = useAppStore.getState().baseIpAddress;
      console.log(`Utilisation de l'adresse IP configurée: ${baseIpAddress}`);
      
      // Créer une URL pour accéder au serveur depuis l'extérieur
      const hostname = baseIpAddress || window.location.hostname; // Obtenir l'IP du serveur actuel
      const serverUrl = `http://${hostname}:${port}`;
      
      console.log(`URL du serveur: ${serverUrl}`);
      
      // Déterminer les options d'affichage en fonction du type de contenu et des options utilisateur
      const mergedDisplayOptions = displayOptionsService.getDisplayOptions(content, displayOptions);
      console.log(`Options d'affichage finales pour ${content.type}:`, mergedDisplayOptions);
      
      // Générer le HTML pour l'affichage avec les options
      console.log(`Génération du HTML pour le contenu de type ${content.type}`);
      const html = htmlGenerator.generateHtml(content, mergedDisplayOptions);
      console.log(`HTML généré (premiers 100 caractères): ${html.substring(0, 100)}...`);
      
      // Sauvegarder les données du serveur sur le serveur
      console.log(`Sauvegarde des données du serveur avec l'ID: ${serverId}`);
      const saveSuccess = await contentService.saveServerData(serverId, content, html, mergedDisplayOptions);
      if (!saveSuccess) {
        console.warn(`Impossible de sauvegarder les données du serveur, mais on continue quand même`);
      }
      
      // Enregistrer le serveur dans notre liste
      console.log(`Enregistrement du serveur dans la liste interne`);
      this.servers.set(screenId, { 
        id: serverId,
        isRunning: true, 
        port, 
        content,
        html,
        serverUrl,
        displayOptions: mergedDisplayOptions
      });
      
      // Démarrer un vrai serveur HTTP sur le port spécifié
      console.log(`Démarrage du serveur HTTP sur le port ${port}`);
      await serverManagementService.startHttpServer(port, content, html);
      
      console.log(`Serveur démarré avec succès pour l'écran ${screenId} sur le port ${port}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
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
      serverManagementService.stopHttpServer(server.port);
      
      // Supprimer le serveur de notre liste
      this.servers.delete(screenId);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Met à jour le contenu d'un serveur web
   */
  async updateServer(screenId: string, port: number, content?: Content, displayOptions?: any): Promise<boolean> {
    if (!content) {
      return false;
    }
    
    // Mettre à jour l'URL de l'API pour s'assurer qu'elle utilise l'adresse IP actuelle
    this.updateApiBaseUrl();
    
    // Si le serveur existe déjà, mettre à jour son contenu
    if (this.servers.has(screenId)) {
      const server = this.servers.get(screenId)!;
      
      // Déterminer les options d'affichage en fonction du type de contenu et des options utilisateur
      const mergedDisplayOptions = displayOptionsService.getDisplayOptions(content, displayOptions);
      console.log(`Options d'affichage pour la mise à jour (${content.type}):`, mergedDisplayOptions);
      
      // Mettre à jour le contenu du serveur
      server.content = content;
      server.displayOptions = mergedDisplayOptions;
      
      // Générer le nouveau HTML avec les options d'affichage
      const html = htmlGenerator.generateHtml(content, mergedDisplayOptions);
      server.html = html;
      
      // Mettre à jour les données du serveur sur le serveur, seulement si elles n'existent pas déjà
      await contentService.saveServerData(server.id, content, html, mergedDisplayOptions);
      
      try {
        // Envoyer une requête à notre backend pour mettre à jour le contenu
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
            contentType: content.type // Ajouter le type de contenu
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
    return this.startServer(screenId, port, content, displayOptions);
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
  async checkServerStatus(port: number): Promise<boolean> {
    // Récupérer l'adresse IP configurée 
    const baseIpAddress = useAppStore.getState().baseIpAddress;
    return serverManagementService.checkServerStatus(port, baseIpAddress);
  }
}

// Export a singleton instance of the service
export const screenServerService = new ScreenServerRealService();
