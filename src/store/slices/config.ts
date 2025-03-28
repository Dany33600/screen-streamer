
import { StateCreator } from 'zustand';
import { AppState } from '../index';
import { configService } from '@/services/config/configService';

// Valeurs par défaut basiques si tout échoue
const DEFAULT_CONFIG = {
  basePort: 5550,
  baseIpAddress: '127.0.0.1',
  configPin: '0000',
  refreshInterval: 5,
  apiPort: 5070,
  apiIpAddress: '127.0.0.1'
};

export interface ConfigState {
  basePort: number;
  baseIpAddress: string;
  isConfigMode: boolean;
  configPin: string;
  isPinVerified: boolean;
  refreshInterval: number;
  isDarkMode: boolean;
  hasCompletedOnboarding: boolean;
  hasAttemptedServerCheck: boolean;
  apiPort: number;
  useBaseIpForApi: boolean;
  apiIpAddress: string;
  menuOptions: {
    dashboard: boolean;
    screens: boolean;
    content: boolean;
    playlists: boolean;
    preview: boolean;
  };
}

export interface ConfigActions {
  getApiUrl: () => string;
  setBasePort: (port: number) => void;
  setBaseIpAddress: (ipAddress: string) => void;
  toggleConfigMode: () => void;
  setConfigPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  resetPinVerification: () => void;
  setRefreshInterval: (minutes: number) => void;
  toggleMenuOption: (option: string, value: boolean) => void;
  toggleDarkMode: () => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setHasAttemptedServerCheck: (value: boolean) => void;
  setApiPort: (port: number) => void;
  setUseBaseIpForApi: (value: boolean) => void;
  setApiIpAddress: (ipAddress: string) => void;
  saveConfig: () => Promise<boolean>;
}

export type ConfigSlice = ConfigState & ConfigActions;

export const createConfigSlice: StateCreator<
  AppState,
  [],
  [],
  ConfigSlice
> = (set, get) => {
  // Récupérer la configuration initiale
  const config = configService.getConfig();
  
  return {
    // État initial avec les valeurs de la configuration
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
    
    getApiUrl: () => {
      const state = get();
      const ipToUse = state.useBaseIpForApi ? state.baseIpAddress : state.apiIpAddress;
      return `http://${ipToUse}:${state.apiPort}/api`;
    },
    
    menuOptions: {
      dashboard: true,
      screens: true,
      content: true,
      playlists: true,
      preview: true,
    },
    
    setBasePort: (port) => set((state) => ({ 
      ...state, 
      basePort: port 
    })),
    
    setBaseIpAddress: (ipAddress) => set((state) => {
      const newState = { 
        ...state, 
        baseIpAddress: ipAddress
      };
      
      if (state.useBaseIpForApi) {
        newState.apiIpAddress = ipAddress;
      }
      
      return newState;
    }),
    
    toggleConfigMode: () => set((state) => {
      if (state.isConfigMode) {
        return { ...state, isConfigMode: false, isPinVerified: false };
      }
      if (state.isPinVerified) {
        return { ...state, isConfigMode: true };
      }
      return state;
    }),
    
    setConfigPin: (pin) => set((state) => ({ 
      ...state, 
      configPin: pin 
    })),
    
    verifyPin: (pin) => {
      const state = get();
      const isValid = pin === state.configPin;
      if (isValid) {
        set((state) => ({ ...state, isPinVerified: true, isConfigMode: true }));
      }
      return isValid;
    },
    
    resetPinVerification: () => set((state) => ({ 
      ...state, 
      isPinVerified: false 
    })),
    
    setRefreshInterval: (minutes) => set((state) => ({ 
      ...state, 
      refreshInterval: Math.min(Math.max(minutes, 1), 60) 
    })),
    
    toggleMenuOption: (option, value) => set((state) => ({
      ...state,
      menuOptions: {
        ...state.menuOptions,
        [option]: value,
      },
    })),
    
    toggleDarkMode: () => set((state) => ({
      ...state,
      isDarkMode: !state.isDarkMode
    })),
    
    setHasCompletedOnboarding: (value) => set((state) => ({
      ...state,
      hasCompletedOnboarding: value
    })),
    
    setHasAttemptedServerCheck: (value) => set((state) => ({
      ...state,
      hasAttemptedServerCheck: value
    })),
    
    setApiPort: (port) => set((state) => ({ 
      ...state, 
      apiPort: port
    })),
    
    setUseBaseIpForApi: (value) => set((state) => {
      if (value) {
        return { 
          ...state, 
          useBaseIpForApi: value,
          apiIpAddress: state.baseIpAddress
        };
      }
      return { 
        ...state, 
        useBaseIpForApi: value 
      };
    }),
    
    setApiIpAddress: (ipAddress) => set((state) => {
      return { 
        ...state, 
        apiIpAddress: ipAddress,
        useBaseIpForApi: false
      };
    }),
    
    saveConfig: async () => {
      const state = get();
      
      // Mettre à jour l'URL de l'API dans le service de configuration
      configService.updateApiBaseUrl({
        baseIpAddress: state.baseIpAddress,
        apiPort: state.apiPort,
        apiIpAddress: state.apiIpAddress,
        useBaseIpForApi: state.useBaseIpForApi
      });
      
      // Préparer l'objet de configuration à sauvegarder
      const configToSave = {
        basePort: state.basePort,
        baseIpAddress: state.baseIpAddress,
        configPin: state.configPin,
        refreshInterval: state.refreshInterval,
        apiPort: state.apiPort,
        apiIpAddress: state.apiIpAddress,
        useBaseIpForApi: state.useBaseIpForApi,
        forceOnboarding: false
      };
      
      // Sauvegarder la configuration via le service
      return await configService.saveConfig(configToSave);
    },
  };
};
