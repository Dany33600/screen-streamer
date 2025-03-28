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

/**
 * Check server API status
 */
export async function checkServerStatus({ ipAddress, port }: { ipAddress: string, port: number }): Promise<{ ipReachable: boolean, serverRunning: boolean }> {
  try {
    console.log(`Checking API server status at ${ipAddress}:${port}`);
    
    // Try to fetch the API status endpoint
    const response = await fetch(`http://${ipAddress}:${port}/api/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Short timeout to quickly determine if the server is responsive
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      console.log('API server is running and accessible');
      return { ipReachable: true, serverRunning: true };
    } else {
      console.log(`API server responded with status ${response.status}`);
      return { ipReachable: true, serverRunning: false };
    }
  } catch (error) {
    console.error('Error checking API server status:', error);
    
    // Determine if it's a network error or the server is just not running
    if (error instanceof TypeError && (error.message.includes('NetworkError') || error.message.includes('Failed to fetch'))) {
      // Network error - could be that the IP is unreachable
      return { ipReachable: false, serverRunning: false };
    }
    
    // Other errors - likely the server is reachable but not running or responding properly
    return { ipReachable: true, serverRunning: false };
  }
}
