
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
  ConfigState 
} from './slices/config';

// Combine all slices
export type AppState = ScreensState & ContentsState & PlaylistsState & ConfigState;

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
