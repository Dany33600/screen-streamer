
import { ConfigState, ConfigActions } from './types';
import { saveConfigAfterUpdate, updateApiUrlInService } from './utils';
import { configService } from '@/services/config/configService';

export const createConfigActions = (
  set: (fn: (state: ConfigState) => Partial<ConfigState>) => void,
  get: () => ConfigState & ConfigActions
): ConfigActions => {
  return {
    getApiUrl: () => {
      const state = get();
      const ipToUse = state.useBaseIpForApi ? state.baseIpAddress : state.apiIpAddress;
      return `http://${ipToUse}:${state.apiPort}/api`;
    },
    
    setBasePort: (port) => {
      set((state) => ({ 
        ...state, 
        basePort: port 
      }));
      saveConfigAfterUpdate(get);
    },
    
    setBaseIpAddress: (ipAddress) => {
      set((state) => {
        const newState = { 
          ...state, 
          baseIpAddress: ipAddress
        };
        
        if (state.useBaseIpForApi) {
          newState.apiIpAddress = ipAddress;
        }
        
        return newState;
      });
      saveConfigAfterUpdate(get);
    },
    
    toggleConfigMode: () => set((state) => {
      if (state.isConfigMode) {
        return { ...state, isConfigMode: false, isPinVerified: false };
      }
      if (state.isPinVerified) {
        return { ...state, isConfigMode: true };
      }
      return state;
    }),
    
    setConfigPin: (pin) => {
      set((state) => ({ 
        ...state, 
        configPin: pin 
      }));
      saveConfigAfterUpdate(get);
    },
    
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
    
    setRefreshInterval: (minutes) => {
      set((state) => ({ 
        ...state, 
        refreshInterval: Math.min(Math.max(minutes, 1), 60) 
      }));
      saveConfigAfterUpdate(get);
    },
    
    toggleMenuOption: (option, value) => {
      set((state) => ({
        ...state,
        menuOptions: {
          ...state.menuOptions,
          [option]: value,
        },
      }));
      saveConfigAfterUpdate(get);
    },
    
    toggleDarkMode: () => set((state) => ({
      ...state,
      isDarkMode: !state.isDarkMode
    })),
    
    setHasCompletedOnboarding: (value) => set((state) => {
      console.log(`Changement du statut d'onboarding: ${value}`);
      return {
        ...state,
        hasCompletedOnboarding: value
      };
    }),
    
    setHasAttemptedServerCheck: (value) => set((state) => ({
      ...state,
      hasAttemptedServerCheck: value
    })),
    
    setApiPort: (port) => {
      set((state) => ({ 
        ...state, 
        apiPort: port
      }));
      
      // Mettre à jour l'URL de l'API dans le service de configuration
      const state = get();
      updateApiUrlInService(state);
      
      saveConfigAfterUpdate(get);
    },
    
    setUseBaseIpForApi: (value) => {
      set((state) => {
        const newState = value ? { 
          ...state, 
          useBaseIpForApi: value,
          apiIpAddress: state.baseIpAddress
        } : { 
          ...state, 
          useBaseIpForApi: value 
        };
        
        // Mettre à jour l'URL de l'API dans le service
        updateApiUrlInService(newState);
        
        return newState;
      });
      
      saveConfigAfterUpdate(get);
    },
    
    setApiIpAddress: (ipAddress) => {
      set((state) => {
        const newState = { 
          ...state, 
          apiIpAddress: ipAddress,
          useBaseIpForApi: false
        };
        
        // Mettre à jour l'URL de l'API dans le service
        updateApiUrlInService(newState);
        
        return newState;
      });
      
      saveConfigAfterUpdate(get);
    },
    
    saveConfig: async () => {
      const state = get();
      
      // Mettre à jour l'URL de l'API dans le service de configuration
      updateApiUrlInService(state);
      
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
      
      try {
        console.log('Sauvegarde de la configuration:', configToSave);
        // Sauvegarder la configuration via le service
        return await configService.saveConfig(configToSave);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
        return false;
      }
    }
  };
};
