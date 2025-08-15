/**
 * Database Initialization Script
 * Professional script to set up database schema and initial data
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { DatabaseManager } = require('../config/database');
const logger = require('../utils/logger');

async function initializeDatabase() {
    const db = DatabaseManager.getInstance();
    
    try {
        logger.info('Starting database initialization...');
        
        // Check if database is reachable
        const isHealthy = await db.healthCheck();
        if (!isHealthy) {
            throw new Error('Database health check failed');
        }
        
        logger.info('Database connection verified');
        
        // Read and execute the SQL schema
        const schemaPath = path.join(__dirname, '../database/init.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }
        
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        logger.info('Schema file loaded successfully');
        
        // Execute the schema in a transaction
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            // Split SQL into individual statements and execute
            const statements = schemaSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            logger.info(`Executing ${statements.length} SQL statements...`);
            
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                
                if (statement.trim()) {
                    try {
                        await client.query(statement);
                        logger.debug(`Statement ${i + 1} executed successfully`);
                    } catch (error) {
                        // Log but continue for statements that might already exist
                        if (error.message.includes('already exists')) {
                            logger.debug(`Statement ${i + 1} skipped (already exists): ${error.message}`);
                        } else {
                            logger.warn(`Statement ${i + 1} failed: ${error.message}`);
                            // Only throw for critical errors
                            if (!error.message.includes('constraint') && !error.message.includes('duplicate')) {
                                throw error;
                            }
                        }
                    }
                }
            }
            
            await client.query('COMMIT');
            logger.info('Database schema initialized successfully');
            
            // Verify tables were created
            const tablesQuery = `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            `;
            
            const tablesResult = await client.query(tablesQuery);
            const tableNames = tablesResult.rows.map(row => row.table_name);
            
            logger.info('Database tables created:', { tables: tableNames });
            
            // Check if admin user exists
            const adminQuery = 'SELECT email, is_admin FROM users WHERE is_admin = true LIMIT 1';
            const adminResult = await client.query(adminQuery);
            
            if (adminResult.rows.length > 0) {
                logger.info('Admin user found:', { email: adminResult.rows[0].email });
            } else {
                logger.warn('No admin user found - you may need to create one manually');
            }
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
        // Get final database statistics
        const stats = await db.getStats();
        logger.info('Database initialization complete:', stats);
        
        return true;
        
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}

// Test database operations
async function testDatabaseOperations() {
    const db = DatabaseManager.getInstance();
    
    try {
        logger.info('Testing database operations...');
        
        // Test basic query
        const testQuery = 'SELECT NOW() as current_time, version() as postgres_version';
        const result = await db.query(testQuery);
        
        logger.info('Database test successful:', {
            currentTime: result.rows[0].current_time,
            version: result.rows[0].postgres_version.split(' ')[0] // Just the version number
        });
        
        // Test User model (if authentication works)
        try {
            const User = require('../models/User');
            const testUser = await User.findByEmail('mr.somers@school.edu');
            
            if (testUser) {
                logger.info('User model test successful:', { 
                    found: true, 
                    email: testUser.email,
                    isAdmin: testUser.isAdmin 
                });
            } else {
                logger.info('User model test: Default admin user not found');
            }
        } catch (error) {
            logger.warn('User model test failed:', error.message);
        }
        
        return true;
        
    } catch (error) {
        logger.error('Database operations test failed:', error);
        throw error;
    }
}

// Main execution function
async function main() {
    try {
        // Check required environment variables
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is required');
        }
        
        if (!process.env.JWT_SECRET) {
            logger.warn('JWT_SECRET not set - authentication will not work');
        }
        
        logger.info('Starting database setup process...');
        
        // Initialize database schema
        await initializeDatabase();
        
        // Test database operations
        await testDatabaseOperations();
        
        logger.info('✅ Database setup completed successfully!');
        
        console.log('\n🎉 Database initialization complete!');
        console.log('📋 Next steps:');
        console.log('  1. Start the server with: npm run dev');
        console.log('  2. Test authentication endpoints');
        console.log('  3. Begin Phase 2 implementation');
        console.log('\n💡 Default admin account:');
        console.log('  Email: mr.somers@school.edu');
        console.log('  Password: admin123');
        console.log('  ⚠️  CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
        
        process.exit(0);
        
    } catch (error) {
        logger.error('❌ Database setup failed:', error);
        console.error('\n💥 Database initialization failed!');
        console.error('Error:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('  1. Verify DATABASE_URL is correct');
        console.error('  2. Ensure database server is running');
        console.error('  3. Check database permissions');
        console.error('  4. Review logs above for specific errors');
        
        process.exit(1);
    }
}

// Handle script interruption
process.on('SIGINT', async () => {
    logger.info('Database setup interrupted by user');
    try {
        const db = DatabaseManager.getInstance();
        await db.closeAllConnections();
    } catch (error) {
        logger.error('Error during cleanup:', error);
    }
    process.exit(0);
});

// Run the setup
if (require.main === module) {
    main();
}

module.exports = { initializeDatabase, testDatabaseOperations };
