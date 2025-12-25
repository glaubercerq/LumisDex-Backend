import { query } from './databaseService.js';
import { config } from '../config/index.js';
import type { Favorite, CreateFavoriteInput } from '../types/favorite.js';
import logger from '../utils/logger.js';

const schema = config.database.schema;

export async function getAllFavorites(): Promise<Favorite[]> {
  try {
    const result = await query<Favorite>(
      `SELECT * FROM ${schema}.favorites ORDER BY created_at DESC`
    );
    return result;
  } catch (error) {
    logger.error('Error getting all favorites', { error });
    throw error;
  }
}

export async function getFavoriteById(id: number): Promise<Favorite | null> {
  try {
    const result = await query<Favorite>(
      `SELECT * FROM ${schema}.favorites WHERE id = $1`,
      [id]
    );
    return result[0] || null;
  } catch (error) {
    logger.error('Error getting favorite by id', { error, id });
    throw error;
  }
}

export async function getFavoriteByPokemonId(pokemonId: number): Promise<Favorite | null> {
  try {
    const result = await query<Favorite>(
      `SELECT * FROM ${schema}.favorites WHERE pokemon_id = $1`,
      [pokemonId]
    );
    return result[0] || null;
  } catch (error) {
    logger.error('Error getting favorite by pokemon id', { error, pokemonId });
    throw error;
  }
}

export async function createFavorite(input: CreateFavoriteInput): Promise<Favorite> {
  try {
    const result = await query<Favorite>(
      `INSERT INTO ${schema}.favorites (pokemon_id, pokemon_name) 
       VALUES ($1, $2) 
       RETURNING *`,
      [input.pokemon_id, input.pokemon_name]
    );
    
    logger.info('Favorite created', { favoriteId: result[0].id, pokemonId: input.pokemon_id });
    return result[0];
  } catch (error) {
    logger.error('Error creating favorite', { error, input });
    throw error;
  }
}

export async function deleteFavorite(id: number): Promise<boolean> {
  try {
    const result = await query<Favorite>(
      `DELETE FROM ${schema}.favorites WHERE id = $1 RETURNING id`,
      [id]
    );
    
    const deleted = result.length > 0;
    
    if (deleted) {
      logger.info('Favorite deleted', { favoriteId: id });
    }
    
    return deleted;
  } catch (error) {
    logger.error('Error deleting favorite', { error, id });
    throw error;
  }
}

export async function deleteFavoriteByPokemonId(pokemonId: number): Promise<boolean> {
  try {
    const result = await query<Favorite>(
      `DELETE FROM ${schema}.favorites WHERE pokemon_id = $1 RETURNING id`,
      [pokemonId]
    );
    
    const deleted = result.length > 0;
    
    if (deleted) {
      logger.info('Favorite deleted by pokemon id', { pokemonId });
    }
    
    return deleted;
  } catch (error) {
    logger.error('Error deleting favorite by pokemon id', { error, pokemonId });
    throw error;
  }
}

