
import { saveContentData, getContentData } from './contentStorage.js';
import { contentExists } from './contentUtils.js';
import { tryDeletePhysicalFileFromUrl } from './contentFileHandler.js';
import fs from 'fs';
import path from 'path';
import { CONTENT_DIR } from '../../utils/fileStorage.js';

// Liste tous les contenus disponibles
export function listAllContent() {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    const contentList = [];
    
    console.log(`Listage des contenus. ${files.length} fichiers trouvés.`);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const contentId = file.replace('.json', '');
          const content = getContentData(contentId);
          if (content) {
            contentList.push(content);
          }
        } catch (err) {
          console.error(`Erreur lors du traitement du fichier ${file}:`, err);
        }
      }
    }
    
    console.log(`${contentList.length} contenus valides trouvés.`);
    return contentList;
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des contenus:', error);
    return [];
  }
}

// Supprime un contenu et son fichier associé
export function deleteContent(contentId) {
  try {
    console.log(`Suppression du contenu demandée. ID exact reçu: "${contentId}"`);
    
    // Vérifier si contentId est vide ou undefined
    if (!contentId) {
      console.error("ID de contenu manquant pour la suppression");
      return false;
    }
    
    // On vérifie d'abord si le fichier JSON existe directement avec l'ID exact
    const exactJsonPath = path.join(CONTENT_DIR, `${contentId}.json`);
    console.log(`Vérification du fichier JSON avec chemin exact: ${exactJsonPath}`);
    
    if (fs.existsSync(exactJsonPath)) {
      console.log(`Fichier JSON trouvé: ${exactJsonPath}`);
      try {
        // Récupérer les données avant de supprimer le fichier JSON
        const contentData = JSON.parse(fs.readFileSync(exactJsonPath, 'utf8'));
        console.log(`Données du contenu récupérées:`, contentData);
        
        // Supprimer le fichier JSON
        fs.unlinkSync(exactJsonPath);
        console.log(`Fichier JSON supprimé: ${exactJsonPath}`);
        
        // Supprimer le fichier physique s'il existe
        if (contentData.url) {
          tryDeletePhysicalFileFromUrl(contentData.url, contentId);
        }
        
        return true;
      } catch (err) {
        console.error(`Erreur lors de la suppression du fichier JSON ${exactJsonPath}:`, err);
      }
    } else {
      console.log(`Fichier JSON non trouvé avec chemin exact: ${exactJsonPath}`);
      
      // Si le fichier exact n'existe pas, rechercher des fichiers contenant l'ID
      console.log(`Recherche de fichiers JSON correspondant à l'ID: ${contentId}`);
      const files = fs.readdirSync(CONTENT_DIR);
      let jsonFound = false;
      
      for (const file of files) {
        if (file.includes(contentId)) {
          try {
            const filePath = path.join(CONTENT_DIR, file);
            console.log(`Fichier JSON correspondant trouvé: ${filePath}`);
            
            // Récupérer les données avant de supprimer
            let contentData = null;
            try {
              contentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              console.log(`Données du contenu récupérées:`, contentData);
            } catch (e) {
              console.warn(`Erreur lors de la lecture du contenu:`, e);
            }
            
            // Supprimer le fichier JSON
            fs.unlinkSync(filePath);
            console.log(`Fichier JSON supprimé: ${filePath}`);
            jsonFound = true;
            
            // Supprimer le fichier physique si possible
            if (contentData && contentData.url) {
              tryDeletePhysicalFileFromUrl(contentData.url, contentId);
            }
          } catch (err) {
            console.error(`Erreur lors de la suppression du fichier ${file}:`, err);
          }
        }
      }
      
      if (!jsonFound) {
        console.warn(`Aucun fichier JSON correspondant à l'ID ${contentId} n'a été trouvé`);
        // Tenter une dernière approche: chercher directement dans le dossier uploads
        return tryDeletePhysicalFileFromUrl(null, contentId);
      }
      
      return jsonFound;
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du contenu ${contentId}:`, error);
    return false;
  }
}

// Sauvegarder un nouveau contenu
export function saveContent(content) {
  try {
    // Generate a unique ID if not provided
    if (!content.id) {
      content.id = Date.now().toString();
    }
    
    console.log(`Sauvegarde du contenu avec ID: ${content.id}`);
    console.log(`Données de contenu:`, content);
    
    return saveContentData(content.id, content);
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du contenu:`, error);
    return false;
  }
}

// Mettre à jour un contenu existant
export function updateContent(contentId, contentData) {
  try {
    // Check if content exists first
    const existingContent = getContentData(contentId);
    if (!existingContent) {
      console.log(`Contenu avec ID ${contentId} non trouvé pour mise à jour`);
      return null;
    }
    
    console.log(`Mise à jour du contenu avec ID: ${contentId}`);
    console.log(`Données de contenu:`, contentData);
    
    // Merge the existing content with the new data
    const updatedContent = { ...existingContent, ...contentData, id: contentId };
    
    if (saveContentData(contentId, updatedContent)) {
      return updatedContent;
    }
    return null;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du contenu ${contentId}:`, error);
    return null;
  }
}

// Fonction principale pour obtenir tous les contenus
export function getContents() {
  return listAllContent();
}
