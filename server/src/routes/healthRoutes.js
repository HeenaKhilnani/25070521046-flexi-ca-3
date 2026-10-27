import { getDb } from '../db.js';
import { sendJson } from '../http/response.js';

export function registerHealthRoutes(router) {
  router.get('/api/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let collectionsCount = 0;

    try {
      const db = getDb();
      if (db) {
        await db.command({ ping: 1 });
        dbStatus = 'connected';
        const cols = await db.listCollections().toArray();
        collectionsCount = cols.length;
      }
    } catch {
      dbStatus = 'disconnected';
    }

    sendJson(res, 200, {
      status: 'ok',
      service: 'NEXTEST API Server',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        collections: collectionsCount
      }
    });
  });
}
