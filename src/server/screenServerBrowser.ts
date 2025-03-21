
import { Content } from '@/types';
import { browserContentService } from '@/services/browserContentService';

/**
 * Version compatible navigateur du service de serveur d'écran
 * qui n'utilise pas Express
 */
class ScreenServerBrowserService {
  private runningServers = new Map<string, {port: number, content?: Content}>();

  startServer(screenId: string, port: number, content?: Content): boolean {
    console.log(`[Browser] Starting server for screen ${screenId} on port ${port}`);
    this.runningServers.set(screenId, {port, content});
    
    if (content) {
      browserContentService.setContent(screenId, content);
    }
    
    return true;
  }

  stopServer(screenId: string): void {
    console.log(`[Browser] Stopping server for screen ${screenId}`);
    this.runningServers.delete(screenId);
    browserContentService.setContent(screenId, undefined);
  }

  updateServer(screenId: string, port: number, content?: Content): boolean {
    console.log(`[Browser] Updating server for screen ${screenId} on port ${port}`);
    
    this.runningServers.set(screenId, {port, content});
    
    if (content) {
      browserContentService.setContent(screenId, content);
    }
    
    return true;
  }

  isServerRunning(screenId: string): boolean {
    return this.runningServers.has(screenId);
  }

  getServerContent(screenId: string): Content | undefined {
    const server = this.runningServers.get(screenId);
    return server?.content || browserContentService.getContent(screenId);
  }
}

export const screenServerService = new ScreenServerBrowserService();
