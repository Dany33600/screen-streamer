
import { toast } from 'sonner';
import { useAppStore } from '@/store';

interface ApiUrlConfig {
  baseIpAddress?: string;
  apiPort?: number;
  apiIpAddress?: string;
  useBaseIpForApi?: boolean;
}

export class ApiService {
  protected apiBaseUrl: string = '';
  
  constructor() {
    // Initialisation avec une URL vide, sera mise à jour avant utilisation
    this.apiBaseUrl = '';
  }
  
  public updateApiBaseUrl(config: ApiUrlConfig = {}): void {
    try {
      // Accéder au store via le hook importé
      const state = useAppStore.getState();
      
      const { 
        baseIpAddress = state.baseIpAddress || '127.0.0.1',
        apiPort = state.apiPort || 5070,
        apiIpAddress = state.apiIpAddress || '127.0.0.1',
        useBaseIpForApi = state.useBaseIpForApi !== undefined ? state.useBaseIpForApi : true
      } = config;
      
      // Determine the correct IP address to use
      const ipToUse = useBaseIpForApi ? baseIpAddress : apiIpAddress;
      
      // Construct the API URL without duplicating /api
      this.apiBaseUrl = `http://${ipToUse}:${apiPort}/api`;
      
      console.log(`API URL configured: ${this.apiBaseUrl}`);
    } catch (error) {
      console.error('Error updating API URL:', error);
      // Fallback to a default URL if there's an error
      this.apiBaseUrl = 'http://127.0.0.1:5070/api';
    }
  }
  
  public getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }
  
  protected async handleApiRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      // Assurez-vous que l'URL de l'API est définie avant d'effectuer des requêtes
      if (!this.apiBaseUrl) {
        this.updateApiBaseUrl();
      }
      
      console.log(`API Request to: ${url}`, options);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `HTTP Error ${response.status}: ${errorText}`;
        console.error(errorMessage);
        
        // Display toast for user feedback on errors
        toast.error('API Error', {
          description: `${response.status}: ${response.statusText}`
        });
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json() as T;
      console.log(`API Response from ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`API Error during request to ${url}:`, error);
      throw error;
    }
  }
}
