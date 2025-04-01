
import express from 'express';
import { getScreens, saveScreens, deleteScreen, addScreen, updateScreen } from '../services/screenService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const screens = await getScreens();
    res.json({ success: true, screens });
  } catch (error) {
    console.error('API: Erreur lors de la récupération des écrans:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des écrans' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { screen } = req.body;
    if (!screen) {
      return res.status(400).json({ success: false, message: 'Données d\'écran manquantes' });
    }
    
    const newScreen = await addScreen(screen);
    if (newScreen) {
      res.status(201).json({ success: true, screen: newScreen });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout d\'un écran' });
    }
  } catch (error) {
    console.error('API: Erreur lors de l\'ajout d\'un écran:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout d\'un écran' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const screenData = req.body.screen || req.body;
    
    console.log('API: Mise à jour de l\'écran:', id);
    console.log('API: Données reçues:', JSON.stringify(screenData, null, 2));
    
    if (!screenData) {
      return res.status(400).json({ success: false, message: 'Données d\'écran manquantes' });
    }
    
    const updatedScreen = await updateScreen(id, screenData);
    if (updatedScreen) {
      res.json({ success: true, screen: updatedScreen });
    } else {
      res.status(404).json({ success: false, message: 'Écran non trouvé' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la mise à jour d\'un écran:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour d\'un écran' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteScreen(id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Écran non trouvé' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la suppression d\'un écran:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression d\'un écran' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { screens } = req.body;
    if (!screens || !Array.isArray(screens)) {
      return res.status(400).json({ success: false, message: 'Données d\'écrans manquantes ou invalides' });
    }
    
    const saved = await saveScreens(screens);
    if (saved) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde des écrans' });
    }
  } catch (error) {
    console.error('API: Erreur lors de la sauvegarde des écrans:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde des écrans' });
  }
});

export default router;
