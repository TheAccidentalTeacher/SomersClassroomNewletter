/**
 * Simple Database Connection Test
 * Test script to verify DATABASE_URL and basic connectivity
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    console.log('📋 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL environment variable is not set');
        return false;
    }
    
    try {
        console.log('🔗 Attempting connection...');
        
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }, // Railway requires SSL
            max: 1, // Just one connection for testing
            idleTimeoutMillis: 5000,
            connectionTimeoutMillis: 5000
        });
        
        const client = await pool.connect();
        console.log('✅ Connection established');
        
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        console.log('📊 Database info:');
        console.log('  - Current time:', result.rows[0].current_time);
        console.log('  - PostgreSQL version:', result.rows[0].postgres_version.split(' ')[0]);
        
        client.release();
        await pool.end();
        
        console.log('✅ Database connection test successful!');
        return true;
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('  Error:', error.message);
        console.error('  Code:', error.code);
        console.error('  Stack:', error.stack);
        return false;
    }
}

// Run the test
if (require.main === module) {
    testDatabaseConnection()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Test crashed:', error);
            process.exit(1);
        });
}

module.exports = testDatabaseConnection;
