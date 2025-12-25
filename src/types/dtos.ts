import type { Pokemon, PaginatedResponse } from './pokemon.js';

export interface ListPokemonsResponse extends PaginatedResponse<Pokemon> {}

export interface GetPokemonResponse extends Pokemon {}

export interface SearchPokemonResponse {
  data: Pokemon[];
  total: number;
}

