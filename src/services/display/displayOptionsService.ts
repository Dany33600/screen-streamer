
import { Content } from '@/types';

export class DisplayOptionsService {
  /**
   * Détermine les options d'affichage en fonction du type de contenu
   */
  public getDisplayOptions(content: Content, userOptions?: any): any {
    // Fusionner les options par défaut avec les options utilisateur
    const options: any = {
      // Options par défaut
      autoplay: true,
      loop: true,
      controls: true,
      muted: true,
      interval: 5000,
      autoSlide: 5000,
      ...userOptions // Surcharger avec les options utilisateur
    };
    
    // Retourner les options fusionnées
    return options;
  }
}

export const displayOptionsService = new DisplayOptionsService();
