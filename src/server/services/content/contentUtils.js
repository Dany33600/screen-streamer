
import fs from 'fs';
import path from 'path';
import { CONTENT_DIR } from '../../utils/fileStorage.js';

// Vérifie si un contenu existe
export function contentExists(contentId) {
  try {
    // Vérifier si l'ID est déjà formaté comme un nom de fichier complet (avec .json)
    if (contentId.endsWith('.json')) {
      const directPath = path.join(CONTENT_DIR, contentId);
      if (fs.existsSync(directPath)) {
        return true;
      }
    }
    
    // Essayer avec l'ID exact
    const exactPath = path.join(CONTENT_DIR, `${contentId}.json`);
    if (fs.existsSync(exactPath)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors de la vérification d'existence du contenu ${contentId}:`, error);
    return false;
  }
}

// Utilitaire pour formater un ID de contenu en nom de fichier valide
export function sanitizeContentId(contentId) {
  return contentId.replace(/[^a-zA-Z0-9-_]/g, '_');
}

// Trouver un fichier contenu par correspondance partielle
export function findContentByPartialMatch(contentId) {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    
    // Recherche de fichiers qui contiennent le contentId
    for (const file of files) {
      if (file.includes(contentId) || file.includes(sanitizeContentId(contentId))) {
        const filePath = path.join(CONTENT_DIR, file);
        console.log(`Correspondance partielle trouvée: ${filePath}`);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la recherche partielle du contenu ${contentId}:`, error);
    return null;
  }
}
