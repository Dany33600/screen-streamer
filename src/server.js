
// Script de démarrage du serveur Express pour les écrans
const { createApiServer } = require('./server/screenServer');

// Port sur lequel le serveur API sera accessible
const API_PORT = process.env.API_PORT || 5000;

// Créer et démarrer le serveur API
const server = createApiServer(API_PORT);

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('Arrêt du serveur API...');
  server.close(() => {
    console.log('Serveur API arrêté');
    process.exit(0);
  });
});

console.log(`Serveur API démarré sur le port ${API_PORT}`);
console.log(`Pour arrêter le serveur, appuyez sur Ctrl+C`);
