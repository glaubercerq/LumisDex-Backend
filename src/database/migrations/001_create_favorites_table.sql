CREATE SCHEMA IF NOT EXISTS lumisdex_local;

SET search_path TO lumisdex_local;

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    pokemon_id INTEGER NOT NULL,
    pokemon_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pokemon_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_pokemon_id ON favorites(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_favorites_pokemon_name ON favorites(pokemon_name);

