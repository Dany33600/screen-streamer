
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage paths
export const STORAGE_DIR = path.join(__dirname, '..', '..', '..', 'storage');
export const CONTENT_DIR = path.join(STORAGE_DIR, 'content');
export const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');

// Initialize storage directories
export function initializeStorageDirectories() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log(`Répertoire de stockage créé: ${STORAGE_DIR}`);
  }

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    console.log(`Répertoire de contenu créé: ${CONTENT_DIR}`);
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Répertoire d'uploads créé: ${UPLOADS_DIR}`);
  }
}

// Create multer storage configuration
export function createMulterStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      console.log(`Stockage du fichier dans: ${UPLOADS_DIR}`);
      cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
      const uniqueFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      console.log(`Nom de fichier généré: ${uniqueFilename}`);
      cb(null, uniqueFilename);
    }
  });
}

// Create multer upload middleware
export function createUploadMiddleware() {
  const storage = createMulterStorage();
  return multer({ 
    storage: storage,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100 MB
    }
  });
}

// Get local IP addresses
export function getLocalIpAddresses() {
  const nets = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  
  return addresses;
}

// Get first non-localhost IPv4 address
export function getFirstIpAddress() {
  const addresses = getLocalIpAddresses();
  return addresses.length > 0 ? addresses[0] : 'localhost';
}

// Upload file and return URL
export function uploadFile(contentId, file, originalName) {
  try {
    if (file) {
      const ipAddress = getFirstIpAddress();
      const serverPort = process.env.API_PORT || 5000;
      const fullFileUrl = `http://${ipAddress}:${serverPort}/uploads/${file.filename}`;
      
      console.log(`Generated full file URL: ${fullFileUrl}`);
      
      return {
        success: true,
        filePath: file.path,
        url: fullFileUrl
      };
    }
    
    const filename = `${contentId}-${originalName || 'file'}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    if (Buffer.isBuffer(file)) {
      fs.writeFileSync(filePath, file);
      return {
        success: true,
        filePath: filePath,
        url: `/uploads/${filename}`
      };
    }
    
    return {
      success: false,
      message: 'Format de fichier non pris en charge'
    };
  } catch (error) {
    console.error(`Erreur lors de l'upload du fichier pour ${contentId}:`, error);
    return {
      success: false,
      message: error.message
    };
  }
}
