
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeStorageDirectories, UPLOADS_DIR, getLocalIpAddresses, uploadFile } from './utils/fileStorage.js';
import apiRoutes from './routes/apiRoutes.js';
import { startServer, stopServer, updateServer } from './services/serverManager.js';

// Recréer l'équivalent de __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize storage directories
initializeStorageDirectories();

/**
 * Creates and starts the API server for screens
 */
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
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Serveur d\'API Screen Streamer en ligne',
      endpoints: ['/api/status', '/api/start-server', '/api/stop-server', '/api/update-server', '/api/content', '/api/upload']
    });
  });
  
  // API info endpoint
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
  
  // Route pour l'upload de fichiers directement à la racine de l'API
  app.post('/api/upload', (req, res) => {
    // Rediriger vers le gestionnaire approprié dans contentRoutes
    console.log('API: Upload de fichier reçu, redirection vers le gestionnaire approprié');
    apiRoutes(req, res);
  });
  
  // Mount API routes
  app.use('/api', apiRoutes);
  
  // 404 handler
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

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Erreur interne du serveur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  });
  
  // Start the server
  const server = app.listen(apiPort, '0.0.0.0', () => {
    console.log(`Serveur API démarré sur le port ${apiPort} (accessible sur toutes les interfaces réseau)`);
    console.log(`URL du serveur API: http://localhost:${apiPort}`);
    console.log(`Adresses IP accessibles:`);
    
    const addresses = getLocalIpAddresses();
    
    for (const address of addresses) {
      console.log(`  http://${address}:${apiPort}`);
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
