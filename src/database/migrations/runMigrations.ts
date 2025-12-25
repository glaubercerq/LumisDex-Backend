import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { query } from '../../services/databaseService.js';
import { config } from '../../config/index.js';
import logger from '../../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureSchema(): Promise<void> {
  await query(`CREATE SCHEMA IF NOT EXISTS ${config.database.schema}`);
  await query(`SET search_path TO ${config.database.schema}`);
  logger.info('Schema ensured', { schema: config.database.schema });
}

function getMigrationsDirectory(): string {
  return join(__dirname, 'migrations');
}

async function getExecutedMigrations(): Promise<string[]> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS ${config.database.schema}.migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await query<{ filename: string }>(
      `SELECT filename FROM ${config.database.schema}.migrations ORDER BY id`
    );
    
    return result.map((row) => row.filename);
  } catch (error) {
    logger.error('Error getting executed migrations', { error });
    return [];
  }
}

async function markMigrationAsExecuted(filename: string): Promise<void> {
  await query(
    `INSERT INTO ${config.database.schema}.migrations (filename) VALUES ($1)`,
    [filename]
  );
}

export async function runMigrations(): Promise<void> {
  if (!config.database.migrationsRun) {
    logger.info('Migrations are disabled');
    return;
  }

  try {
    await ensureSchema();
    
    const migrationsDir = getMigrationsDirectory();
    const files = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const executedMigrations = await getExecutedMigrations();

    for (const file of files) {
      if (executedMigrations.includes(file)) {
        logger.debug('Migration already executed', { file });
        continue;
      }

      logger.info('Running migration', { file });
      
      const migrationPath = join(migrationsDir, file);
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      
      await query(migrationSQL);
      await markMigrationAsExecuted(file);
      
      logger.info('Migration executed successfully', { file });
    }

    logger.info('All migrations completed');
  } catch (error) {
    logger.error('Migration error', { error });
    throw error;
  }
}

