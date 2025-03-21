
import express from 'express';
import cors from 'cors';
import { Content } from '@/types';
import path from 'path';

interface ServerInstance {
  app: express.Application;
  server: any;
  port: number;
}

class ScreenServerService {
  private servers: Map<string, ServerInstance> = new Map();
  
  /**
   * Démarre un serveur pour un écran spécifique
   */
  startServer(screenId: string, port: number, content?: Content): boolean {
    try {
      // Vérifie si un serveur existe déjà pour cet écran
      if (this.servers.has(screenId)) {
        console.log(`Le serveur pour l'écran ${screenId} tourne déjà sur le port ${port}`);
        return true;
      }
      
      // Crée une nouvelle instance Express
      const app = express();
      
      // Configurer CORS pour permettre les requêtes depuis n'importe quelle origine
      app.use(cors());
      
      // Servir les fichiers statiques (pour les images, vidéos, etc.)
      app.use(express.static('public'));
      
      // Route principale qui affiche le contenu assigné à l'écran
      app.get('/', (req, res) => {
        res.send(this.generateHtml(content));
      });
      
      // Route pour vérifier l'état du serveur
      app.get('/status', (req, res) => {
        res.json({ status: 'online', screenId, content: content?.name || 'Aucun contenu' });
      });
      
      // Démarrer le serveur sur le port spécifié
      const server = app.listen(port, () => {
        console.log(`Serveur pour l'écran ${screenId} démarré sur le port ${port}`);
      });
      
      // Stocker l'instance du serveur
      this.servers.set(screenId, { app, server, port });
      
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Arrête le serveur pour un écran spécifique
   */
  stopServer(screenId: string): boolean {
    try {
      const serverInstance = this.servers.get(screenId);
      if (!serverInstance) {
        console.log(`Aucun serveur trouvé pour l'écran ${screenId}`);
        return false;
      }
      
      serverInstance.server.close(() => {
        console.log(`Serveur pour l'écran ${screenId} arrêté`);
      });
      
      this.servers.delete(screenId);
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Redémarre le serveur pour un écran avec un nouveau contenu
   */
  updateServer(screenId: string, port: number, content?: Content): boolean {
    this.stopServer(screenId);
    return this.startServer(screenId, port, content);
  }
  
  /**
   * Vérifie si un serveur est en cours d'exécution pour un écran spécifique
   */
  isServerRunning(screenId: string): boolean {
    return this.servers.has(screenId);
  }
  
  /**
   * Obtient le port d'un serveur en cours d'exécution
   */
  getServerPort(screenId: string): number | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance ? serverInstance.port : null;
  }
  
  /**
   * Génère le HTML pour afficher le contenu sur l'écran
   */
  private generateHtml(content?: Content): string {
    if (!content) {
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Écran - Aucun contenu</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #111;
              color: #fff;
              font-family: Arial, sans-serif;
              text-align: center;
            }
            .container {
              max-width: 80%;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 1rem;
            }
            p {
              font-size: 1.2rem;
              color: #aaa;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Aucun contenu assigné</h1>
            <p>Veuillez assigner du contenu à cet écran pour l'afficher.</p>
          </div>
        </body>
        </html>
      `;
    }
    
    // Déterminer le type de contenu
    switch (content.type) {
      case 'image':
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                background-color: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${content.url}" alt="${content.name}" />
          </body>
          </html>
        `;
        
      case 'video':
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                background-color: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              video {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <video src="${content.url}" autoplay loop controls></video>
          </body>
          </html>
        `;
        
      default:
        return `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Écran - ${content.name}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #111;
                color: #fff;
                font-family: Arial, sans-serif;
                text-align: center;
              }
              .container {
                max-width: 80%;
              }
              h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
              }
              p {
                font-size: 1.2rem;
                color: #aaa;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${content.name}</h1>
              <p>Type de contenu non pris en charge: ${content.type}</p>
            </div>
          </body>
          </html>
        `;
    }
  }
}

// Exporter une instance unique du service
export const screenServerService = new ScreenServerService();
