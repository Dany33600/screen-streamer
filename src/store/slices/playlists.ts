
import { Playlist } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface PlaylistsState {
  playlists: Playlist[];
  
  // Actions
  addPlaylist: (name: string, contentIds: string[]) => void;
  updatePlaylist: (id: string, data: Partial<Playlist>) => void;
  removePlaylist: (id: string) => void;
}

export const createPlaylistsSlice = (
  get: () => any, 
  set: (fn: (state: any) => any) => void
) => ({
  playlists: [],
  
  addPlaylist: (name, contentIds) => set((state: any) => ({
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
  
  updatePlaylist: (id, data) => set((state: any) => ({
    playlists: state.playlists.map((playlist: Playlist) =>
      playlist.id === id ? { ...playlist, ...data } : playlist
    ),
  })),
  
  removePlaylist: (id) => set((state: any) => ({
    playlists: state.playlists.filter((playlist: Playlist) => playlist.id !== id),
  })),
});
