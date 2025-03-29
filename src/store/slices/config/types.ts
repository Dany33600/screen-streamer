
import { AppState } from '../../index';

// Valeurs par défaut basiques si tout échoue
export const DEFAULT_CONFIG = {
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
