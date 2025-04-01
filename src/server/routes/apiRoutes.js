
import express from 'express';
import statusRoutes from './statusRoutes.js';
import configRoutes from './configRoutes.js';
import screenRoutes from './screenRoutes.js';
import contentRoutes from './contentRoutes.js';
import multer from 'multer';
import { createMulterStorage } from '../utils/fileStorage.js';
import { saveContentData } from '../services/content/contentStorage.js';

const router = express.Router();

// Configuration pour le stockage des fichiers lors de l'upload
const upload = multer({ 
  storage: createMulterStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  }
});

// Route d'upload directe au niveau API
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    // Vérifier si le fichier a été uploadé correctement
    const file = req.file;
    
    if (!file) {
      console.error('API: Aucun fichier reçu dans la requête');
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }
    
    // Récupérer le contentId et contentType du corps de la requête
    const contentId = req.body.contentId || `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const contentType = req.body.contentType || 'unknown';
    
    console.log(`API: ContentId reçu: ${contentId}`);
    console.log(`API: ContentType reçu: ${contentType}`);
    
    // Construire l'URL du fichier
    const fileUrl = `/uploads/${file.filename}`;
    
    console.log(`API: Fichier reçu et stocké avec succès à ${fileUrl}`);
    console.log(`API: Détails du fichier:`, {
      path: file.path,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Créer les données de contenu
    const contentData = {
      id: contentId,
      name: req.body.originalName || file.originalname,
      type: contentType,
      url: fileUrl,
      createdAt: Date.now(),
      mimetype: file.mimetype,
      size: file.size
    };
    
    // Sauvegarder les données du contenu dans un fichier JSON
    const jsonSaved = saveContentData(contentId, contentData);
    console.log(`API: Sauvegarde des métadonnées du contenu: ${jsonSaved ? 'Réussie' : 'Échouée'}`);
    
    // Retourner les informations sur le fichier uploadé
    return res.status(201).json({
      success: true,
      url: fileUrl,
      filePath: file.path,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      contentId: contentId,
      jsonSaved: jsonSaved
    });
  } catch (error) {
    console.error('API: Erreur lors de l\'upload du fichier:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'upload du fichier', error: error.message });
  }
});

// Monter les sous-routeurs
router.use('/status', statusRoutes);
router.use('/config', configRoutes);
router.use('/screens', screenRoutes);
router.use('/content', contentRoutes); // Route content (singulier)

export default router;
