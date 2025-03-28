import { Screen } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface ScreensState {
  screens: Screen[];
  isLoadingScreens: boolean;
  
  // Actions
  addScreen: (name: string) => Promise<Screen>;
  updateScreen: (id: string, data: Partial<Screen>) => Promise<Screen>;
  removeScreen: (id: string) => Promise<boolean>;
  assignContentToScreen: (screenId: string, contentId?: string) => Promise<Screen>;
  loadScreens: () => Promise<Screen[]>;
}

export const createScreensSlice = (
  get: () => any, 
  set: (fn: (state: any) => any) => void
) => ({
  screens: [],
  isLoadingScreens: false,
  
  loadScreens: async () => {
    try {
      set((state) => ({ 
        ...state,
        isLoadingScreens: true 
      }));
      
      // Make API call to load screens
      const apiUrl = get().apiUrl;
      
      if (!apiUrl) {
        console.warn("Aucune URL d'API configurée, impossible de charger les écrans");
        set((state) => ({ 
          ...state, 
          isLoadingScreens: false 
        }));
        return [];
      }
      
      // Fix: Use the correct endpoint without duplication
      const response = await fetch(`${apiUrl}/screens`);
      
      if (!response.ok) {
        throw new Error(`Error loading screens: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        set((state) => ({ 
          ...state, 
          screens: data.screens || [] 
        }));
        return data.screens || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error loading screens:', error);
      return [];
    } finally {
      set((state) => ({ 
        ...state, 
        isLoadingScreens: false 
      }));
    }
  },
  
  addScreen: async (name) => {
    // Get the next available port from config slice
    const basePort = get().basePort || 5550;
    const screens = get().screens;
    
    // Find the highest port currently in use and add 1 for the new screen
    const highestPort = screens.reduce(
      (maxPort, screen) => (screen.port > maxPort ? screen.port : maxPort),
      basePort - 1
    );
    
    const newPort = highestPort + 1;
    
    // Use the configured base IP address
    const baseIpAddress = get().baseIpAddress || '127.0.0.1';
    
    // Create a new screen object
    const newScreen: Screen = {
      id: uuidv4(),
      name,
      ipAddress: baseIpAddress,
      port: newPort,
      status: 'offline',
      createdAt: Date.now(),
    };
    
    try {
      // Make API call to save the screen
      const apiUrl = get().apiUrl;
      
      if (apiUrl) {
        // Fix: Use the correct endpoint without duplication
        const response = await fetch(`${apiUrl}/screens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ screen: newScreen }),
        });
        
        if (!response.ok) {
          console.error(`Error creating screen: ${response.statusText}`);
        }
      }
      
      // Update the local state
      set((state) => ({
        ...state,
        screens: [...state.screens, newScreen],
      }));
      
      return newScreen;
    } catch (error) {
      console.error('Error adding screen:', error);
      // Add to local state anyway
      set((state) => ({
        ...state,
        screens: [...state.screens, newScreen],
      }));
      return newScreen;
    }
  },
  
  updateScreen: async (id, data) => {
    try {
      // Update the screen on the API
      const apiUrl = get().apiUrl;
      
      if (apiUrl) {
        // Fix: Use the correct endpoint without duplication
        await fetch(`${apiUrl}/screens/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data }),
        });
      }
      
      // Update the local state
      set((state) => ({
        ...state,
        screens: state.screens.map((screen) =>
          screen.id === id ? { ...screen, ...data } : screen
        ),
      }));
      
      // Return the updated screen
      return get().screens.find((screen) => screen.id === id);
    } catch (error) {
      console.error('Error updating screen:', error);
      // Still update the local state
      set((state) => ({
        ...state,
        screens: state.screens.map((screen) =>
          screen.id === id ? { ...screen, ...data } : screen
        ),
      }));
      
      return get().screens.find((screen) => screen.id === id);
    }
  },
  
  removeScreen: async (id) => {
    try {
      // Delete the screen on the API
      const apiUrl = get().apiUrl;
      
      if (apiUrl) {
        // Fix: Use the correct endpoint without duplication
        await fetch(`${apiUrl}/screens/${id}`, {
          method: 'DELETE',
        });
      }
      
      // Update the local state
      set((state) => ({
        ...state,
        screens: state.screens.filter((screen) => screen.id !== id),
      }));
      
      return true;
    } catch (error) {
      console.error('Error removing screen:', error);
      
      // Still update the local state
      set((state) => ({
        ...state,
        screens: state.screens.filter((screen) => screen.id !== id),
      }));
      
      return true;
    }
  },
  
  assignContentToScreen: async (screenId, contentId) => {
    try {
      // Update the screen data
      const updatedScreen = await get().updateScreen(screenId, { contentId });
      return updatedScreen;
    } catch (error) {
      console.error('Error assigning content to screen:', error);
      throw error;
    }
  },
});
