
import { useState } from 'react';
import { Screen } from '@/types';
import { useAppStore } from '@/store';
import { checkServerStatus } from '@/utils/server-status';

/**
 * Hook for checking server status of a screen
 */
export function useServerStatusCheck(screen: Screen) {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const updateScreen = useAppStore((state) => state.updateScreen);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiUrl = useAppStore((state) => state.apiUrl);
  
  /**
   * Function to verify server status
   */
  const verifyServerStatus = async (isCurrentlyOnline: boolean, contentId?: string): Promise<boolean | undefined> => {
    if (isCheckingStatus) return; // Prevent simultaneous checks
    
    try {
      setIsCheckingStatus(true);
      
      // Use the extracted utility function
      const isRunning = await checkServerStatus(
        screen,
        isCurrentlyOnline,
        apiUrl,
        baseIpAddress,
        contentId
      );
      
      // If state changed, update the screen
      if (isRunning !== isCurrentlyOnline) {
        updateScreen(screen.id, { status: isRunning ? 'online' : 'offline' });
        return isRunning;
      }
      
      return isCurrentlyOnline;
    } catch (error) {
      console.error("Error checking server status:", error);
      return isCurrentlyOnline;
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  return {
    isCheckingStatus,
    checkServerStatus: verifyServerStatus
  };
}
