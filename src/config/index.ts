import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV,
  
  database: {
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

