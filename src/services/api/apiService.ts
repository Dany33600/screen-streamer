
import { useAppStore } from '@/store';
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
    this.updateApiBaseUrl({});
  }
  
  public updateApiBaseUrl(config: ApiUrlConfig = {}): void {
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
