
import { 
  saveContent, 
  updateContent, 
  deleteContent, 
  getContents 
} from './content/contentManager.js';

import { 
  getContentData, 
  saveContentData 
} from './content/contentStorage.js';

import { 
  contentExists 
} from './content/contentUtils.js';

// Exporter toutes les fonctions nécessaires
export {
  saveContent,
  updateContent,
  deleteContent,
  getContents,
  getContentData,
  saveContentData,
  contentExists
};
