
import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { screenServerService } from '@/services/screenServerReal';
import { useAppStore } from '@/store';

interface PreviewControlsProps {
  isRefreshing: boolean;
  setIsRefreshing: (value: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  isRefreshing,
  setIsRefreshing,
  isFullscreen,
  setIsFullscreen,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error(`Impossible de passer en plein écran: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const refreshAllServers = async () => {
    setIsRefreshing(true);
    
    try {
      const state = useAppStore.getState();
      screenServerService.updateApiBaseUrl({
        baseIpAddress: state.baseIpAddress,
        apiIpAddress: state.apiIpAddress,
        apiPort: state.apiPort,
        useBaseIpForApi: state.useBaseIpForApi
      });
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
      
      toast.success("Rafraîchissement terminé", {
        description: "L'état des écrans a été actualisé"
      });
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      toast.error("Erreur", {
        description: "Impossible de rafraîchir l'état des écrans"
      });
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed top-0 right-4 z-10 p-4 flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleFullscreen}
      >
        {isFullscreen ? (
          <Minimize className="mr-2 h-4 w-4" />
        ) : (
          <Maximize className="mr-2 h-4 w-4" />
        )}
        {isFullscreen ? "Quitter" : "Plein écran"}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={refreshAllServers}
        disabled={isRefreshing}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Rafraîchir
      </Button>
    </div>
  );
};
