
import { Screen } from '@/types';
import { ApiService } from '@/services/api/apiService';
import { toast } from 'sonner';

class ScreenService extends ApiService {
  private endpoint: string = 'screens';
  
  // Common method to handle API requests with error handling
  private async handleScreenRequest<T>(
    method: string, 
    url: string, 
    options: RequestInit = {}
  ): Promise<T | null> {
    try {
      return await this.handleApiRequest<T>(url, options);
    } catch (error) {
      console.error(`Screen Service: Error during ${method} request to ${url}:`, error);
      return null;
    }
  }
  
  // Get all screens from the server
  async getAllScreens(config: { apiUrl?: string, baseIpAddress?: string } = {}): Promise<Screen[]> {
    this.updateApiBaseUrl(config);
    
    const data = await this.handleScreenRequest<{ success: boolean, screens: Screen[] }>(
      'GET',
      `${this.apiBaseUrl}/${this.endpoint}`,
      { method: 'GET' }
    );
    
    if (data?.success && Array.isArray(data.screens)) {
      return data.screens;
    }
    
    return [];
  }
  
  // Get a screen by ID
  async getScreenById(
    screenId: string, 
    config: { apiUrl?: string, baseIpAddress?: string } = {}
  ): Promise<Screen | null> {
    this.updateApiBaseUrl(config);
    
    const data = await this.handleScreenRequest<{ success: boolean, screen: Screen }>(
      'GET',
      `${this.apiBaseUrl}/${this.endpoint}/${screenId}`,
      { method: 'GET' }
    );
    
    if (data?.success && data.screen) {
      return data.screen;
    }
    
    return null;
  }
  
  // Save a new screen to the server
  async saveScreen(
    screen: Screen, 
    config: { apiUrl?: string, baseIpAddress?: string } = {}
  ): Promise<Screen | null> {
    this.updateApiBaseUrl(config);
    
    const data = await this.handleScreenRequest<{ success: boolean, screen: Screen }>(
      'POST',
      `${this.apiBaseUrl}/${this.endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ screen }),
      }
    );
    
    if (data?.success && data.screen) {
      return data.screen;
    }
    
    return null;
  }
  
  // Update an existing screen
  async updateScreen(
    screenId: string, 
    data: Partial<Screen>, 
    config: { apiUrl?: string, baseIpAddress?: string } = {}
  ): Promise<Screen | null> {
    this.updateApiBaseUrl(config);
    
    const responseData = await this.handleScreenRequest<{ success: boolean, screen: Screen }>(
      'PUT',
      `${this.apiBaseUrl}/${this.endpoint}/${screenId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      }
    );
    
    if (responseData?.success && responseData.screen) {
      return responseData.screen;
    }
    
    return null;
  }
  
  // Delete a screen from the server
  async deleteScreen(
    screenId: string, 
    config: { apiUrl?: string, baseIpAddress?: string } = {}
  ): Promise<boolean> {
    this.updateApiBaseUrl(config);
    
    const data = await this.handleScreenRequest<{ success: boolean }>(
      'DELETE',
      `${this.apiBaseUrl}/${this.endpoint}/${screenId}`,
      { method: 'DELETE' }
    );
    
    return data?.success === true;
  }
}

// Export a singleton instance
export const screenService = new ScreenService();
