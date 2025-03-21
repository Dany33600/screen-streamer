
import { Content } from '@/types';

/**
 * Service simplifié pour gérer le contenu dans l'environnement navigateur
 * sans dépendre d'Express
 */
class BrowserContentService {
  private contentMap = new Map<string, Content>();

  // Stocker le contenu pour un écran spécifique
  setContent(screenId: string, content: Content | undefined): void {
    if (content) {
      this.contentMap.set(screenId, content);
    } else {
      this.contentMap.delete(screenId);
    }
  }

  // Récupérer le contenu pour un écran spécifique
  getContent(screenId: string): Content | undefined {
    return this.contentMap.get(screenId);
  }

  // Vérifier si un écran a du contenu assigné
  hasContent(screenId: string): boolean {
    return this.contentMap.has(screenId);
  }
}

export const browserContentService = new BrowserContentService();
