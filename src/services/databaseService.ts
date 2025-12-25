import { Pool, PoolClient } from 'pg';
import { config } from '../config/index';
import logger from '../utils/logger';

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    const dbConfig = {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    pool = new Pool(dbConfig);

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle database client', { error: err });
    });

    pool.on('connect', () => {
      logger.info('Database connection established');
    });
  }

  return pool;
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getDatabasePool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Database query executed', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
    
    return result.rows as T[];
  } catch (error) {
    logger.error('Database query error', { error, query: text.substring(0, 100) });
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  const pool = getDatabasePool();
  return pool.connect();
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', { error });
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
}

