
import { StateCreator } from 'zustand';
import { AppState } from '../../index';
import { configService } from '@/services/config/configService';
import { ConfigSlice, ConfigState, DEFAULT_CONFIG } from './types';
import { createConfigActions } from './actions';

export * from './types';

export const createConfigSlice: StateCreator<
  AppState,
  [],
  [],
  ConfigSlice
> = (set, get) => {
  // Récupérer la configuration initiale
  const config = configService.getConfig();
  
  // État initial avec les valeurs de la configuration
  const initialState: ConfigState = {
    basePort: config.basePort || DEFAULT_CONFIG.basePort,
    baseIpAddress: config.baseIpAddress || DEFAULT_CONFIG.baseIpAddress,
    isConfigMode: false,
    configPin: config.configPin || DEFAULT_CONFIG.configPin,
    isPinVerified: false,
    refreshInterval: config.refreshInterval || DEFAULT_CONFIG.refreshInterval,
    isDarkMode: false,
    hasCompletedOnboarding: false,
    hasAttemptedServerCheck: false,
    apiPort: config.apiPort || DEFAULT_CONFIG.apiPort,
    useBaseIpForApi: config.useBaseIpForApi !== undefined ? config.useBaseIpForApi : true,
    apiIpAddress: config.apiIpAddress || DEFAULT_CONFIG.apiIpAddress,
    menuOptions: {
      dashboard: true,
      screens: true,
      content: true,
      playlists: true,
      preview: true,
    }
  };
  
  // Créer et combiner les actions avec l'état initial
  return {
    ...initialState,
    ...createConfigActions(set, get as any)
  };
};
