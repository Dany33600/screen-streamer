
import { StateCreator } from 'zustand';
import { Content, ContentType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { AppState } from '../index';

export interface ContentsState {
  contents: Content[];
  
  // Actions
  addContent: (name: string, type: ContentType, url: string, htmlContent?: string) => void;
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
  
  addContent: (name, type, url, htmlContent) => set((state) => {
    const newContent: Content = {
      id: uuidv4(),
      name,
      type,
      url,
      createdAt: Date.now(),
      htmlContent // Ajout du contenu HTML
    };
    
    console.log(`Ajout d'un contenu au store: ${name} (${type}), URL: ${url}`);
    
    // Vérifier si le contenu existe déjà (pour éviter les doublons)
    const existingContent = state.contents.find(
      content => content.url === url && content.type === type
    );
    
    if (existingContent) {
      console.log(`Ce contenu existe déjà, mise à jour...`);
      return {
        contents: state.contents.map(content =>
          content.id === existingContent.id 
          ? { ...content, name, htmlContent: htmlContent || content.htmlContent }
          : content
        )
      };
    }
    
    return {
      contents: [
        ...state.contents,
        newContent,
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
  })),
});
