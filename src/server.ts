import app from './app.js';
import { config } from './config/index.js';

const { port } = config;

app.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🎮 LumisDex API Server                          ║
║                                                   ║
║   Server running on http://localhost:${port}        ║
║   Environment: ${config.nodeEnv.padEnd(15)}              ║
║                                                   ║
║   Endpoints:                                      ║
║   GET  /api/health          - Health check        ║
║   GET  /api/pokemon         - List Pokemon        ║
║   GET  /api/pokemon/:id     - Get Pokemon by ID   ║
║   GET  /api/pokemon/search  - Search Pokemon      ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

