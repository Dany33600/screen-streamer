
import { ConfigState } from './types';
import { configService } from '@/services/config/configService';

/**
 * Fonction utilitaire pour sauvegarder la configuration après chaque modification
 */
export const saveConfigAfterUpdate = async (
  getState: () => ConfigState & { saveConfig: () => Promise<boolean>, hasCompletedOnboarding: boolean }
): Promise<boolean> => {
  // Ne pas sauvegarder automatiquement si nous sommes en onboarding
  if (!getState().hasCompletedOnboarding) {
    console.log('Onboarding en cours, sauvegarde automatique de la configuration désactivée');
    return true;
  }
  
  try {
    await getState().saveConfig();
    console.log('Configuration sauvegardée automatiquement après modification');
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde automatique de la configuration:', error);
    return false;
  }
};

/**
 * Met à jour l'URL de l'API dans le service de configuration
 */
export const updateApiUrlInService = (state: ConfigState): void => {
  configService.updateApiBaseUrl({
    baseIpAddress: state.baseIpAddress,
    apiPort: state.apiPort,
    apiIpAddress: state.apiIpAddress,
    useBaseIpForApi: state.useBaseIpForApi
  });
};
