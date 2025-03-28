
import { Playlist } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { AppState } from '../index';

export interface PlaylistsState {
  playlists: Playlist[];
  
  // Actions
  addPlaylist: (name: string, contentIds: string[]) => void;
  updatePlaylist: (id: string, data: Partial<Playlist>) => void;
  removePlaylist: (id: string) => void;
}

export const createPlaylistsSlice: StateCreator<
  AppState,
  [],
  [],
  PlaylistsState
> = (set) => ({
  playlists: [],
  
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
    playlists: state.playlists.map((playlist: Playlist) =>
      playlist.id === id ? { ...playlist, ...data } : playlist
    ),
  })),
  
  removePlaylist: (id) => set((state) => ({
    playlists: state.playlists.filter((playlist: Playlist) => playlist.id !== id),
  })),
});
