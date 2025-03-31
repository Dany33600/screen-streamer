
import express from 'express';
import statusRoutes from './statusRoutes.js';
import configRoutes from './configRoutes.js';
import screenRoutes from './screenRoutes.js';
import contentRoutes from './contentRoutes.js';
import multer from 'multer';
import { createMulterStorage } from '../utils/fileStorage.js';

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
    // Récupérer les données du middleware multer
    const file = req.file;
    const { name, contentType } = req.body;
    
    if (!file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    }
    
    // Construire l'URL du fichier
    const fileUrl = `/uploads/${file.filename}`;
    
    console.log(`API: Fichier reçu et stocké avec succès à ${fileUrl}`);
    
    // Retourner les informations sur le fichier uploadé
    return res.status(201).json({
      success: true,
      url: fileUrl,
      filePath: file.path,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
  } catch (error) {
    console.error('API: Erreur lors de l\'upload du fichier:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'upload du fichier' });
  }
});

// Monter les sous-routeurs
router.use('/status', statusRoutes);
router.use('/config', configRoutes);
router.use('/screens', screenRoutes);
router.use('/content', contentRoutes); // Ici la route est content (singulier)

export default router;
