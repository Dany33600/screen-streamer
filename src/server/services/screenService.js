
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

// Get all screens - this will be exported as getScreens
export function getScreens() {
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

// Save all screens at once
export function saveScreens(screens) {
  try {
    ensureScreensDirectory();
    
    // Validate input
    if (!Array.isArray(screens)) {
      console.error('saveScreens expected an array, got:', typeof screens);
      return false;
    }
    
    // Create or update each screen file
    for (const screen of screens) {
      if (!screen.id) {
        screen.id = uuidv4();
      }
      
      const filePath = path.join(SCREENS_DIR, `${screen.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(screen, null, 2));
    }
    
    console.log(`Saved ${screens.length} screens`);
    return true;
  } catch (error) {
    console.error('Error saving screens:', error);
    return false;
  }
}

// Delete a screen - this is already correctly exported as deleteScreen
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

// Add a new screen - renamed from saveScreen to addScreen
export function addScreen(screen) {
  try {
    ensureScreensDirectory();
    
    if (!screen.id) {
      screen.id = uuidv4();
    }
    
    const filePath = path.join(SCREENS_DIR, `${screen.id}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(screen, null, 2));
    console.log(`Screen added: ${screen.id}`);
    
    return screen;
  } catch (error) {
    console.error('Error adding screen:', error);
    return null;
  }
}

// Update a screen - This is already correctly exported as updateScreen
export function updateScreen(screenId, screenData) {
  try {
    ensureScreensDirectory();
    const filePath = path.join(SCREENS_DIR, `${screenId}.json`);
    
    console.log(`Updating screen ${screenId} with data:`, JSON.stringify(screenData, null, 2));
    
    if (!fs.existsSync(filePath)) {
      console.error(`Screen file not found: ${filePath}`);
      return null;
    }
    
    // Read the existing screen data
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let existingScreen;
    
    try {
      existingScreen = JSON.parse(fileContent);
    } catch (parseError) {
      console.error(`Error parsing screen file ${screenId}:`, parseError);
      return null;
    }
    
    // Merge the existing data with the new data
    const updatedScreen = { ...existingScreen, ...screenData };
    console.log(`Updated screen data:`, JSON.stringify(updatedScreen, null, 2));
    
    // Write the updated screen back to the file
    fs.writeFileSync(filePath, JSON.stringify(updatedScreen, null, 2));
    console.log(`Screen updated: ${screenId}`);
    
    return updatedScreen;
  } catch (error) {
    console.error(`Error updating screen ${screenId}:`, error);
    return null;
  }
}

// For backward compatibility
export const getAllScreens = getScreens;
export const getScreenById = (screenId) => {
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
};
export const saveScreen = addScreen;
