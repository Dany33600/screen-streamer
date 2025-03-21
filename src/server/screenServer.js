import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os'; 
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage');
const CONTENT_DIR = path.join(STORAGE_DIR, 'content');
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');

// Création des répertoires si nécessaire
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  console.log(`Répertoire de stockage créé: ${STORAGE_DIR}`);
}

if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  console.log(`Répertoire de contenu créé: ${CONTENT_DIR}`);
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`Répertoire d'uploads créé: ${UPLOADS_DIR}`);
}

const runningServers = new Map();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    console.log(`Stockage du fichier dans: ${UPLOADS_DIR}`);
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log(`Nom de fichier généré: ${uniqueFilename}`);
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  }
});

function startServer(port, html, contentType = 'html') {
  if (runningServers.has(port)) {
    stopServer(port);
  }
  
  try {
    const app = express();
    
    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Servir les fichiers statiques depuis node_modules reveal.js
    try {
      const revealJsPath = path.resolve(__dirname, '..', '..', 'node_modules', 'reveal.js');
      console.log(`Tentative de servir reveal.js depuis: ${revealJsPath}`);
      if (fs.existsSync(revealJsPath)) {
        app.use('/node_modules/reveal.js', express.static(revealJsPath));
        console.log('Répertoire reveal.js servi avec succès');
      } else {
        console.warn('Répertoire reveal.js non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration du répertoire statique pour reveal.js:', error);
    }
    
    // Ajouter le répertoire d'uploads comme statique
    app.use('/uploads', express.static(UPLOADS_DIR));
    
    app.get('/', (req, res) => {
      // En fonction du type de contenu, nous pouvons ajouter des en-têtes spécifiques
      if (contentType === 'video') {
        res.setHeader('Content-Type', 'text/html');
      } else if (contentType === 'powerpoint') {
        res.setHeader('Content-Type', 'text/html');
      } else {
        res.setHeader('Content-Type', 'text/html');
      }
      
      console.log(`Affichage du contenu de type: ${contentType}`);
      res.send(html);
    });
    
    app.get('/ping', (req, res) => {
      res.status(200).send('pong');
    });
    
    const server = createServer(app);
    
    server.listen(port, '0.0.0.0', () => {
      console.log(`Serveur démarré sur le port ${port} pour le contenu de type ${contentType}`);
    });
    
    runningServers.set(port, { server, contentType });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors du démarrage du serveur sur le port ${port}:`, error);
    return false;
  }
}

function stopServer(port) {
  if (!runningServers.has(port)) {
    console.log(`Aucun serveur en cours d'exécution sur le port ${port}`);
    return false;
  }
  
  try {
    const { server } = runningServers.get(port);
    
    server.close(() => {
      console.log(`Serveur arrêté sur le port ${port}`);
    });
    
    runningServers.delete(port);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'arrêt du serveur pour le port ${port}:`, error);
    return false;
  }
}

function updateServer(port, html, contentType = 'html') {
  return startServer(port, html, contentType);
}

function saveContentData(contentId, contentData) {
  try {
    // Logs pour le débogage
    console.log(`Sauvegarde du contenu avec ID: ${contentId}`);
    console.log(`Données de contenu:`, JSON.stringify(contentData, null, 2));
    
    // S'assurer que le contentId est une chaîne valide pour un nom de fichier
    const sanitizedContentId = contentId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const contentPath = path.join(CONTENT_DIR, `${sanitizedContentId}.json`);
    
    // Écrire le fichier JSON
    fs.writeFileSync(contentPath, JSON.stringify(contentData, null, 2));
    console.log(`Contenu sauvegardé avec succès dans: ${contentPath}`);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du contenu ${contentId}:`, error);
    return false;
  }
}

function getContentData(contentId) {
  try {
    console.log(`Recherche du contenu avec ID: ${contentId}`);
    
    // Vérifier si l'ID est déjà formaté comme un nom de fichier complet (avec .json)
    if (contentId.endsWith('.json')) {
      const directPath = path.join(CONTENT_DIR, contentId);
      if (fs.existsSync(directPath)) {
        console.log(`Fichier trouvé (chemin direct): ${directPath}`);
        const data = fs.readFileSync(directPath, 'utf8');
        return JSON.parse(data);
      }
    }
    
    // Essayer avec l'ID exact
    const exactPath = path.join(CONTENT_DIR, `${contentId}.json`);
    if (fs.existsSync(exactPath)) {
      console.log(`Fichier trouvé (ID exact): ${exactPath}`);
      const data = fs.readFileSync(exactPath, 'utf8');
      return JSON.parse(data);
    }
    
    // Si le fichier n'est pas trouvé, rechercher par correspondance partielle
    console.log(`Fichier non trouvé. Recherche de correspondances partielles pour: ${contentId}`);
    const files = fs.readdirSync(CONTENT_DIR);
    
    // Recherche de fichiers qui contiennent le contentId
    for (const file of files) {
      if (file.includes(contentId) || file.includes(contentId.replace(/[^a-zA-Z0-9-_]/g, '_'))) {
        const filePath = path.join(CONTENT_DIR, file);
        console.log(`Correspondance partielle trouvée: ${filePath}`);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    }
    
    // Lister tous les fichiers disponibles pour le débogage
    console.log('Aucune correspondance trouvée. Fichiers disponibles:');
    console.log(files);
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du contenu ${contentId}:`, error);
    return null;
  }
}

function listAllContent() {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    const contentList = [];
    
    console.log(`Listage des contenus. ${files.length} fichiers trouvés.`);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const contentId = file.replace('.json', '');
          const content = getContentData(contentId);
          if (content) {
            contentList.push(content);
          }
        } catch (err) {
          console.error(`Erreur lors du traitement du fichier ${file}:`, err);
        }
      }
    }
    
    console.log(`${contentList.length} contenus valides trouvés.`);
    return contentList;
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des contenus:', error);
    return [];
  }
}

function deleteContent(contentId) {
  try {
    console.log(`Suppression du contenu demandée. ID exact reçu: "${contentId}"`);
    
    // Vérifier si contentId est vide ou undefined
    if (!contentId) {
      console.error("ID de contenu manquant pour la suppression");
      return false;
    }
    
    // On vérifie d'abord si le fichier JSON existe directement avec l'ID exact
    const exactJsonPath = path.join(CONTENT_DIR, `${contentId}.json`);
    console.log(`Vérification du fichier JSON avec chemin exact: ${exactJsonPath}`);
    
    if (fs.existsSync(exactJsonPath)) {
      console.log(`Fichier JSON trouvé: ${exactJsonPath}`);
      try {
        // Récupérer les données avant de supprimer le fichier JSON
        const contentData = JSON.parse(fs.readFileSync(exactJsonPath, 'utf8'));
        console.log(`Données du contenu récupérées:`, contentData);
        
        // Supprimer le fichier JSON
        fs.unlinkSync(exactJsonPath);
        console.log(`Fichier JSON supprimé: ${exactJsonPath}`);
        
        // Supprimer le fichier physique s'il existe
        if (contentData.url) {
          try {
            // Extraire le nom du fichier depuis l'URL
            const fileName = contentData.url.split('/').pop();
            if (fileName) {
              const filePath = path.join(UPLOADS_DIR, fileName);
              console.log(`Tentative de suppression du fichier physique: ${filePath}`);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Fichier physique supprimé: ${filePath}`);
              } else {
                console.warn(`Fichier physique non trouvé: ${filePath}`);
                
                // Essayer avec l'ID exact comme nom de fichier
                const exactFilePath = path.join(UPLOADS_DIR, contentId);
                if (fs.existsSync(exactFilePath)) {
                  fs.unlinkSync(exactFilePath);
                  console.log(`Fichier physique supprimé (ID exact): ${exactFilePath}`);
                }
              }
            }
          } catch (e) {
            console.warn(`Erreur lors de la suppression du fichier physique:`, e);
          }
        }
        
        return true;
      } catch (err) {
        console.error(`Erreur lors de la suppression du fichier JSON ${exactJsonPath}:`, err);
      }
    } else {
      console.log(`Fichier JSON non trouvé avec chemin exact: ${exactJsonPath}`);
      
      // Si le fichier exact n'existe pas, rechercher des fichiers contenant l'ID
      console.log(`Recherche de fichiers JSON correspondant à l'ID: ${contentId}`);
      const files = fs.readdirSync(CONTENT_DIR);
      let jsonFound = false;
      
      for (const file of files) {
        if (file.includes(contentId)) {
          try {
            const filePath = path.join(CONTENT_DIR, file);
            console.log(`Fichier JSON correspondant trouvé: ${filePath}`);
            
            // Récupérer les données avant de supprimer
            let contentData = null;
            try {
              contentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              console.log(`Données du contenu récupérées:`, contentData);
            } catch (e) {
              console.warn(`Erreur lors de la lecture du contenu:`, e);
            }
            
            // Supprimer le fichier JSON
            fs.unlinkSync(filePath);
            console.log(`Fichier JSON supprimé: ${filePath}`);
            jsonFound = true;
            
            // Supprimer le fichier physique si possible
            if (contentData && contentData.url) {
              try {
                const fileName = contentData.url.split('/').pop();
                if (fileName) {
                  const filePath = path.join(UPLOADS_DIR, fileName);
                  console.log(`Tentative de suppression du fichier physique: ${filePath}`);
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Fichier physique supprimé: ${filePath}`);
                  } else {
                    console.warn(`Fichier physique non trouvé: ${filePath}`);
                  }
                }
              } catch (e) {
                console.warn(`Erreur lors de la suppression du fichier physique:`, e);
              }
            }
          } catch (err) {
            console.error(`Erreur lors de la suppression du fichier ${file}:`, err);
          }
        }
      }
      
      if (!jsonFound) {
        console.warn(`Aucun fichier JSON correspondant à l'ID ${contentId} n'a été trouvé`);
        
        // Tenter une dernière approche: chercher directement dans le dossier uploads
        try {
          console.log(`Recherche directe dans le dossier uploads pour des fichiers correspondant à l'ID: ${contentId}`);
          const uploadFiles = fs.readdirSync(UPLOADS_DIR);
          for (const file of uploadFiles) {
            if (file.includes(contentId)) {
              const filePath = path.join(UPLOADS_DIR, file);
              console.log(`Fichier correspondant trouvé dans uploads: ${filePath}`);
              fs.unlinkSync(filePath);
              console.log(`Fichier supprimé: ${filePath}`);
              return true;
            }
          }
        } catch (e) {
          console.warn(`Erreur lors de la recherche dans le dossier uploads:`, e);
        }
      }
      
      return jsonFound;
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du contenu ${contentId}:`, error);
    return false;
  }
}

function uploadFile(contentId, file, originalName) {
  try {
    if (file) {
      const nets = os.networkInterfaces();
      let ipAddress = 'localhost';
      
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            ipAddress = net.address;
            break;
          }
        }
        if (ipAddress !== 'localhost') break;
      }
      
      const serverPort = process.env.API_PORT || 5000;
      const fullFileUrl = `http://${ipAddress}:${serverPort}/uploads/${file.filename}`;
      
      console.log(`Generated full file URL: ${fullFileUrl}`);
      
      return {
        success: true,
        filePath: file.path,
        url: fullFileUrl
      };
    }
    
    const filename = `${contentId}-${originalName || 'file'}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    if (Buffer.isBuffer(file)) {
      fs.writeFileSync(filePath, file);
      return {
        success: true,
        filePath: filePath,
        url: `/uploads/${filename}`
      };
    }
    
    return {
      success: false,
      message: 'Format de fichier non pris en charge'
    };
  } catch (error) {
    console.error(`Erreur lors de l'upload du fichier pour ${contentId}:`, error);
    return {
      success: false,
      message: error.message
    };
  }
}

function createApiServer(apiPort = 5000) {
  const app = express();
  
  app.use(express.json({ limit: '50mb' }));
  
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.options('*', cors());
  
  app.use('/uploads', express.static(UPLOADS_DIR));
  
  // Servir les fichiers statiques depuis node_modules reveal.js
  try {
    const revealJsPath = path.resolve(__dirname, '..', '..', 'node_modules', 'reveal.js');
    console.log(`API: Tentative de servir reveal.js depuis: ${revealJsPath}`);
    if (fs.existsSync(revealJsPath)) {
      app.use('/node_modules/reveal.js', express.static(revealJsPath));
      console.log('API: Répertoire reveal.js servi avec succès');
    } else {
      console.warn('API: Répertoire reveal.js non trouvé');
    }
  } catch (error) {
    console.error('API: Erreur lors de la configuration du répertoire statique pour reveal.js:', error);
  }
  
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Serveur d\'API Screen Streamer en ligne',
      endpoints: ['/api/status', '/api/start-server', '/api/stop-server', '/api/update-server', '/api/content', '/api/upload']
    });
  });
  
  app.get('/api', (req, res) => {
    res.json({
      status: 'ok',
      message: 'API Screen Streamer',
      version: '1.0.0',
      availableEndpoints: [
        'GET /api/status - État du serveur et liste des serveurs actifs',
        'GET /api/content - Liste de tous les contenus',
        'POST /api/upload - Upload d\'un fichier',
        'POST /api/content - Enregistrer un contenu',
        'GET /api/content/:contentId - Récupérer un contenu spécifique',
        'DELETE /api/content/:contentId - Supprimer un contenu',
        'POST /api/start-server - Démarrer un serveur d\'écran',
        'POST /api/stop-server - Arrêter un serveur d\'écran',
        'POST /api/update-server - Mettre à jour un serveur d\'écran'
      ]
    });
  });
  
  app.post('/api/upload', (req, res) => {
    console.log('Requête d\'upload reçue');
    
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      console.log(`Répertoire d'uploads recréé: ${UPLOADS_DIR}`);
    }

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
        
        // Récupérer les informations sur le réseau
        const nets = os.networkInterfaces();
        let ipAddress = 'localhost';
        
        for (const name of Object.keys(nets)) {
          for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
              ipAddress = net.address;
              break;
            }
          }
          if (ipAddress !== 'localhost') break;
        }
        
        // Construire l'URL complète du fichier
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
  
  app.post('/api/start-server', (req, res) => {
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
  
  app.post('/api/stop-server', (req, res) => {
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
  
  app.post('/api/update-server', (req, res) => {
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

  app.get('/api/status', (req, res) => {
    const serverStatus = Array.from(runningServers.entries()).map(([port, data]) => ({
      port,
      contentType: data.contentType || 'html'
    }));
    
    res.json({ 
      status: 'ok', 
      servers: serverStatus
    });
  });

  app.post('/api/content', (req, res) => {
    try {
      const { contentId, content } = req.body;
      
      if (!contentId || !content) {
        return res.status(400).json({ success: false, message: 'ID de contenu et données requis' });
      }
      
      console.log(`Sauvegarde du contenu ${contentId} via API POST`);
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
  
  app.get('/api/content/:contentId', (req, res) => {
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
  
  app.get('/api/content', (req, res) => {
    try {
      console.log('Récupération de tous les contenus via API GET');
      const contentList = listAllContent();
      res.json({ success: true, contentList });
    } catch (error) {
      console.error("Erreur dans /api/content (GET):", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  app.delete('/api/content/:contentId', (req, res) => {
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
  
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route non trouvée: ${req.method} ${req.url}`,
      availableEndpoints: [
        'GET /',
        'GET /api',
        'GET /api/status',
        'POST /api/upload',
        'POST /api/start-server',
        'POST /api/stop-server',
        'POST /api/update-server',
        'POST /api/content',
        'GET /api/content',
        'GET /api/content/:contentId',
        'DELETE /api/content/:contentId'
      ]
    });
  });

  app.use((err, req, res, next) => {
    console.error('Erreur interne du serveur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  });
  
  const server = app.listen(apiPort, '0.0.0.0', () => {
    console.log(`Serveur API démarré sur le port ${apiPort} (accessible sur toutes les interfaces réseau)`);
    console.log(`URL du serveur API: http://localhost:${apiPort}`);
    console.log(`Adresses IP accessibles:`);
    
    const nets = os.networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`  http://${net.address}:${apiPort}`);
        }
      }
    }
  });
  
  return server;
}

export {
  startServer,
  stopServer,
  updateServer,
  createApiServer,
  uploadFile
};
