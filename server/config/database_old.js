const { Pool } = require('pg');
const { promisify } = require('util');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Initialize database connection pool
   */
  async initialize() {
    try {
      const connectionString = process.env.DATABASE_URL;
      
      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      // Create connection pool with proper configuration
      this.pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
        connectionTimeoutMillis: 2000, // How long to wait for a connection
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      console.log('✅ Database connected successfully');
      
      // Set up error handling
      this.pool.on('error', (err) => {
        console.error('🚨 Unexpected database pool error:', err);
        this.isConnected = false;
      });

      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Execute a query with error handling
   * @param {string} text - SQL query text
   * @param {Array} params - Query parameters
   * @returns {Object} Query result
   */
  async query(text, params = []) {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call initialize() first.');
    }

    const start = Date.now();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log slow queries for performance monitoring
      if (duration > 1000) {
        console.warn(`🐌 Slow query detected (${duration}ms):`, text.substring(0, 100));
      }
      
      return result;
    } catch (error) {
      console.error('🚨 Database query error:', {
        error: error.message,
        query: text.substring(0, 100),
        params: params?.length > 0 ? '[PARAMS_PROVIDED]' : 'none'
      });
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   * @returns {Object} Database client
   */
  async getClient() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call initialize() first.');
    }
    return await this.pool.connect();
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Function} callback - Function containing transaction logic
   * @returns {*} Transaction result
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
   * Get connection status
   * @returns {boolean} Connection status
   */
  isHealthy() {
    return this.isConnected && this.pool && this.pool.totalCount >= 0;
  }

  /**
   * Get connection pool statistics
   * @returns {Object} Pool statistics
   */
  getStats() {
    if (!this.pool) {
      return { connected: false };
    }

    return {
      connected: this.isConnected,
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }

  /**
   * Gracefully close all connections
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('📦 Database connections closed');
    }
  }
}

// Export the class and create singleton access
module.exports = {
  DatabaseManager: class {
    static getInstance() {
      if (!DatabaseManager._instance) {
        DatabaseManager._instance = new DatabaseManager();
      }
      return DatabaseManager._instance;
    }

    constructor() {
      if (DatabaseManager._instance) {
        return DatabaseManager._instance;
      }
      
      this.pool = null;
      this.isConnected = false;
      DatabaseManager._instance = this;
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
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          max: 20, // maximum number of clients in pool
          idleTimeoutMillis: 30000, // close idle clients after 30 seconds
          connectionTimeoutMillis: 10000, // return an error after 10 seconds if connection could not be established
          query_timeout: 60000, // query timeout of 60 seconds
          statement_timeout: 60000, // statement timeout of 60 seconds
          idle_in_transaction_session_timeout: 30000 // session timeout of 30 seconds
        };

        this.pool = new Pool(connectionConfig);

        // Test the connection
        const client = await this.pool.connect();
        await client.query('SELECT NOW()');
        client.release();

        this.isConnected = true;
        return true;

      } catch (error) {
        this.isConnected = false;
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
          console.warn(`Slow query detected: ${duration}ms`);
        }
        
        return result;
      } catch (error) {
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
     * Health check
     */
    async healthCheck() {
      try {
        const result = await this.query('SELECT 1 as health');
        return result.rows.length > 0;
      } catch (error) {
        return false;
      }
    }

    /**
     * Get connection pool statistics
     */
    getStats() {
      if (!this.pool) {
        return { connected: false };
      }
      
      return {
        connected: this.isConnected,
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount
      };
    }

    /**
     * Close all connections
     */
    async closeAllConnections() {
      if (this.pool) {
        await this.pool.end();
        this.isConnected = false;
      }
    }
  }
};
