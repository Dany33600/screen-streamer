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

function startServer(port, html) {
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
    
    app.get('/', (req, res) => {
      res.send(html);
    });
    
    app.get('/ping', (req, res) => {
      res.status(200).send('pong');
    });
    
    const server = createServer(app);
    
    server.listen(port, '0.0.0.0', () => {
      console.log(`Serveur démarré sur le port ${port}`);
    });
    
    runningServers.set(port, server);
    
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
    const server = runningServers.get(port);
    
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

function updateServer(port, html) {
  return startServer(port, html);
}

function saveContentData(contentId, contentData) {
  try {
    const contentPath = path.join(CONTENT_DIR, `${contentId}.json`);
    fs.writeFileSync(contentPath, JSON.stringify(contentData, null, 2));
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du contenu ${contentId}:`, error);
    return false;
  }
}

function getContentData(contentId) {
  try {
    const contentPath = path.join(CONTENT_DIR, `${contentId}.json`);
    if (fs.existsSync(contentPath)) {
      const data = fs.readFileSync(contentPath, 'utf8');
      return JSON.parse(data);
    }
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
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const contentId = file.replace('.json', '');
        const content = getContentData(contentId);
        if (content) {
          contentList.push(content);
        }
      }
    }
    
    return contentList;
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des contenus:', error);
    return [];
  }
}

function deleteContent(contentId) {
  try {
    const contentPath = path.join(CONTENT_DIR, `${contentId}.json`);
    if (fs.existsSync(contentPath)) {
      fs.unlinkSync(contentPath);
      return true;
    }
    return false;
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
          message: `Erreur lors de l'upload: ${err.message}` 
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
        const fullFileUrl = `http://${ipAddress}:${serverPort}/uploads/${req.file.filename}`;
        
        console.log(`Generated full file URL: ${fullFileUrl}`);
        
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
      const { port, html } = req.body;
      
      if (!port || !html) {
        return res.status(400).json({ success: false, message: 'Port et HTML requis' });
      }
      
      const success = startServer(port, html);
      
      if (success) {
        res.json({ success: true, message: `Serveur démarré sur le port ${port}` });
      } else {
        res.status(500).json({ success: false, message: `Échec du démarrage du serveur sur le port ${port}` });
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
      const { port, html } = req.body;
      
      if (!port || !html) {
        return res.status(400).json({ success: false, message: 'Port et HTML requis' });
      }
      
      const success = updateServer(port, html);
      
      if (success) {
        res.json({ success: true, message: `Serveur mis à jour sur le port ${port}` });
      } else {
        res.status(500).json({ success: false, message: `Échec de la mise à jour du serveur sur le port ${port}` });
      }
    } catch (error) {
      console.error("Erreur dans /api/update-server:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get('/api/status', (req, res) => {
    res.json({ 
      status: 'ok', 
      servers: Array.from(runningServers.keys())
    });
  });

  app.post('/api/content', (req, res) => {
    try {
      const { contentId, content } = req.body;
      
      if (!contentId || !content) {
        return res.status(400).json({ success: false, message: 'ID de contenu et données requis' });
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
  
  app.get('/api/content/:contentId', (req, res) => {
    try {
      const { contentId } = req.params;
      
      if (!contentId) {
        return res.status(400).json({ success: false, message: 'ID de contenu requis' });
      }
      
      const content = getContentData(contentId);
      
      if (content) {
        res.json({ success: true, content });
      } else {
        res.status(404).json({ success: false, message: `Contenu ${contentId} non trouvé` });
      }
    } catch (error) {
      console.error("Erreur dans /api/content/:contentId (GET):", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  app.get('/api/content', (req, res) => {
    try {
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
      
      const success = deleteContent(contentId);
      
      if (success) {
        res.json({ success: true, message: `Contenu ${contentId} supprimé avec succès` });
      } else {
        res.status(404).json({ success: false, message: `Contenu ${contentId} non trouvé ou erreur lors de la suppression` });
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
