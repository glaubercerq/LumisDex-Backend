import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORTA || '5432', 10),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'root',
    database: process.env.POSTGRES_DB || 'postgres',
    schema: process.env.POSTGRES_SCHEMA || 'lumisdex_local',
    sync: process.env.POSTGRES_SYNC === 'true',
    migrationsRun: process.env.POSTGRES_MIGRATIONS_RUN === 'true',
    ssl: process.env.POSTGRES_SSL === 'true',
    url: process.env.DATABASE_URL,
  },
  
  redis: {
    url: process.env.REDIS_URL,
  },
  
  pokeApi: {
    baseUrl: process.env.POKEAPI_BASE_URL,
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
  },
} as const;

