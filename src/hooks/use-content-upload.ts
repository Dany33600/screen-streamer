
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
  const apiUrl = useAppStore(state => state.apiUrl);
  const baseIpAddress = useAppStore(state => state.baseIpAddress);

  const uploadContent = async (
    file: File,
    contentType: ContentType
  ): Promise<UploadResult> => {
    setIsLoading(true);

    try {
      if (!apiUrl) {
        throw new Error("L'URL de l'API n'est pas configurée");
      }
      
      // Use the IP address from the app configuration rather than localhost
      const formattedApiUrl = apiUrl.replace('localhost', baseIpAddress);
      
      // Ensure the API URL doesn't have trailing slashes
      const baseUrl = formattedApiUrl.endsWith('/') 
        ? formattedApiUrl.slice(0, -1) 
        : formattedApiUrl;
      
      console.log(`Using IP address from config: ${baseIpAddress}`);
      console.log(`Uploading to API URL: ${baseUrl}/api/upload`);
      
      // Générer un ID de contenu basé sur l'horodatage et le nom du fichier (pour être plus unique)
      const timestamp = Date.now();
      // Supprimer les caractères spéciaux et les espaces du nom de fichier pour éviter les problèmes
      const safeFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const contentId = `${timestamp}-${safeFileName}`;
      console.log(`Génération d'un content ID: ${contentId}`);
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', contentType);
      formData.append('contentId', contentId);
      formData.append('originalName', file.name);

      // Use the full API URL from the store
      const uploadUrl = `${baseUrl}/api/upload`;
      console.log(`Sending upload request to: ${uploadUrl}`);
      console.log(`File details: ${file.name}, size: ${file.size}, type: ${file.type}`);

      // Upload to server
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Add explicit handling of CORS
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
          // If the response is not valid JSON, use the raw text
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

      // Extraire le baseApiUrl (sans /api) pour accéder aux fichiers statiques
      const apiBaseWithoutPath = baseUrl.split('/api')[0];
      
      // Construire l'URL complète avec l'adresse IP et le port
      // Si l'URL commence par un slash, supprimer le slash pour éviter les doubles slashes
      const fileUrl = data.url || data.filePath;
      const fullFileUrl = fileUrl.startsWith('http') 
        ? fileUrl // Si l'URL est déjà complète (commence par http), utiliser telle quelle
        : fileUrl.startsWith('/') 
          ? `${apiBaseWithoutPath}${fileUrl}`
          : `${apiBaseWithoutPath}/${fileUrl}`;
      
      console.log("Generated full file URL:", fullFileUrl);

      // Vérifier si le contenu a été correctement créé en appelant l'API pour récupérer les détails
      console.log(`Vérification de la création du contenu avec ID: ${contentId}`);
      try {
        // Attendre un moment pour que le serveur ait le temps de traiter le fichier et créer l'entrée
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const contentCheckUrl = `${baseUrl}/api/content/${contentId}`;
        console.log(`Requête de vérification du contenu: ${contentCheckUrl}`);
        
        const contentCheckResponse = await fetch(contentCheckUrl);
        if (contentCheckResponse.ok) {
          const contentData = await contentCheckResponse.json();
          console.log("Le contenu a été correctement enregistré sur le serveur:", contentData);
        } else {
          console.warn(`Le contenu n'a pas pu être vérifié (${contentCheckResponse.status}), mais l'upload a réussi`);
          
          // Si le contenu n'est pas trouvé, essayons d'enregistrer manuellement les métadonnées
          const contentRegisterUrl = `${baseUrl}/api/content`;
          console.log(`Tentative d'enregistrement manuel du contenu: ${contentRegisterUrl}`);
          
          const contentRegisterResponse = await fetch(contentRegisterUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contentId,
              content: {
                id: contentId,
                name: file.name,
                type: contentType,
                url: fullFileUrl,
                createdAt: Date.now()
              }
            }),
          });
          
          if (contentRegisterResponse.ok) {
            console.log("Le contenu a été manuellement enregistré sur le serveur.");
          } else {
            console.warn("Échec de l'enregistrement manuel du contenu.");
          }
        }
      } catch (checkError) {
        console.warn("Erreur lors de la vérification du contenu:", checkError);
      }

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
