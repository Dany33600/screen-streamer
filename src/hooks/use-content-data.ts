
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Content } from '@/types';
import { toast } from 'sonner';

export const useContentData = () => {
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  const apiUrl = useAppStore((state) => state.apiUrl);

  // Fonction pour obtenir l'URL de l'API formatée correctement
  const getFormattedApiUrl = () => {
    // Utiliser directement l'URL préformatée du store
    return apiUrl;
  };

  // Requête pour récupérer les contenus
  const { 
    data: serverContents, 
    isLoading, 
    error, 
    refetch: refetchContents 
  } = useQuery({
    queryKey: ['contents', apiUrl], // Ajouter apiUrl comme dépendance pour le refetch automatique
    queryFn: async () => {
      const formattedApiUrl = getFormattedApiUrl();
      console.log(`Récupération des contenus depuis: ${formattedApiUrl}/content`);
      
      try {
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

  return {
    serverContents: serverContents || [],
    isLoading,
    error,
    refetchContents
  };
};
