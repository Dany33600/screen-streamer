
import { useAppStore } from '@/store';
import { toast } from 'sonner';

interface ApiUrlConfig {
  apiUrl?: string;
  baseIpAddress?: string;
}

export class ApiService {
  protected apiBaseUrl: string = '';
  
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
      
      console.log(`API URL configured: ${this.apiBaseUrl}`);
    } else {
      // Fallback to determine the API URL based on the current window location
      const hostname = baseIpAddress || window.location.hostname;
      const port = 5000; // Default API port
      this.apiBaseUrl = `http://${hostname}:${port}/api`;
      console.log(`No API URL provided, using default: ${this.apiBaseUrl}`);
    }
  }
  
  protected async handleApiRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
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
      
      return await response.json() as T;
    } catch (error) {
      console.error(`API Error during request to ${url}:`, error);
      throw error;
    }
  }
}
