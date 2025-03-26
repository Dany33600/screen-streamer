
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Screen } from '@/types';
import { screenService } from '@/services/screenService';
import { toast } from 'sonner';

export interface ScreensState {
  screens: Screen[];
  isLoadingScreens: boolean;
  
  // Actions
  loadScreens: () => Promise<void>;
  addScreen: (name: string) => Promise<Screen | null>;
  updateScreen: (id: string, data: Partial<Screen>) => Promise<Screen | null>;
  removeScreen: (id: string) => Promise<boolean>;
  assignContentToScreen: (screenId: string, contentId: string | undefined) => Promise<Screen | null>;
}

export const createScreensSlice = (
  get: () => any, 
  set: (fn: (state: any) => any) => void
) => ({
  screens: [],
  isLoadingScreens: false,
  
  loadScreens: async () => {
    set({ isLoadingScreens: true });
    try {
      const state = get();
      const screens = await screenService.getAllScreens(state.apiUrl, state.baseIpAddress);
      
      if (screens && screens.length > 0) {
        set({ screens });
        console.log(`Chargé ${screens.length} écrans depuis le serveur`);
      } else {
        console.log('Aucun écran trouvé sur le serveur');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des écrans:', error);
      toast.error('Impossible de charger les écrans depuis le serveur');
    } finally {
      set({ isLoadingScreens: false });
    }
  },
  
  addScreen: async (name) => {
    try {
      const state = get();
      const newPort = state.basePort + state.screens.length;
      
      const newScreen: Screen = {
        id: uuidv4(),
        name,
        port: newPort,
        ipAddress: state.baseIpAddress,
        status: 'offline',
        createdAt: Date.now(),
      };
      
      // Sauvegarder l'écran sur le serveur
      const savedScreen = await screenService.saveScreen(newScreen, state.apiUrl, state.baseIpAddress);
      
      if (savedScreen) {
        // Mettre à jour l'état local uniquement après une sauvegarde réussie
        set((state: any) => ({
          screens: [...state.screens, savedScreen],
        }));
        
        toast.success(`L'écran "${name}" a été ajouté avec succès`);
        
        return savedScreen;
      } else {
        throw new Error('Échec de la sauvegarde de l\'écran sur le serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'écran:', error);
      toast.error('Impossible d\'ajouter l\'écran');
      return null;
    }
  },
  
  updateScreen: async (id, data) => {
    try {
      const state = get();
      // Mettre à jour l'écran sur le serveur
      const updatedScreen = await screenService.updateScreen(id, data, state.apiUrl, state.baseIpAddress);
      
      if (updatedScreen) {
        // Mettre à jour l'état local uniquement après une mise à jour réussie
        set((state: any) => ({
          screens: state.screens.map((screen: Screen) =>
            screen.id === id ? updatedScreen : screen
          ),
        }));
        
        toast.success(`L'écran a été mis à jour avec succès`);
        
        return updatedScreen;
      } else {
        throw new Error('Échec de la mise à jour de l\'écran sur le serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'écran:', error);
      toast.error('Impossible de mettre à jour l\'écran');
      return null;
    }
  },
  
  removeScreen: async (id) => {
    try {
      const state = get();
      // Supprimer l'écran du serveur
      const success = await screenService.deleteScreen(id, state.apiUrl, state.baseIpAddress);
      
      if (success) {
        // Mettre à jour l'état local uniquement après une suppression réussie
        set((state: any) => ({
          screens: state.screens.filter((screen: Screen) => screen.id !== id),
        }));
        
        toast.success('L\'écran a été supprimé avec succès');
        
        return true;
      } else {
        throw new Error('Échec de la suppression de l\'écran du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'écran:', error);
      toast.error('Impossible de supprimer l\'écran');
      return false;
    }
  },
  
  assignContentToScreen: async (screenId, contentId) => {
    try {
      // Récupérer l'écran actuel
      const currentScreen = get().screens.find((screen: Screen) => screen.id === screenId);
      const state = get();
      
      if (!currentScreen) {
        throw new Error('Écran non trouvé');
      }
      
      // Mettre à jour l'écran sur le serveur
      const updatedScreen = await screenService.updateScreen(
        screenId, 
        { contentId }, 
        state.apiUrl, 
        state.baseIpAddress
      );
      
      if (updatedScreen) {
        // Mettre à jour l'état local uniquement après une mise à jour réussie
        set((state: any) => ({
          screens: state.screens.map((screen: Screen) =>
            screen.id === screenId ? updatedScreen : screen
          ),
        }));
        
        return updatedScreen;
      } else {
        throw new Error('Échec de l\'assignation du contenu à l\'écran sur le serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation du contenu à l\'écran:', error);
      toast.error('Impossible d\'assigner le contenu à l\'écran');
      return null;
    }
  },
});
