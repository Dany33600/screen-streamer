
import { toast } from 'sonner';

interface ApiUrlConfig {
  baseIpAddress?: string;
  apiPort?: number;
  apiIpAddress?: string;
  useBaseIpForApi?: boolean;
}

export class ApiService {
  protected apiBaseUrl: string = '';
  
  constructor() {
    // Initialize with empty URL, will be updated on first use
    this.apiBaseUrl = '';
  }
  
  public updateApiBaseUrl(config: ApiUrlConfig = {}): void {
    try {
      // Import dynamically to avoid circular dependency
      const { useAppStore } = require('@/store');
      const state = useAppStore.getState();
      
      const { 
        baseIpAddress = state.baseIpAddress,
        apiPort = state.apiPort,
        apiIpAddress = state.apiIpAddress,
        useBaseIpForApi = state.useBaseIpForApi
      } = config;
      
      // Determine the correct IP address to use
      const ipToUse = useBaseIpForApi ? baseIpAddress : apiIpAddress;
      
      // Construct the API URL
      this.apiBaseUrl = `http://${ipToUse}:${apiPort}/api`;
      
      console.log(`API URL configured: ${this.apiBaseUrl}`);
    } catch (error) {
      console.error('Error updating API URL:', error);
      // Initialize with safe defaults if store is not available
      const { DEFAULT_IP_ADDRESS, API_PORT } = require('@/config/constants');
      this.apiBaseUrl = `http://${DEFAULT_IP_ADDRESS}:${API_PORT}/api`;
    }
  }
  
  protected async handleApiRequest<T>(url: string, options: RequestInit): Promise<T> {
    // If apiBaseUrl is empty, update it
    if (!this.apiBaseUrl) {
      this.updateApiBaseUrl();
    }
    
    try {
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
