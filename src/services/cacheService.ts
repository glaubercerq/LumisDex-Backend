import Redis from 'ioredis';
import { config } from '../config/index';
import logger from '../utils/logger';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!redis && config.nodeEnv !== 'test') {
    try {
      redis = new Redis(config.redis.url || 'redis://localhost:6379', {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('Redis connection failed, running without cache', { retries: times });
            return null;
          }
          return Math.min(times * 200, 2000);
        },
      });
      
      redis.on('error', (err) => {
        logger.error('Redis error', { error: err.message });
      });
      
      redis.on('connect', () => {
        logger.info('Redis connected successfully');
      });
    } catch (error) {
      logger.warn('Redis not available, running without cache', { error });
      redis = null;
    }
  }
  return redis;
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    logger.error('Cache get error', { error, key });
    return null;
  }
}

export async function setInCache<T>(key: string, data: T, ttl?: number): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    const serialized = JSON.stringify(data);
    const cacheTtl = ttl || config.cache.ttl;
    await client.setex(key, cacheTtl, serialized);
  } catch (error) {
    logger.error('Cache set error', { error, key });
  }
}

export async function deleteFromCache(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.del(key);
  } catch (error) {
    logger.error('Cache delete error', { error, key });
  }
}

export async function clearCache(): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.flushdb();
  } catch (error) {
    logger.error('Cache clear error', { error });
  }
}

