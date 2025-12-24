import type { Request, Response } from 'express';
import { 
  getPokemonById, 
  getPokemonByName,
  getPokemonList, 
  getPokemonByType,
  searchPokemon 
} from '../services/pokemonService.js';

export async function listPokemons(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string | undefined;
    
    if (limit > 100) {
      res.status(400).json({ error: 'Limit cannot exceed 100' });
      return;
    }
    
    let result;
    if (type) {
      result = await getPokemonByType(type, page, limit);
    } else {
      result = await getPokemonList(page, limit);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in listPokemons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPokemon(req: Request, res: Response): Promise<void> {
  try {
    const { idOrName } = req.params;
    
    let pokemon;
    
    // Check if it's a number (ID) or string (name)
    if (/^\d+$/.test(idOrName)) {
      pokemon = await getPokemonById(parseInt(idOrName, 10));
    } else {
      pokemon = await getPokemonByName(idOrName);
    }
    
    if (!pokemon) {
      res.status(404).json({ error: 'Pokemon not found' });
      return;
    }
    
    res.json(pokemon);
  } catch (error) {
    console.error('Error in getPokemon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function search(req: Request, res: Response): Promise<void> {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length === 0) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    const results = await searchPokemon(query.trim());
    
    res.json({ data: results, total: results.length });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

