
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');

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
    app.use(cors());
    
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
    server.listen(port, () => {
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
    console.error(`Erreur lors de l'arrêt du serveur sur le port ${port}:`, error);
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

// Créer un serveur API pour gérer les serveurs d'écran
function createApiServer(apiPort = 5000) {
  const app = express();
  
  // Parser JSON
  app.use(express.json());
  
  // Activer CORS
  app.use(cors());
  
  // Route pour démarrer un serveur
  app.post('/api/start-server', (req, res) => {
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
  });
  
  // Route pour arrêter un serveur
  app.post('/api/stop-server', (req, res) => {
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
  });
  
  // Route pour mettre à jour un serveur
  app.post('/api/update-server', (req, res) => {
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
  });
  
  // Démarrer le serveur API
  const server = app.listen(apiPort, () => {
    console.log(`Serveur API démarré sur le port ${apiPort}`);
  });
  
  return server;
}

// Exporter les fonctions
module.exports = {
  startServer,
  stopServer,
  updateServer,
  createApiServer
};
