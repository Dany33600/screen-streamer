
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
    console.log('ConfigService: Initialisation avec les valeurs par défaut', this.config);
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
      console.log('ConfigService: Début du chargement de la configuration, isLoaded=', this.isLoaded);
      
      // S'assurer que l'URL de l'API est configurée avec les paramètres actuels
      this.updateApiBaseUrl({
        baseIpAddress: this.config.baseIpAddress, 
        apiPort: this.config.apiPort,
        apiIpAddress: this.config.apiIpAddress,
        useBaseIpForApi: true
      });
      
      const configUrl = `${this.apiBaseUrl}/config`;
      console.log(`ConfigService: URL de chargement de la configuration: ${configUrl}`);
      
      try {
        const response = await this.handleApiRequest<{success: boolean, config: AppConfig}>(
          configUrl,
          { method: 'GET' }
        );
        
        if (response.success && response.config) {
          console.log('ConfigService: Configuration chargée avec succès:', response.config);
          this.config = response.config;
          this.isLoaded = true;
          
          // Mettre à jour l'URL de l'API avec les valeurs chargées
          this.updateApiBaseUrl({
            baseIpAddress: this.config.baseIpAddress,
            apiPort: this.config.apiPort,
            apiIpAddress: this.config.apiIpAddress,
            useBaseIpForApi: true
          });
          
          // Mettre à jour le store Zustand avec la nouvelle configuration
          this.updateStoreWithConfig();
          
          return this.config;
        }
      } catch (error) {
        console.error('ConfigService: Erreur lors de la requête API:', error);
        // En cas d'échec de l'API, utiliser les valeurs par défaut ou existantes
      }
      
      // Si aucune configuration n'a été chargée, utiliser les valeurs actuelles
      console.log('ConfigService: Utilisation des valeurs par défaut/existantes', this.config);
      
      // Mise à jour du store même si on utilise les valeurs par défaut
      this.updateStoreWithConfig();
      
      return this.config;
    } catch (error) {
      console.error('ConfigService: Erreur lors du chargement de la configuration:', error);
      toast.error('Erreur de configuration', {
        description: 'Impossible de charger la configuration, utilisation des valeurs par défaut'
      });
      
      // Mise à jour du store en cas d'erreur
      this.updateStoreWithConfig();
      
      return this.config;
    }
  }
  
  // Mettre à jour le store Zustand avec la configuration actuelle
  private updateStoreWithConfig(): void {
    try {
      const state = useAppStore.getState();
      
      // Mettre à jour toutes les valeurs dans le store
      if (state.setBasePort) state.setBasePort(this.config.basePort);
      if (state.setBaseIpAddress) state.setBaseIpAddress(this.config.baseIpAddress);
      if (state.setConfigPin) state.setConfigPin(this.config.configPin);
      if (state.setRefreshInterval) state.setRefreshInterval(this.config.refreshInterval);
      if (state.setApiPort) state.setApiPort(this.config.apiPort);
      if (state.setApiIpAddress) state.setApiIpAddress(this.config.apiIpAddress);
      
      // Forcer l'utilisation de l'adresse IP de l'API si elle est différente de l'adresse IP de base
      if (state.setUseBaseIpForApi) {
        const shouldUseBaseIp = this.config.baseIpAddress === this.config.apiIpAddress;
        state.setUseBaseIpForApi(shouldUseBaseIp);
      }
      
      console.log('ConfigService: Store Zustand mis à jour avec la configuration', this.config);
    } catch (error) {
      console.error('ConfigService: Erreur lors de la mise à jour du store:', error);
    }
  }
  
  // Sauvegarder la configuration sur le backend
  public async saveConfig(config: AppConfig): Promise<boolean> {
    try {
      console.log('ConfigService: Sauvegarde de la configuration sur le backend:', config);
      
      // Mettre à jour la configuration locale
      this.config = { ...config };
      
      // Mettre à jour l'URL de l'API avec la configuration actuelle
      const useBaseIpForApi = true; // We're assuming backend and frontend are on same IP
      const ipToUse = useBaseIpForApi ? config.baseIpAddress : config.apiIpAddress;
      const apiUrl = `http://${ipToUse}:${config.apiPort}/api`;
      
      console.log(`ConfigService: URL de l'API pour la sauvegarde: ${apiUrl}/config`);
      
      const response = await this.handleApiRequest<{success: boolean}>(
        `${apiUrl}/config`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config })
        }
      );
      
      if (response.success) {
        console.log('ConfigService: Configuration sauvegardée avec succès');
        
        // Mise à jour de l'URL de l'API après la sauvegarde
        this.updateApiBaseUrl({
          baseIpAddress: config.baseIpAddress,
          apiPort: config.apiPort,
          apiIpAddress: config.apiIpAddress,
          useBaseIpForApi: true
        });
        
        // Mettre à jour le store Zustand
        this.updateStoreWithConfig();
        
        return true;
      } else {
        console.warn('ConfigService: Échec de la sauvegarde de la configuration');
        return false;
      }
    } catch (error) {
      console.error('ConfigService: Erreur lors de la sauvegarde de la configuration:', error);
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
