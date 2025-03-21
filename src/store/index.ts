import { create } from 'zustand';
import { Content, Screen, Playlist, ContentType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  contents: Content[];
  screens: Screen[];
  playlists: Playlist[];
  addContent: (file: File | null, type: ContentType, url: string, metadata: string) => void;
  updateContent: (id: string, updates: Partial<Omit<Content, 'id' | 'url' | 'file' | 'createdAt'>>) => void;
  removeContent: (id: string) => void;
  addScreen: (name: string, port: number, ipAddress: string) => void;
  updateScreen: (id: string, updates: Partial<Omit<Screen, 'id' | 'createdAt'>>) => void;
  removeScreen: (id: string) => void;
  assignContentToScreen: (screenId: string, contentId: string) => void;
  unassignContentFromScreen: (screenId: string) => void;
  addPlaylist: (name: string) => void;
  updatePlaylist: (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => void;
  removePlaylist: (id: string) => void;
  addContentToPlaylist: (playlistId: string, contentId: string) => void;
  removeContentFromPlaylist: (playlistId: string, contentId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  contents: [],
  screens: [],
  playlists: [],
  addContent: (file, type, url, metadata) =>
    set((state) => ({
      contents: [
        ...state.contents,
        {
          id: uuidv4(),
          name: file?.name || 'Untitled',
          type,
          url,
          file,
          createdAt: Date.now(),
          thumbnail: type === 'image' ? url : undefined,
          // You might want to parse the metadata here if you need to use it as an object
          metadata, // Store the metadata as a string
        },
      ],
    })),
  updateContent: (id, updates) =>
    set((state) => ({
      contents: state.contents.map((content) =>
        content.id === id ? { ...content, ...updates } : content
      ),
    })),
  removeContent: (id) =>
    set((state) => ({
      contents: state.contents.filter((content) => content.id !== id),
    })),
  addScreen: (name, port, ipAddress) =>
    set((state) => ({
      screens: [
        ...state.screens,
        {
          id: uuidv4(),
          name,
          port,
          ipAddress,
          status: 'offline',
          createdAt: Date.now(),
        },
      ],
    })),
  updateScreen: (id, updates) =>
    set((state) => ({
      screens: state.screens.map((screen) =>
        screen.id === id ? { ...screen, ...updates } : screen
      ),
    })),
  removeScreen: (id) =>
    set((state) => ({
      screens: state.screens.filter((screen) => screen.id !== id),
    })),
  assignContentToScreen: (screenId, contentId) =>
    set((state) => ({
      screens: state.screens.map((screen) =>
        screen.id === screenId ? { ...screen, contentId } : screen
      ),
    })),
  unassignContentFromScreen: (screenId) =>
    set((state) => ({
      screens: state.screens.map((screen) =>
        screen.id === screenId ? { ...screen, contentId: undefined } : screen
      ),
    })),
  addPlaylist: (name) =>
    set((state) => ({
      playlists: [
        ...state.playlists,
        {
          id: uuidv4(),
          name,
          contentIds: [],
          createdAt: Date.now(),
        },
      ],
    })),
  updatePlaylist: (id, updates) =>
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === id ? { ...playlist, ...updates } : playlist
      ),
    })),
  removePlaylist: (id) =>
    set((state) => ({
      playlists: state.playlists.filter((playlist) => playlist.id !== id),
    })),
  addContentToPlaylist: (playlistId, contentId) =>
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId && !playlist.contentIds.includes(contentId)
          ? { ...playlist, contentIds: [...playlist.contentIds, contentId] }
          : playlist
      ),
    })),
  removeContentFromPlaylist: (playlistId, contentId) =>
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              contentIds: playlist.contentIds.filter((id) => id !== contentId),
            }
          : playlist
      ),
    })),
}));
