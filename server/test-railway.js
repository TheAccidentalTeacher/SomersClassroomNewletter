const { Client } = require('pg');

async function testConnection() {
  console.log('Testing Railway PostgreSQL connection...');
  
  const connectionString = 'postgresql://postgres:YqjcCLLwFnZujmKZToCbwl3jFLjGAckC@nozomi.proxy.rlwy.net:25197/railway';
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Query successful:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  } finally {
    try {
      await client.end();
      console.log('Connection closed.');
    } catch (e) {
      console.log('Error closing connection:', e.message);
    }
  }
}

testConnection();
