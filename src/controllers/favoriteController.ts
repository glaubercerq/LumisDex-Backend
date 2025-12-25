import type { Request, Response, NextFunction } from 'express';
import {
  getAllFavorites,
  getFavoriteById,
  getFavoriteByPokemonId,
  createFavorite,
  deleteFavorite,
  deleteFavoriteByPokemonId,
} from '../services/favoriteService.js';
import { AppError } from '../middlewares/errorHandler.js';
import logger from '../utils/logger.js';
import type { Favorite } from '../types/favorite.js';

export interface GetAllFavoritesResponse {
  data: Favorite[];
  total: number;
}

export interface GetFavoriteResponse extends Favorite {}

export interface CreateFavoriteResponse extends Favorite {}

export async function listFavorites(
  req: Request,
  res: Response<GetAllFavoritesResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const favorites = await getAllFavorites();
    
    res.json({
      data: favorites,
      total: favorites.length,
    });
  } catch (error) {
    logger.error('Error in listFavorites', { error });
    return next(new AppError('Failed to retrieve favorites', 500));
  }
}

export async function getFavorite(
  req: Request,
  res: Response<GetFavoriteResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id, 10))) {
      return next(new AppError('Invalid favorite ID', 400));
    }
    
    const favorite = await getFavoriteById(parseInt(id, 10));
    
    if (!favorite) {
      return next(new AppError('Favorite not found', 404));
    }
    
    res.json(favorite);
  } catch (error) {
    logger.error('Error in getFavorite', { error, id: req.params.id });
    return next(new AppError('Failed to retrieve favorite', 500));
  }
}

export async function addFavorite(
  req: Request,
  res: Response<CreateFavoriteResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { pokemon_id, pokemon_name } = req.body;
    
    if (!pokemon_id || !pokemon_name) {
      return next(new AppError('pokemon_id and pokemon_name are required', 400));
    }
    
    if (typeof pokemon_id !== 'number' || pokemon_id < 1) {
      return next(new AppError('pokemon_id must be a positive number', 400));
    }
    
    if (typeof pokemon_name !== 'string' || pokemon_name.trim().length === 0) {
      return next(new AppError('pokemon_name must be a non-empty string', 400));
    }
    
    const existing = await getFavoriteByPokemonId(pokemon_id);
    if (existing) {
      return next(new AppError('Pokemon is already in favorites', 409));
    }
    
    const favorite = await createFavorite({
      pokemon_id,
      pokemon_name: pokemon_name.trim(),
    });
    
    res.status(201).json(favorite);
  } catch (error) {
    logger.error('Error in addFavorite', { error, body: req.body });
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return next(new AppError('Pokemon is already in favorites', 409));
    }
    
    return next(new AppError('Failed to create favorite', 500));
  }
}

export async function removeFavorite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id, 10))) {
      return next(new AppError('Invalid favorite ID', 400));
    }
    
    const deleted = await deleteFavorite(parseInt(id, 10));
    
    if (!deleted) {
      return next(new AppError('Favorite not found', 404));
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error in removeFavorite', { error, id: req.params.id });
    return next(new AppError('Failed to delete favorite', 500));
  }
}

export async function removeFavoriteByPokemonId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pokemonId } = req.params;
    
    if (!pokemonId || isNaN(parseInt(pokemonId, 10))) {
      return next(new AppError('Invalid pokemon ID', 400));
    }
    
    const deleted = await deleteFavoriteByPokemonId(parseInt(pokemonId, 10));
    
    if (!deleted) {
      return next(new AppError('Favorite not found', 404));
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error in removeFavoriteByPokemonId', { error, pokemonId: req.params.pokemonId });
    return next(new AppError('Failed to delete favorite', 500));
  }
}

