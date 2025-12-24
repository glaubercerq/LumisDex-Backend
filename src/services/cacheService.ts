import Redis from 'ioredis';
import { config } from '../config/index.js';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!redis && config.nodeEnv !== 'test') {
    try {
      redis = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('Redis connection failed, running without cache');
            return null;
          }
          return Math.min(times * 200, 2000);
        },
      });
      
      redis.on('error', (err) => {
        console.error('Redis error:', err.message);
      });
      
      redis.on('connect', () => {
        console.log('✓ Redis connected');
      });
    } catch (error) {
      console.warn('Redis not available, running without cache');
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
    console.error('Cache get error:', error);
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
    console.error('Cache set error:', error);
  }
}

export async function deleteFromCache(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function clearCache(): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.flushdb();
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

