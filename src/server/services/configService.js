
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

// Charger les données de configuration
export function getConfigData() {
  try {
    ensureDataDirExists();
    
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf8');
      return JSON.parse(data);
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error);
    return null;
  }
}

// Sauvegarder les données de configuration
export function saveConfigData(config) {
  try {
    ensureDataDirExists();
    
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`Configuration sauvegardée dans ${configFilePath}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error);
    return false;
  }
}
