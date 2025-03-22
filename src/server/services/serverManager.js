
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import fs from 'fs';

// Map to track running servers
const runningServers = new Map();

// Start a screen server on a specific port
export function startServer(port, html, contentType = 'html') {
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
      const revealJsPath = path.resolve(__dirname, '..', '..', '..', 'node_modules', 'reveal.js');
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
    const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'storage', 'uploads');
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
    
    // Endpoint de ping pour vérifier que le serveur est en cours d'exécution
    app.get('/ping', (req, res) => {
      res.status(200).send('pong');
    });
    
    app.get('/status', (req, res) => {
      res.status(200).json({
        running: true,
        port,
        contentType,
        startTime: runningServers.get(port)?.startTime || new Date(),
      });
    });
    
    const server = createServer(app);
    
    server.listen(port, '0.0.0.0', () => {
      console.log(`Serveur démarré sur le port ${port} pour le contenu de type ${contentType}`);
    });
    
    runningServers.set(port, { 
      server, 
      contentType,
      startTime: new Date()
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors du démarrage du serveur sur le port ${port}:`, error);
    return false;
  }
}

// Stop a running server
export function stopServer(port) {
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

// Update an existing server
export function updateServer(port, html, contentType = 'html') {
  return startServer(port, html, contentType);
}

// Get all running servers
export function getRunningServers() {
  return Array.from(runningServers.entries()).map(([port, data]) => ({
    port,
    contentType: data.contentType || 'html',
    startTime: data.startTime || new Date(),
    uptime: data.startTime ? Math.floor((new Date() - data.startTime) / 1000) : 0 // uptime in seconds
  }));
}
