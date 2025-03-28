
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { Content } from '@/types';
import { screenServerService } from '@/services/screenServerReal';

export function useContentData() {
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  const [serverContents, setServerContents] = useState<Content[]>([]);
  
  // Get the appropriate IP address based on configuration
  const ipToUse = useBaseIpForApi ? baseIpAddress : apiIpAddress;
  const apiUrl = `http://${ipToUse}:${apiPort}/api`;
  
  // Récupérer la liste des contenus depuis le serveur
  const { 
    data: serverContentData, 
    isLoading: isLoadingContents, 
    error: contentsError,
    refetch: refetchContents
  } = useQuery({
    queryKey: ['contents', apiUrl, ipToUse, apiPort],
    queryFn: async () => {
      if (!apiUrl) throw new Error("L'URL de l'API n'est pas configurée");
      
      // Update API URL with store values
      screenServerService.updateApiBaseUrl({
        baseIpAddress,
        apiIpAddress,
        apiPort,
        useBaseIpForApi
      });
      
      // Fix: Remove duplicate 'api' in the URL
      const response = await fetch(`${apiUrl}/content`);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des contenus: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.contentList : [];
    },
    enabled: !!apiUrl,
    retry: 2,
  });

  // Mettre à jour les contenus du serveur quand les données sont chargées
  useEffect(() => {
    if (serverContentData) {
      setServerContents(serverContentData);
    }
  }, [serverContentData]);

  return {
    serverContents,
    isLoadingContents,
    contentsError,
    refetchContents
  };
}
