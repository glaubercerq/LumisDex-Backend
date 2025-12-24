import { Router } from 'express';
import pokemonRoutes from './pokemonRoutes.js';

const router = Router();

router.use('/pokemon', pokemonRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

