import { Router } from 'express';
import { listPokemons, getPokemon, search } from '../controllers/pokemonController';

const router = Router();

/**
 * @route GET /api/pokemon
 * @desc List all Pokemon with pagination
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20, max: 100)
 * @query type - Filter by Pokemon type
 */
router.get('/', listPokemons);

/**
 * @route GET /api/pokemon/search
 * @desc Search Pokemon by name
 * @query q - Search query
 */
router.get('/search', search);

/**
 * @route GET /api/pokemon/:idOrName
 * @desc Get a single Pokemon by ID or name
 * @param idOrName - Pokemon ID or name
 */
router.get('/:idOrName', getPokemon);

export default router;

