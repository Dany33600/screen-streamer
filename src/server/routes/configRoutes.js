
import express from 'express';
import { getConfigData, saveConfigData, configFileExists } from '../services/configService.js';

const router = express.Router();

// Endpoint pour vérifier si le fichier de configuration existe
router.get('/exists', (req, res) => {
  try {
    const exists = configFileExists();
    console.log('API: Vérification de l\'existence de la configuration:', exists);
    res.json({ exists });
  } catch (error) {
    console.error('API: Erreur lors de la vérification de la configuration:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de la configuration' });
  }
});

// Route pour obtenir la configuration
router.get('/', (req, res) => {
  try {
    const config = getConfigData();
    if (config) {
      res.json({ success: true, config });
    } else {
      res.status(404).json({ success: false, message: 'Configuration non trouvée' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la récupération de la configuration:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la configuration' });
  }
});

// Route pour mettre à jour la configuration
router.post('/', (req, res) => {
  try {
    const { config } = req.body;
    if (config) {
      const saved = saveConfigData(config);
      if (saved) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde de la configuration' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Données de configuration manquantes' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la mise à jour de la configuration:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la configuration' });
  }
});

export default router;
