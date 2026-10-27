import http from 'http';
import { config } from './config.js';
import { connectDb, closeDb } from './db.js';
import { Router } from './http/router.js';
import { registerAuthRoutes } from './routes/authRoutes.js';
import { registerStudentRoutes } from './routes/studentRoutes.js';
import { registerTestRoutes } from './routes/testRoutes.js';
import { registerAttemptRoutes } from './routes/attemptRoutes.js';
import { registerHealthRoutes } from './routes/healthRoutes.js';

export function createServer() {
  const router = new Router();

  // Register all API route groups
  registerAuthRoutes(router);
  registerStudentRoutes(router);
  registerTestRoutes(router);
  registerAttemptRoutes(router);
  registerHealthRoutes(router);

  const server = http.createServer((req, res) => {
    router.handleRequest(req, res);
  });

  return { server, router };
}

export async function startServer(port = config.port) {
  const { server } = createServer();

  // Attempt to connect to MongoDB
  try {
    await connectDb();
  } catch (err) {
    console.warn('\n⚠️ [Database Notice] Could not connect to MongoDB at: ' + config.mongodbUri);
    console.warn('   Ensure your MongoDB server is running (e.g. brew services start mongodb-community)');
    console.warn('   or set MONGODB_URI to an authorized MongoDB Atlas connection string in server/.env\n');
  }

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log('====================================================');
      console.log(`🚀 NEXTEST HTTP Backend running on http://localhost:${port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Allowed CORS Origin: ${config.corsOrigin}`);
      console.log('====================================================\n');
      resolve(server);
    });
  });
}

// Graceful shutdown
function setupShutdown(server) {
  const shutdown = async () => {
    console.log('\n[Server] Gracefully stopping HTTP server and database...');
    server.close(async () => {
      await closeDb();
      console.log('[Server] Server shut down cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Auto-run when invoked directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer().then(setupShutdown);
}
