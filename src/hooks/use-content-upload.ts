
import { useState } from 'react';
import { useAppStore } from '@/store';
import { ContentType } from '@/types';
import { toast } from 'sonner';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const useContentUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = useAppStore(state => state.apiUrl);

  const uploadContent = async (
    file: File,
    contentType: ContentType
  ): Promise<UploadResult> => {
    setIsLoading(true);

    try {
      if (!apiUrl) {
        throw new Error("L'URL de l'API n'est pas configurée");
      }
      
      console.log(`Uploading to API URL: ${apiUrl}/api/upload`);
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', contentType);
      formData.append('contentId', Date.now().toString()); // Use timestamp as temporary ID

      // Use the full API URL from the store
      const uploadUrl = `${apiUrl}/api/upload`;
      console.log(`Sending upload request to: ${uploadUrl}`);
      console.log(`File details: ${file.name}, size: ${file.size}, type: ${file.type}`);

      // Upload to server
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log(`Upload response status: ${response.status} ${response.statusText}`);
      
      // Traiter les erreurs HTTP
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si la réponse n'est pas un JSON valide, utiliser le texte brut
          try {
            errorMessage = await response.text();
          } catch (e2) {
            // Si on ne peut pas lire le texte non plus, garder le message d'erreur par défaut
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Upload response data:", data);

      if (!data.success) {
        throw new Error(data.message || "Échec de l'upload pour une raison inconnue");
      }

      return {
        success: true,
        url: data.url || data.filePath,
      };
    } catch (error) {
      console.error('Erreur d\'upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
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
