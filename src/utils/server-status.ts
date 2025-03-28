
import { Screen } from '@/types';
import { screenServerService } from '@/services/screenServerReal';

/**
 * Utility function for checking server status
 */
export async function checkServerStatus(
  screen: Screen, 
  isCurrentlyOnline: boolean, 
  baseIpAddress: string,
  contentId?: string
): Promise<boolean> {
  console.log(`Checking server status for screen ${screen.name} (${screen.id})`);
  
  // Ensure the service uses the current IP address
  screenServerService.updateApiBaseUrl({
    baseIpAddress,
    apiIpAddress: baseIpAddress,
    useBaseIpForApi: true
  });
  
  // Check if the server is running internally
  const isRunning = screenServerService.isServerRunning(screen.id);
  console.log(`Internal server state for screen ${screen.name}: ${isRunning ? 'online' : 'offline'}`);
  
  // If our local state differs from the actual server state, update it
  if (isRunning !== isCurrentlyOnline) {
    console.log(`Server state for screen ${screen.name} (${screen.id}) changed: ${isRunning ? 'online' : 'offline'}`);
    return isRunning;
  }
  
  // If the server is supposed to be running, verify it's responding
  if (isRunning) {
    console.log(`Verifying server responsiveness for screen ${screen.name} on port ${screen.port}`);
    const isResponding = await screenServerService.checkServerStatus(screen.port);
    console.log(`Server for screen ${screen.name} responding? ${isResponding ? 'Yes' : 'No'}`);
    
    if (!isResponding && contentId) {
      console.log(`Server for screen ${screen.name} not responding, attempting restart...`);
      
      // Update screen IP address with configuration IP if different
      if (screen.ipAddress !== baseIpAddress) {
        console.log(`Updating screen IP address: ${screen.ipAddress} -> ${baseIpAddress}`);
      }
    }
  }
  
  return isCurrentlyOnline;
}
