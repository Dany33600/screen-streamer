
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get current file path and directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory where screen data will be stored
const SCREENS_DIR = path.join(__dirname, '..', '..', '..', 'storage', 'screens');

// Ensure the screens directory exists
function ensureScreensDirectory() {
  if (!fs.existsSync(SCREENS_DIR)) {
    fs.mkdirSync(SCREENS_DIR, { recursive: true });
    console.log(`Created screens directory at ${SCREENS_DIR}`);
  }
}

// Initialize storage directory
ensureScreensDirectory();

// Get all screens
export function getAllScreens() {
  try {
    ensureScreensDirectory();
    
    const files = fs.readdirSync(SCREENS_DIR);
    const screens = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(SCREENS_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
          const screen = JSON.parse(fileContent);
          screens.push(screen);
        } catch (parseError) {
          console.error(`Error parsing screen file ${file}:`, parseError);
        }
      }
    }
    
    return screens;
  } catch (error) {
    console.error('Error getting all screens:', error);
    return [];
  }
}

// Get a screen by ID
export function getScreenById(screenId) {
  try {
    const filePath = path.join(SCREENS_DIR, `${screenId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error getting screen ${screenId}:`, error);
    return null;
  }
}

// Save a screen
export function saveScreen(screen) {
  try {
    ensureScreensDirectory();
    
    if (!screen.id) {
      screen.id = uuidv4();
    }
    
    const filePath = path.join(SCREENS_DIR, `${screen.id}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(screen, null, 2));
    console.log(`Screen saved: ${screen.id}`);
    
    return screen;
  } catch (error) {
    console.error('Error saving screen:', error);
    return null;
  }
}

// Update a screen
export function updateScreen(screenId, screenData) {
  try {
    const filePath = path.join(SCREENS_DIR, `${screenId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const existingScreen = JSON.parse(fileContent);
    
    const updatedScreen = { ...existingScreen, ...screenData };
    
    fs.writeFileSync(filePath, JSON.stringify(updatedScreen, null, 2));
    console.log(`Screen updated: ${screenId}`);
    
    return updatedScreen;
  } catch (error) {
    console.error(`Error updating screen ${screenId}:`, error);
    return null;
  }
}

// Delete a screen
export function deleteScreen(screenId) {
  try {
    const filePath = path.join(SCREENS_DIR, `${screenId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    fs.unlinkSync(filePath);
    console.log(`Screen deleted: ${screenId}`);
    
    return true;
  } catch (error) {
    console.error(`Error deleting screen ${screenId}:`, error);
    return false;
  }
}
