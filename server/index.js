/**
 * Newsletter Generator Server
 * Professional Express.js server with authentication and database integration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import our professional modules
const { DatabaseManager } = require('./config/database');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// CRITICAL: Health check MUST be first, before any middleware
app.get('/health', (req, res) => {
  logger.info('Health check endpoint hit - before any middleware');
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    middleware: 'before-all'
  });
});

// Validate required environment variables and log database info
const requiredEnvVars = [
  'JWT_SECRET',
  'OPENAI_API_KEY'
];

// Check for database URL (prioritize Railway's auto-generated)
const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  requiredEnvVars.push('DATABASE_PUBLIC_URL or DATABASE_URL');
}

// Debug: Log database connection info (masked for security)
if (databaseUrl) {
  const dbUrl = databaseUrl;
  const maskedUrl = dbUrl.replace(/:[^:@]*@/, ':****@');
  logger.info('DATABASE_URL configured:', { maskedUrl });
} else {
  logger.error('DATABASE_URL not found in environment variables');
}

const optionalEnvVars = [
  'REPLICATE_API_TOKEN',
  'AZURE_AI_API_KEY',
  'UNSPLASH_ACCESS_KEY',
  'PEXELS_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
const missingOptionalVars = optionalEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', { missing: missingEnvVars });
  if (process.env.NODE_ENV === 'production') {
    logger.error('Server cannot start without required environment variables');
    process.exit(1);
  } else {
    logger.warn('Running in development mode with missing environment variables');
  }
}

if (missingOptionalVars.length > 0) {
  logger.warn('Missing optional environment variables (some features will be disabled):', { 
    missing: missingOptionalVars 
  });
}

// Initialize database connection and schema
async function initializeDatabase() {
  try {
    const db = DatabaseManager.getInstance();
    
    // Initialize the database connection first
    logger.info('Initializing database connection...');
    await db.initialize();
    logger.info('Database manager initialized');
    
    // Test basic connection
    logger.info('Testing database connection...');
    const testResult = await db.query('SELECT NOW() as current_time');
    logger.info('Database connection successful:', { time: testResult.rows[0].current_time });
    
    // Check if tables exist
    const tableCheckQuery = `
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const result = await db.query(tableCheckQuery);
    const tableCount = parseInt(result.rows[0].table_count);
    
    logger.info(`Found ${tableCount} tables in database`);
    
    if (tableCount === 0) {
      logger.info('Database is empty, initializing schema...');
      await initializeSchema(db);
    } else {
      logger.info('Database schema already exists');
    }
    
    // Now run health check
    const isHealthy = await db.healthCheck();
    if (isHealthy) {
      logger.info('Database health check passed');
      const stats = await db.getStats();
      logger.info('Database connection stats:', stats);

      // Apply small schema patches/migrations that are safe to run repeatedly
      await ensureSchemaPatches(db);
    } else {
      logger.warn('Database health check failed, but continuing...');
    }
    
  } catch (error) {
    logger.error('Database initialization failed:', error);
    
    if (process.env.NODE_ENV === 'production') {
      logger.error('Continuing without database in production mode');
      // Don't exit in production, let the app start without DB
    } else {
      logger.warn('Continuing in development mode without database');
    }
  }
}

// Ensure idempotent schema patches for existing databases
async function ensureSchemaPatches(db) {
  try {
    // 1) Ensure activity_logs.resource_type CHECK allows 'system'
    const checkConstraintQuery = `
      SELECT c.conname, pg_get_constraintdef(c.oid) AS def
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE t.relname = 'activity_logs' AND c.conname = 'logs_resource_type_valid'
    `;

    const cc = await db.query(checkConstraintQuery);
    if (cc.rows.length > 0) {
      const def = cc.rows[0].def || '';
      if (!def.includes("'system'")) {
        logger.warn("Patching activity_logs.logs_resource_type_valid to include 'system'");
        await db.query(`
          ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS logs_resource_type_valid;
          ALTER TABLE activity_logs
            ADD CONSTRAINT logs_resource_type_valid CHECK (
              resource_type IN ('user','newsletter','template','share','export','auth','system')
            );
        `);
        logger.info('Constraint patched successfully');
      }
    }

    // 2) Attempt to write the schema_created log if not present yet
    const existsLog = await db.query(
      `SELECT 1 FROM activity_logs WHERE action = 'schema_created' LIMIT 1`
    );
    if (existsLog.rows.length === 0) {
      logger.info('Writing initial schema_created activity log');
      await db.query(
        `INSERT INTO activity_logs (action, resource_type, metadata)
         VALUES ($1, $2, $3)`,
        [
          'schema_created',
          'system',
          {
            version: '1.0.0',
            tables_created: [
              'users','user_sessions','templates','newsletters','newsletter_shares','activity_logs'
            ]
          }
        ]
      );
    }

  } catch (err) {
    // Non-fatal; keep server running
    logger.warn('Schema patches step skipped due to error:', err);
  }
}

// Initialize database schema
async function initializeSchema(db) {
  try {
    logger.info('Starting database schema initialization...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, './database/init.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    logger.info('Schema file loaded successfully');
    
    // Execute the schema
    await db.query(schemaSQL);
    logger.info('Database schema initialized successfully');
    
    // Verify tables were created
    const tableCheckQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const result = await db.query(tableCheckQuery);
    const tables = result.rows.map(row => row.table_name);
    logger.info('Created tables:', { tables });
    
    return true;
    
  } catch (error) {
    logger.error('Schema initialization failed:', error);
    throw error;
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.replicate.com"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.RAILWAY_STATIC_URL,
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', { origin });
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(cors(corsOptions));

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, `${req.method} ${req.path}`, 'http');
    
    if (duration > 1000) {
      logger.logPerformance(`${req.method} ${req.path}`, duration, {
        statusCode: res.statusCode
      });
    }
  });
  
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/newsletters', require('./routes/newsletters'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/images', require('./routes/images'));
app.use('/api/export', require('./routes/export'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoints MUST come before static file serving
// Health check endpoint with detailed information
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      message: 'Newsletter API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: false,
        auth: true,
        api: true
      }
    };

    // Check database health
    try {
      const db = DatabaseManager.getInstance();
      health.services.database = await db.healthCheck();
    } catch (error) {
      logger.warn('Database health check failed in health endpoint:', error);
    }

    const statusCode = health.services.database ? 200 : 503;
    res.status(statusCode).json(health);
    
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  logger.info('Looking for React build files at:', { buildPath });
  
  const fs = require('fs');
  if (fs.existsSync(buildPath)) {
    logger.info('Build directory found, serving static files');
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      logger.info('Catch-all route hit for:', { path: req.path, url: req.url });
      const indexPath = path.join(buildPath, 'index.html');
      res.sendFile(indexPath);
    });
  } else {
    logger.error('Build directory not found', { 
      buildPath,
      availableFiles: fs.readdirSync(__dirname)
    });
    
    app.get('*', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Application build files not found',
        code: 'BUILD_NOT_FOUND'
      });
    });
  }
}

// Global error handling middleware
app.use((error, req, res, next) => {
  logger.logError(error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  
  const statusCode = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  // Don't leak error details in production
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production' ? 
      'An internal error occurred' : message,
    code: error.code || 'INTERNAL_ERROR'
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      stack: error.stack,
      originalMessage: message
    };
  }
  
  res.status(statusCode).json(response);
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  logger.warn('API endpoint not found', { path: req.path, method: req.method });
  res.status(404).json({ 
    success: false,
    message: 'API endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path
  });
});

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  try {
    // Close database connections
    const db = DatabaseManager.getInstance();
    await db.closeAllConnections();
    logger.info('Database connections closed');
    
    // Close server
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info('Newsletter server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        databaseConfigured: !!process.env.DATABASE_URL,
        railwayPort: process.env.PORT || 'not set'
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
