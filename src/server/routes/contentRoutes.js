
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getContents, saveContent, deleteContent, updateContent } from '../services/contentService.js';

// Configuration pour le stockage des fichiers
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const contents = await getContents();
    res.json({ success: true, contents });
  } catch (error) {
    console.error('API: Erreur lors de la récupération des contenus:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des contenus' });
  }
});

// Route pour gérer l'upload de fichier physique
router.post('/', upload.single('file'), async (req, res) => {
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

// Nouvelle route pour gérer l'ajout de contenus par URL
router.post('/url', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.name || !content.url || !content.type) {
      return res.status(400).json({
        success: false,
        message: 'Données de contenu incomplètes. Assurez-vous de fournir name, url et type.'
      });
    }
    
    console.log('API: Réception d\'un contenu URL:', content);
    
    // Enregistrer le contenu URL
    const saved = await saveContent(content);
    
    if (saved) {
      res.status(201).json({ success: true, content: content });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde du contenu URL' });
    }
  } catch (error) {
    console.error('API: Erreur lors de l\'ajout d\'un contenu URL:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout d\'un contenu URL' });
  }
});

// Ajout d'une route pour traiter la soumission JSON directe (pour les URLs)
router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false, 
        message: 'Aucune donnée de contenu reçue'
      });
    }
    
    console.log('API: Réception d\'un contenu JSON:', content);
    
    // Sauvegarder le contenu
    const saved = await saveContent(content);
    
    if (saved) {
      res.status(201).json({ success: true, content: content });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde du contenu' });
    }
  } catch (error) {
    console.error('API: Erreur lors de l\'ajout d\'un contenu JSON:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout d\'un contenu' });
  }
});

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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
