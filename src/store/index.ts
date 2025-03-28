
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
    (...a) => ({
      ...createScreensSlice(...a),
      ...createContentsSlice(...a),
      ...createPlaylistsSlice(...a),
      ...createConfigSlice(...a),
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
export const initializeApiUrl = () => {
  const state = useAppStore.getState();
  const ipToUse = state.useBaseIpForApi ? state.baseIpAddress : state.apiIpAddress;
  const port = state.apiPort;
  
  console.log(`Initializing API URL with IP: ${ipToUse} and port: ${port}`);
  return `http://${ipToUse}:${port}/api`;
};

// Load screens from the server when the app starts
// This function should be called at app initialization
export const initializeScreens = async () => {
  console.log('Initializing screens from server...');
  const apiUrl = initializeApiUrl();
  console.log(`Using API URL: ${apiUrl}`);
  
  try {
    await useAppStore.getState().loadScreens();
  } catch (error) {
    console.error('Error initializing screens:', error);
  }
  
  console.log('Écrans initialisés depuis le serveur');
};
