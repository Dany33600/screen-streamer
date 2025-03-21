
import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Content } from '@/types';
import { htmlGenerator } from '@/services/htmlGenerator';

interface ServerInstance {
  server: http.Server;
  port: number;
  content?: Content;
}

class ScreenServerService {
  private servers: Map<string, ServerInstance> = new Map();

  /**
   * Démarre un serveur réel pour un écran spécifique
   */
  startServer(screenId: string, port: number, content?: Content): boolean {
    try {
      // Si un serveur existe déjà, on l'arrête d'abord
      if (this.servers.has(screenId)) {
        this.stopServer(screenId);
      }
      
      console.log(`Démarrage du serveur pour l'écran ${screenId} sur le port ${port}`);
      
      // Créer une application Express
      const app = express();
      
      // Configurer CORS pour permettre à tous les clients de se connecter
      app.use(cors());
      
      // Route principale pour servir le contenu HTML
      app.get('/', (req: Request, res: Response) => {
        const serverInstance = this.servers.get(screenId);
        const html = htmlGenerator.generateHtml(serverInstance?.content);
        res.send(html);
      });
      
      // Route d'API pour vérifier l'état du serveur
      app.get('/api/status', (req: Request, res: Response) => {
        res.json({ status: 'online', screenId, content: this.servers.get(screenId)?.content?.name });
      });
      
      // Démarrer le serveur HTTP
      const server = http.createServer(app);
      
      // Démarrer le serveur sur le port spécifié
      server.listen(port, () => {
        console.log(`Serveur pour l'écran ${screenId} démarré sur le port ${port}`);
      });
      
      // Stocker l'instance du serveur
      this.servers.set(screenId, { server, port, content });
      
      return true;
    } catch (error) {
      console.error(`Erreur lors du démarrage du serveur pour l'écran ${screenId}:`, error);
      return false;
    }
  }
  
  /**
   * Arrête le serveur
   */
  stopServer(screenId: string): boolean {
    try {
      const serverInstance = this.servers.get(screenId);
      
      if (!serverInstance) {
        console.log(`Aucun serveur trouvé pour l'écran ${screenId}`);
        return false;
      }
      
      console.log(`Arrêt du serveur pour l'écran ${screenId}`);
      
      // Fermer le serveur HTTP
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
   * Met à jour le serveur
   */
  updateServer(screenId: string, port: number, content?: Content): boolean {
    this.stopServer(screenId);
    return this.startServer(screenId, port, content);
  }
  
  /**
   * Vérifie si un serveur est en cours d'exécution
   */
  isServerRunning(screenId: string): boolean {
    return this.servers.has(screenId);
  }
  
  /**
   * Obtient le port d'un serveur
   */
  getServerPort(screenId: string): number | null {
    const serverInstance = this.servers.get(screenId);
    return serverInstance ? serverInstance.port : null;
  }
}

// Exporter une instance unique du service
export const screenServerService = new ScreenServerService();
