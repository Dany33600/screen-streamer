
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createScreensSlice, 
  ScreensState 
} from './slices/screens';
import { 
  createContentsSlice, 
  ContentsState 
} from './slices/contents';
import { 
  createPlaylistsSlice, 
  PlaylistsState 
} from './slices/playlists';
import { 
  createConfigSlice, 
  ConfigState,
  ConfigActions
} from './slices/config';

// Combine all slices with their respective actions
export type AppState = ScreensState & ContentsState & PlaylistsState & ConfigState & ConfigActions;

// Create the store with all slices
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createScreensSlice(get, set),
      ...createContentsSlice(get, set),
      ...createPlaylistsSlice(get, set),
      ...createConfigSlice(get, set),
    }),
    {
      name: 'screen-streamer-storage',
      // Ne pas persister certains états transitoires
      partialize: (state) => ({
        ...state,
        isLoadingScreens: false,
        isPinVerified: false,
      }),
    }
  )
);

// Fonction pour initialiser l'URL de l'API dans l'ensemble de l'application
const initializeApiUrl = () => {
  const state = useAppStore.getState();
  const ipToUse = state.useBaseIpForApi ? state.baseIpAddress : state.apiIpAddress;
  const port = state.apiPort;
  
  // Mettre à jour l'URL de l'API dans le store
  console.log(`Initializing API URL with IP: ${ipToUse} and port: ${port}`);
};

// Load screens from the server when the app starts
// This function should be called at app initialization
export const initializeScreens = async () => {
  console.log('Initializing screens from server...');
  
  // S'assurer que l'URL de l'API est initialisée
  initializeApiUrl();
  
  try {
    await useAppStore.getState().loadScreens();
  } catch (error) {
    console.error('Error initializing screens:', error);
  }
  
  console.log('Écrans initialisés depuis le serveur');
};
