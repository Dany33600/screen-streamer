
import fs from 'fs';
import path from 'path';
import { CONTENT_DIR, UPLOADS_DIR } from '../utils/fileStorage.js';

// Save content data to a JSON file
export function saveContentData(contentId, contentData) {
  try {
    // Logs pour le débogage
    console.log(`Sauvegarde du contenu avec ID: ${contentId}`);
    console.log(`Données de contenu:`, JSON.stringify(contentData, null, 2));
    
    // S'assurer que le contentId est une chaîne valide pour un nom de fichier
    const sanitizedContentId = contentId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const contentPath = path.join(CONTENT_DIR, `${sanitizedContentId}.json`);
    
    // Écrire le fichier JSON
    fs.writeFileSync(contentPath, JSON.stringify(contentData, null, 2));
    console.log(`Contenu sauvegardé avec succès dans: ${contentPath}`);
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du contenu ${contentId}:`, error);
    return false;
  }
}

// Get content data from a JSON file
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
    const files = fs.readdirSync(CONTENT_DIR);
    
    // Recherche de fichiers qui contiennent le contentId
    for (const file of files) {
      if (file.includes(contentId) || file.includes(contentId.replace(/[^a-zA-Z0-9-_]/g, '_'))) {
        const filePath = path.join(CONTENT_DIR, file);
        console.log(`Correspondance partielle trouvée: ${filePath}`);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    }
    
    // Lister tous les fichiers disponibles pour le débogage
    console.log('Aucune correspondance trouvée. Fichiers disponibles:');
    console.log(files);
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération du contenu ${contentId}:`, error);
    return null;
  }
}

// List all content files
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

// Delete content data
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
          try {
            // Extraire le nom du fichier depuis l'URL
            const fileName = contentData.url.split('/').pop();
            if (fileName) {
              const filePath = path.join(UPLOADS_DIR, fileName);
              console.log(`Tentative de suppression du fichier physique: ${filePath}`);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Fichier physique supprimé: ${filePath}`);
              } else {
                console.warn(`Fichier physique non trouvé: ${filePath}`);
                
                // Essayer avec l'ID exact comme nom de fichier
                const exactFilePath = path.join(UPLOADS_DIR, contentId);
                if (fs.existsSync(exactFilePath)) {
                  fs.unlinkSync(exactFilePath);
                  console.log(`Fichier physique supprimé (ID exact): ${exactFilePath}`);
                }
              }
            }
          } catch (e) {
            console.warn(`Erreur lors de la suppression du fichier physique:`, e);
          }
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
              try {
                const fileName = contentData.url.split('/').pop();
                if (fileName) {
                  const filePath = path.join(UPLOADS_DIR, fileName);
                  console.log(`Tentative de suppression du fichier physique: ${filePath}`);
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Fichier physique supprimé: ${filePath}`);
                  } else {
                    console.warn(`Fichier physique non trouvé: ${filePath}`);
                  }
                }
              } catch (e) {
                console.warn(`Erreur lors de la suppression du fichier physique:`, e);
              }
            }
          } catch (err) {
            console.error(`Erreur lors de la suppression du fichier ${file}:`, err);
          }
        }
      }
      
      if (!jsonFound) {
        console.warn(`Aucun fichier JSON correspondant à l'ID ${contentId} n'a été trouvé`);
        
        // Tenter une dernière approche: chercher directement dans le dossier uploads
        try {
          console.log(`Recherche directe dans le dossier uploads pour des fichiers correspondant à l'ID: ${contentId}`);
          const uploadFiles = fs.readdirSync(UPLOADS_DIR);
          for (const file of uploadFiles) {
            if (file.includes(contentId)) {
              const filePath = path.join(UPLOADS_DIR, file);
              console.log(`Fichier correspondant trouvé dans uploads: ${filePath}`);
              fs.unlinkSync(filePath);
              console.log(`Fichier supprimé: ${filePath}`);
              return true;
            }
          }
        } catch (e) {
          console.warn(`Erreur lors de la recherche dans le dossier uploads:`, e);
        }
      }
      
      return jsonFound;
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du contenu ${contentId}:`, error);
    return false;
  }
}
