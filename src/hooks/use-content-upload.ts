
import { useState } from 'react';
import { useAppStore } from '@/store';
import { ContentType } from '@/types';
import { toast } from 'sonner';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  contentId?: string;
}

export const useContentUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const getApiUrl = useAppStore(state => state.getApiUrl);
  const baseIpAddress = useAppStore(state => state.baseIpAddress);
  const apiIpAddress = useAppStore(state => state.apiIpAddress);
  const useBaseIpForApi = useAppStore(state => state.useBaseIpForApi);

  const uploadContent = async (
    file: File,
    contentType: ContentType
  ): Promise<UploadResult> => {
    setIsLoading(true);

    try {
      // Determine which IP address to use
      const ipToUse = useBaseIpForApi ? baseIpAddress : apiIpAddress;
      
      // Build the base API URL with the correct IP
      const baseUrl = `http://${ipToUse}:5000`;
      const uploadUrl = `${baseUrl}/api/upload`;

      console.log(`Using IP address for API: ${ipToUse}`);
      console.log(`Uploading to URL: ${uploadUrl}`);
      
      // Générer un ID de contenu basé sur l'horodatage et le nom du fichier
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const contentId = `${timestamp}-${safeFileName}`;
      console.log(`Génération d'un content ID: ${contentId}`);
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', contentType);
      formData.append('contentId', contentId);
      formData.append('originalName', file.name);

      // Upload to server
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'same-origin',
      });

      console.log(`Upload response status: ${response.status} ${response.statusText}`);
      
      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si la réponse n'est pas du JSON valide
          try {
            errorMessage = await response.text();
          } catch (e2) {
            // Si on ne peut pas lire le texte non plus
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Upload response data:", data);

      if (!data.success) {
        throw new Error(data.message || "Échec de l'upload pour une raison inconnue");
      }

      // Construire l'URL complète avec l'adresse IP et le port
      const fileUrl = data.url || data.filePath;
      const fullFileUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : fileUrl.startsWith('/') 
          ? `${baseUrl}${fileUrl}`
          : `${baseUrl}/${fileUrl}`;
      
      console.log("Generated full file URL:", fullFileUrl);
      
      toast.success(`Fichier "${file.name}" uploadé avec succès`);
      
      return {
        success: true,
        url: fullFileUrl,
        contentId: contentId,
      };
    } catch (error) {
      console.error('Erreur d\'upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      toast.error(`Erreur d'upload: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadContent,
    isLoading,
  };
};
