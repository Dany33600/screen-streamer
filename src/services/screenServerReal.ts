import { Content } from '@/types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { htmlGenerator } from './htmlGenerator';
import { useAppStore } from '@/store';

interface ApiUrlConfig {
  apiUrl: string;
  baseIpAddress?: string;
}

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

class ScreenServerRealService {
  private servers: Map<string, ServerInstance> = new Map();
  private apiBaseUrl: string;
  
  constructor() {
    // Use the API URL from the app store if available, or provide a fallback approach
    this.updateApiBaseUrl();
    
    console.log(`Service ScreenServerReal initialisé avec l'URL API: ${this.apiBaseUrl}`);
  }
  
  // Method to update the API base URL (can be called when the API URL changes)
  public updateApiBaseUrl(config: ApiUrlConfig): void {
    const { apiUrl, baseIpAddress } = config;
    if (apiUrl) {
      // Replace 'localhost' with the base IP address if provided
      const formattedApiUrl = apiUrl.replace('localhost', baseIpAddress || 'localhost');
      
      this.apiBaseUrl = formattedApiUrl.endsWith('/') 
        ? formattedApiUrl.slice(0, -1)
        : formattedApiUrl;
        
      // Make sure the URL ends with '/api'
      if (!this.apiBaseUrl.endsWith('/api')) {
        this.apiBaseUrl = this.apiBaseUrl + '/api';
      }
      
      console.log(`API URL configurée: ${this.apiBaseUrl}`);
    } else {
      // Fallback to a default API URL
      console.warn('Aucune URL d\'API fournie, utilisation de l\'URL par défaut');
    }
  }
  
  // Vérifie si un contenu existe déjà pour éviter les doublons
  private async contentExists(contentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/content/${contentId}`);
      return response.ok; // Si la réponse est OK, le contenu existe
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'existence du contenu ${contentId}:`, error);
      return false; // En cas d'erreur, supposons que le contenu n'existe pas
    }
  }
  
  // Méthode pour stocker les données d'un serveur sur le serveur
  private async saveServerData(serverId: string, content: Content, html: string, displayOptions?: any): Promise<boolean> {
    try {
      // Vérifier d'abord si le contenu existe déjà
      const exists = await this.contentExists(serverId);
      if (exists) {
        console.log(`Le contenu ${serverId} existe déjà, mise à jour des données`);
      }
      
      const apiUrl = `${this.apiBaseUrl}/content`;
      
      console.log(`Sauvegarde des données du serveur pour l'ID: ${serverId} sur ${apiUrl}`);
      console.log(`Options d'affichage:`, displayOptions);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: serverId,
          content: {
            content,
            html,
            displayOptions
          }
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur HTTP ${response.status} lors de la sauvegarde des données: ${errorText}`);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      console.log(`Données du serveur sauvegardées avec succès pour l'ID: ${serverId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données du serveur:', error);
      return false;
    }
  }
  
  // Méthode pour récupérer les données d'un serveur depuis le serveur
  async getServerDataById(serverId: string): Promise<{ content: Content; html: string; displayOptions?: any } | null> {
    try {
      const apiUrl = `${this.apiBaseUrl}/content/${serverId}`;
      
      console.log(`Récupération des données du serveur pour l'ID: ${serverId} depuis ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Aucune donnée trouvée pour le serveur avec l'ID: ${serverId}`);
          return null;
        }
        const errorText = await response.text();
        console.error(`Erreur HTTP ${response.status} lors de la récupération des données: ${errorText}`);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Données récupérées pour le serveur ${serverId}:`, data);
      
      if (data.success && data.content) {
        return data.content;
      }
      
      console.log(`Données invalides pour le serveur ${serverId}`);
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
        console.log(`Contenu trouvé en mémoire pour l'écran ${screenId}`);
        return server.content;
      }
      
      // Si le serveur n'est pas trouvé en mémoire, essayez de le récupérer depuis l'API
      console.log(`Contenu non trouvé en mémoire pour l'écran ${screenId}, tentative de récupération depuis l'API`);
      const serverId = screenId; // Utiliser l'ID de l'écran comme ID du serveur
      const serverData = await this.getServerDataById(serverId);
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
   * Détermine les options d'affichage en fonction du type de contenu
   */
  private getDisplayOptions(content: Content, userOptions?: any): any {
    // Fusionner les options par défaut avec les options utilisateur
    const options: any = {
      // Options par défaut
      autoplay: true,
      loop: true,
      controls: true,
      muted: true,
      interval: 5000,
      autoSlide: 5000,
      ...userOptions // Surcharger avec les options utilisateur
    };
    
    // Retourner les options fusionnées
    return options;
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
      const mergedDisplayOptions = this.getDisplayOptions(content, displayOptions);
      console.log(`Options d'affichage finales pour ${content.type}:`, mergedDisplayOptions);
      
      // Générer le HTML pour l'affichage avec les options
      console.log(`Génération du HTML pour le contenu de type ${content.type}`);
      const html = htmlGenerator.generateHtml(content, mergedDisplayOptions);
      console.log(`HTML généré (premiers 100 caractères): ${html.substring(0, 100)}...`);
      
      // Sauvegarder les données du serveur sur le serveur
      console.log(`Sauvegarde des données du serveur avec l'ID: ${serverId}`);
      const saveSuccess = await this.saveServerData(serverId, content, html, mergedDisplayOptions);
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
      await this.startHttpServer(port, content, html);
      
      console.log(`Serveur démarré avec succès pour l'écran ${screenId} sur le port ${port}`);
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
    // Mettre à jour l'URL de l'API pour s'assurer qu'elle utilise l'adresse IP actuelle
    this.updateApiBaseUrl();
    
    // Utiliser l'URL de l'API configurée dans le constructeur
    const apiUrl = `${this.apiBaseUrl}/start-server`;
    
    console.log(`Envoi de la requête à ${apiUrl} pour démarrer le serveur sur le port ${port}`);
    console.log(`Taille du HTML: ${html.length} caractères`);
    
    try {
      // Envoyer la requête pour démarrer le serveur
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          port,
          html,
          contentType: content.type // Ajouter le type de contenu pour des traitements spécifiques côté serveur
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur HTTP ${response.status} lors du démarrage du serveur: ${errorText}`);
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
    // Mettre à jour l'URL de l'API pour s'assurer qu'elle utilise l'adresse IP actuelle
    this.updateApiBaseUrl();
    
    // Envoyer une requête à notre backend pour arrêter le serveur
    const apiUrl = `${this.apiBaseUrl}/stop-server`;
    
    console.log(`Envoi de la requête à ${apiUrl} pour arrêter le serveur sur le port ${port}`);
    
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
      const mergedDisplayOptions = this.getDisplayOptions(content, displayOptions);
      console.log(`Options d'affichage pour la mise à jour (${content.type}):`, mergedDisplayOptions);
      
      // Mettre à jour le contenu du serveur
      server.content = content;
      server.displayOptions = mergedDisplayOptions;
      
      // Générer le nouveau HTML avec les options d'affichage
      const html = htmlGenerator.generateHtml(content, mergedDisplayOptions);
      server.html = html;
      
      // Mettre à jour les données du serveur sur le serveur, seulement si elles n'existent pas déjà
      await this.saveServerData(server.id, content, html, mergedDisplayOptions);
      
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
    try {
      // Récupérer l'adresse IP configurée 
      const baseIpAddress = useAppStore.getState().baseIpAddress;
      
      // Construire l'URL du serveur à vérifier
      const serverUrl = `http://${baseIpAddress}:${port}/ping`;
      console.log(`Vérification de l'état du serveur à l'URL: ${serverUrl}`);
      
      // Définir un timeout pour la requête (3 secondes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Envoyer une requête ping au serveur
      const response = await fetch(serverUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      
      // Annuler le timeout
      clearTimeout(timeoutId);
      
      // Vérifier si la réponse est OK
      if (response.ok) {
        const text = await response.text();
        console.log(`Réponse du serveur sur le port ${port}: ${text}`);
        return text === 'pong';
      }
      
      console.log(`Le serveur sur le port ${port} a répondu avec le statut: ${response.status}`);
      return false;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'état du serveur sur le port ${port}:`, error);
      return false;
    }
  }
}

// Export a singleton instance of the service
export const screenServerService = new ScreenServerRealService();
