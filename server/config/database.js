/**
 * Database Manager
 * Professional database connection manager with connection pooling and error handling
 */

const { Pool } = require('pg');

class DatabaseManager {
  constructor() {
    if (DatabaseManager._instance) {
      return DatabaseManager._instance;
    }
    
    this.pool = null;
    this.isConnected = false;
    DatabaseManager._instance = this;
  }

  static getInstance() {
    if (!DatabaseManager._instance) {
      DatabaseManager._instance = new DatabaseManager();
    }
    return DatabaseManager._instance;
  }

  /**
   * Initialize database connection pool
   */
  async initialize() {
    if (this.isConnected) {
      return true;
    }

    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      // Parse DATABASE_URL for connection details
      const connectionConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { 
          rejectUnauthorized: false // Railway requires SSL but with self-signed certificates
        },
        max: 20, // maximum number of clients in pool
        idleTimeoutMillis: 30000, // close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // return an error after 10 seconds if connection could not be established
        query_timeout: 60000, // query timeout of 60 seconds
        statement_timeout: 60000, // statement timeout of 60 seconds
        idle_in_transaction_session_timeout: 30000 // session timeout of 30 seconds
      };

      this.pool = new Pool(connectionConfig);

      // Set up error handlers
      this.pool.on('error', (err) => {
        console.error('Database pool error:', err);
        this.isConnected = false;
      });

      this.pool.on('connect', () => {
        console.log('Database client connected');
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      console.log('Database connection pool initialized successfully');
      return true;

    } catch (error) {
      this.isConnected = false;
      console.error('Database connection failed:', error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Get a database client from the pool
   */
  async getClient() {
    if (!this.isConnected) {
      await this.initialize();
    }
    return this.pool.connect();
  }

  /**
   * Execute a query with automatic connection management
   */
  async query(text, params = []) {
    if (!this.isConnected) {
      await this.initialize();
    }

    const start = Date.now();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`Slow query detected (${duration}ms):`, text.substring(0, 100));
      }
      
      return result;
    } catch (error) {
      console.error('Database query failed:', error.message);
      console.error('Query:', text.substring(0, 200));
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Execute a transaction
   */
  async transaction(callback) {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health check - verify database is reachable
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }
      
      const result = await this.query('SELECT 1 as health, NOW() as timestamp');
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get connection pool statistics
   */
  getStats() {
    if (!this.pool) {
      return { 
        connected: false,
        error: 'Pool not initialized'
      };
    }
    
    return {
      connected: this.isConnected,
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }

  /**
   * Monitor slow queries and performance
   */
  logPerformanceMetrics() {
    if (!this.pool) return;
    
    const stats = this.getStats();
    console.log('Database Performance Metrics:', {
      timestamp: new Date().toISOString(),
      ...stats
    });
  }

  /**
   * Close all connections gracefully
   */
  async closeAllConnections() {
    try {
      if (this.pool) {
        console.log('Closing database connections...');
        await this.pool.end();
        this.isConnected = false;
        console.log('Database connections closed successfully');
      }
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
  }
}

// Export the class
module.exports = { DatabaseManager };
