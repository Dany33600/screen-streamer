
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
      console.log(`Uploading to API URL: ${apiUrl}/api/upload`);
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', contentType);
      formData.append('contentId', Date.now().toString()); // Use timestamp as temporary ID

      // Use the full API URL from the store
      const uploadUrl = `${apiUrl}/api/upload`;
      console.log(`Sending upload request to: ${uploadUrl}`);

      // Upload to server
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Upload response:", data);

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
