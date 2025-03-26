import express from 'express';
import { saveContentData, getContentData, listAllContent, deleteContent, contentExists } from '../services/contentService.js';
import { startServer, stopServer, updateServer, getRunningServers } from '../services/serverManager.js';
import { createUploadMiddleware, getFirstIpAddress } from '../utils/fileStorage.js';
import { getAllScreens, getScreenById, saveScreen, updateScreen, deleteScreen } from '../services/screenService.js';

const router = express.Router();
const upload = createUploadMiddleware();

// Status endpoint
router.get('/status', (req, res) => {
  const serverStatus = getRunningServers();
  
  res.json({ 
    status: 'ok', 
    servers: serverStatus
  });
});

// File upload endpoint
router.post('/upload', (req, res) => {
  console.log('Requête d\'upload reçue');
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Erreur Multer lors de l\'upload:', err);
      return res.status(500).json({ 
        success: false, 
        message: `Erreur lors de l\'upload: ${err.message}` 
      });
    }
    
    try {
      console.log('Corps de la requête d\'upload:', req.body);
      
      if (!req.file) {
        console.error('Aucun fichier reçu dans la requête d\'upload');
        return res.status(400).json({ 
          success: false, 
          message: 'Aucun fichier reçu' 
        });
      }
      
      console.log('Fichier uploadé:', req.file);
      
      // Construire l'URL complète du fichier
      const ipAddress = getFirstIpAddress();
      const serverPort = process.env.API_PORT || 5000;
      const fullFileUrl = `http://${ipAddress}:${serverPort}/uploads/${req.file.filename}`;
      
      console.log(`Generated full file URL: ${fullFileUrl}`);
      
      // Si le contentId est fourni dans la requête, enregistrer également les métadonnées
      if (req.body.contentId && req.body.contentType) {
        const contentId = req.body.contentId;
        const contentType = req.body.contentType;
        const contentName = req.file.originalname;
        
        console.log(`Enregistrement des métadonnées pour le contentId: ${contentId}`);
        
        // Créer un objet contenu
        const contentData = {
          id: contentId,
          name: contentName,
          type: contentType,
          url: fullFileUrl,
          filePath: req.file.path,
          createdAt: Date.now()
        };
        
        // Sauvegarder les métadonnées
        saveContentData(contentId, contentData);
      }
      
      res.json({
        success: true,
        message: 'Fichier uploadé avec succès',
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fullFileUrl,
        filePath: req.file.path
      });
    } catch (error) {
      console.error('Erreur dans le gestionnaire d\'upload:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload du fichier',
        error: error.message
      });
    }
  });
});

// Start server endpoint
router.post('/start-server', (req, res) => {
  try {
    const { port, html, contentType } = req.body;
    
    if (!port || !html) {
      return res.status(400).json({ success: false, message: 'Port et HTML requis' });
    }
    
    const success = startServer(port, html, contentType || 'html');
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Serveur démarré sur le port ${port} pour le contenu de type ${contentType || 'html'}` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: `Échec du démarrage du serveur sur le port ${port}` 
      });
    }
  } catch (error) {
    console.error("Erreur dans /api/start-server:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stop server endpoint
router.post('/stop-server', (req, res) => {
  try {
    const { port } = req.body;
    
    if (!port) {
      return res.status(400).json({ success: false, message: 'Port requis' });
    }
    
    const success = stopServer(port);
    
    if (success) {
      res.json({ success: true, message: `Serveur arrêté sur le port ${port}` });
    } else {
      res.status(500).json({ success: false, message: `Échec de l'arrêt du serveur sur le port ${port}` });
    }
  } catch (error) {
    console.error("Erreur dans /api/stop-server:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update server endpoint
router.post('/update-server', (req, res) => {
  try {
    const { port, html, contentType } = req.body;
    
    if (!port || !html) {
      return res.status(400).json({ success: false, message: 'Port et HTML requis' });
    }
    
    const success = updateServer(port, html, contentType || 'html');
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Serveur mis à jour sur le port ${port} pour le contenu de type ${contentType || 'html'}` 
      });
    } else {
      res.status(500).json({ success: false, message: `Échec de la mise à jour du serveur sur le port ${port}` });
    }
  } catch (error) {
    console.error("Erreur dans /api/update-server:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Content management endpoints
router.post('/content', (req, res) => {
  try {
    const { contentId, content } = req.body;
    
    if (!contentId || !content) {
      return res.status(400).json({ success: false, message: 'ID de contenu et données requis' });
    }
    
    console.log(`Sauvegarde du contenu ${contentId} via API POST`);
    
    // Ne pas créer de fichiers JSON pour les UUID de serveur d'écran
    // Ces UUIDs sont générés lorsqu'un écran démarre et n'ont pas besoin d'être enregistrés comme contenu
    if (contentId.includes('-') && contentId.length > 30) {
      // Vérifier si c'est un fichier de serveur d'écran (UUID) qui contient un champ "html"
      if (content.html && content.content) {
        console.log(`Le contenu ${contentId} semble être un fichier de serveur d'écran (contient HTML), ignoré pour éviter les doublons`);
        return res.json({ 
          success: true, 
          message: `Contenu ${contentId} non enregistré pour éviter les doublons de serveur d'écran` 
        });
      }
      
      // Vérifier si le contenu existe déjà
      if (contentExists(contentId)) {
        console.log(`Le contenu ${contentId} existe déjà, annulation de la sauvegarde pour éviter les doublons`);
        return res.json({ 
          success: true, 
          message: `Contenu ${contentId} existe déjà, utilisation de la version existante` 
        });
      }
    }
    
    const success = saveContentData(contentId, content);
    
    if (success) {
      res.json({ success: true, message: `Contenu ${contentId} sauvegardé avec succès` });
    } else {
      res.status(500).json({ success: false, message: `Échec de la sauvegarde du contenu ${contentId}` });
    }
  } catch (error) {
    console.error("Erreur dans /api/content (POST):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/content/:contentId', (req, res) => {
  try {
    const { contentId } = req.params;
    
    if (!contentId) {
      return res.status(400).json({ success: false, message: 'ID de contenu requis' });
    }
    
    console.log(`Récupération du contenu ${contentId} via API GET`);
    const content = getContentData(contentId);
    
    if (content) {
      res.json({ success: true, content });
    } else {
      console.log(`Contenu ${contentId} non trouvé`);
      res.status(404).json({ success: false, message: `Contenu ${contentId} non trouvé` });
    }
  } catch (error) {
    console.error("Erreur dans /api/content/:contentId (GET):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/content', (req, res) => {
  try {
    console.log('Récupération de tous les contenus via API GET');
    const contentList = listAllContent();
    res.json({ success: true, contentList });
  } catch (error) {
    console.error("Erreur dans /api/content (GET):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/content/:contentId', (req, res) => {
  try {
    const { contentId } = req.params;
    
    if (!contentId) {
      return res.status(400).json({ success: false, message: 'ID de contenu requis' });
    }
    
    console.log(`Traitement de la suppression pour l'ID exact: "${contentId}"`);
    
    // Tentative de suppression avec l'ID exact fourni
    const success = deleteContent(contentId);
    
    if (success) {
      res.json({ success: true, message: `Contenu ${contentId} supprimé avec succès` });
    } else {
      res.status(404).json({ 
        success: false, 
        message: `Contenu ${contentId} non trouvé ou erreur lors de la suppression`
      });
    }
  } catch (error) {
    console.error("Erreur dans /api/content/:contentId (DELETE):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// SCREEN MANAGEMENT ENDPOINTS
// Get all screens
router.get('/screens', (req, res) => {
  try {
    console.log('Récupération de tous les écrans via API GET');
    const screens = getAllScreens();
    res.json({ success: true, screens });
  } catch (error) {
    console.error("Erreur dans /api/screens (GET):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a specific screen
router.get('/screens/:screenId', (req, res) => {
  try {
    const { screenId } = req.params;
    
    if (!screenId) {
      return res.status(400).json({ success: false, message: 'ID d\'écran requis' });
    }
    
    console.log(`Récupération de l'écran ${screenId} via API GET`);
    const screen = getScreenById(screenId);
    
    if (screen) {
      res.json({ success: true, screen });
    } else {
      console.log(`Écran ${screenId} non trouvé`);
      res.status(404).json({ success: false, message: `Écran ${screenId} non trouvé` });
    }
  } catch (error) {
    console.error("Erreur dans /api/screens/:screenId (GET):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create or update a screen
router.post('/screens', (req, res) => {
  try {
    const { screen } = req.body;
    
    if (!screen) {
      return res.status(400).json({ success: false, message: 'Données d\'écran requises' });
    }
    
    console.log(`Sauvegarde de l'écran via API POST:`, screen);
    
    const savedScreen = saveScreen(screen);
    
    if (savedScreen) {
      res.json({ success: true, screen: savedScreen, message: `Écran sauvegardé avec succès` });
    } else {
      res.status(500).json({ success: false, message: `Échec de la sauvegarde de l'écran` });
    }
  } catch (error) {
    console.error("Erreur dans /api/screens (POST):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a screen
router.put('/screens/:screenId', (req, res) => {
  try {
    const { screenId } = req.params;
    const { data } = req.body;
    
    if (!screenId || !data) {
      return res.status(400).json({ success: false, message: 'ID d\'écran et données requis' });
    }
    
    console.log(`Mise à jour de l'écran ${screenId} via API PUT`);
    const updatedScreen = updateScreen(screenId, data);
    
    if (updatedScreen) {
      res.json({ success: true, screen: updatedScreen, message: `Écran ${screenId} mis à jour avec succès` });
    } else {
      res.status(500).json({ success: false, message: `Échec de la mise à jour de l'écran ${screenId}` });
    }
  } catch (error) {
    console.error("Erreur dans /api/screens/:screenId (PUT):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a screen
router.delete('/screens/:screenId', (req, res) => {
  try {
    const { screenId } = req.params;
    
    if (!screenId) {
      return res.status(400).json({ success: false, message: 'ID d\'écran requis' });
    }
    
    console.log(`Suppression de l'écran ${screenId} via API DELETE`);
    const success = deleteScreen(screenId);
    
    if (success) {
      res.json({ success: true, message: `Écran ${screenId} supprimé avec succès` });
    } else {
      res.status(404).json({ success: false, message: `Écran ${screenId} non trouvé ou erreur lors de la suppression` });
    }
  } catch (error) {
    console.error("Erreur dans /api/screens/:screenId (DELETE):", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
