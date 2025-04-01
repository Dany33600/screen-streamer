
import fs from 'fs';
import path from 'path';
import { CONTENT_DIR } from '../../utils/fileStorage.js';
import { sanitizeContentId, contentExists, findContentByPartialMatch } from './contentUtils.js';

// Sauvegarde les données d'un contenu dans un fichier JSON
export function saveContentData(contentId, contentData) {
  try {
    // Logs pour le débogage
    console.log(`Sauvegarde du contenu avec ID: ${contentId}`);
    console.log(`Données de contenu:`, JSON.stringify(contentData, null, 2));
    
    // S'assurer que le répertoire de contenu existe
    if (!fs.existsSync(CONTENT_DIR)) {
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
      console.log(`Répertoire de contenu créé: ${CONTENT_DIR}`);
    }
    
    // S'assurer que le contentId est une chaîne valide pour un nom de fichier
    const sanitizedContentId = sanitizeContentId(contentId);
    const contentPath = path.join(CONTENT_DIR, `${sanitizedContentId}.json`);
    
    // Écrire le fichier JSON
    fs.writeFileSync(contentPath, JSON.stringify(contentData, null, 2), 'utf8');
    console.log(`Contenu sauvegardé avec succès dans: ${contentPath}`);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du contenu ${contentId}:`, error);
    return false;
  }
}

// Récupère les données d'un contenu depuis un fichier JSON
export function getContentData(contentId) {
  try {
    console.log(`Recherche du contenu avec ID: ${contentId}`);
    
    // Vérifier si l'ID est déjà formaté comme un nom de fichier complet (avec .json)
    if (contentId.endsWith('.json')) {
      const directPath = path.join(CONTENT_DIR, contentId);
      if (fs.existsSync(directPath)) {
        console.log(`Fichier trouvé (chemin direct): ${directPath}`);
        const data = fs.readFileSync(directPath, 'utf8');
        return JSON.parse(data);
      }
    }
    
    // Essayer avec l'ID exact
    const exactPath = path.join(CONTENT_DIR, `${contentId}.json`);
    if (fs.existsSync(exactPath)) {
      console.log(`Fichier trouvé (ID exact): ${exactPath}`);
      const data = fs.readFileSync(exactPath, 'utf8');
      return JSON.parse(data);
    }
    
    // Si le fichier n'est pas trouvé, rechercher par correspondance partielle
    console.log(`Fichier non trouvé. Recherche de correspondances partielles pour: ${contentId}`);
    return findContentByPartialMatch(contentId);
  } catch (error) {
    console.error(`Erreur lors de la récupération du contenu ${contentId}:`, error);
    return null;
  }
}
