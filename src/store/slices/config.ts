import { 
  DEFAULT_BASE_PORT, 
  DEFAULT_IP_ADDRESS, 
  DEFAULT_PIN, 
  DEFAULT_REFRESH_INTERVAL,
  API_PORT,
  DEFAULT_API_IP_ADDRESS
} from '@/config/constants';
import { configService } from '@/services/config/configService';

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
  
  apiUrl: string;
}

export const createConfigSlice = (
  get: () => any, 
  set: (fn: (state: any) => any) => void
) => {
  const buildApiUrl = (ipAddress: string, port: number) => `http://${ipAddress}:${port}/api`;
  
  const config = configService.getConfig();
  
  return {
    basePort: config.basePort,
    baseIpAddress: config.baseIpAddress,
    isConfigMode: false,
    configPin: config.configPin,
    isPinVerified: false,
    refreshInterval: config.refreshInterval,
    isDarkMode: false,
    hasCompletedOnboarding: false,
    hasAttemptedServerCheck: false,
    apiPort: config.apiPort,
    useBaseIpForApi: true,
    apiIpAddress: config.apiIpAddress,
    
    get apiUrl() {
      const ipToUse = this.useBaseIpForApi ? this.baseIpAddress : this.apiIpAddress;
      return buildApiUrl(ipToUse, this.apiPort);
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
      
      configService.updateApiBaseUrl({
        baseIpAddress: state.baseIpAddress,
        apiPort: state.apiPort,
        apiIpAddress: state.apiIpAddress,
        useBaseIpForApi: state.useBaseIpForApi
      });
      
      const configToSave = {
        basePort: state.basePort,
        baseIpAddress: state.baseIpAddress,
        configPin: state.configPin,
        refreshInterval: state.refreshInterval,
        apiPort: state.apiPort,
        apiIpAddress: state.apiIpAddress,
        forceOnboarding: false
      };
      
      return await configService.saveConfig(configToSave);
    },
  };
};
