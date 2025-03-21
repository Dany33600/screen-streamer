
import { useState } from 'react';
import { Content, ContentType } from '@/types';
import { useConfig } from '@/hooks/use-config';
import { toast } from 'sonner';
import { useAppStore } from '@/store';

export function useContentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileURL, setSelectedFileURL] = useState<string>('');
  const [contentName, setContentName] = useState('');
  const [contentType, setContentType] = useState<ContentType>('image');
  
  const addContent = useAppStore((state) => state.addContent);
  const { serverUrl } = useConfig();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedFileURL(url);
    setContentName(file.name);
    
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      setContentType('image');
    } else if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
      setContentType('video');
    } else if (['ppt', 'pptx'].includes(extension)) {
      setContentType('powerpoint');
    } else if (extension === 'pdf') {
      setContentType('pdf');
    } else if (['html', 'htm'].includes(extension)) {
      setContentType('html');
    }
  };

  const uploadContent = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return false;
    }
    
    if (contentName.trim() === '') {
      toast.error('Le nom du contenu ne peut pas être vide');
      return false;
    }

    if (!serverUrl) {
      toast.error('URL du serveur API non configurée');
      return false;
    }
    
    // Vérifier si l'URL du serveur est accessible
    try {
      // Ping rapide pour vérifier si le serveur est accessible
      const pingResponse = await fetch(`${serverUrl}/api/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Important: ajouter un timeout pour ne pas bloquer trop longtemps
        signal: AbortSignal.timeout(5000)
      });
      
      if (!pingResponse.ok) {
        throw new Error(`Le serveur a répondu avec le statut: ${pingResponse.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du serveur:', error);
      
      let errorMessage = 'Impossible de se connecter au serveur API';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
      toast.error(`Vérifiez que l'URL du serveur (${serverUrl}) est correcte et que le serveur est démarré.`);
      return false;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      console.log(`Tentative d'upload vers ${serverUrl}/api/upload`);
      
      const uploadResponse = await fetch(`${serverUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || `Erreur lors de l'upload du fichier (${uploadResponse.status})`);
      }
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Erreur lors de l\'upload du fichier');
      }
      
      const fileInfo = uploadResult.file;
      
      // Convert the metadata object to a JSON string
      const metadataString = JSON.stringify({
        filePath: fileInfo.path,
        serverUrl: serverUrl,
        size: fileInfo.size
      });
      
      // Ajouter le contenu au store
      addContent(
        contentName,
        contentType, 
        fileInfo.url,
        metadataString
      );
      
      resetForm();
      toast.success(`Contenu "${contentName}" ajouté avec succès`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Problème lors de l\'upload'}`);
      return false;
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetForm = () => {
    setSelectedFile(null);
    setSelectedFileURL('');
    setContentName('');
    setContentType('image');
  };

  return {
    isUploading,
    selectedFile,
    selectedFileURL,
    contentName,
    contentType,
    handleFileChange,
    uploadContent,
    resetForm,
    setContentName,
    setContentType
  };
}
