import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import { screenServerService } from '@/services/screenServerReal';
import { PreviewHeader } from '@/components/preview/PreviewHeader';
import { PreviewControls } from '@/components/preview/PreviewControls';
import { ScreenGrid } from '@/components/preview/ScreenGrid';

const PreviewPage = () => {
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const refreshInterval = useAppStore((state) => state.refreshInterval);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const refreshAllServers = async () => {
    setIsRefreshing(true);
    
    try {
      const state = useAppStore.getState();
      screenServerService.updateApiBaseUrl({
        apiUrl: state.apiUrl,
        baseIpAddress: state.baseIpAddress,
        apiIpAddress: state.apiIpAddress,
        useBaseIpForApi: state.useBaseIpForApi
      });
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    refreshAllServers();
    
    const intervalMs = refreshInterval * 60 * 1000;
    
    const intervalId = setInterval(refreshAllServers, intervalMs);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval]);
  
  return (
    <div className="relative min-h-screen bg-background">
      <PreviewHeader refreshInterval={refreshInterval} />
      
      <PreviewControls 
        isRefreshing={isRefreshing}
        setIsRefreshing={setIsRefreshing}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
      />
      
      <div className="pt-28 px-4 pb-4 flex justify-center min-h-screen">
        <div className="w-full max-w-7xl">
          <ScreenGrid screens={screens} contents={contents} />
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
