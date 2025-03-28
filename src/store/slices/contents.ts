
import { Content, ContentType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';

export interface ContentsState {
  contents: Content[];
  
  // Actions
  addContent: (file: File | null, type: ContentType, url: string, contentId?: string, content?: Partial<Content>) => void;
  updateContent: (id: string, data: Partial<Content>) => void;
  removeContent: (id: string) => void;
}

export const createContentsSlice: StateCreator<ContentsState> = (set) => ({
  contents: [],
  
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
    contents: state.contents.map((content: Content) =>
      content.id === id ? { ...content, ...data } : content
    ),
  })),
  
  removeContent: (id) => set((state) => ({
    contents: state.contents.filter((content: Content) => content.id !== id),
    screens: state.screens.map((screen: any) =>
      screen.contentId === id ? { ...screen, contentId: undefined } : screen
    ),
  })),
});
