import app from './app.js';
import { config } from './config/index.js';
import logger from './utils/logger.js';

const { port } = config;

app.listen(port, () => {
  logger.info('LumisDex API Server started', {
    port,
    environment: config.nodeEnv,
    endpoints: [
      'GET /api/health - Health check',
      'GET /api/pokemon - List Pokemon',
      'GET /api/pokemon/:id - Get Pokemon by ID',
      'GET /api/pokemon/search - Search Pokemon'
    ]
  });
});

