/**
 * Logger Utility
 * Professional logging system with multiple levels and environment awareness
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define colors for each level
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
};

// Set colors in winston
winston.addColors(logColors);

// Create log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        ({ timestamp, level, message, stack, ...meta }) => {
            let log = `${timestamp} [${level}]: ${message}`;
            
            // Add metadata if present
            if (Object.keys(meta).length > 0) {
                log += ` ${JSON.stringify(meta)}`;
            }
            
            // Add stack trace for errors
            if (stack) {
                log += `\n${stack}`;
            }
            
            return log;
        }
    )
);

// Create file format (without colors)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Determine log level based on environment
const getLogLevel = () => {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
        case 'production':
            return 'warn';
        case 'test':
            return 'error';
        default:
            return 'debug';
    }
};

// Create transports array
const transports = [];

// Console transport
transports.push(
    new winston.transports.Console({
        level: getLogLevel(),
        format: logFormat
    })
);

// File transports (only in production or when LOG_TO_FILE is true)
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
    const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');
    
    // Ensure logs directory exists
    const fs = require('fs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Error log file
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );

    // Combined log file
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
}

// Create the logger
const logger = winston.createLogger({
    level: getLogLevel(),
    levels: logLevels,
    format: fileFormat,
    transports,
    exitOnError: false
});

// Create custom logging methods with additional context
class Logger {
    constructor(winston) {
        this.winston = winston;
    }

    error(message, meta = {}) {
        this.winston.error(message, meta);
    }

    warn(message, meta = {}) {
        this.winston.warn(message, meta);
    }

    info(message, meta = {}) {
        this.winston.info(message, meta);
    }

    http(message, meta = {}) {
        this.winston.http(message, meta);
    }

    debug(message, meta = {}) {
        this.winston.debug(message, meta);
    }

    // Log with request context
    logRequest(req, res, message, level = 'info') {
        const context = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            statusCode: res.statusCode
        };

        this.winston[level](message, context);
    }

    // Log authentication events
    logAuth(event, user, meta = {}) {
        const context = {
            event,
            userId: user?.id,
            email: user?.email,
            ...meta
        };

        this.winston.info(`Auth: ${event}`, context);
    }

    // Log database operations
    logDB(operation, table, meta = {}) {
        const context = {
            operation,
            table,
            ...meta
        };

        this.winston.debug(`DB: ${operation} on ${table}`, context);
    }

    // Log performance metrics
    logPerformance(operation, duration, meta = {}) {
        const context = {
            operation,
            duration: `${duration}ms`,
            ...meta
        };

        const level = duration > 1000 ? 'warn' : 'debug';
        this.winston[level](`Performance: ${operation}`, context);
    }

    // Log errors with additional context
    logError(error, context = {}) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context
        };

        this.winston.error('Application Error', errorInfo);
    }

    // Create child logger with persistent context
    child(defaultMeta = {}) {
        return {
            error: (message, meta = {}) => this.error(message, { ...defaultMeta, ...meta }),
            warn: (message, meta = {}) => this.warn(message, { ...defaultMeta, ...meta }),
            info: (message, meta = {}) => this.info(message, { ...defaultMeta, ...meta }),
            http: (message, meta = {}) => this.http(message, { ...defaultMeta, ...meta }),
            debug: (message, meta = {}) => this.debug(message, { ...defaultMeta, ...meta })
        };
    }
}

// Create and export logger instance
const customLogger = new Logger(logger);

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
    process.on('uncaughtException', (error) => {
        customLogger.logError(error, { type: 'uncaughtException' });
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        customLogger.logError(
            new Error(`Unhandled Rejection: ${reason}`),
            { type: 'unhandledRejection', promise: promise.toString() }
        );
    });
}

module.exports = customLogger;
