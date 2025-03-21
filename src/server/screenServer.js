
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os'; // Import os at the top with other imports

// Obtenir le chemin du répertoire actuel en utilisant ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le répertoire de stockage
const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage');
const CONTENT_DIR = path.join(STORAGE_DIR, 'content');

// Créer les répertoires de stockage s'ils n'existent pas
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

// Map pour stocker les serveurs en cours d'exécution
const runningServers = new Map();

/**
 * Démarre un nouveau serveur HTTP sur le port spécifié
 */
function startServer(port, html) {
  // Si un serveur existe déjà sur ce port, on l'arrête d'abord
  if (runningServers.has(port)) {
    stopServer(port);
  }
  
  try {
    // Créer une nouvelle application Express
    const app = express();
    
    // Activer CORS pour permettre les requêtes cross-origin
    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Route principale qui sert le HTML
    app.get('/', (req, res) => {
      res.send(html);
    });
    
    // Route de ping pour vérifier si le serveur est en vie
    app.get('/ping', (req, res) => {
      res.status(200).send('pong');
    });
    
    // Créer un serveur HTTP
    const server = createServer(app);
    
    // Démarrer le serveur sur le port spécifié
    server.listen(port, '0.0.0.0', () => {
      console.log(`Serveur démarré sur le port ${port}`);
    });
    
    // Stocker le serveur dans la map
    runningServers.set(port, server);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors du démarrage du serveur sur le port ${port}:`, error);
    return false;
  }
}

/**
 * Arrête un serveur HTTP en cours d'exécution
 */
function stopServer(port) {
  if (!runningServers.has(port)) {
    console.log(`Aucun serveur en cours d'exécution sur le port ${port}`);
    return false;
  }
  
  try {
    const server = runningServers.get(port);
    
    // Fermer le serveur
    server.close(() => {
      console.log(`Serveur arrêté sur le port ${port}`);
    });
    
    // Supprimer le serveur de la map
    runningServers.delete(port);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'arrêt du serveur pour le port ${port}:`, error);
    return false;
  }
}

/**
 * Met à jour le contenu d'un serveur en cours d'exécution
 */
function updateServer(port, html) {
  // Arrêter puis redémarrer le serveur avec le nouveau contenu
  // C'est une approche simple mais efficace pour mettre à jour le contenu
  return startServer(port, html);
}

/**
 * Sauvegarde les données du contenu sur le serveur
 */
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

/**
 * Récupère les données du contenu depuis le serveur
 */
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

/**
 * Liste tous les contenus stockés sur le serveur
 */
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

/**
 * Supprime un contenu stocké sur le serveur
 */
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

// Créer un serveur API pour gérer les serveurs d'écran
function createApiServer(apiPort = 5000) {
  const app = express();
  
  // Parser JSON
  app.use(express.json({ limit: '50mb' }));
  
  // Activer CORS avec une configuration plus permissive
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Middleware pour gérer les erreurs CORS préflight
  app.options('*', cors());
  
  // Route racine pour montrer que le serveur fonctionne
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Serveur d\'API Screen Streamer en ligne',
      endpoints: ['/api/status', '/api/start-server', '/api/stop-server', '/api/update-server']
    });
  });
  
  // Route pour démarrer un serveur
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
  
  // Route pour arrêter un serveur
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
  
  // Route pour mettre à jour un serveur
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

  // Route de diagnostic pour vérifier si le serveur API est en vie
  app.get('/api/status', (req, res) => {
    res.json({ 
      status: 'ok', 
      servers: Array.from(runningServers.keys())
    });
  });

  // Routes pour la gestion des contenus
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
  
  // Middleware pour gérer les erreurs 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route non trouvée: ${req.method} ${req.url}`,
      availableEndpoints: [
        'GET /',
        'GET /api/status',
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

  // Middleware pour gérer les erreurs internes
  app.use((err, req, res, next) => {
    console.error('Erreur interne du serveur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  });
  
  // Démarrer le serveur API
  const server = app.listen(apiPort, '0.0.0.0', () => {
    console.log(`Serveur API démarré sur le port ${apiPort} (accessible sur toutes les interfaces réseau)`);
    console.log(`URL du serveur API: http://localhost:${apiPort}`);
    console.log(`Adresses IP accessibles:`);
    
    // Afficher toutes les adresses IP du système
    const nets = os.networkInterfaces(); // Use the imported os module instead of require
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Ignorer les adresses non IPv4 et localhost
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`  http://${net.address}:${apiPort}`);
        }
      }
    }
  });
  
  return server;
}

// Exporter les fonctions
export {
  startServer,
  stopServer,
  updateServer,
  createApiServer
};
