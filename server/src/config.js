import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading from server/.env then root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nextest',
  dbName: process.env.DB_NAME || 'nextest',
  sessionSecret: process.env.SESSION_SECRET || 'nextest_super_secret_session_key_32bytes_min',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  sessionCookieName: 'nextest_session',
  sessionMaxAgeMs: 24 * 60 * 60 * 1000 // 24 hours
};
