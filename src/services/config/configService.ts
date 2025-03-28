
import { ApiService } from '../api/apiService';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { 
  DEFAULT_BASE_PORT, 
  DEFAULT_IP_ADDRESS, 
  DEFAULT_PIN, 
  DEFAULT_REFRESH_INTERVAL,
  DEFAULT_API_IP_ADDRESS,
  API_PORT,
  FORCE_ONBOARDING
} from '@/config/constants';

// Configuration par défaut à utiliser si le backend n'est pas accessible
const defaultConfig = {
  basePort: DEFAULT_BASE_PORT,
  baseIpAddress: DEFAULT_IP_ADDRESS,
  configPin: DEFAULT_PIN,
  refreshInterval: DEFAULT_REFRESH_INTERVAL,
  apiPort: API_PORT,
  apiIpAddress: DEFAULT_API_IP_ADDRESS,
  forceOnboarding: FORCE_ONBOARDING
};

// Interface pour la configuration
export interface AppConfig {
  basePort: number;
  baseIpAddress: string;
  configPin: string;
  refreshInterval: number;
  apiPort: number;
  apiIpAddress: string;
  forceOnboarding: boolean;
}

// Classe singleton pour gérer la configuration
class ConfigService extends ApiService {
  private static instance: ConfigService;
  private config: AppConfig = { ...defaultConfig };
  private isLoaded: boolean = false;
  
  private constructor() {
    super();
    // Configurer l'URL de l'API avec les valeurs par défaut
    this.updateApiBaseUrl({
      baseIpAddress: defaultConfig.baseIpAddress,
      apiPort: defaultConfig.apiPort,
      apiIpAddress: defaultConfig.apiIpAddress,
      useBaseIpForApi: true
    });
  }
  
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
  
  // Charger la configuration à partir du backend
  public async loadConfig(): Promise<AppConfig> {
    try {
      if (!this.isLoaded) {
        console.log('Chargement de la configuration depuis le backend...');
        
        // S'assurer que l'URL de l'API est configurée
        this.updateApiBaseUrl({
          baseIpAddress: defaultConfig.baseIpAddress,
          apiPort: defaultConfig.apiPort,
          apiIpAddress: defaultConfig.apiIpAddress,
          useBaseIpForApi: true
        });
        
        const configUrl = `${this.apiBaseUrl}/config`;
        console.log(`URL de chargement de la configuration: ${configUrl}`);
        
        const response = await this.handleApiRequest<{success: boolean, config: AppConfig}>(
          configUrl,
          { method: 'GET' }
        );
        
        if (response.success && response.config) {
          console.log('Configuration chargée avec succès:', response.config);
          this.config = response.config;
          this.isLoaded = true;
          
          // Mise à jour de l'URL de l'API avec les valeurs chargées
          this.updateApiBaseUrl({
            baseIpAddress: this.config.baseIpAddress,
            apiPort: this.config.apiPort,
            apiIpAddress: this.config.apiIpAddress,
            useBaseIpForApi: true
          });
          
          // Mettre à jour le store Zustand avec la nouvelle configuration
          const state = useAppStore.getState();
          if (state.setBaseIpAddress) {
            state.setBaseIpAddress(this.config.baseIpAddress);
          }
          if (state.setApiPort) {
            state.setApiPort(this.config.apiPort);
          }
          if (state.setApiIpAddress) {
            state.setApiIpAddress(this.config.apiIpAddress);
          }
        } else {
          console.warn('Échec du chargement de la configuration, utilisation des valeurs par défaut');
        }
      }
      
      return this.config;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      toast.error('Erreur de configuration', {
        description: 'Impossible de charger la configuration, utilisation des valeurs par défaut'
      });
      return this.config;
    }
  }
  
  // Sauvegarder la configuration sur le backend
  public async saveConfig(config: AppConfig): Promise<boolean> {
    try {
      console.log('Sauvegarde de la configuration sur le backend:', config);
      
      // Mettre à jour l'URL de l'API avec la configuration actuelle
      const useBaseIpForApi = true; // We're assuming backend and frontend are on same IP
      const ipToUse = useBaseIpForApi ? config.baseIpAddress : config.apiIpAddress;
      const apiUrl = `http://${ipToUse}:${config.apiPort}/api`;
      
      console.log(`URL de l'API pour la sauvegarde: ${apiUrl}/config`);
      
      // Fixed: removed duplicate "/api" in the URL
      const response = await this.handleApiRequest<{success: boolean}>(
        `${apiUrl}/config`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config })
        }
      );
      
      if (response.success) {
        console.log('Configuration sauvegardée avec succès');
        this.config = config;
        
        // Mise à jour de l'URL de l'API après la sauvegarde
        this.updateApiBaseUrl({
          baseIpAddress: config.baseIpAddress,
          apiPort: config.apiPort,
          apiIpAddress: config.apiIpAddress,
          useBaseIpForApi: true
        });
        
        return true;
      } else {
        console.warn('Échec de la sauvegarde de la configuration');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      toast.error('Erreur de configuration', {
        description: 'Impossible de sauvegarder la configuration'
      });
      return false;
    }
  }
  
  // Obtenir la configuration actuelle
  public getConfig(): AppConfig {
    return { ...this.config };
  }
  
  // Vérifier si la configuration a été chargée
  public isConfigLoaded(): boolean {
    return this.isLoaded;
  }
}

// Exporter une instance singleton du service
export const configService = ConfigService.getInstance();
