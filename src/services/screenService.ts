
import { Screen } from '@/types';
import { toast } from 'sonner';

class ScreenService {
  private apiBaseUrl: string = '';
  
  constructor() {
    // Initialize with empty API URL - will be updated before each API call
  }
  
  // Method to update the API base URL using parameters instead of store
  public updateApiBaseUrl(apiUrl?: string, baseIpAddress?: string): void {
    if (apiUrl) {
      // Use the API URL from parameters
      const formattedApiUrl = apiUrl.replace('localhost', baseIpAddress || 'localhost');
      
      this.apiBaseUrl = formattedApiUrl.endsWith('/') 
        ? formattedApiUrl.slice(0, -1)
        : formattedApiUrl;
        
      // S'assurer que l'URL se termine par '/api'
      if (!this.apiBaseUrl.endsWith('/api')) {
        this.apiBaseUrl = this.apiBaseUrl + '/api';
      }
    } else {
      // Fallback: determine the API URL based on the current window location
      const hostname = baseIpAddress || window.location.hostname;
      const port = 5000; // Default API port
      this.apiBaseUrl = `http://${hostname}:${port}/api`;
    }
    
    console.log(`Screen Service: API Base URL updated to: ${this.apiBaseUrl}`);
  }
  
  // Get all screens from the server
  async getAllScreens(apiUrl?: string, baseIpAddress?: string): Promise<Screen[]> {
    try {
      this.updateApiBaseUrl(apiUrl, baseIpAddress);
      
      const response = await fetch(`${this.apiBaseUrl}/screens`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.screens)) {
        return data.screens;
      } else {
        console.warn('Format de réponse incorrect pour les écrans:', data);
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des écrans:', error);
      return [];
    }
  }
  
  // Get a screen by ID
  async getScreenById(screenId: string, apiUrl?: string, baseIpAddress?: string): Promise<Screen | null> {
    try {
      this.updateApiBaseUrl(apiUrl, baseIpAddress);
      
      const response = await fetch(`${this.apiBaseUrl}/screens/${screenId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.screen) {
        return data.screen;
      } else {
        console.warn(`Format de réponse incorrect pour l'écran ${screenId}:`, data);
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'écran ${screenId}:`, error);
      return null;
    }
  }
  
  // Save a new screen to the server
  async saveScreen(screen: Screen, apiUrl?: string, baseIpAddress?: string): Promise<Screen | null> {
    try {
      this.updateApiBaseUrl(apiUrl, baseIpAddress);
      
      const response = await fetch(`${this.apiBaseUrl}/screens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ screen }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.screen) {
        return data.screen;
      } else {
        console.warn('Format de réponse incorrect lors de la sauvegarde de l\'écran:', data);
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'écran:', error);
      return null;
    }
  }
  
  // Update an existing screen
  async updateScreen(screenId: string, data: Partial<Screen>, apiUrl?: string, baseIpAddress?: string): Promise<Screen | null> {
    try {
      this.updateApiBaseUrl(apiUrl, baseIpAddress);
      
      const response = await fetch(`${this.apiBaseUrl}/screens/${screenId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.screen) {
        return responseData.screen;
      } else {
        console.warn(`Format de réponse incorrect lors de la mise à jour de l'écran ${screenId}:`, responseData);
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'écran ${screenId}:`, error);
      return null;
    }
  }
  
  // Delete a screen from the server
  async deleteScreen(screenId: string, apiUrl?: string, baseIpAddress?: string): Promise<boolean> {
    try {
      this.updateApiBaseUrl(apiUrl, baseIpAddress);
      
      const response = await fetch(`${this.apiBaseUrl}/screens/${screenId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.success === true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'écran ${screenId}:`, error);
      return false;
    }
  }
}

// Export a singleton instance
export const screenService = new ScreenService();
