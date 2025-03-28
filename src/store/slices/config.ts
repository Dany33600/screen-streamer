import { 
  DEFAULT_BASE_PORT, 
  DEFAULT_IP_ADDRESS, 
  DEFAULT_PIN, 
  DEFAULT_REFRESH_INTERVAL,
  API_PORT,
  DEFAULT_API_IP_ADDRESS
} from '@/config/constants';

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
  
  // Computed properties
  apiUrl: string; // URL calculée à partir de apiIpAddress et apiPort
  
  // Actions
  setBasePort: (port: number) => void;
  setBaseIpAddress: (ipAddress: string) => void;
  toggleConfigMode: () => void;
  setConfigPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  resetPinVerification: () => void;
  setRefreshInterval: (minutes: number) => void;
  toggleMenuOption: (option: keyof ConfigState['menuOptions'], value: boolean) => void;
  toggleDarkMode: () => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setHasAttemptedServerCheck: (value: boolean) => void;
  setApiPort: (port: number) => void;
  setUseBaseIpForApi: (value: boolean) => void;
  setApiIpAddress: (ipAddress: string) => void;
}

export const createConfigSlice = (
  get: () => any, 
  set: (fn: (state: any) => any) => void
) => {
  // Fonction pour construire l'URL de l'API
  const buildApiUrl = (ipAddress: string, port: number) => `http://${ipAddress}:${port}/api`;
  
  return {
    basePort: DEFAULT_BASE_PORT,
    baseIpAddress: DEFAULT_IP_ADDRESS,
    isConfigMode: false,
    configPin: DEFAULT_PIN,
    isPinVerified: false,
    refreshInterval: DEFAULT_REFRESH_INTERVAL,
    isDarkMode: false,
    hasCompletedOnboarding: false,
    hasAttemptedServerCheck: false,
    apiPort: API_PORT,
    useBaseIpForApi: true,
    apiIpAddress: DEFAULT_API_IP_ADDRESS,
    
    // Computed property
    get apiUrl() {
      // Utiliser l'IP appropriée selon la configuration
      const ipToUse = this.useBaseIpForApi ? this.baseIpAddress : this.apiIpAddress;
      return buildApiUrl(ipToUse, this.apiPort);
    },
    
    // Default menu options - all enabled by default
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
      
      // Si useBaseIpForApi est vrai, mettre également à jour apiIpAddress
      if (state.useBaseIpForApi) {
        newState.apiIpAddress = ipAddress;
      }
      
      return newState;
    }),
    
    toggleConfigMode: () => set((state) => {
      // If currently in config mode, reset pin verification when leaving
      if (state.isConfigMode) {
        return { ...state, isConfigMode: false, isPinVerified: false };
      }
      // If verified, can enter config mode
      if (state.isPinVerified) {
        return { ...state, isConfigMode: true };
      }
      // Otherwise, don't change the mode (PIN will be requested by UI)
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
      refreshInterval: Math.min(Math.max(minutes, 1), 60) // Ensure value is between 1-60
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
      // Si on active l'option, on synchronise l'IP API avec l'IP de base
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
        // Si l'utilisateur modifie manuellement l'IP API, désactiver l'option d'utiliser l'IP de base
        useBaseIpForApi: false
      };
    }),
  };
};
