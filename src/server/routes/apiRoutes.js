
import express from 'express';
import statusRoutes from './statusRoutes.js';
import configRoutes from './configRoutes.js';
import screenRoutes from './screenRoutes.js';
import contentRoutes from './contentRoutes.js';

const router = express.Router();

// Monter les sous-routeurs
router.use('/status', statusRoutes);
router.use('/config', configRoutes);
router.use('/screens', screenRoutes);
router.use('/contents', contentRoutes);

export default router;
