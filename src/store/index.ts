
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Content, Screen, Playlist, ContentType } from '@/types';
import { screenService } from '@/services/screenService';
import { toast } from 'sonner';

interface AppState {
  screens: Screen[];
  contents: Content[];
  playlists: Playlist[];
  basePort: number;
  baseIpAddress: string;
  isConfigMode: boolean;
  apiUrl: string;
  configPin: string;
  isPinVerified: boolean;
  refreshInterval: number; // Minutes between preview refreshes
  isLoadingScreens: boolean;
  
  // Menu visibility options
  menuOptions: {
    dashboard: boolean;
    screens: boolean;
    content: boolean;
    playlists: boolean;
    preview: boolean;
  };
  
  // Screens actions
  loadScreens: () => Promise<void>;
  addScreen: (name: string) => Promise<Screen | null>;
  updateScreen: (id: string, data: Partial<Screen>) => Promise<Screen | null>;
  removeScreen: (id: string) => Promise<boolean>;
  assignContentToScreen: (screenId: string, contentId: string | undefined) => Promise<Screen | null>;
  
  // Content actions
  addContent: (file: File | null, type: ContentType, url: string, contentId?: string, content?: Partial<Content>) => void;
  updateContent: (id: string, data: Partial<Content>) => void;
  removeContent: (id: string) => void;
  
  // Playlist actions
  addPlaylist: (name: string, contentIds: string[]) => void;
  updatePlaylist: (id: string, data: Partial<Playlist>) => void;
  removePlaylist: (id: string) => void;
  
  // Config actions
  setBasePort: (port: number) => void;
  setBaseIpAddress: (ipAddress: string) => void;
  toggleConfigMode: () => void;
  setApiUrl: (url: string) => void;
  setConfigPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  resetPinVerification: () => void;
  setRefreshInterval: (minutes: number) => void;
  
  // Menu options actions
  toggleMenuOption: (option: keyof AppState['menuOptions'], value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      screens: [],
      contents: [],
      playlists: [],
      basePort: 5550,
      baseIpAddress: '192.168.0.14',
      isConfigMode: false,
      apiUrl: 'http://localhost:5000',
      configPin: '1234', // Default PIN
      isPinVerified: false,
      refreshInterval: 1, // Default to 1 minute
      isLoadingScreens: false,
      
      // Default menu options - all enabled by default
      menuOptions: {
        dashboard: true,
        screens: true,
        content: true,
        playlists: true,
        preview: true,
      },
      
      // Screens actions
      loadScreens: async () => {
        set({ isLoadingScreens: true });
        try {
          const screens = await screenService.getAllScreens();
          
          if (screens && screens.length > 0) {
            set({ screens });
            console.log(`Chargé ${screens.length} écrans depuis le serveur`);
          } else {
            console.log('Aucun écran trouvé sur le serveur');
          }
        } catch (error) {
          console.error('Erreur lors du chargement des écrans:', error);
          toast({
            title: 'Erreur de chargement',
            description: 'Impossible de charger les écrans depuis le serveur',
            variant: 'destructive',
          });
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
          const savedScreen = await screenService.saveScreen(newScreen);
          
          if (savedScreen) {
            // Mettre à jour l'état local uniquement après une sauvegarde réussie
            set((state) => ({
              screens: [...state.screens, savedScreen],
            }));
            
            toast({
              title: 'Écran ajouté',
              description: `L'écran "${name}" a été ajouté avec succès`,
            });
            
            return savedScreen;
          } else {
            throw new Error('Échec de la sauvegarde de l\'écran sur le serveur');
          }
        } catch (error) {
          console.error('Erreur lors de l\'ajout de l\'écran:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible d\'ajouter l\'écran',
            variant: 'destructive',
          });
          return null;
        }
      },
      
      updateScreen: async (id, data) => {
        try {
          // Mettre à jour l'écran sur le serveur
          const updatedScreen = await screenService.updateScreen(id, data);
          
          if (updatedScreen) {
            // Mettre à jour l'état local uniquement après une mise à jour réussie
            set((state) => ({
              screens: state.screens.map((screen) =>
                screen.id === id ? updatedScreen : screen
              ),
            }));
            
            toast({
              title: 'Écran mis à jour',
              description: `L'écran a été mis à jour avec succès`,
            });
            
            return updatedScreen;
          } else {
            throw new Error('Échec de la mise à jour de l\'écran sur le serveur');
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'écran:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de mettre à jour l\'écran',
            variant: 'destructive',
          });
          return null;
        }
      },
      
      removeScreen: async (id) => {
        try {
          // Supprimer l'écran du serveur
          const success = await screenService.deleteScreen(id);
          
          if (success) {
            // Mettre à jour l'état local uniquement après une suppression réussie
            set((state) => ({
              screens: state.screens.filter((screen) => screen.id !== id),
            }));
            
            toast({
              title: 'Écran supprimé',
              description: 'L\'écran a été supprimé avec succès',
            });
            
            return true;
          } else {
            throw new Error('Échec de la suppression de l\'écran du serveur');
          }
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'écran:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de supprimer l\'écran',
            variant: 'destructive',
          });
          return false;
        }
      },
      
      assignContentToScreen: async (screenId, contentId) => {
        try {
          // Récupérer l'écran actuel
          const currentScreen = get().screens.find(screen => screen.id === screenId);
          
          if (!currentScreen) {
            throw new Error('Écran non trouvé');
          }
          
          // Mettre à jour l'écran sur le serveur
          const updatedScreen = await screenService.updateScreen(screenId, { contentId });
          
          if (updatedScreen) {
            // Mettre à jour l'état local uniquement après une mise à jour réussie
            set((state) => ({
              screens: state.screens.map((screen) =>
                screen.id === screenId ? updatedScreen : screen
              ),
            }));
            
            return updatedScreen;
          } else {
            throw new Error('Échec de l\'assignation du contenu à l\'écran sur le serveur');
          }
        } catch (error) {
          console.error('Erreur lors de l\'assignation du contenu à l\'écran:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible d\'assigner le contenu à l\'écran',
            variant: 'destructive',
          });
          return null;
        }
      },
      
      // Content actions
      addContent: (file, type, url, contentId, content) => set((state) => {
        // Utiliser le contentId fourni par le serveur ou générer un nouvel ID
        const id = contentId || (file ? `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}` : uuidv4());
        
        return {
          contents: [
            ...state.contents,
            {
              id,
              name: file ? file.name : content?.name || 'Nouveau contenu',
              type,
              url,
              file,
              thumbnail: content?.thumbnail,
              createdAt: Date.now(),
            },
          ],
        };
      }),
      
      updateContent: (id, data) => set((state) => ({
        contents: state.contents.map((content) =>
          content.id === id ? { ...content, ...data } : content
        ),
      })),
      
      removeContent: (id) => set((state) => ({
        contents: state.contents.filter((content) => content.id !== id),
        screens: state.screens.map((screen) =>
          screen.contentId === id ? { ...screen, contentId: undefined } : screen
        ),
      })),
      
      // Playlist actions
      addPlaylist: (name, contentIds) => set((state) => ({
        playlists: [
          ...state.playlists,
          {
            id: uuidv4(),
            name,
            contentIds,
            createdAt: Date.now(),
          },
        ],
      })),
      
      updatePlaylist: (id, data) => set((state) => ({
        playlists: state.playlists.map((playlist) =>
          playlist.id === id ? { ...playlist, ...data } : playlist
        ),
      })),
      
      removePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter((playlist) => playlist.id !== id),
      })),
      
      // Config actions
      setBasePort: (port) => set({ basePort: port }),
      setBaseIpAddress: (ipAddress) => set({ baseIpAddress: ipAddress }),
      toggleConfigMode: () => set((state) => {
        // If currently in config mode, reset pin verification when leaving
        if (state.isConfigMode) {
          return { isConfigMode: false, isPinVerified: false };
        }
        // If verified, can enter config mode
        if (state.isPinVerified) {
          return { isConfigMode: true };
        }
        // Otherwise, don't change the mode (PIN will be requested by UI)
        return state;
      }),
      setApiUrl: (url) => set({ apiUrl: url }),
      setConfigPin: (pin) => set({ configPin: pin }),
      verifyPin: (pin) => {
        const state = get();
        const isValid = pin === state.configPin;
        if (isValid) {
          set({ isPinVerified: true, isConfigMode: true });
        }
        return isValid;
      },
      resetPinVerification: () => set({ isPinVerified: false }),
      
      setRefreshInterval: (minutes) => set({ 
        refreshInterval: Math.min(Math.max(minutes, 1), 60) // Ensure value is between 1-60
      }),
      
      // Menu options actions
      toggleMenuOption: (option, value) => set((state) => ({
        menuOptions: {
          ...state.menuOptions,
          [option]: value,
        },
      })),
    }),
    {
      name: 'screen-streamer-storage',
    }
  )
);

// Load screens from the server when the app starts
// This function should be called at app initialization
export const initializeScreens = async () => {
  console.log('Initializing screens from server...');
  
  try {
    await useAppStore.getState().loadScreens();
  } catch (error) {
    console.error('Error initializing screens:', error);
  }
};
