
import { useAppStore } from '@/store';

interface ApiUrlConfig {
  apiUrl?: string;
  baseIpAddress?: string;
}

export class ApiService {
  protected apiBaseUrl: string;
  
  constructor() {
    this.updateApiBaseUrl({});
  }
  
  public updateApiBaseUrl(config: ApiUrlConfig = {}): void {
    const state = useAppStore.getState();
    const { apiUrl = state.apiUrl, baseIpAddress = state.baseIpAddress } = config;
    
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
  
  protected async handleApiRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`Erreur API lors de la requête ${url}:`, error);
      throw error;
    }
  }
}
