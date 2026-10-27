import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client = null;
let db = null;
let customCollectionProvider = null;

/**
 * Connect to MongoDB using the official Node.js driver.
 */
export async function connectDb(customUri = null) {
  if (db) return db;

  const uri = customUri || config.mongodbUri;
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  });

  await client.connect();
  db = client.db(config.dbName);
  console.log(`[Database] Connected successfully to MongoDB: ${config.dbName}`);

  // Create required indexes
  await ensureIndexes(db);

  return db;
}

/**
 * Override collection provider (useful for isolated unit/flow tests).
 */
export function setCustomCollectionProvider(provider) {
  customCollectionProvider = provider;
}

/**
 * Get active database instance.
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Please call connectDb() first.');
  }
  return db;
}

/**
 * Helper to get a collection by name.
 */
export function getCollection(name) {
  if (customCollectionProvider) {
    return customCollectionProvider(name);
  }
  return getDb().collection(name);
}

/**
 * Ensure database indexes exist for performance and constraints.
 */
export async function ensureIndexes(database) {
  try {
    const studentsCol = database.collection('students');
    await studentsCol.createIndex({ email: 1 }, { unique: true });

    const testsCol = database.collection('tests');
    await testsCol.createIndex({ code: 1 }, { unique: true });
    await testsCol.createIndex({ isPublished: 1, startTime: 1, endTime: 1 });

    const attemptsCol = database.collection('attempts');
    await attemptsCol.createIndex({ studentId: 1, testId: 1 });
    await attemptsCol.createIndex({ studentId: 1, createdAt: -1 });
    await attemptsCol.createIndex({ status: 1 });

    const sessionsCol = database.collection('sessions');
    await sessionsCol.createIndex({ token: 1 }, { unique: true });
    await sessionsCol.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    console.log('[Database] Indexes verified and ensured.');
  } catch (error) {
    console.error('[Database] Warning creating indexes:', error.message);
  }
}

/**
 * Close database connection gracefully.
 */
export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[Database] Connection closed.');
  }
}
