import { Router } from 'express';
import {
  listFavorites,
  getFavorite,
  addFavorite,
  removeFavorite,
  removeFavoriteByPokemonId,
} from '../controllers/favoriteController';

const router = Router();

router.get('/', listFavorites);

router.get('/:id', getFavorite);

router.post('/', addFavorite);

router.delete('/:id', removeFavorite);

router.delete('/pokemon/:pokemonId', removeFavoriteByPokemonId);

export default router;

