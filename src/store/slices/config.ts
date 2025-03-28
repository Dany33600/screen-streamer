import { 
  DEFAULT_BASE_PORT, 
  DEFAULT_IP_ADDRESS, 
  DEFAULT_PIN, 
  DEFAULT_REFRESH_INTERVAL,
  API_PORT
} from '@/config/constants';

export interface ConfigState {
  basePort: number;
  baseIpAddress: string;
  isConfigMode: boolean;
  apiUrl: string;
  configPin: string;
  isPinVerified: boolean;
  refreshInterval: number;
  isDarkMode: boolean;
  hasCompletedOnboarding: boolean;
  hasAttemptedServerCheck: boolean;
  apiPort: number;
  menuOptions: {
    dashboard: boolean;
    screens: boolean;
    content: boolean;
    playlists: boolean;
    preview: boolean;
  };
  
  // Actions
  setBasePort: (port: number) => void;
  setBaseIpAddress: (ipAddress: string) => void;
  toggleConfigMode: () => void;
  setApiUrl: (url: string) => void;
  setConfigPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  resetPinVerification: () => void;
  setRefreshInterval: (minutes: number) => void;
  toggleMenuOption: (option: keyof ConfigState['menuOptions'], value: boolean) => void;
  toggleDarkMode: () => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setHasAttemptedServerCheck: (value: boolean) => void;
  setApiPort: (port: number) => void;
}

export const createConfigSlice = (
  get: () => any, 
  set: (fn: (state: any) => any) => void
) => ({
  basePort: DEFAULT_BASE_PORT,
  baseIpAddress: DEFAULT_IP_ADDRESS,
  isConfigMode: false,
  apiUrl: 'http://localhost:5000',
  configPin: DEFAULT_PIN, // Utilisation de la constante par défaut
  isPinVerified: false,
  refreshInterval: DEFAULT_REFRESH_INTERVAL, // Utilisation de la constante par défaut
  isDarkMode: false, // Thème clair par défaut
  hasCompletedOnboarding: false, // Par défaut, l'onboarding n'a pas été complété
  hasAttemptedServerCheck: false, // Par défaut, aucune tentative de vérification du serveur n'a été effectuée
  apiPort: API_PORT, // Port API par défaut
  
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
  
  setBaseIpAddress: (ipAddress) => set((state) => ({ 
    ...state, 
    baseIpAddress: ipAddress 
  })),
  
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
  
  setApiUrl: (url) => set((state) => ({ 
    ...state, 
    apiUrl: url 
  })),
  
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
});
