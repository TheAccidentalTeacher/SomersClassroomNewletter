/**
 * Railway PostgreSQL Connection Test
 * Test different connection configurations for Railway
 */

const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

async function testConnection(config, description) {
  console.log(`\n🔄 Testing: ${description}`);
  console.log(`URL: ${config.connectionString || 'N/A'}`);
  
  const client = new Client(config);
  
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful!');
    console.log(`Database time: ${result.rows[0].current_time}`);
    console.log(`PostgreSQL version: ${result.rows[0].pg_version}`);
    
    await client.end();
    console.log('✅ Connection closed successfully');
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

async function main() {
  console.log('🚀 Railway PostgreSQL Connection Test');
  console.log('=====================================');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }
  
  console.log(`DATABASE_URL: ${databaseUrl}`);
  
  const testConfigs = [
    {
      config: {
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      },
      description: 'Railway URL with SSL (rejectUnauthorized: false)'
    },
    {
      config: {
        connectionString: databaseUrl,
        ssl: true
      },
      description: 'Railway URL with SSL: true'
    },
    {
      config: {
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false,
          sslmode: 'require'
        }
      },
      description: 'Railway URL with SSL require mode'
    },
    {
      config: {
        connectionString: databaseUrl + '?sslmode=require',
        ssl: { rejectUnauthorized: false }
      },
      description: 'Railway URL with sslmode=require in URL'
    },
    {
      config: {
        connectionString: databaseUrl,
        ssl: false
      },
      description: 'Railway URL without SSL (should fail)'
    }
  ];
  
  let successCount = 0;
  
  for (const { config, description } of testConfigs) {
    const success = await testConnection(config, description);
    if (success) successCount++;
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Successful connections: ${successCount}/${testConfigs.length}`);
  
  if (successCount === 0) {
    console.log('\n🚨 No connections successful. Possible issues:');
    console.log('  - Railway database might be paused/sleeping');
    console.log('  - Network connectivity issues');
    console.log('  - Incorrect DATABASE_URL');
    console.log('  - Railway service might be down');
    console.log('\n💡 Try:');
    console.log('  1. Check Railway dashboard for database status');
    console.log('  2. Verify DATABASE_URL is correct');
    console.log('  3. Try connecting from Railway dashboard');
  }
}

main().catch(console.error);
