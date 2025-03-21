
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Content, Screen, Playlist, ContentType } from '@/types';

interface AppState {
  screens: Screen[];
  contents: Content[];
  playlists: Playlist[];
  basePort: number;
  baseIpAddress: string;
  isConfigMode: boolean;
  apiUrl: string;
  
  // Screens actions
  addScreen: (name: string) => void;
  updateScreen: (id: string, data: Partial<Screen>) => void;
  removeScreen: (id: string) => void;
  assignContentToScreen: (screenId: string, contentId: string | undefined) => void;
  
  // Content actions
  addContent: (file: File, type: ContentType, url: string, contentId?: string, thumbnail?: string) => void;
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      screens: [],
      contents: [],
      playlists: [],
      basePort: 5550,
      baseIpAddress: '192.168.0.14',
      isConfigMode: false,
      apiUrl: 'http://localhost:5000',
      
      // Screens actions
      addScreen: (name) => set((state) => {
        const newPort = state.basePort + state.screens.length;
        return {
          screens: [
            ...state.screens,
            {
              id: uuidv4(),
              name,
              port: newPort,
              ipAddress: state.baseIpAddress,
              status: 'offline',
              createdAt: Date.now(),
            },
          ],
        };
      }),
      
      updateScreen: (id, data) => set((state) => ({
        screens: state.screens.map((screen) =>
          screen.id === id ? { ...screen, ...data } : screen
        ),
      })),
      
      removeScreen: (id) => set((state) => ({
        screens: state.screens.filter((screen) => screen.id !== id),
      })),
      
      assignContentToScreen: (screenId, contentId) => set((state) => ({
        screens: state.screens.map((screen) =>
          screen.id === screenId ? { ...screen, contentId } : screen
        ),
      })),
      
      // Content actions
      addContent: (file, type, url, contentId, thumbnail) => set((state) => {
        // Utiliser le contentId fourni par le serveur ou générer un nouvel ID
        const id = contentId || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
        
        return {
          contents: [
            ...state.contents,
            {
              id,
              name: file.name,
              type,
              url,
              file,
              thumbnail,
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
      toggleConfigMode: () => set((state) => ({ isConfigMode: !state.isConfigMode })),
      setApiUrl: (url) => set({ apiUrl: url }),
    }),
    {
      name: 'screen-streamer-storage',
    }
  )
);
