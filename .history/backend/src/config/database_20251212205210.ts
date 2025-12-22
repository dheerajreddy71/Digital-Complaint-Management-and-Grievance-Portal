import mysql from 'mysql2/promise';
import { config } from '../config';
import { logger } from '../utils/logger';

// Connection pool for efficient DB access
let pool: mysql.Pool | null = null;

export const getPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    logger.info('Database connection pool created');
  }
  return pool;
};

// Execute query with automatic connection management
export const query = async <T>(sql: string, params?: unknown[]): Promise<T> => {
  const pool = getPool();
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    logger.error('Database query error', { sql, error });
    throw error;
  }
};

// Get a connection for transactions
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  const pool = getPool();
  return pool.getConnection();
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error });
    return false;
  }
};

// Close pool on shutdown
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection pool closed');
  }
};
