export interface ConfigState {
  basePort: number;
  baseIpAddress: string;
  isConfigMode: boolean;
  apiUrl: string;
  configPin: string;
  isPinVerified: boolean;
  refreshInterval: number;
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
}

export const createConfigSlice = (
  get: () => any, 
  set: (fn: (state: any) => any) => void
) => ({
  basePort: 5550,
  baseIpAddress: '192.168.0.14',
  isConfigMode: false,
  apiUrl: 'http://localhost:5000',
  configPin: '1234', // Default PIN
  isPinVerified: false,
  refreshInterval: 1, // Default to 1 minute
  
  // Default menu options - all enabled by default
  menuOptions: {
    dashboard: true,
    screens: true,
    content: true,
    playlists: true,
    preview: true,
  },
  
  setBasePort: (port) => set({ basePort: port }),
  
  setBaseIpAddress: (ipAddress) => set({ baseIpAddress: ipAddress }),
  
  toggleConfigMode: () => set((state: any) => {
    // If currently in config mode, reset pin verification when leaving
    if (state.isConfigMode) {
      return { isConfigMode: false, isPinVerified: false };
    }
    // If verified, can enter config mode
    if (state.isPinVerified) {
      return { isConfigMode: true };
    }
    // Otherwise, don't change the mode (PIN will be requested by UI)
    return state;
  }),
  
  setApiUrl: (url) => set({ apiUrl: url }),
  
  setConfigPin: (pin) => set({ configPin: pin }),
  
  verifyPin: (pin) => {
    const state = get();
    const isValid = pin === state.configPin;
    if (isValid) {
      set({ isPinVerified: true, isConfigMode: true });
    }
    return isValid;
  },
  
  resetPinVerification: () => set({ isPinVerified: false }),
  
  setRefreshInterval: (minutes) => set({ 
    refreshInterval: Math.min(Math.max(minutes, 1), 60) // Ensure value is between 1-60
  }),
  
  toggleMenuOption: (option, value) => set((state: any) => ({
    menuOptions: {
      ...state.menuOptions,
      [option]: value,
    },
  })),
});
