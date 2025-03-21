
// Script de démarrage du serveur Express pour les écrans
import { createApiServer } from './server/screenServer.js';
import os from 'os';

// Port sur lequel le serveur API sera accessible
const API_PORT = process.env.API_PORT || 5000;

// Créer et démarrer le serveur API
const server = createApiServer(API_PORT);

// Afficher un message informatif pour l'utilisateur
console.log('='.repeat(50));
console.log('Screen Streamer API Server');
console.log('='.repeat(50));
console.log(`Le serveur API est démarré sur le port ${API_PORT}`);
console.log('Adresses IP disponibles sur ce serveur:');

// Afficher toutes les adresses IP du système
const nets = os.networkInterfaces();
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Ignorer les adresses non IPv4 et localhost
    if (net.family === 'IPv4' && !net.internal) {
      console.log(`  http://${net.address}:${API_PORT}`);
    }
  }
}

console.log('-'.repeat(50));
console.log('IMPORTANT: Utilisez l\'une de ces adresses IP dans votre application');
console.log('Pour arrêter le serveur, appuyez sur Ctrl+C');
console.log('='.repeat(50));

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('Arrêt du serveur API...');
  server.close(() => {
    console.log('Serveur API arrêté');
    process.exit(0);
  });
});
