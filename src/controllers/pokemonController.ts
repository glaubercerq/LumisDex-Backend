import type { Request, Response, NextFunction } from 'express';
import { 
  getPokemonById, 
  getPokemonByName,
  getPokemonList, 
  getPokemonByType,
  searchPokemon 
} from '../services/pokemonService.js';
import { AppError } from '../middlewares/errorHandler.js';
import logger from '../utils/logger.js';
import type { 
  ListPokemonsResponse, 
  GetPokemonResponse, 
  SearchPokemonResponse 
} from '../types/dtos.js';

export async function listPokemons(
  req: Request, 
  res: Response<ListPokemonsResponse>, 
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string | undefined;
    
    if (limit > 100) {
      return next(new AppError('Limit cannot exceed 100', 400));
    }
    
    if (page < 1 || limit < 1) {
      return next(new AppError('Page and limit must be greater than 0', 400));
    }
    
    let result;
    if (type) {
      result = await getPokemonByType(type, page, limit);
    } else {
      result = await getPokemonList(page, limit);
    }
    
    if (result.data.length === 0 && result.total === 0 && page === 1) {
      return next(new AppError('Unable to fetch pokemon data. Please try again later.', 503));
    }
    
    res.json(result);
  } catch (error) {
    logger.error('Error in listPokemons', { error });
    
    if (error instanceof Error && error.message.includes('HTTP Error')) {
      const statusMatch = error.message.match(/HTTP Error: (\d+)/);
      if (statusMatch) {
        const httpStatus = parseInt(statusMatch[1], 10);
        if (httpStatus === 404) {
          return next(new AppError('Pokemon data not found', 404));
        }
        if (httpStatus >= 500) {
          return next(new AppError('External service is temporarily unavailable', 503));
        }
      }
      return next(new AppError('Failed to fetch pokemon data from external service', 503));
    }
    
    return next(new AppError('An unexpected error occurred while fetching pokemon list', 500));
  }
}

export async function getPokemon(
  req: Request, 
  res: Response<GetPokemonResponse>, 
  next: NextFunction
): Promise<void> {
  try {
    const { idOrName } = req.params;
    
    if (!idOrName || idOrName.trim().length === 0) {
      return next(new AppError('Pokemon ID or name is required', 400));
    }
    
    let pokemon;
    
    if (/^\d+$/.test(idOrName)) {
      const id = parseInt(idOrName, 10);
      if (id < 1) {
        return next(new AppError('Pokemon ID must be greater than 0', 400));
      }
      pokemon = await getPokemonById(id);
    } else {
      pokemon = await getPokemonByName(idOrName.trim());
    }
    
    if (!pokemon) {
      return next(new AppError(`Pokemon '${idOrName}' not found`, 404));
    }
    
    res.json(pokemon);
  } catch (error) {
    logger.error('Error in getPokemon', { error, idOrName: req.params.idOrName });
    
    if (error instanceof Error && error.message.includes('HTTP Error')) {
      const statusMatch = error.message.match(/HTTP Error: (\d+)/);
      if (statusMatch) {
        const httpStatus = parseInt(statusMatch[1], 10);
        if (httpStatus === 404) {
          return next(new AppError(`Pokemon '${req.params.idOrName}' not found`, 404));
        }
        if (httpStatus >= 500) {
          return next(new AppError('External service is temporarily unavailable', 503));
        }
      }
      return next(new AppError('Failed to fetch pokemon data from external service', 503));
    }
    
    return next(new AppError('An unexpected error occurred while fetching pokemon', 500));
  }
}

export async function search(
  req: Request, 
  res: Response<SearchPokemonResponse>, 
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length === 0) {
      return next(new AppError('Search query is required', 400));
    }
    
    if (query.trim().length < 2) {
      return next(new AppError('Search query must be at least 2 characters long', 400));
    }
    
    const results = await searchPokemon(query.trim());
    
    res.json({ data: results, total: results.length });
  } catch (error) {
    logger.error('Error in search', { error, query: req.query.q });
    
    if (error instanceof Error && error.message.includes('HTTP Error')) {
      const statusMatch = error.message.match(/HTTP Error: (\d+)/);
      if (statusMatch) {
        const httpStatus = parseInt(statusMatch[1], 10);
        if (httpStatus >= 500) {
          return next(new AppError('External service is temporarily unavailable', 503));
        }
      }
      return next(new AppError('Failed to search pokemon data from external service', 503));
    }
    
    return next(new AppError('An unexpected error occurred while searching pokemon', 500));
  }
}

