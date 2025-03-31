
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getContents, saveContent, deleteContent, updateContent } from '../services/contentService.js';
import { UPLOADS_DIR } from '../utils/fileStorage.js';

// Configuration pour le stockage des fichiers
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Assurons-nous que nous utilisons le bon dossier d'uploads
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`API: Création du répertoire d'uploads: ${UPLOADS_DIR}`);
}

// Configuration du middleware multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`API: Stockage du fichier dans: ${UPLOADS_DIR}`);
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Obtenir contentId de la requête s'il existe ou générer un nouveau
    const contentId = req.body.contentId || `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${contentId}-${safeFileName}`;
    console.log(`API: Nom de fichier généré: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  }
});

const router = express.Router();

// Liste tous les contenus
router.get('/', async (req, res) => {
  try {
    const contents = await getContents();
    console.log('API: Envoi des contenus:', contents);
    res.json({ success: true, contents }); // Assurez-vous que la clé est "contents"
  } catch (error) {
    console.error('API: Erreur lors de la récupération des contenus:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des contenus' });
  }
});

// Route pour gérer l'upload de fichier physique
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { name, type, contentId } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }

    console.log(`API: Fichier reçu: ${file.originalname}, type: ${type || 'non spécifié'}`);

    const content = {
      id: contentId || `content-${Date.now()}`,
      name: name || file.originalname,
      type: type || 'file',
      url: `/uploads/${file.filename}`,
      createdAt: Date.now()
    };

    const saved = await saveContent(content);

    if (saved) {
      console.log(`API: Contenu sauvegardé avec succès: ${content.id}`);
      res.status(201).json({ success: true, content: content });
    } else {
      console.error(`API: Échec de la sauvegarde du contenu: ${content.id}`);
      res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde du contenu' });
    }
  } catch (error) {
    console.error('API: Erreur lors de l\'ajout d\'un contenu:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout d\'un contenu', error: error.message });
  }
});

// Route pour gérer l'ajout de contenus par URL
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

// Mettre à jour un contenu
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    console.log('API: Mise à jour du contenu', id);
    console.log('Données reçues:', content);
    
    // Si c'est un contenu HTML avec htmlContent, nous devons également mettre à jour le fichier physique
    if (content.type === 'html' && content.htmlContent) {
      // Vérifier si l'URL existe déjà
      const existingContent = await getContents().then(contents => 
        contents.find(c => c.id === id)
      );
      
      if (existingContent) {
        try {
          // Gérer les URLs relatives
          let filePath;
          if (existingContent.url && existingContent.url.startsWith('/uploads/')) {
            const relativePath = existingContent.url.replace('/uploads/', '');
            filePath = path.join(UPLOADS_DIR, relativePath);
            console.log(`API: Chemin du fichier HTML à mettre à jour: ${filePath}`);
          } else {
            // Créer un nouveau fichier HTML s'il n'existe pas déjà
            const fileName = `html-${Date.now()}.html`;
            filePath = path.join(UPLOADS_DIR, fileName);
            content.url = `/uploads/${fileName}`;
            console.log(`API: Création d'un nouveau fichier HTML: ${filePath}`);
          }
          
          // Écrire le contenu HTML dans le fichier
          fs.writeFileSync(filePath, content.htmlContent, 'utf8');
          console.log(`API: Fichier HTML mis à jour: ${filePath}`);
        } catch (fileError) {
          console.error('API: Erreur lors de l\'écriture du fichier HTML:', fileError);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'écriture du fichier HTML',
            error: fileError.message
          });
        }
      }
    }
    
    const updatedContent = await updateContent(id, content);
    
    if (updatedContent) {
      res.json({ success: true, content: updatedContent });
    } else {
      res.status(404).json({ success: false, message: 'Contenu non trouvé' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la mise à jour d\'un contenu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour d\'un contenu',
      error: error.message
    });
  }
});

// Supprimer un contenu
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`API: Tentative de suppression du contenu avec ID: ${id}`);
    
    const deleted = await deleteContent(id);
    
    if (deleted) {
      console.log(`API: Contenu avec ID ${id} supprimé avec succès`);
      res.json({ success: true });
    } else {
      console.log(`API: Contenu avec ID ${id} non trouvé`);
      res.status(404).json({ success: false, message: 'Contenu non trouvé' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la suppression d\'un contenu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression d\'un contenu',
      error: error.message
    });
  }
});

export default router;
