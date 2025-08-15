/**
 * Database verification script
 * Check if the default user exists and has the correct password hash
 */

require('dotenv').config();
const { DatabaseManager } = require('./config/database');

async function verifyDatabase() {
    try {
        console.log('🔍 Verifying database and default user...');
        
        const db = DatabaseManager.getInstance();
        
        // Check if users table exists
        const tableCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        `);
        
        console.log('📋 Users table exists:', tableCheck.rows.length > 0);
        
        // Check if default user exists
        const userCheck = await db.query(
            'SELECT email, display_name, is_admin, password_hash FROM users WHERE email = $1',
            ['mr.somers@school.edu']
        );
        
        if (userCheck.rows.length > 0) {
            const user = userCheck.rows[0];
            console.log('✅ Default user found:');
            console.log('   Email:', user.email);
            console.log('   Name:', user.display_name);
            console.log('   Admin:', user.is_admin);
            console.log('   Has password hash:', !!user.password_hash);
            console.log('   Password hash length:', user.password_hash ? user.password_hash.length : 'N/A');
            console.log('   Hash starts with:', user.password_hash ? user.password_hash.substring(0, 7) : 'N/A');
        } else {
            console.log('❌ Default user NOT found');
            
            // Check if any users exist
            const allUsers = await db.query('SELECT COUNT(*) as count FROM users');
            console.log('👥 Total users in database:', allUsers.rows[0].count);
        }
        
        console.log('✅ Database verification complete');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database verification failed:', error);
        process.exit(1);
    }
}

verifyDatabase();
