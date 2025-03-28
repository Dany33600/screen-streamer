
import { useState } from 'react';
import { Screen } from '@/types';
import { checkServerStatus } from '@/utils/server-status';
import { toast } from '@/hooks/use-toast';

// Define the return type for server check
export interface ServerCheckResult {
  ipReachable: boolean;
  serverRunning: boolean;
}

/**
 * Hook for checking server status of a screen
 */
export function useServerStatusCheck(screen?: Screen) {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  // Get store functions lazily to avoid circular dependencies
  const getStoreState = () => {
    const { useAppStore } = require('@/store');
    return useAppStore.getState();
  };
  
  /**
   * Function to verify server status
   */
  const verifyServerStatus = async (isCurrentlyOnline: boolean, contentId?: string): Promise<boolean | undefined> => {
    if (isCheckingStatus || !screen) return; // Prevent simultaneous checks or if no screen
    
    try {
      setIsCheckingStatus(true);
      
      const { baseIpAddress, updateScreen } = getStoreState();
      
      // Use the extracted utility function
      const isRunning = await checkServerStatus(
        screen,
        isCurrentlyOnline,
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
  
  /**
   * Function to check API connection
   */
  const checkServerConnection = async (): Promise<ServerCheckResult> => {
    setIsCheckingStatus(true);
    
    try {
      const { baseIpAddress, apiPort } = getStoreState();
      
      console.log('Checking server connection to API...');
      const ipAddressToCheck = baseIpAddress;
      const portToCheck = apiPort;
      
      // First check if the IP is reachable
      const ipReachable = await isIpReachable(ipAddressToCheck, portToCheck);
      
      // If IP is reachable, check if the API server is running
      let serverRunning = false;
      if (ipReachable) {
        serverRunning = await isApiServerRunning(ipAddressToCheck, portToCheck);
      }
      
      return {
        ipReachable,
        serverRunning
      };
    } catch (error) {
      console.error("Error checking server connection:", error);
      return {
        ipReachable: false,
        serverRunning: false
      };
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  /**
   * Helper function to check if an IP is reachable
   */
  const isIpReachable = async (ip: string, port: number): Promise<boolean> => {
    try {
      // We use a simple ping endpoint to check if the IP is reachable
      // In a real scenario, you'd use an actual ping operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`http://${ip}:${port}/ping`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error(`Error checking if IP ${ip} is reachable:`, error);
      return false;
    }
  };
  
  /**
   * Helper function to check if the API server is running
   */
  const isApiServerRunning = async (ip: string, port: number): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`http://${ip}:${port}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error(`Error checking if API server is running on ${ip}:${port}:`, error);
      return false;
    }
  };
  
  return {
    isCheckingStatus,
    checkServerStatus: verifyServerStatus,
    checkServerConnection
  };
}
