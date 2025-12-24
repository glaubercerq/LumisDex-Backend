import { config } from '../config/index.js';
import { httpGet } from '../utils/httpClient.js';
import { getFromCache, setInCache } from './cacheService.js';
import type { 
  Pokemon, 
  PokemonApiResponse, 
  PokemonListResponse,
  TypeApiResponse,
  PaginatedResponse 
} from '../types/pokemon.js';

const BASE_URL = config.pokeApi.baseUrl;

function mapPokemonResponse(data: PokemonApiResponse): Pokemon {
  return {
    id: data.id,
    name: data.name,
    image: data.sprites.other['official-artwork'].front_default,
    types: data.types.map(t => t.type.name),
    stats: data.stats.map(s => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map(a => a.ability.name),
  };
}

export async function getPokemonById(id: number): Promise<Pokemon | null> {
  const cacheKey = `pokemon:${id}`;
  
  // Try cache first
  const cached = await getFromCache<Pokemon>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const data = await httpGet<PokemonApiResponse>(`${BASE_URL}/pokemon/${id}`);
    const pokemon = mapPokemonResponse(data);
    
    // Cache the result
    await setInCache(cacheKey, pokemon);
    
    return pokemon;
  } catch (error) {
    console.error(`Error fetching pokemon ${id}:`, error);
    return null;
  }
}

export async function getPokemonByName(name: string): Promise<Pokemon | null> {
  const cacheKey = `pokemon:name:${name.toLowerCase()}`;
  
  const cached = await getFromCache<Pokemon>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const data = await httpGet<PokemonApiResponse>(`${BASE_URL}/pokemon/${name.toLowerCase()}`);
    const pokemon = mapPokemonResponse(data);
    
    await setInCache(cacheKey, pokemon);
    await setInCache(`pokemon:${pokemon.id}`, pokemon);
    
    return pokemon;
  } catch (error) {
    console.error(`Error fetching pokemon ${name}:`, error);
    return null;
  }
}

export async function getPokemonList(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Pokemon>> {
  const offset = (page - 1) * limit;
  const cacheKey = `pokemon:list:${page}:${limit}`;
  
  const cached = await getFromCache<PaginatedResponse<Pokemon>>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const listData = await httpGet<PokemonListResponse>(
      `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`
    );
    
    const pokemonPromises = listData.results.map(async (item) => {
      const id = parseInt(item.url.split('/').filter(Boolean).pop() || '0', 10);
      const pokemon = await getPokemonById(id);
      return pokemon;
    });
    
    const pokemons = (await Promise.all(pokemonPromises)).filter(
      (p): p is Pokemon => p !== null
    );
    
    const result: PaginatedResponse<Pokemon> = {
      data: pokemons,
      total: listData.count,
      page,
      limit,
      totalPages: Math.ceil(listData.count / limit),
    };
    
    await setInCache(cacheKey, result, 300); // 5 min cache for lists
    
    return result;
  } catch (error) {
    console.error('Error fetching pokemon list:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
}

export async function getPokemonByType(
  type: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Pokemon>> {
  const cacheKey = `pokemon:type:${type}:${page}:${limit}`;
  
  const cached = await getFromCache<PaginatedResponse<Pokemon>>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const typeData = await httpGet<TypeApiResponse>(`${BASE_URL}/type/${type}`);
    
    const offset = (page - 1) * limit;
    const paginatedItems = typeData.pokemon.slice(offset, offset + limit);
    
    const pokemonPromises = paginatedItems.map(async (item) => {
      const id = parseInt(item.pokemon.url.split('/').filter(Boolean).pop() || '0', 10);
      const pokemon = await getPokemonById(id);
      return pokemon;
    });
    
    const pokemons = (await Promise.all(pokemonPromises)).filter(
      (p): p is Pokemon => p !== null
    );
    
    const result: PaginatedResponse<Pokemon> = {
      data: pokemons,
      total: typeData.pokemon.length,
      page,
      limit,
      totalPages: Math.ceil(typeData.pokemon.length / limit),
    };
    
    await setInCache(cacheKey, result, 300);
    
    return result;
  } catch (error) {
    console.error(`Error fetching pokemon by type ${type}:`, error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
}

export async function searchPokemon(query: string): Promise<Pokemon[]> {
  // Try exact match first
  const pokemon = await getPokemonByName(query);
  if (pokemon) {
    return [pokemon];
  }
  
  return [];
}

