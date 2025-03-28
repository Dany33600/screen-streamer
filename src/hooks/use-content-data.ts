
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Content } from '@/types';
import { toast } from 'sonner';
import { configService } from '@/services/config/configService';

export const useContentData = () => {
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  
  // Fonction pour obtenir l'URL de l'API formatée correctement
  const getFormattedApiUrl = () => {
    const ipToUse = useBaseIpForApi ? baseIpAddress : apiIpAddress;
    const apiUrl = `http://${ipToUse}:${apiPort}/api`;
    console.log(`useContentData: URL de l'API générée: ${apiUrl}`);
    return apiUrl;
  };

  // Requête pour récupérer les contenus
  const { 
    data: serverContents, 
    isLoading, 
    error, 
    refetch: refetchContents 
  } = useQuery({
    queryKey: ['contents', baseIpAddress, apiIpAddress, apiPort, useBaseIpForApi], // Dépendances pour le refetch automatique
    queryFn: async () => {
      const formattedApiUrl = getFormattedApiUrl();
      console.log(`Récupération des contenus depuis: ${formattedApiUrl}/content`);
      
      try {
        // Mettre à jour l'URL de l'API dans configService pour s'assurer qu'elle est à jour
        configService.updateApiBaseUrl({
          baseIpAddress,
          apiPort,
          apiIpAddress,
          useBaseIpForApi
        });
        
        const response = await fetch(`${formattedApiUrl}/content`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data.contentList || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des contenus:', error);
        toast.error('Erreur', { 
          description: 'Impossible de charger les contenus depuis le serveur'
        });
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  // S'assurer que la configuration de l'API est à jour quand les paramètres changent
  useEffect(() => {
    configService.updateApiBaseUrl({
      baseIpAddress,
      apiPort,
      apiIpAddress,
      useBaseIpForApi
    });
  }, [baseIpAddress, apiPort, apiIpAddress, useBaseIpForApi]);

  return {
    serverContents: serverContents || [],
    isLoading,
    error,
    refetchContents
  };
};
