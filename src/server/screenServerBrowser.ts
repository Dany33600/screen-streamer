
import { Content } from '@/types';
import { browserContentService } from '@/services/browserContentService';

/**
 * Version compatible navigateur du service de serveur d'écran
 * qui n'utilise pas Express
 */
class ScreenServerBrowserService {
  private runningServers = new Set<string>();

  startServer(screenId: string, port: number, content?: Content): boolean {
    console.log(`[Mock] Starting server for screen ${screenId} on port ${port}`);
    this.runningServers.add(screenId);
    
    if (content) {
      browserContentService.setContent(screenId, content);
    }
    
    return true;
  }

  stopServer(screenId: string): void {
    console.log(`[Mock] Stopping server for screen ${screenId}`);
    this.runningServers.delete(screenId);
    browserContentService.setContent(screenId, undefined);
  }

  updateServer(screenId: string, port: number, content?: Content): boolean {
    console.log(`[Mock] Updating server for screen ${screenId} on port ${port}`);
    
    if (content) {
      browserContentService.setContent(screenId, content);
    } else {
      browserContentService.setContent(screenId, undefined);
    }
    
    return true;
  }

  isServerRunning(screenId: string): boolean {
    return this.runningServers.has(screenId);
  }

  getServerContent(screenId: string): Content | undefined {
    return browserContentService.getContent(screenId);
  }
}

export const screenServerService = new ScreenServerBrowserService();
