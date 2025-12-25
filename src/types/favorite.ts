export interface Favorite {
  id: number;
  pokemon_id: number;
  pokemon_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFavoriteInput {
  pokemon_id: number;
  pokemon_name: string;
}

