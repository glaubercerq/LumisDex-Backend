import app from './app';
import { config } from './config/index';
import logger from './utils/logger';
import { runMigrations } from './database/migrations/runMigrations';
import { closePool } from './services/databaseService';

const { port } = config;

async function startServer(): Promise<void> {
  try {
    if (config.database.migrationsRun) {
      await runMigrations();
    }

    app.listen(port, () => {
      logger.info('LumisDex API Server started', {
        port,
        environment: config.nodeEnv,
        endpoints: [
          'GET /api/health - Health check',
          'GET /api/pokemon - List Pokemon',
          'GET /api/pokemon/:id - Get Pokemon by ID',
          'GET /api/pokemon/search - Search Pokemon',
          'GET /api/favorites - List favorites',
          'GET /api/favorites/:id - Get favorite by ID',
          'POST /api/favorites - Add favorite',
          'DELETE /api/favorites/:id - Remove favorite',
          'DELETE /api/favorites/pokemon/:pokemonId - Remove favorite by pokemon ID'
        ]
      });
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await closePool();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      await closePool();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();

