
import express from 'express';

const router = express.Router();

// Endpoint pour le statut du serveur API
router.get('/', (req, res) => {
  res.json({ status: 'ok', serverRunning: true });
});

export default router;
