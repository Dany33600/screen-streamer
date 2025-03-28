
import { StateCreator } from 'zustand';
import { Content, ContentType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { AppState } from '../index';

export interface ContentsState {
  contents: Content[];
  
  // Actions
  addContent: (name: string, type: ContentType, url: string) => void;
  updateContent: (id: string, data: Partial<Content>) => void;
  removeContent: (id: string) => void;
}

export const createContentsSlice: StateCreator<
  AppState,
  [],
  [],
  ContentsState
> = (set, get) => ({
  contents: [],
  
  addContent: (name, type, url) => set((state) => ({
    contents: [
      ...state.contents,
      {
        id: uuidv4(),
        name,
        type,
        url,
        createdAt: Date.now(),
      },
    ],
  })),
  
  updateContent: (id, data) => set((state) => ({
    contents: state.contents.map((content: Content) =>
      content.id === id ? { ...content, ...data } : content
    ),
  })),
  
  removeContent: (id) => set((state) => ({
    contents: state.contents.filter((content: Content) => content.id !== id),
  })),
});
