
import express from 'express';
import { getConfigData, saveConfigData, configFileExists } from '../services/configService.js';
import { getScreens, saveScreens, deleteScreen, addScreen, updateScreen } from '../services/screenService.js';
import { getContents, saveContent, deleteContent, updateContent } from '../services/contentService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Configuration des routes API
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin vers le dossier pour le stockage des fichiers
const uploadsDir = path.join(__dirname, '..', 'data', 'uploads');

// S'assurer que le dossier uploads existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du middleware multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Endpoint pour vérifier si le fichier de configuration existe
router.get('/config/exists', (req, res) => {
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
router.get('/config', (req, res) => {
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
router.post('/config', (req, res) => {
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

// Routes pour les écrans
router.get('/screens', async (req, res) => {
  try {
    const screens = await getScreens();
    res.json({ success: true, screens });
  } catch (error) {
    console.error('API: Erreur lors de la récupération des écrans:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des écrans' });
  }
});

router.post('/screens', async (req, res) => {
  try {
    const { screen } = req.body;
    if (!screen) {
      return res.status(400).json({ success: false, message: 'Données d\'écran manquantes' });
    }
    
    const newScreen = await addScreen(screen);
    if (newScreen) {
      res.status(201).json({ success: true, screen: newScreen });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout d\'un écran' });
    }
  } catch (error) {
    console.error('API: Erreur lors de l\'ajout d\'un écran:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout d\'un écran' });
  }
});

router.put('/screens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { screen } = req.body;
    if (!screen) {
      return res.status(400).json({ success: false, message: 'Données d\'écran manquantes' });
    }
    
    const updatedScreen = await updateScreen(id, screen);
    if (updatedScreen) {
      res.json({ success: true, screen: updatedScreen });
    } else {
      res.status(404).json({ success: false, message: 'Écran non trouvé' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la mise à jour d\'un écran:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour d\'un écran' });
  }
});

router.delete('/screens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteScreen(id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Écran non trouvé' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la suppression d\'un écran:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression d\'un écran' });
  }
});

router.post('/screens/save', async (req, res) => {
  try {
    const { screens } = req.body;
    if (!screens || !Array.isArray(screens)) {
      return res.status(400).json({ success: false, message: 'Données d\'écrans manquantes ou invalides' });
    }
    
    const saved = await saveScreens(screens);
    if (saved) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde des écrans' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la sauvegarde des écrans:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde des écrans' });
  }
});

// Routes pour les contenus
router.get('/contents', async (req, res) => {
  try {
    const contents = await getContents();
    res.json({ success: true, contents });
  } catch (error) {
    console.error('API: Erreur lors de la récupération des contenus:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des contenus' });
  }
});

router.post('/contents', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { name, type } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }

    const content = {
      name: name,
      type: type,
      url: `/uploads/${file.filename}`,
    };

    const saved = await saveContent(content);

    if (saved) {
      res.status(201).json({ success: true, content: content });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde du contenu' });
    }
  } catch (error) {
    console.error('API: Erreur lors de l\'ajout d\'un contenu:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout d\'un contenu' });
  }
});

router.put('/contents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const updatedContent = await updateContent(id, content);
    if (updatedContent) {
      res.json({ success: true, content: updatedContent });
    } else {
      res.status(404).json({ success: false, message: 'Contenu non trouvé' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la mise à jour d\'un contenu:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour d\'un contenu' });
  }
});

router.delete('/contents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteContent(id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Contenu non trouvé' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la suppression d\'un contenu:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression d\'un contenu' });
  }
});

export default router;
