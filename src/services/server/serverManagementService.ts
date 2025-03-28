
import { Content } from '@/types';
import { ApiService } from '../api/apiService';
import { htmlGenerator } from '../htmlGenerator';

export class ServerManagementService extends ApiService {
  /**
   * Démarre un serveur HTTP réel sur le port spécifié
   */
  public async startHttpServer(port: number, content: Content, html: string): Promise<void> {
    // Mettre à jour l'URL de l'API pour s'assurer qu'elle utilise l'adresse IP actuelle
    this.updateApiBaseUrl();
    
    // Utiliser l'URL de l'API configurée dans le constructeur
    const apiUrl = `${this.apiBaseUrl}/start-server`;
    
    console.log(`Envoi de la requête à ${apiUrl} pour démarrer le serveur sur le port ${port}`);
    console.log(`Taille du HTML: ${html.length} caractères`);
    
    try {
      // Envoyer la requête pour démarrer le serveur
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          port,
          html,
          contentType: content.type // Ajouter le type de contenu pour des traitements spécifiques côté serveur
        }),
      };
      
      const data = await this.handleApiRequest<any>(apiUrl, options);
      console.log(`Serveur démarré avec succès sur le port ${port}:`, data);
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur HTTP sur le port ${port}:`, error);
      throw error; // Propager l'erreur pour pouvoir la gérer au niveau supérieur
    }
  }
  
  /**
   * Arrête un serveur HTTP réel
   */
  public stopHttpServer(port: number): void {
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
   * Vérifie l'état d'un serveur en envoyant une requête ping
   */
  public async checkServerStatus(port: number, baseIpAddress: string): Promise<boolean> {
    try {
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

  /**
   * Récupère l'adresse IP du serveur Node.js
   */
  public async getServerIpAddress(): Promise<string | null> {
    try {
      // Mettre à jour l'URL de l'API pour s'assurer qu'elle utilise l'adresse IP actuelle
      this.updateApiBaseUrl();
      
      // Envoyer une requête au serveur pour récupérer son adresse IP
      const apiUrl = `${this.apiBaseUrl}/network/ip`;
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ipAddress) {
          return data.ipAddress;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse IP du serveur:", error);
      return null;
    }
  }
}

export const serverManagementService = new ServerManagementService();
