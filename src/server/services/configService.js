
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Recréer l'équivalent de __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin vers le dossier de données (un niveau au-dessus de 'services')
const dataDir = path.join(__dirname, '..', 'data');
const configFilePath = path.join(dataDir, 'app-config.json');

// S'assurer que le répertoire de données existe
function ensureDataDirExists() {
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`Répertoire créé: ${dataDir}`);
    } catch (error) {
      console.error(`Erreur lors de la création du répertoire ${dataDir}:`, error);
      throw error;
    }
  }
}

// Vérifier si le fichier de configuration existe
export function configFileExists() {
  ensureDataDirExists();
  return fs.existsSync(configFilePath);
}

// Cache pour éviter de lire/écrire constamment le fichier de configuration
let configCache = null;
let lastSavedConfig = null;

// Charger les données de configuration
export function getConfigData() {
  try {
    ensureDataDirExists();
    
    // Si nous avons déjà chargé la config, utiliser le cache
    if (configCache) {
      return configCache;
    }
    
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf8');
      configCache = JSON.parse(data);
      lastSavedConfig = JSON.stringify(configCache);
      return configCache;
    }
    
    // Retourner un objet de configuration par défaut si le fichier n'existe pas
    const defaultConfig = {
      basePort: 5550,
      baseIpAddress: '127.0.0.1',
      configPin: '0000',
      refreshInterval: 5,
      apiPort: 5070,
      apiIpAddress: '127.0.0.1',
      useBaseIpForApi: true,
      forceOnboarding: false
    };
    
    configCache = defaultConfig;
    return defaultConfig;
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error);
    return null;
  }
}

// Sauvegarder les données de configuration
export function saveConfigData(config) {
  try {
    ensureDataDirExists();
    
    // Vérifier si la configuration a changé pour éviter les sauvegardes inutiles
    const configString = JSON.stringify(config);
    if (configString === lastSavedConfig) {
      console.log('Configuration inchangée, sauvegarde ignorée');
      return true;
    }
    
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`Configuration sauvegardée dans ${configFilePath}`);
    
    // Mettre à jour le cache et le dernier état sauvegardé
    configCache = config;
    lastSavedConfig = configString;
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error);
    return false;
  }
}
