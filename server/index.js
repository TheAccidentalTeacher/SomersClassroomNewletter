const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Changed from 5000 to 3000 (Railway default)

// Validate required environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'REPLICATE_API_TOKEN',
  'DATABASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingEnvVars);
  console.warn('⚠️  Some features will be disabled until these are configured.');
  
  // In production, warn but don't exit - let Railway configure the database first
  if (process.env.NODE_ENV === 'production') {
    console.warn('🔧 Running in setup mode - add environment variables in Railway dashboard');
    console.warn('📋 Required: DATABASE_URL, OPENAI_API_KEY, REPLICATE_API_TOKEN');
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.RAILWAY_STATIC_URL || process.env.FRONTEND_URL
    : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/newsletters', require('./routes/newsletters'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/images', require('./routes/images'));
app.use('/api/export', require('./routes/export'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Newsletter API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  console.log('📁 Looking for React build files at:', buildPath);
  
  // Check if build directory exists
  const fs = require('fs');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build directory found, serving static files');
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(buildPath, 'index.html');
      console.log('📄 Serving index.html from:', indexPath);
      res.sendFile(indexPath);
    });
  } else {
    console.error('❌ Build directory not found at:', buildPath);
    console.log('📁 Available files in server directory:', fs.readdirSync(__dirname));
    
    // Fallback response
    app.get('*', (req, res) => {
      res.status(503).json({
        error: 'Application build files not found',
        message: 'The React build files are missing. Please check the deployment configuration.',
        buildPath: buildPath
      });
    });
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  const statusCode = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error.details 
      })
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: { 
      message: 'API endpoint not found',
      path: req.path
    } 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Newsletter server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🌐 Railway PORT env: ${process.env.PORT || 'not set'}`);
  console.log(`📡 Server listening on 0.0.0.0:${PORT}`);
});
