import { Router } from 'express';
import pokemonRoutes from './pokemonRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';

const router = Router();

router.use('/pokemon', pokemonRoutes);
router.use('/favorites', favoriteRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

