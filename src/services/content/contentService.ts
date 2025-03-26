
import { Content } from '@/types';
import { ApiService } from '../api/apiService';

interface ContentResponse {
  success: boolean;
  content: {
    content: Content;
    html: string;
    displayOptions?: any;
  };
}

export class ContentService extends ApiService {
  // Vérifie si un contenu existe déjà pour éviter les doublons
  public async contentExists(contentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/content/${contentId}`);
      return response.ok; // Si la réponse est OK, le contenu existe
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'existence du contenu ${contentId}:`, error);
      return false; // En cas d'erreur, supposons que le contenu n'existe pas
    }
  }
  
  // Méthode pour stocker les données d'un serveur sur le serveur
  public async saveServerData(serverId: string, content: Content, html: string, displayOptions?: any): Promise<boolean> {
    try {
      // Vérifier d'abord si le contenu existe déjà
      const exists = await this.contentExists(serverId);
      if (exists) {
        console.log(`Le contenu ${serverId} existe déjà, mise à jour des données`);
      }
      
      const apiUrl = `${this.apiBaseUrl}/content`;
      
      console.log(`Sauvegarde des données du serveur pour l'ID: ${serverId} sur ${apiUrl}`);
      console.log(`Options d'affichage:`, displayOptions);
      
      const options: RequestInit = {
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
      };
      
      await this.handleApiRequest<any>(apiUrl, options);
      
      console.log(`Données du serveur sauvegardées avec succès pour l'ID: ${serverId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données du serveur:', error);
      return false;
    }
  }
  
  // Méthode pour récupérer les données d'un serveur depuis le serveur
  public async getServerDataById(serverId: string): Promise<{ content: Content; html: string; displayOptions?: any } | null> {
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
}

export const contentService = new ContentService();
