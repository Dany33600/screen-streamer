
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
console.log('IMPORTANT: Pour utiliser cette API:');
console.log('1. Assurez-vous que ce serveur est accessible depuis le navigateur');
console.log('2. Configurez l\'URL de l\'API dans les paramètres de l\'application');
console.log('3. URL de l\'API à utiliser: http://<adresse_ip>:5000');
console.log('Points de terminaison disponibles:');
console.log('  GET /api/status - État du serveur et liste des serveurs en cours d\'exécution');
console.log('  GET /api/ping - Vérification que le serveur API est en cours d\'exécution');
console.log('  GET /api/content - Liste de tous les contenus stockés');
console.log('  POST /api/upload - Upload d\'un fichier');
console.log('  POST /api/content - Enregistrer un contenu');
console.log('  GET /api/content/:contentId - Récupérer un contenu spécifique');
console.log('  DELETE /api/content/:contentId - Supprimer un contenu');
console.log('  POST /api/start-server - Démarrer un serveur d\'écran');
console.log('  POST /api/stop-server - Arrêter un serveur d\'écran');
console.log('  POST /api/update-server - Mettre à jour un serveur d\'écran');
console.log('-'.repeat(50));
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
