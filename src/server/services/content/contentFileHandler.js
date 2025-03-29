
import fs from 'fs';
import path from 'path';
import { UPLOADS_DIR } from '../../utils/fileStorage.js';

// Supprime un fichier physique associé à un contenu
export function deletePhysicalFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Fichier physique supprimé: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier physique ${filePath}:`, error);
    return false;
  }
}

// Tente de supprimer un fichier physique par son URL ou son ID
export function tryDeletePhysicalFileFromUrl(url, contentId) {
  try {
    if (url) {
      // Extraire le nom du fichier depuis l'URL
      const fileName = url.split('/').pop();
      if (fileName) {
        const filePath = path.join(UPLOADS_DIR, fileName);
        console.log(`Tentative de suppression du fichier physique: ${filePath}`);
        if (deletePhysicalFile(filePath)) {
          return true;
        }
      }
    }
    
    // Tentative avec l'ID comme nom de fichier
    if (contentId) {
      const exactFilePath = path.join(UPLOADS_DIR, contentId);
      if (deletePhysicalFile(exactFilePath)) {
        return true;
      }
    }
    
    // Si aucun des deux n'a fonctionné, parcourir le dossier uploads
    if (contentId) {
      console.log(`Recherche directe dans le dossier uploads pour des fichiers correspondant à l'ID: ${contentId}`);
      const uploadFiles = fs.readdirSync(UPLOADS_DIR);
      for (const file of uploadFiles) {
        if (file.includes(contentId)) {
          const filePath = path.join(UPLOADS_DIR, file);
          console.log(`Fichier correspondant trouvé dans uploads: ${filePath}`);
          if (deletePhysicalFile(filePath)) {
            return true;
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors de la tentative de suppression du fichier physique:`, error);
    return false;
  }
}
